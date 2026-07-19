from typing import Any


def success_response(data: Any):
    return {
        "success": True,
        "data": data,
    }


def error_response(message: str):
    return {
        "success": False,
        "error": message,
    }
