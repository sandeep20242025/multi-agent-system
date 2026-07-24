from typing import Dict

from app.agents.base_agent import BaseAgent
from app.agents.planner_agent import PlannerAgent
from app.agents.researcher_agent import ResearcherAgent
from app.agents.analyzer_agent import AnalyzerAgent
from app.agents.writer_agent import WriterAgent

from app.core.exceptions import AgentNotFoundException


class AgentRegistry:

    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}

        self._register_default_agents()

    # ---------------------------------
    # Register default agents
    # ---------------------------------

    def _register_default_agents(self):

        self.register("planner", PlannerAgent())
        self.register("researcher", ResearcherAgent())
        self.register("analyzer", AnalyzerAgent())
        self.register("writer", WriterAgent())

    # ---------------------------------
    # Register new agent
    # ---------------------------------

    def register(
        self,
        name: str,
        agent: BaseAgent,
    ):

        self.agents[name] = agent

    # ---------------------------------
    # Get Agent
    # ---------------------------------

    def get(
        self,
        name: str,
    ) -> BaseAgent:

        if name not in self.agents:

            raise AgentNotFoundException(
                f"Agent '{name}' not found."
            )

        return self.agents[name]

    # ---------------------------------
    # Check if exists
    # ---------------------------------

    def exists(
        self,
        name: str,
    ) -> bool:

        return name in self.agents

    # ---------------------------------
    # Remove
    # ---------------------------------

    def unregister(
        self,
        name: str,
    ):

        self.agents.pop(name, None)

    # ---------------------------------
    # Get all agents
    # ---------------------------------

    def list_agents(self):

        return list(self.agents.keys())


agent_registry = AgentRegistry()