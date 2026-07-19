from app.agents.base_agent import BaseAgent
from app.services.llm_service import llm_service


class WriterAgent(BaseAgent):
    def __init__(self):
        super().__init__("Writer")

    async def execute(self, analysis: str) -> dict:
        prompt = f"""
You are an AI Writer.

Using the following analysis, prepare a final polished response.

Analysis:
{analysis}

Return a professional answer.
"""

        final_response = await llm_service.generate(prompt)

        return {
            "agent": self.name,
            "response": final_response,
        }