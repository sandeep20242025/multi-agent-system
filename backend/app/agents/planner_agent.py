from app.agents.base_agent import BaseAgent


class PlannerAgent(BaseAgent):

    def __init__(self):
        super().__init__("Planner")

    async def execute(self, user_input: str) -> dict:

        plan = [
            "Understand the user request",
            "Research the topic",
            "Analyze the collected information",
            "Generate the final response"
        ]

        return {
            "agent": self.name,
            "goal": user_input,
            "plan": plan,
        }