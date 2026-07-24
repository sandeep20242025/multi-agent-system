from typing import Optional


class AgentException(Exception):
    """
    Base exception for the Multi-Agent System.
    """

    def __init__(
        self,
        message: str,
        status_code: int = 400,
    ):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


# =====================================================
# Agent Exceptions
# =====================================================

class AgentNotFoundException(AgentException):
    def __init__(self, agent_name: str):
        super().__init__(
            message=f"Agent '{agent_name}' not found.",
            status_code=404,
        )


class AgentExecutionException(AgentException):
    def __init__(self, agent_name: str):
        super().__init__(
            message=f"{agent_name} execution failed.",
            status_code=500,
        )


# =====================================================
# Session Exceptions
# =====================================================

class SessionNotFoundException(AgentException):
    def __init__(self, session_id: Optional[str] = None):
        message = "Session not found."

        if session_id:
            message = f"Session '{session_id}' not found."

        super().__init__(
            message=message,
            status_code=404,
        )


# =====================================================
# Authentication Exceptions
# =====================================================

class AuthenticationException(AgentException):
    def __init__(self):
        super().__init__(
            message="Authentication failed.",
            status_code=401,
        )


class AuthorizationException(AgentException):
    def __init__(self):
        super().__init__(
            message="Permission denied.",
            status_code=403,
        )


# =====================================================
# LLM Exceptions
# =====================================================

class LLMProviderException(AgentException):
    def __init__(self, provider: str = "LLM"):
        super().__init__(
            message=f"{provider} provider failed.",
            status_code=500,
        )


# =====================================================
# Validation Exceptions
# =====================================================

class ValidationException(AgentException):
    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=422,
        )