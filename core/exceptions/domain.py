class DomainError(Exception):
    """Base class for domain-specific exceptions."""


class ValidationError(DomainError):
    """Raised when business rules are violated."""


class NotFoundError(DomainError):
    """Raised when an entity cannot be located."""


class PermissionDeniedError(DomainError):
    """Raised when a user lacks permissions to perform an action."""

