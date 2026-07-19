from enum import Enum
from pydantic import BaseModel
from typing import Optional


class AgentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class WorkflowStep(BaseModel):
    agent: str
    status: AgentStatus
    output: Optional[str] = None
