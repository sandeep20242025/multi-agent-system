from app.agents.base_agent import BaseAgent
from app.services.llm_service import llm_service


class AnalyzerAgent(BaseAgent):
    def __init__(self):
        super().__init__("Analyzer")

    async def execute(self, research: str) -> dict:
        prompt = f"""
You are an AI Analysis Agent.

Analyze the following research.

Research:
{research}

Return:
- Summary
- Advantages
- Disadvantages
- Final observations
"""

        analysis = await llm_service.generate(prompt)

        return {
            "agent": self.name,
            "analysis": analysis,
        }