import time
from uuid import uuid4

from app.agents.planner_agent import PlannerAgent
from app.agents.researcher_agent import ResearcherAgent
from app.agents.analyzer_agent import AnalyzerAgent
from app.agents.writer_agent import WriterAgent

from app.services.memory_service import memory_service
from app.services.title_service import title_service
from app.services.summary_service import summary_service
from app.services.agent_log_service import agent_log_service


def generate_session_id():
    return str(uuid4())


class Orchestrator:

    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearcherAgent()
        self.analyzer = AnalyzerAgent()
        self.writer = WriterAgent()

    # ---------------------------------------------------
    # Session
    # ---------------------------------------------------

    async def _create_session(
        self,
        session_id: str | None,
        user_input: str,
    ):

        if session_id:
            return session_id

        session_id = generate_session_id()

        title = await title_service.generate_title(user_input)

        await memory_service.create_session(
            session_id=session_id,
            title=title,
        )

        return session_id

    # ---------------------------------------------------
    # Conversation Builder
    # ---------------------------------------------------

    def _build_conversation(self, history):

        return "\n".join(
            f"{msg['role'].capitalize()}: {msg['content']}"
            for msg in history
        )

    # ---------------------------------------------------
    # Logging
    # ---------------------------------------------------

    async def _log_success(
        self,
        session_id,
        agent_name,
        start,
    ):

        await agent_log_service.log(
            session_id=session_id,
            agent_name=agent_name,
            status="Success",
            execution_time=round(
                time.perf_counter() - start,
                3,
            ),
        )

    async def _log_failure(
        self,
        session_id,
        agent_name,
        error,
    ):

        await agent_log_service.log(
            session_id=session_id,
            agent_name=agent_name,
            status=f"Failed: {error}",
            execution_time=0,
        )

    # ---------------------------------------------------
    # Execute
    # ---------------------------------------------------

    async def execute(
        self,
        user_input: str,
        session_id: str | None = None,
    ):

        session_id = await self._create_session(
            session_id,
            user_input,
        )

        await memory_service.save_message(
            session_id=session_id,
            role="user",
            content=user_input,
        )

        history = await memory_service.get_recent_messages(
            session_id
        )

        conversation = self._build_conversation(history)

        summary = await memory_service.get_summary(session_id)

        research_prompt = f"""
Conversation Summary

{summary}

Conversation History

{conversation}

Current User Message

{user_input}
"""

        # -------------------------
        # Planner
        # -------------------------

        start = time.perf_counter()

        try:

            planner_result = await self.planner.execute(
                {"goal": user_input}
            )

            await self._log_success(
                session_id,
                "Planner",
                start,
            )

        except Exception as e:

            await self._log_failure(
                session_id,
                "Planner",
                e,
            )

            raise
        
                # -------------------------
        # Researcher
        # -------------------------

        start = time.perf_counter()

        try:

            research_result = await self.researcher.execute(
                research_prompt
            )

            await self._log_success(
                session_id,
                "Researcher",
                start,
            )

        except Exception as e:

            await self._log_failure(
                session_id,
                "Researcher",
                e,
            )

            raise

        # -------------------------
        # Analyzer
        # -------------------------

        start = time.perf_counter()

        try:

            analyzer_result = await self.analyzer.execute(
                research_result["research"]
            )

            await self._log_success(
                session_id,
                "Analyzer",
                start,
            )

        except Exception as e:

            await self._log_failure(
                session_id,
                "Analyzer",
                e,
            )

            raise

        # -------------------------
        # Writer
        # -------------------------

        start = time.perf_counter()

        try:

            writer_result = await self.writer.execute(
                analyzer_result["analysis"]
            )

            await self._log_success(
                session_id,
                "Writer",
                start,
            )

        except Exception as e:

            await self._log_failure(
                session_id,
                "Writer",
                e,
            )

            raise

        # -------------------------
        # Save Assistant Response
        # -------------------------

        await memory_service.save_message(
            session_id=session_id,
            role="assistant",
            content=writer_result["response"],
        )

        # -------------------------
        # Update Summary
        # -------------------------

        history = await memory_service.get_recent_messages(
            session_id
        )

        if len(history) >= 20:

            conversation = self._build_conversation(
                history
            )

            summary = await summary_service.generate_summary(
                conversation
            )

            await memory_service.update_summary(
                session_id=session_id,
                summary=summary,
            )

        # -------------------------
        # Response
        # -------------------------

        return {
            "success": True,
            "session_id": session_id,
            "planner": planner_result,
            "research": research_result,
            "analysis": analyzer_result,
            "response": writer_result["response"],
        }