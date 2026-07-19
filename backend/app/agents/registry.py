from app.agents.planner_agent import PlannerAgent
from app.agents.researcher_agent import ResearcherAgent
from app.agents.analyzer_agent import AnalyzerAgent
from app.agents.writer_agent import WriterAgent
from app.core.exceptions import AgentNotFoundException


class AgentRegistry:

    def __init__(self):
        self.agents = {
            "planner": PlannerAgent(),
            "researcher": ResearcherAgent(),
            "analyzer": AnalyzerAgent(),
            "writer": WriterAgent(),
        }

    def get(self, name: str):
        agent = self.agents.get(name)

        if agent is None:
            raise AgentNotFoundException(f"Agent '{name}' not found.")

        return agent


agent_registry = AgentRegistry()
