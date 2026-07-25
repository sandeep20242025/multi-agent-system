from fastapi import APIRouter, Depends

from app.api.dependencies import get_orchestrator
from app.agents.orchestrator import Orchestrator
from app.models.chat_models import ChatRequest, ChatResponse
from app.services.memory_service import memory_service
from app.services.agent_log_service import agent_log_service
from app.core.security import get_current_user

router = APIRouter(
    prefix="/agents",
    tags=["Agents"],
)


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    user_id: str = current_user["user_id"]

    result = await orchestrator.execute(
        user_input=request.message,
        user_id=user_id,
        session_id=request.session_id,
    )

    return ChatResponse(
        session_id=result["session_id"],
        response=result["response"],
    )


@router.get("/sessions")
async def get_sessions(
    current_user: dict = Depends(get_current_user),
):
    user_id: str = current_user["user_id"]
    return await memory_service.get_all_sessions(user_id)


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id: str = current_user["user_id"]
    messages = await memory_service.get_session_messages(session_id, user_id)

    return {
        "session_id": session_id,
        "messages": messages,
    }


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id: str = current_user["user_id"]
    await memory_service.delete_session(session_id, user_id)

    return {
        "message": "Session deleted successfully",
    }


@router.get("/logs/{session_id}")
async def get_logs(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id: str = current_user["user_id"]
    await memory_service.get_session_messages(session_id, user_id)
    return await agent_log_service.get_logs(session_id)
