from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.logging import get_logger

logger = get_logger(__name__)


class PaymentWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        """Receive payment provider webhooks."""
        event = request.data
        logger.info("payment.webhook_received", payload=event)
        return Response({"status": "received"}, status=status.HTTP_200_OK)

