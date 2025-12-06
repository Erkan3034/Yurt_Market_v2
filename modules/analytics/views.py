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


class SellerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get dashboard statistics for the authenticated seller."""
        if not hasattr(request.user, "seller_profile"):
            return Response({"detail": "User is not a seller."}, status=403)
        
        service = AnalyticsService()
        
        # Get date range from query params (7, 30, or 365 for year)
        date_range = request.query_params.get("range", "30")
        if date_range == "7":
            days = 7
        elif date_range == "365" or date_range == "year":
            days = 365
        else:
            days = 30
        
        seller_id = request.user.id
        
        stats = service.get_seller_dashboard_stats(seller_id, days)
        revenue_over_time = service.get_revenue_over_time(seller_id, days)
        top_products = service.get_top_selling_products(seller_id, days, limit=5)
        
        return Response({
            "stats": stats,
            "revenue_over_time": revenue_over_time,
            "top_products": top_products,
            "date_range": days,
        })

