from app.agents.planner_agent import PlannerAgent
from app.agents.researcher_agent import ResearcherAgent
from app.agents.analyzer_agent import AnalyzerAgent
from app.agents.writer_agent import WriterAgent

from app.services.memory_service import memory_service


class Orchestrator:

    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearcherAgent()
        self.analyzer = AnalyzerAgent()
        self.writer = WriterAgent()

    async def execute(self, user_input: str) -> dict:
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

        # Create unique session
        session_id = await memory_service.create_session()

        await memory_service.save_message(
            session_id,
            "user",
            user_input,
        )

        # -------------------------------
        # Planner
        # -------------------------------
        planner_result = await self.planner.execute({"goal": user_input})

        # -------------------------------
        # Researcher
        # -------------------------------
        research_result = await self.researcher.execute(user_input)

        # -------------------------------
        # Analyzer
        # -------------------------------
        analyzer_result = await self.analyzer.execute(research_result["research"])

        # -------------------------------
        # Writer
        # -------------------------------
        writer_result = await self.writer.execute(analyzer_result["analysis"])

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
