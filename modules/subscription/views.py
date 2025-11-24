from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

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
        subscription = SubscriptionService().start_subscription(
            seller=request.user,
            plan_id=serializer.validated_data["plan_id"],
        )
        return Response(
            {
                "subscription_id": subscription.id,
                "plan": subscription.plan.name,
                "expires_at": subscription.expires_at,
            },
            status=status.HTTP_201_CREATED,
        )

