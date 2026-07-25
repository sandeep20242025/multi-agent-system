"""
orchestrator.py
---------------
Thin entry-point that delegates all execution logic to ``Workflow``.
"""

from app.services.workflow import Workflow


class Orchestrator:
    """
    Public interface for running the multi-agent pipeline.

    All coordination logic lives in :class:`~app.services.workflow.Workflow`.
    This class exists solely to provide a stable, named entry-point for
    API routes and other callers.
    """

    def __init__(self) -> None:
        self.workflow = Workflow()

    async def execute(
        self,
        user_input: str,
        user_id: str,
        session_id: str | None = None,
    ) -> dict:
        """
        Run the full multi-agent pipeline for one user message.

        Parameters
        ----------
        user_input:
            The raw text submitted by the user.
        user_id:
            UUID of the authenticated user who owns the session.
        session_id:
            An existing session ID to continue a conversation, or
            ``None`` to start a new session automatically.

        Returns
        -------
        dict
            ``{ success, session_id, planner, research, analysis, response }``
        """
        return await self.workflow.run(
            user_input,
            user_id,
            session_id,
        )
