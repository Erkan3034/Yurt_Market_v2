from django.urls import path

from .views import LoginView, MeView, RefreshTokenView, RegisterView

urlpatterns = [
    path("auth/register", RegisterView.as_view(), name="auth-register"),
    path("auth/login", LoginView.as_view(), name="auth-login"),
    path("auth/refresh", RefreshTokenView.as_view(), name="auth-refresh"),
    path("me", MeView.as_view(), name="me"),
]

