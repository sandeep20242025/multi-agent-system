"""
security.py
-----------
Reusable FastAPI dependency module for protecting routes with Supabase Auth.

This module does NOT create or decode JWTs.  It delegates all token
validation to ``auth_service``, which in turn calls the Supabase Auth API.

Public API
----------
extract_bearer_token  – parse a raw ``Authorization`` header value
get_current_user      – FastAPI dependency → authenticated user dict
get_current_user_id   – FastAPI dependency → user_id string only
require_authenticated_user – alias for ``get_current_user``; reserved for
                             future role-based authorization layers
"""

from typing import Optional

from fastapi import Depends, Header

from app.services.auth_service import auth_service
from app.core.exceptions import AuthenticationException


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------


def extract_bearer_token(authorization: Optional[str]) -> str:
    """
    Extract the raw bearer token from an ``Authorization`` header value.

    Accepts a header string in the form ``Bearer <token>`` and returns the
    token portion.  The comparison is case-insensitive for the scheme prefix.

    Parameters
    ----------
    authorization:
        Raw value of the ``Authorization`` HTTP header, or ``None`` when the
        header is absent.

    Returns
    -------
    str
        The token string stripped of surrounding whitespace.

    Raises
    ------
    AuthenticationException
        When the header is absent, empty, or does not conform to the
        ``Bearer <token>`` format.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AuthenticationException(
            "Missing or invalid Authorization header. "
            "Expected format: 'Bearer <token>'"
        )
    return authorization.split(" ", 1)[1].strip()


# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
) -> dict:
    """
    FastAPI dependency that validates the bearer token and returns the user.

    Extracts the token from the ``Authorization`` header, then delegates
    validation to ``auth_service.get_current_user``.  Supabase verifies the
    token signature and expiry server-side; no local JWT logic is performed.

    Parameters
    ----------
    authorization:
        Injected by FastAPI from the ``Authorization`` request header.

    Returns
    -------
    dict
        ``{ user_id, email, full_name }`` as returned by ``auth_service``.

    Raises
    ------
    AuthenticationException
        When the header is missing, malformed, or the token is invalid or
        expired.
    """
    token = extract_bearer_token(authorization)
    return await auth_service.get_current_user(token)


async def get_current_user_id(
    current_user: dict = Depends(get_current_user),
) -> str:
    """
    FastAPI dependency that returns only the ``user_id`` of the current user.

    Parameters
    ----------
    current_user:
        Resolved by the ``get_current_user`` dependency.

    Returns
    -------
    str
        The UUID string identifying the authenticated user.
    """
    return current_user["user_id"]


async def require_authenticated_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    FastAPI dependency alias for ``get_current_user``.

    Intended as a named hook for future role-based or permission-based
    authorization logic.  Currently returns the same result as
    ``get_current_user``.

    Parameters
    ----------
    current_user:
        Resolved by the ``get_current_user`` dependency.

    Returns
    -------
    dict
        ``{ user_id, email, full_name }`` for the authenticated user.
    """
    return current_user
