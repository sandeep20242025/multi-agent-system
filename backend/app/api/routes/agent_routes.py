from fastapi import APIRouter, Depends

from app.api.dependencies import get_orchestrator
from app.agents.orchestrator import Orchestrator
from app.models.agent_models import AgentRequest, AgentResponse
from app.services.memory_service import memory_service
from app.models.chat_models import ChatRequest, ChatResponse

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

@router.get("/sessions")
async def get_sessions():
    return await memory_service.get_all_sessions()

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    return await memory_service.get_session_messages(session_id)

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    await memory_service.delete_session(session_id)

    return {
        "message": "Session deleted successfully"
    }
    
@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    orchestrator: Orchestrator = Depends(get_orchestrator)
):
    result = await orchestrator.execute(
        user_input=request.message,
        session_id=request.session_id
    )

    return ChatResponse(
        session_id=result["session_id"],
        response=result["response"]
    )
    
@router.get("/sessions")
async def get_sessions():
    return await memory_service.get_all_sessions()

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    messages = await memory_service.get_session_messages(session_id)

    return {
        "session_id": session_id,
        "messages": messages
    }