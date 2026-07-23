from app.core.supabase_client import supabase


class AgentLogService:

    async def log(
        self,
        session_id: str,
        agent_name: str,
        status: str,
        execution_time: float,
    ):
        (
            supabase.table("agent_logs")
            .insert(
                {
                    "session_id": session_id,
                    "agent_name": agent_name,
                    "status": status,
                    "execution_time": execution_time,
                }
            )
            .execute()
        )

    async def get_logs(self, session_id: str):
        response = (
            supabase.table("agent_logs")
            .select("*")
            .eq("session_id", session_id)
            .order("created_at")
            .execute()
        )

        return response.data


agent_log_service = AgentLogService()