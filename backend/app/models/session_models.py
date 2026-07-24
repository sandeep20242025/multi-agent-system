from pydantic import BaseModel, Field


class SessionRequest(BaseModel):
    """
    Request model for continuing an existing chat session.
    """

    session_id: str = Field(
        ...,
        description="Existing chat session ID",
        examples=["7bb7f26b-8d24-4cf9-91f6-6b54d7a1d2d5"],
    )

    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User message",
        examples=["Continue our previous conversation."],
    )


class SessionResponse(BaseModel):
    """
    Response after processing a session request.
    """

    success: bool = Field(
        ...,
        description="Whether the request was successful",
    )

    session_id: str = Field(
        ...,
        description="Chat session ID",
    )

    message: str = Field(
        ...,
        description="Status message",
    )


class SessionInfo(BaseModel):
    """
    Session metadata.
    """

    id: str
    title: str
    summary: str | None = None


class SessionListResponse(BaseModel):
    """
    Response containing all chat sessions.
    """

    success: bool = True

    sessions: list[SessionInfo]