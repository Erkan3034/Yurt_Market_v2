from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from modules.payments.services import PaymentService

from .serializers import SubscriptionStartSerializer
from .services import SubscriptionService


class SubscriptionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = SubscriptionService().get_status(request.user.id)
        return Response(data)


class SubscriptionStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SubscriptionStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = SubscriptionService()
        plan = service.get_plan(serializer.validated_data["plan_id"])

        payment_session = PaymentService(
            provider=getattr(settings, "PAYMENT_PROVIDER", "dummy")
        ).create_checkout(amount=float(plan.price))

        subscription = service.start_subscription(
            seller=request.user,
            plan_id=plan.id,
        )
        return Response(
            {
                "subscription_id": subscription.id,
                "plan": subscription.plan.name,
                "expires_at": subscription.expires_at,
                "payment_session": payment_session,
            },
            status=status.HTTP_201_CREATED,
        )

