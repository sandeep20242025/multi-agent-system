"""
auth_schemas.py
---------------
Pydantic models for the /auth endpoints.

All fields are validated at the FastAPI boundary before any Supabase call
is made, keeping route handlers free of low-level input checking.
"""

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Requests
# ---------------------------------------------------------------------------


class RegisterRequest(BaseModel):
    """Payload for POST /auth/register."""

    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    """Payload for POST /auth/login."""

    email: EmailStr
    password: str


class LogoutRequest(BaseModel):
    """Payload for POST /auth/logout — carries the user's access token."""

    access_token: str


# ---------------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------------


class UserResponse(BaseModel):
    """Minimal, safe user representation returned to the client."""

    id: str
    email: str


class AuthResponse(BaseModel):
    """Returned by /register and /login on success."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    """Generic single-message response (e.g. logout confirmation)."""

    message: str
