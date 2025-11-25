from django.db import connections
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        status_map = {"database": False}
        try:
            with connections["default"].cursor() as cursor:
                cursor.execute("SELECT 1")
            status_map["database"] = True
        except Exception:
            status_map["database"] = False

        return Response(
            {
                "status": "ok" if all(status_map.values()) else "degraded",
                "services": status_map,
            }
        )

