class AgentException(Exception):
    """Base exception for agent-related errors."""

    pass


class AgentNotFoundException(AgentException):
    """Raised when an agent is not found."""

    pass


class SessionNotFoundException(AgentException):
    """Raised when a session is not found."""

    pass


class LLMProviderException(AgentException):
    """Raised when the LLM provider fails."""

    pass
