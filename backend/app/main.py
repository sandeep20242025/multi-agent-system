from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.exception_handler import global_exception_handler
from app.core.logger import logger
from app.utils.response import success_response


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Multi-Agent AI System Backend",
    docs_url="/docs",
    redoc_url="/redoc",
)

# =====================================================
# Global Exception Handler
# =====================================================

app.add_exception_handler(
    Exception,
    global_exception_handler,
)

# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# API Routes
# =====================================================

app.include_router(api_router)

# =====================================================
# Root
# =====================================================

@app.get(
    "/",
    tags=["System"],
    summary="Backend Status",
)
async def root():

    logger.info("Root endpoint called")

    return success_response(
        message="Multi-Agent AI Backend Running 🚀",
    )