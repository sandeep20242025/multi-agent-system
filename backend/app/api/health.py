from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    return {
        "success": True,
        "message": "Backend is healthy",
        "status": "running"
    }