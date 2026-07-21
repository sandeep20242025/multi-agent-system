from app.agents.planner_agent import PlannerAgent
from app.agents.researcher_agent import ResearcherAgent
from app.agents.analyzer_agent import AnalyzerAgent
from app.agents.writer_agent import WriterAgent

from app.services.memory_service import memory_service
from uuid import uuid4


def generate_session_id():
    return str(uuid4())


class Orchestrator:

    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearcherAgent()
        self.analyzer = AnalyzerAgent()
        self.writer = WriterAgent()

    async def execute(
        self,
        user_input: str,
        session_id: str | None = None,
    ):
        """
        Complete Multi-Agent Workflow

        User
            ↓
        Planner
            ↓
        Researcher
            ↓
        Analyzer
            ↓
        Writer
            ↓
        Final Response
        """

        # Create a new session only if one wasn't provided
        if session_id is None:
            session_id = generate_session_id()

            await memory_service.create_session(
                session_id=session_id,
                title=user_input[:50],
            )

        # Save user message
        await memory_service.save_message(
            session_id=session_id,
            role="user",
            content=user_input,
        )
        
        history = await memory_service.get_recent_messages(session_id)

        conversation = ""

        for msg in history:
            conversation += (
            f"{msg['role'].capitalize()}: "
            f"{msg['content']}\n"
            )

        # Planner
        planner_result = await self.planner.execute({"goal": user_input})

        # Researcher
        research_prompt = f"""
        Conversation History

        {conversation}

        Current User Message

        {user_input}
        """

        research_result = await self.researcher.execute(research_prompt)

        # Analyzer
        analyzer_result = await self.analyzer.execute(
            research_result["research"]
        )

        # Writer
        writer_result = await self.writer.execute(
            analyzer_result["analysis"]
        )

        # Save assistant response
        await memory_service.save_message(
            session_id=session_id,
            role="assistant",
            content=writer_result["response"],
        )

        return {
            "success": True,
            "session_id": session_id,
            "planner": planner_result,
            "research": research_result,
            "analysis": analyzer_result,
            "response": writer_result["response"],
        }