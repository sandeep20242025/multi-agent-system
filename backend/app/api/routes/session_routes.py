from fastapi import APIRouter

from app.models.session_models import SessionRequest, SessionResponse
from app.services.memory_service import memory_service

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("/message", response_model=SessionResponse)
async def add_message(request: SessionRequest):

    memory_service.add_message(
        session_id=request.session_id,
        role="user",
        content=request.message,
    )

    return SessionResponse(
        success=True,
        session_id=request.session_id,
    )


@router.get("/{session_id}")
async def get_session(session_id: str):
    return memory_service.get_messages(session_id)


@router.delete("/{session_id}")
async def clear_session(session_id: str):
    memory_service.clear_session(session_id)

    return {"success": True, "message": "Session cleared"}
