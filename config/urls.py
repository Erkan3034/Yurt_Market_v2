from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from core.views import HealthCheckView

def root_view(request):
    """Root endpoint with API information."""
    return JsonResponse(
        {
            "name": "Yurt Market API",
            "version": "0.1.0",
            "description": "Multi-dorm student marketplace API",
            "endpoints": {
                "api_docs": "/api/schema/swagger-ui/",
                "api_schema": "/api/schema/",
                "admin": "/admin/",
                "users": "/api/users/",
                "products": "/api/products/",
                "orders": "/api/orders/",
                "subscription": "/api/subscription/",
                "notifications": "/api/notifications/",
                "analytics": "/api/analytics/",
            },
        }
    )


urlpatterns = [
    path("", root_view, name="root"),
    path("health/", HealthCheckView.as_view(), name="healthcheck"),
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/users/", include("modules.users.urls")),
    path("api/products/", include("modules.products.urls")),
    path("api/orders/", include("modules.orders.urls")),
    path("api/subscription/", include("modules.subscription.urls")),
    path("api/notifications/", include("modules.notifications.urls")),
    path("api/analytics/", include("modules.analytics.urls")),
    path("api/payments/", include("modules.payments.urls")),
]

