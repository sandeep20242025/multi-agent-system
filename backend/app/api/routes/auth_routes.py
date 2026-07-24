"""
auth_routes.py
--------------
Supabase-backed authentication endpoints.

All identity operations (sign-up, sign-in, sign-out, current user) are
delegated entirely to Supabase Auth.  No custom JWT is generated and no
users table is maintained by this application.

Endpoints
---------
POST /auth/register  – create a new Supabase Auth user
POST /auth/login     – sign in with email + password
POST /auth/logout    – invalidate the current session token
GET  /auth/me        – return the authenticated user's profile
"""

from fastapi import APIRouter, HTTPException, Header, status

from gotrue.errors import AuthApiError

from app.core.supabase_auth_client import supabase_auth
from app.api.schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    LogoutRequest,
    AuthResponse,
    UserResponse,
    MessageResponse,
)

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _build_auth_response(session) -> AuthResponse:
    """
    Map a Supabase ``Session`` + ``User`` pair to ``AuthResponse``.

    Parameters
    ----------
    session:
        The ``Session`` object returned by Supabase after sign-up or sign-in.

    Returns
    -------
    AuthResponse
    """
    return AuthResponse(
        access_token=session.access_token,
        user=UserResponse(
            id=str(session.user.id),
            email=session.user.email,
        ),
    )


def _require_bearer(authorization: str | None) -> str:
    """
    Extract and return the raw token from an ``Authorization: Bearer …``
    header, or raise **401** if the header is absent or malformed.

    Parameters
    ----------
    authorization:
        Raw value of the ``Authorization`` header.

    Returns
    -------
    str
        The token portion (everything after ``"Bearer "``).

    Raises
    ------
    HTTPException
        **401** when the header is missing or does not start with
        ``"Bearer "``.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header. "
                   "Expected: 'Bearer <token>'",
        )
    return authorization.removeprefix("Bearer ").strip()


# ---------------------------------------------------------------------------
# POST /auth/register
# ---------------------------------------------------------------------------


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(body: RegisterRequest) -> AuthResponse:
    """
    Create a new Supabase Auth user and return an access token.

    Supabase will send a confirmation e-mail if the project has e-mail
    confirmation enabled; the returned session token is valid immediately
    if confirmation is disabled.

    Raises
    ------
    HTTPException
        **400** when Supabase rejects the request (e.g. duplicate e-mail,
        weak password).
    """
    try:
        result = supabase_auth.auth.sign_up(
            {
                "email": body.email,
                "password": body.password,
            }
        )
    except AuthApiError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=exc.message,
        ) from exc

    if result.session is None:
        # Supabase returns session=None when e-mail confirmation is required.
        raise HTTPException(
            status_code=status.HTTP_201_CREATED,
            detail="Registration successful. "
                   "Please confirm your e-mail address before signing in.",
        )

    return _build_auth_response(result.session)


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Sign in with email and password",
)
async def login(body: LoginRequest) -> AuthResponse:
    """
    Authenticate with email + password and return a Supabase access token.

    Raises
    ------
    HTTPException
        **401** for invalid credentials; **400** for all other Supabase
        Auth errors.
    """
    try:
        result = supabase_auth.auth.sign_in_with_password(
            {
                "email": body.email,
                "password": body.password,
            }
        )
    except AuthApiError as exc:
        # Supabase returns "Invalid login credentials" for wrong password /
        # unknown e-mail; surface that as 401.
        status_code = (
            status.HTTP_401_UNAUTHORIZED
            if "invalid" in exc.message.lower() or "credentials" in exc.message.lower()
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(
            status_code=status_code,
            detail=exc.message,
        ) from exc

    return _build_auth_response(result.session)


# ---------------------------------------------------------------------------
# POST /auth/logout
# ---------------------------------------------------------------------------


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Sign out and invalidate the current session",
)
async def logout(body: LogoutRequest) -> MessageResponse:
    """
    Invalidate the Supabase session associated with the given access token.

    The client should discard the token after a successful response
    regardless of outcome.

    Raises
    ------
    HTTPException
        **400** if Supabase rejects the sign-out request.
    """
    try:
        # Inject the user's token so Supabase invalidates *their* session,
        # not the service-role session.
        supabase_auth.auth.set_session(body.access_token, "")
        supabase_auth.auth.sign_out()
    except AuthApiError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=exc.message,
        ) from exc

    return MessageResponse(message="Logged out successfully.")


# ---------------------------------------------------------------------------
# GET /auth/me
# ---------------------------------------------------------------------------


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Return the currently authenticated user",
)
async def me(
    authorization: str | None = Header(default=None),
) -> UserResponse:
    """
    Validate the bearer token and return the associated user profile.

    The ``Authorization`` header must be present and follow the
    ``Bearer <token>`` scheme.

    Raises
    ------
    HTTPException
        **401** if the header is absent, malformed, or the token is
        expired / invalid.
    """
    token = _require_bearer(authorization)

    try:
        result = supabase_auth.auth.get_user(token)
    except AuthApiError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=exc.message,
        ) from exc

    if result.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    return UserResponse(
        id=str(result.user.id),
        email=result.user.email,
    )
