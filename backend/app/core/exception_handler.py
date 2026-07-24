from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.exceptions import AgentException


async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    """
    Global exception handler for the application.
    """

    # Custom application exceptions
    if isinstance(exc, AgentException):

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.message,
            },
        )

    # Unexpected exceptions
    print("\n========== UNHANDLED EXCEPTION ==========")
    print(exc)
    print("=========================================\n")

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal Server Error",
        },
    )