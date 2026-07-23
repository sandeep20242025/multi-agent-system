from app.core.supabase_client import supabase


class MemoryService:

    async def create_session(
        self,
        session_id: str,
        title: str,
    ):
        """
        Create a new chat session.
        """

        supabase.table("chat_sessions").insert(
            {
                "id": session_id,
                "title": title,
            }
        ).execute()

        return session_id

    async def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
    ):
        """
        Save a user or assistant message.
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
    ):
        """
        Get all messages for one chat session.
        """

        response = (
            supabase.table("chat_messages")
            .select("*")
            .eq("session_id", session_id)
            .order("created_at")
            .execute()
        )

        return response.data

    async def get_all_sessions(self):
        """
        Get all chat sessions.
        """

        response = (
            supabase.table("chat_sessions")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return response.data

    async def delete_session(
        self,
        session_id: str,
    ):
        """
        Delete a session and all its messages.
        """

        supabase.table("chat_messages") \
            .delete() \
            .eq("session_id", session_id) \
            .execute()

        supabase.table("chat_sessions") \
            .delete() \
            .eq("id", session_id) \
            .execute()
            
    async def get_recent_messages(
        self,
        session_id: str,
        limit: int = 20,
    ):
        response = (
            supabase.table("chat_messages")
            .select("role, content")
            .eq("session_id", session_id)
            .order("created_at")
            .limit(limit)
            .execute()
        )

        return response.data
    
    async def update_summary(
        self,
        session_id: str,
        summary: str,
    ):
        (
            supabase.table("chat_sessions")
            .update({"summary": summary})
            .eq("id", session_id)
            .execute()
        )
    
    async def get_summary(
        self,
        session_id: str,
    ):
        response = (
            supabase.table("chat_sessions")
            .select("summary")
            .eq("id", session_id)
            .single()
            .execute()
        )

        return response.data.get("summary")


memory_service = MemoryService()