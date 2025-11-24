from django.conf import settings
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView


class NotificationConfigView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "provider": "smtp",
                "host": settings.EMAIL_HOST,
                "sender": settings.DEFAULT_FROM_EMAIL,
            }
        )

