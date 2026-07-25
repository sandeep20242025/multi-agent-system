"""
auth_service.py
---------------
Service layer for all Supabase Auth operations.

All identity operations (register, login, logout, session refresh, and
current-user lookup) are handled here and nowhere else.  Route handlers
call this service; they never touch the Supabase client directly.

Design notes
------------
- Auth operations require the **anon-key** client so Supabase returns a
  user-scoped JWT.  The service-role client is intentionally NOT used here.
- ``AuthenticationException`` is raised for every predictable auth failure
  (wrong password, expired token, duplicate e-mail, etc.).
- Unexpected errors are logged with ``logger.exception`` and re-raised so
  the global exception handler can return a 500 response.
"""

from gotrue.errors import AuthApiError

from app.core.supabase_auth_client import supabase_auth
from app.core.exceptions import AuthenticationException
from app.core.logger import logger


class AuthService:
    """
    Provides async methods for Supabase Auth operations.

    Each method maps to one logical identity action and returns a plain
    ``dict`` that route handlers can serialise directly into responses.
    """

    # ------------------------------------------------------------------
    # Register
    # ------------------------------------------------------------------

    async def register(
        self,
        email: str,
        password: str,
        full_name: str | None = None,
    ) -> dict:
        """
        Create a new Supabase Auth user.

        Optional ``full_name`` is stored in the user's ``user_metadata``
        object inside Supabase — no custom ``users`` table is required.

        Parameters
        ----------
        email:
            The user's e-mail address.  Must be unique within the project.
        password:
            Plain-text password (minimum 6 characters enforced by Supabase).
        full_name:
            Optional display name stored as ``user_metadata.full_name``.

        Returns
        -------
        dict
            ``{ user_id, email, message }``

        Raises
        ------
        AuthenticationException
            When Supabase rejects the sign-up (e.g. duplicate e-mail or
            weak password).
        """
        options: dict = {}
        if full_name:
            options["data"] = {"full_name": full_name}

        try:
            result = supabase_auth.auth.sign_up(
                {
                    "email": email,
                    "password": password,
                    "options": options,
                }
            )
        except AuthApiError as exc:
            logger.warning("Register failed for %s: %s", email, exc.message)
            raise AuthenticationException(exc.message) from exc
        except Exception as exc:
            logger.exception("Unexpected error during register for %s", email)
            raise

        user = result.user
        if user is None:
            # Supabase returns user=None only when the project requires
            # e-mail confirmation before the account becomes active.
            raise AuthenticationException(
                "Registration received. "
                "Please confirm your e-mail address to activate your account."
            )

        logger.info("User registered: %s (id=%s)", user.email, user.id)

        return {
            "user_id": str(user.id),
            "email": user.email,
            "message": "Registration successful.",
        }

    # ------------------------------------------------------------------
    # Login
    # ------------------------------------------------------------------

    async def login(
        self,
        email: str,
        password: str,
    ) -> dict:
        """
        Authenticate with email and password.

        Parameters
        ----------
        email:
            Registered e-mail address.
        password:
            Plain-text password.

        Returns
        -------
        dict
            ``{ access_token, refresh_token, user_id, email }``

        Raises
        ------
        AuthenticationException
            When credentials are invalid or the account does not exist.
        """
        try:
            result = supabase_auth.auth.sign_in_with_password(
                {
                    "email": email,
                    "password": password,
                }
            )
        except AuthApiError as exc:
            logger.warning("Login failed for %s: %s", email, exc.message)
            raise AuthenticationException(exc.message) from exc
        except Exception:
            logger.exception("Unexpected error during login for %s", email)
            raise

        session = result.session
        user = result.user

        if session is None or user is None:
            raise AuthenticationException(
                "Login failed: no session returned by the provider."
            )

        logger.info("User logged in: %s (id=%s)", user.email, user.id)

        return {
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "user_id": str(user.id),
            "email": user.email,
        }

    # ------------------------------------------------------------------
    # Logout
    # ------------------------------------------------------------------

    async def logout(self, access_token: str) -> dict:
        """
        Invalidate the Supabase session associated with the given token.

        The caller should discard both the access and refresh tokens after
        a successful response, regardless of the HTTP outcome.

        Parameters
        ----------
        access_token:
            The JWT issued by Supabase at login / register time.

        Returns
        -------
        dict
            ``{ message }``

        Raises
        ------
        AuthenticationException
            When Supabase rejects the sign-out request.
        """
        try:
            # Inject the user's token before signing out so Supabase
            # invalidates *their* session, not the anon client session.
            supabase_auth.auth.set_session(access_token, "")
            supabase_auth.auth.sign_out()
        except AuthApiError as exc:
            logger.warning("Logout failed: %s", exc.message)
            raise AuthenticationException(exc.message) from exc
        except Exception:
            logger.exception("Unexpected error during logout")
            raise

        logger.info("User session invalidated successfully.")

        return {"message": "Logged out successfully."}

    # ------------------------------------------------------------------
    # Refresh Session
    # ------------------------------------------------------------------

    async def refresh_session(self, refresh_token: str) -> dict:
        """
        Exchange a refresh token for a new access/refresh token pair.

        Parameters
        ----------
        refresh_token:
            The refresh token issued alongside the original access token.

        Returns
        -------
        dict
            ``{ access_token, refresh_token }``

        Raises
        ------
        AuthenticationException
            When the refresh token is expired, revoked, or invalid.
        """
        try:
            result = supabase_auth.auth.refresh_session(refresh_token)
        except AuthApiError as exc:
            logger.warning("Session refresh failed: %s", exc.message)
            raise AuthenticationException(exc.message) from exc
        except Exception:
            logger.exception("Unexpected error during session refresh")
            raise

        session = result.session

        if session is None:
            raise AuthenticationException(
                "Session refresh failed: no session returned by the provider."
            )

        logger.info(
            "Session refreshed for user id=%s",
            result.user.id if result.user else "unknown",
        )

        return {
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
        }

    # ------------------------------------------------------------------
    # Get Current User
    # ------------------------------------------------------------------

    async def get_current_user(self, access_token: str) -> dict:
        """
        Validate a JWT and return the associated user profile.

        Supabase verifies the token signature and expiry server-side;
        no local JWT decoding is performed here.

        Parameters
        ----------
        access_token:
            The bearer token supplied by the client.

        Returns
        -------
        dict
            ``{ user_id, email, full_name }``
            ``full_name`` is ``None`` when not stored in user metadata.

        Raises
        ------
        AuthenticationException
            When the token is missing, expired, or otherwise invalid.
        """
        try:
            result = supabase_auth.auth.get_user(access_token)
        except AuthApiError as exc:
            logger.warning("get_current_user failed: %s", exc.message)
            raise AuthenticationException(exc.message) from exc
        except Exception:
            logger.exception("Unexpected error in get_current_user")
            raise

        user = result.user

        if user is None:
            raise AuthenticationException("Invalid or expired token.")

        full_name: str | None = None
        if user.user_metadata:
            full_name = user.user_metadata.get("full_name")

        return {
            "user_id": str(user.id),
            "email": user.email,
            "full_name": full_name,
        }


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

auth_service = AuthService()
