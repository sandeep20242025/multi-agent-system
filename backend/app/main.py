from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.exception_handler import global_exception_handler
from app.api.router import api_router
from app.core.config import settings
from app.core.logger import logger
from app.core.exception_handler import global_exception_handler

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Multi-Agent AI System Backend",
)

app.add_exception_handler(
    Exception,
    global_exception_handler,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(
    Exception,
    global_exception_handler,
)

app.include_router(api_router)


@app.get("/")
async def root():
    logger.info("Root endpoint called")

    return {"success": True, "message": "Multi-Agent AI Backend Running 🚀"}
