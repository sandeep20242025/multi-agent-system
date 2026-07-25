"""
workflow.py
-----------
Contains the Workflow class, which owns the full multi-agent execution
pipeline.  The Orchestrator (and any future entry-point) delegates to
this class so that coordination logic lives in exactly one place.
"""

import asyncio
import time
from uuid import uuid4

from app.agents.registry import agent_registry
from app.agents.base_agent import BaseAgent

from app.services.memory_service import memory_service
from app.services.title_service import title_service
from app.services.summary_service import summary_service
from app.services.agent_log_service import agent_log_service


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SUMMARY_THRESHOLD: int = 20  # Trigger summary after this many messages.


# ---------------------------------------------------------------------------
# Workflow
# ---------------------------------------------------------------------------


class Workflow:
    """
    Orchestrates the full multi-agent pipeline for a single user turn.

    Responsibilities
    ----------------
    - Session lifecycle (create / reuse).
    - Persisting user and assistant messages.
    - Building a formatted conversation string for agent context.
    - Running the Planner to decide which agents are needed.
    - Executing Researcher tasks in parallel via ``asyncio.gather``.
    - Running Analyzer sequentially on researcher output.
    - Running Writer on the best available input.
    - Updating the session summary after ``SUMMARY_THRESHOLD`` messages.
    - Logging every agent execution (success or failure).
    """

    # ------------------------------------------------------------------
    # Construction
    # ------------------------------------------------------------------

    def __init__(self) -> None:
        self._registry = agent_registry

    # ==================================================================
    # Public entry-point
    # ==================================================================

    async def run(
        self,
        user_input: str,
        user_id: str,
        session_id: str | None = None,
    ) -> dict:
        """
        Execute the complete multi-agent pipeline for one user message.

        Parameters
        ----------
        user_input:
            The raw text sent by the user.
        user_id:
            UUID of the authenticated user who owns the session.
        session_id:
            An existing session ID to continue a conversation, or
            ``None`` to start a new session.

        Returns
        -------
        dict
            ``{ success, session_id, planner, research, analysis, response }``
        """
        # 1. Session ---------------------------------------------------------
        if session_id is None:
            session_id = await self.create_session(user_input, user_id)

        # 2. Persist user message --------------------------------------------
        await self.save_user_message(session_id, user_input)

        # 3. Build conversation context for agents ---------------------------
        history, conversation = await self.build_conversation(session_id, user_id)

        # 4. Planner ---------------------------------------------------------
        planner_result = await self.run_planner(
            user_input=user_input,
            session_id=session_id,
        )
        selected_agents: list[str] = planner_result.get("agents", ["writer"])

        # 5. Build prompt with full context ----------------------------------
        research_prompt = self._build_research_prompt(
            conversation=conversation,
            user_input=user_input,
        )

        # 6. Parallel researcher(s) ------------------------------------------
        results: dict = {}
        results = await self.run_researcher(
            selected_agents=selected_agents,
            research_prompt=research_prompt,
            session_id=session_id,
            results=results,
        )

        # 7. Sequential analyzer ---------------------------------------------
        results = await self.run_analyzer(
            selected_agents=selected_agents,
            session_id=session_id,
            results=results,
        )

        # 8. Writer ----------------------------------------------------------
        results = await self.run_writer(
            user_input=user_input,
            session_id=session_id,
            results=results,
        )

        # 9. Persist assistant response --------------------------------------
        await self.save_assistant_message(
            session_id,
            results["writer"]["response"],
        )

        # 10. Reload history and conditionally update summary ----------------
        history, conversation = await self.build_conversation(session_id, user_id)
        await self.update_summary_if_needed(
            session_id=session_id,
            user_id=user_id,
            history=history,
            conversation=conversation,
        )

        # 11. Return structured response ------------------------------------
        return {
            "success": True,
            "session_id": session_id,
            "planner": planner_result,
            "research": results.get("researcher"),
            "analysis": results.get("analyzer"),
            "response": results["writer"]["response"],
        }

    # ==================================================================
    # Session helpers
    # ==================================================================

    async def create_session(self, user_input: str, user_id: str) -> str:
        """
        Generate a new session ID, derive a title from the user's first
        message, and persist the session in the database.

        Parameters
        ----------
        user_input:
            Used to generate a short descriptive title.
        user_id:
            UUID of the authenticated user who owns the session.

        Returns
        -------
        str
            The newly created session ID.
        """
        session_id = str(uuid4())
        title = await title_service.generate_title(user_input)
        await memory_service.create_session(
            session_id=session_id,
            user_id=user_id,
            title=title,
        )
        return session_id

    async def save_user_message(
        self,
        session_id: str,
        message: str,
    ) -> None:
        """Persist a user-role message in memory."""
        await memory_service.save_message(
            session_id=session_id,
            role="user",
            content=message,
        )

    async def save_assistant_message(
        self,
        session_id: str,
        message: str,
    ) -> None:
        """Persist an assistant-role message in memory."""
        await memory_service.save_message(
            session_id=session_id,
            role="assistant",
            content=message,
        )

    # ==================================================================
    # Conversation helpers
    # ==================================================================

    async def build_conversation(
        self,
        session_id: str,
        user_id: str,
    ) -> tuple[list, str]:
        """
        Fetch recent messages and return both the raw list and a
        newline-separated human-readable string.

        Parameters
        ----------
        session_id:
            Target session.
        user_id:
            UUID of the authenticated user; passed to ``memory_service`` for
            ownership verification.

        Returns
        -------
        tuple[list, str]
            ``(history_list, formatted_conversation_string)``
        """
        history: list = await memory_service.get_recent_messages(session_id, user_id)
        conversation = "".join(
            f"{msg['role'].capitalize()}: {msg['content']}\n"
            for msg in history
        )
        return history, conversation

    # ==================================================================
    # Agent runners
    # ==================================================================

    async def run_planner(
        self,
        user_input: str,
        session_id: str,
    ) -> dict:
        """
        Run the Planner agent to decide which downstream agents to invoke.

        Parameters
        ----------
        user_input:
            The raw user message used as the planning goal.
        session_id:
            Used for logging.

        Returns
        -------
        dict
            Planner output containing an ``agents`` list.
        """
        planner: BaseAgent = self._registry.get("planner")
        _, result = await self.execute_agent(
            agent=planner,
            agent_name="Planner",
            input_data={"goal": user_input},
            session_id=session_id,
        )
        return result

    async def run_researcher(
        self,
        selected_agents: list[str],
        research_prompt: str,
        session_id: str,
        results: dict,
    ) -> dict:
        """
        Execute Researcher tasks in parallel using ``asyncio.gather``.

        Currently one researcher is dispatched; the gather pattern allows
        multiple independent research sub-tasks to be added in the future
        without interface changes.

        Parameters
        ----------
        selected_agents:
            Agents chosen by the Planner.
        research_prompt:
            Contextualised prompt passed to the researcher.
        session_id:
            Used for logging.
        results:
            Shared results dict that is mutated and returned.

        Returns
        -------
        dict
            Updated results dict (includes ``"researcher"`` key when run).
        """
        if "researcher" not in selected_agents:
            return results

        researcher: BaseAgent = self._registry.get("researcher")

        parallel_tasks = [
            self.execute_agent(
                agent=researcher,
                agent_name="Researcher",
                input_data=research_prompt,
                session_id=session_id,
            )
        ]

        parallel_results = await asyncio.gather(*parallel_tasks)

        for agent_name, result in parallel_results:
            results[agent_name.lower()] = result

        return results

    async def run_analyzer(
        self,
        selected_agents: list[str],
        session_id: str,
        results: dict,
    ) -> dict:
        """
        Execute the Analyzer agent sequentially on researcher output.

        Parameters
        ----------
        selected_agents:
            Agents chosen by the Planner.
        session_id:
            Used for logging.
        results:
            Shared results dict; ``results["researcher"]["research"]`` is
            used as input when available.

        Returns
        -------
        dict
            Updated results dict (includes ``"analyzer"`` key when run).
        """
        if "analyzer" not in selected_agents:
            return results

        analyzer: BaseAgent = self._registry.get("analyzer")
        research_output: str = results["researcher"]["research"]

        _, analyzer_result = await self.execute_agent(
            agent=analyzer,
            agent_name="Analyzer",
            input_data=research_output,
            session_id=session_id,
        )
        results["analyzer"] = analyzer_result
        return results

    async def run_writer(
        self,
        user_input: str,
        session_id: str,
        results: dict,
    ) -> dict:
        """
        Execute the Writer agent, choosing the richest available input.

        Priority: analyzer output > researcher output > raw user input.

        Parameters
        ----------
        user_input:
            Fallback content if no upstream agent has run.
        session_id:
            Used for logging.
        results:
            Shared results dict used to find upstream output.

        Returns
        -------
        dict
            Updated results dict with ``"writer"`` key populated.
        """
        writer: BaseAgent = self._registry.get("writer")

        if "analyzer" in results:
            writer_input: str = results["analyzer"]["analysis"]
        elif "researcher" in results:
            writer_input = results["researcher"]["research"]
        else:
            writer_input = user_input

        _, writer_result = await self.execute_agent(
            agent=writer,
            agent_name="Writer",
            input_data=writer_input,
            session_id=session_id,
        )
        results["writer"] = writer_result
        return results

    # ==================================================================
    # Summary
    # ==================================================================

    async def update_summary_if_needed(
        self,
        session_id: str,
        user_id: str,
        history: list,
        conversation: str,
    ) -> None:
        """
        Regenerate and persist the session summary when the conversation
        has reached or exceeded ``SUMMARY_THRESHOLD`` messages.

        Parameters
        ----------
        session_id:
            Target session.
        user_id:
            UUID of the authenticated user; passed to ``memory_service`` for
            ownership verification.
        history:
            List of recent message dicts (used for length check).
        conversation:
            Pre-formatted conversation string passed to the summariser.
        """
        if len(history) < SUMMARY_THRESHOLD:
            return

        summary: str = await summary_service.generate_summary(conversation)
        await memory_service.update_summary(
            session_id=session_id,
            user_id=user_id,
            summary=summary,
        )

    # ==================================================================
    # Logging helpers
    # ==================================================================

    async def log_success(
        self,
        session_id: str,
        agent_name: str,
        start_time: float,
    ) -> None:
        """
        Log a successful agent execution with elapsed wall-clock time.

        Parameters
        ----------
        session_id:
            Target session.
        agent_name:
            Display name of the agent (e.g. ``"Researcher"``).
        start_time:
            ``time.perf_counter()`` value captured before agent execution.
        """
        await agent_log_service.log(
            session_id=session_id,
            agent_name=agent_name,
            status="Success",
            execution_time=round(time.perf_counter() - start_time, 3),
        )

    async def log_failure(
        self,
        session_id: str,
        agent_name: str,
        error: Exception,
    ) -> None:
        """
        Log a failed agent execution.

        Parameters
        ----------
        session_id:
            Target session.
        agent_name:
            Display name of the agent.
        error:
            The exception that caused the failure.
        """
        await agent_log_service.log(
            session_id=session_id,
            agent_name=agent_name,
            status=f"Failed: {error}",
            execution_time=0,
        )

    # ==================================================================
    # Core agent executor
    # ==================================================================

    async def execute_agent(
        self,
        agent: BaseAgent,
        agent_name: str,
        input_data,
        session_id: str,
    ) -> tuple[str, dict]:
        """
        Execute a single agent, logging success or failure.

        Parameters
        ----------
        agent:
            The ``BaseAgent`` instance to run.
        agent_name:
            Human-readable name used in logs (e.g. ``"Researcher"``).
        input_data:
            Argument forwarded to ``agent.execute()``.  Type depends on
            the agent (``dict`` for Planner, ``str`` for the others).
        session_id:
            Used for log persistence.

        Returns
        -------
        tuple[str, dict]
            ``(agent_name, result_dict)``

        Raises
        ------
        Exception
            Re-raises any exception after logging the failure.
        """
        start: float = time.perf_counter()
        try:
            result: dict = await agent.execute(input_data)
            await self.log_success(
                session_id=session_id,
                agent_name=agent_name,
                start_time=start,
            )
            return agent_name, result
        except Exception as exc:
            await self.log_failure(
                session_id=session_id,
                agent_name=agent_name,
                error=exc,
            )
            raise

    # ==================================================================
    # Private helpers
    # ==================================================================

    @staticmethod
    def _build_research_prompt(
        conversation: str,
        user_input: str,
    ) -> str:
        """
        Compose the contextualised prompt string passed to the Researcher.

        Parameters
        ----------
        conversation:
            Formatted conversation history string.
        user_input:
            The current user message.

        Returns
        -------
        str
            The full prompt string.
        """
        return (
            "Conversation History\n\n"
            f"{conversation}\n"
            "Current User Message\n\n"
            f"{user_input}"
        )
