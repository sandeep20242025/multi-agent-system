from app.agents.base_agent import BaseAgent
from app.services.llm_service import llm_service


class ResearcherAgent(BaseAgent):
    def __init__(self):
        super().__init__("Researcher")

    async def execute(self, task: str) -> dict:
        prompt = f"""
You are a professional AI Research Agent.

Research the following task thoroughly.

Task:
{task}

Return:
- Key facts
- Important points
- Helpful references
"""

        research = await llm_service.generate(prompt)

        return {
            "agent": self.name,
            "research": research,
        }