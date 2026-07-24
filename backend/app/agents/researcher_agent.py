from app.agents.base_agent import BaseAgent
from app.services.llm_service import llm_service
from app.tools.tool_registry import tool_registry

import re


class ResearcherAgent(BaseAgent):

    def __init__(self):
        super().__init__("Researcher")

    def _is_math_expression(self, text: str) -> bool:
        """
        Detect simple arithmetic expressions.

        Examples:
            25+15
            100/5
            (25+10)*3
        """
        pattern = r"^[0-9\+\-\*\/\%\(\)\.\s]+$"
        return bool(re.fullmatch(pattern, text.strip()))

    async def execute(self, task: str) -> dict:

        # -------------------------
        # Calculator Tool
        # -------------------------

        if self._is_math_expression(task):

            calculator = tool_registry.get("calculator")

            result = await calculator.execute(task)

            return {
                "agent": self.name,
                "tool_used": "calculator",
                "research": str(result["result"]),
            }

        # -------------------------
        # LLM Research
        # -------------------------

        prompt = f"""
You are a professional AI Research Agent.

Research the following request thoroughly.

Task:
{task}

Return:
- Key facts
- Important points
- Helpful references
- Clear explanation
"""

        research = await llm_service.generate(prompt)

        return {
            "agent": self.name,
            "tool_used": "llm",
            "research": research,
        }