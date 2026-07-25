from app.core.supabase_client import supabase
from app.core.exceptions import SessionNotFoundException


class MemoryService:

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _get_session(
        self,
        session_id: str,
        user_id: str,
    ) -> dict:
        """
        Fetch a single chat session and verify ownership.

        Parameters
        ----------
        session_id:
            UUID of the chat session to look up.
        user_id:
            UUID of the authenticated user asserting ownership.

        Returns
        -------
        dict
            The raw session row from ``chat_sessions``.

        Raises
        ------
        SessionNotFoundException
            When no session exists with the given ``session_id``, or when
            the session exists but does not belong to ``user_id``.
        """
        response = (
            supabase.table("chat_sessions")
            .select("*")
            .eq("id", session_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not response.data:
            raise SessionNotFoundException(session_id)

        return response.data

    # ------------------------------------------------------------------
    # Session operations
    # ------------------------------------------------------------------

    async def create_session(
        self,
        session_id: str,
        user_id: str,
        title: str,
    ) -> str:
        """
        Create a new chat session owned by the given user.

        Parameters
        ----------
        session_id:
            UUID to assign to the new session.
        user_id:
            UUID of the authenticated user who owns this session.
        title:
            Human-readable label for the session.

        Returns
        -------
        str
            The ``session_id`` that was inserted.
        """
        supabase.table("chat_sessions").insert(
            {
                "id": session_id,
                "user_id": user_id,
                "title": title,
            }
        ).execute()

        return session_id

    async def get_all_sessions(
        self,
        user_id: str,
    ) -> list:
        """
        Return all chat sessions belonging to the given user, newest first.

        Parameters
        ----------
        user_id:
            UUID of the authenticated user.

        Returns
        -------
        list
            List of session rows from ``chat_sessions``.
        """
        response = (
            supabase.table("chat_sessions")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        return response.data

    async def delete_session(
        self,
        session_id: str,
        user_id: str,
    ) -> None:
        """
        Delete a session and all its messages after verifying ownership.

        Parameters
        ----------
        session_id:
            UUID of the session to delete.
        user_id:
            UUID of the authenticated user; must be the session owner.

        Raises
        ------
        SessionNotFoundException
            When the session does not exist or does not belong to ``user_id``.
        """
        await self._get_session(session_id, user_id)

        supabase.table("chat_messages") \
            .delete() \
            .eq("session_id", session_id) \
            .execute()

        supabase.table("chat_sessions") \
            .delete() \
            .eq("id", session_id) \
            .eq("user_id", user_id) \
            .execute()

    # ------------------------------------------------------------------
    # Message operations
    # ------------------------------------------------------------------

    async def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
    ) -> None:
        """
        Save a user or assistant message to a session.

        Parameters
        ----------
        session_id:
            UUID of the owning session.
        role:
            Either ``"user"`` or ``"assistant"``.
        content:
            The message body.
        """
        supabase.table("chat_messages").insert(
            {
                "session_id": session_id,
                "role": role,
                "content": content,
            }
        ).execute()

    async def get_session_messages(
        self,
        session_id: str,
        user_id: str,
    ) -> list:
        """
        Return all messages for a session after verifying ownership.

        Parameters
        ----------
        session_id:
            UUID of the session whose messages are requested.
        user_id:
            UUID of the authenticated user; must be the session owner.

        Returns
        -------
        list
            Ordered list of message rows from ``chat_messages``.

        Raises
        ------
        SessionNotFoundException
            When the session does not exist or does not belong to ``user_id``.
        """
        await self._get_session(session_id, user_id)

        response = (
            supabase.table("chat_messages")
            .select("*")
            .eq("session_id", session_id)
            .order("created_at")
            .execute()
        )

        return response.data

    async def get_recent_messages(
        self,
        session_id: str,
        user_id: str,
        limit: int = 20,
    ) -> list:
        """
        Return the most recent messages for a session after verifying ownership.

        Parameters
        ----------
        session_id:
            UUID of the session.
        user_id:
            UUID of the authenticated user; must be the session owner.
        limit:
            Maximum number of messages to return (default 20).

        Returns
        -------
        list
            List of ``{ role, content }`` rows ordered oldest-first.

        Raises
        ------
        SessionNotFoundException
            When the session does not exist or does not belong to ``user_id``.
        """
        await self._get_session(session_id, user_id)

        response = (
            supabase.table("chat_messages")
            .select("role, content")
            .eq("session_id", session_id)
            .order("created_at")
            .limit(limit)
            .execute()
        )

        return response.data

    # ------------------------------------------------------------------
    # Summary operations
    # ------------------------------------------------------------------

    async def update_summary(
        self,
        session_id: str,
        user_id: str,
        summary: str,
    ) -> None:
        """
        Persist a conversation summary on a session after verifying ownership.

        Parameters
        ----------
        session_id:
            UUID of the session to update.
        user_id:
            UUID of the authenticated user; must be the session owner.
        summary:
            The summary text to store.

        Raises
        ------
        SessionNotFoundException
            When the session does not exist or does not belong to ``user_id``.
        """
        await self._get_session(session_id, user_id)

        (
            supabase.table("chat_sessions")
            .update({"summary": summary})
            .eq("id", session_id)
            .eq("user_id", user_id)
            .execute()
        )

    async def get_summary(
        self,
        session_id: str,
        user_id: str,
    ):
        """
        Return the stored summary for a session after verifying ownership.

        Parameters
        ----------
        session_id:
            UUID of the session.
        user_id:
            UUID of the authenticated user; must be the session owner.

        Returns
        -------
        str or None
            The summary string, or ``None`` when no summary has been saved yet.

        Raises
        ------
        SessionNotFoundException
            When the session does not exist or does not belong to ``user_id``.
        """
        session = await self._get_session(session_id, user_id)
        return session.get("summary")


memory_service = MemoryService()
