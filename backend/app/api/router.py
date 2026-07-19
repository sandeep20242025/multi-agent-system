from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.agent_routes import router as agent_router
from app.api.routes.session_routes import router as session_router

api_router = APIRouter(prefix="/api")

api_router.include_router(health_router)
api_router.include_router(agent_router)
api_router.include_router(session_router)
