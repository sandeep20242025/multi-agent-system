from pydantic import BaseModel


class SessionRequest(BaseModel):
    session_id: str
    message: str


class SessionResponse(BaseModel):
    success: bool
    session_id: str
