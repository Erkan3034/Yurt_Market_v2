from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

from .domain import DomainError, NotFoundError, PermissionDeniedError, ValidationError


def drf_exception_handler(exc, context):
    """Translate domain exceptions into DRF responses with structured payloads."""
    if isinstance(exc, ValidationError):
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    if isinstance(exc, PermissionDeniedError):
        return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
    if isinstance(exc, NotFoundError):
        return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
    if isinstance(exc, DomainError):
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    response = exception_handler(exc, context)
    if response is not None:
        return response

    return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

