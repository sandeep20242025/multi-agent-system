from fastapi import APIRouter, Depends

from app.api.dependencies import get_orchestrator
from app.agents.orchestrator import Orchestrator
from app.models.agent_models import AgentRequest, AgentResponse

router = APIRouter(
    prefix="/agents",
    tags=["Agents"],
)


@router.post("/chat", response_model=AgentResponse)
async def chat(
    request: AgentRequest,
    orchestrator: Orchestrator = Depends(get_orchestrator),
):

    result = await orchestrator.execute(request.message)

    return AgentResponse(
        success=result["success"],
        session_id=result["session_id"],
        response=result["response"],
    )
