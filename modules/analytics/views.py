from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import AnalyticsService


class PopularSellersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        dorm_id = request.query_params.get("dorm") or request.user.dorm_id
        refresh = request.query_params.get("refresh") == "1"
        service = AnalyticsService()
        if refresh:
            service.generate_popular_sellers(int(dorm_id))
        sellers = service.list_popular_sellers(int(dorm_id))
        return Response(sellers)

