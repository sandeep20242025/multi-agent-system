"""
auth_routes.py
--------------
Authentication endpoints.  This router is intentionally thin:

- Validate the incoming request model.
- Extract the bearer token where required.
- Delegate all business logic to ``auth_service``.
- Return a typed response model.

No Supabase client, no JWT library, and no business logic belong here.
All auth failures surface as ``AuthenticationException`` from the service
layer and are handled globally by ``global_exception_handler``.

Endpoints
---------
POST /auth/register  – create a new account
POST /auth/login     – sign in with email + password
POST /auth/logout    – invalidate the current session
POST /auth/refresh   – exchange a refresh token for a new token pair
GET  /auth/me        – return the authenticated user's profile
"""

from fastapi import APIRouter, Header, Body, status

from app.models.auth_models import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    CurrentUserResponse,
)
from app.services.auth_service import auth_service
from app.core.exceptions import AuthenticationException

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------


def _extract_bearer(authorization: str | None) -> str:
    """
    Pull the raw token from an ``Authorization: Bearer <token>`` header.

    Raises ``AuthenticationException`` (→ HTTP 401 via the global handler)
    instead of ``HTTPException`` so the error shape stays consistent with
    every other auth failure in this application.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AuthenticationException(
            "Missing or invalid Authorization header. "
            "Expected format: 'Bearer <token>'"
        )
    return authorization.split(" ", 1)[1].strip()


# ---------------------------------------------------------------------------
# POST /auth/register
# ---------------------------------------------------------------------------


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description=(
        "Create a new account using email and password. "
        "An optional full name is stored in the user profile. "
        "Returns an access token immediately when email confirmation is disabled."
    ),
)
async def register(body: RegisterRequest) -> AuthResponse:
    result = await auth_service.register(
        email=body.email,
        password=body.password,
        full_name=body.full_name,
    )
    return AuthResponse(
        success=True,
        message=result["message"],
        user_id=result["user_id"],
        email=result["email"],
    )


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Sign in with email and password",
    description=(
        "Authenticate with a registered email and password. "
        "Returns a Supabase access token and refresh token on success."
    ),
)
async def login(body: LoginRequest) -> AuthResponse:
    result = await auth_service.login(
        email=body.email,
        password=body.password,
    )
    return AuthResponse(
        success=True,
        message="Login successful.",
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        user_id=result["user_id"],
        email=result["email"],
    )


# ---------------------------------------------------------------------------
# POST /auth/logout
# ---------------------------------------------------------------------------


@router.post(
    "/logout",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Sign out and invalidate the current session",
    description=(
        "Invalidate the Supabase session tied to the supplied bearer token. "
        "Pass the access token in the Authorization header as 'Bearer <token>'. "
        "The client should discard both tokens after a successful response."
    ),
)
async def logout(
    authorization: str | None = Header(default=None),
) -> AuthResponse:
    access_token = _extract_bearer(authorization)
    result = await auth_service.logout(access_token)
    return AuthResponse(
        success=True,
        message=result["message"],
    )


# ---------------------------------------------------------------------------
# POST /auth/refresh
# ---------------------------------------------------------------------------


@router.post(
    "/refresh",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh the session token",
    description=(
        "Exchange a valid refresh token for a new access/refresh token pair. "
        "Send the refresh token in the JSON body under the key ``refresh_token``."
    ),
)
async def refresh(
    refresh_token: str = Body(..., embed=True),
) -> AuthResponse:
    result = await auth_service.refresh_session(refresh_token)
    return AuthResponse(
        success=True,
        message="Session refreshed successfully.",
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
    )


# ---------------------------------------------------------------------------
# GET /auth/me
# ---------------------------------------------------------------------------


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get the authenticated user",
    description=(
        "Validate the bearer token and return the associated user profile. "
        "Pass the access token in the Authorization header as 'Bearer <token>'."
    ),
)
async def me(
    authorization: str | None = Header(default=None),
) -> CurrentUserResponse:
    access_token = _extract_bearer(authorization)
    result = await auth_service.get_current_user(access_token)
    return CurrentUserResponse(
        success=True,
        user_id=result["user_id"],
        email=result["email"],
        full_name=result["full_name"],
    )
