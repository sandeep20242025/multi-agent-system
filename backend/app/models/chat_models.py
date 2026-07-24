from typing import Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """
    Incoming chat request.
    """

    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User message",
        examples=["Explain quantum computing in simple words."],
    )

    session_id: Optional[str] = Field(
        default=None,
        description="Existing chat session ID. Leave empty to create a new session.",
    )


class ChatResponse(BaseModel):
    """
    Chat response returned by the AI.
    """

    success: bool = True

    session_id: str = Field(
        ...,
        description="Current chat session ID",
    )

    response: str = Field(
        ...,
        description="Final AI response",
    )


class ChatHistoryResponse(BaseModel):
    """
    Chat history response.
    """

    success: bool = True

    session_id: str

    messages: list