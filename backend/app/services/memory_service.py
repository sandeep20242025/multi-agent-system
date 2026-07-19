from app.core.supabase_client import supabase


class MemoryService:

    async def create_session(self):
        response = (
            supabase.table("chat_sessions")
            .insert({})
            .execute()
        )

        return response.data[0]["id"]

    async def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
    ):
        supabase.table("chat_messages").insert(
            {
                "session_id": session_id,
                "role": role,
                "content": content,
            }
        ).execute()

    async def get_history(self, session_id: str):
        response = (
            supabase.table("chat_messages")
            .select("*")
            .eq("session_id", session_id)
            .order("created_at")
            .execute()
        )

        return response.data


memory_service = MemoryService()