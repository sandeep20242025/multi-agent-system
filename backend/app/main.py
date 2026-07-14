from fastapi import FastAPI

from app.api.router import api_router

app = FastAPI(
    title="Multi-Agent AI System",
    description="Backend API for IBM AI Impact Track",
    version="1.0.0"
)


@app.get("/", tags=["Root"])
async def root():
    return {
        "success": True,
        "message": "Welcome to Multi-Agent AI Backend"
    }


app.include_router(api_router)