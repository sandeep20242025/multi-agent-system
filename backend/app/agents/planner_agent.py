from app.agents.base_agent import BaseAgent
from app.services.llm_service import llm_service
import json


class PlannerAgent(BaseAgent):

    def __init__(self):
        super().__init__("Planner")

    async def execute(self, user_input: dict) -> dict:

        goal = user_input["goal"]

        prompt = f"""
You are the Planner Agent in a Multi-Agent AI System.

User Request:
{goal}

Available Agents:
- researcher
- analyzer
- writer

Decide which agents should execute.

Rules:
- Research questions -> researcher + writer
- Comparison/analysis -> researcher + analyzer + writer
- Simple writing -> writer only

Return ONLY valid JSON.

Example:

{{
    "agents":[
        "researcher",
        "analyzer",
        "writer"
    ]
}}
"""

        response = await llm_service.generate(prompt)

        try:
            result = json.loads(response)
            agents = result.get("agents", ["writer"])

        except Exception:
            agents = ["writer"]

        return {
            "agent": self.name,
            "goal": goal,
            "agents": agents,
        }