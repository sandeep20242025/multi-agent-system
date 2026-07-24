from typing import Any


def success_response(
    data: Any = None,
    message: str = "Success",
):
    """
    Standard successful API response.
    """

    return {
        "success": True,
        "message": message,
        "data": data,
    }


def error_response(
    message: str = "Something went wrong",
    errors: list | None = None,
):
    """
    Standard error API response.
    """

    return {
        "success": False,
        "message": message,
        "errors": errors or [],
    }