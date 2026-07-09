"""
Auth URL patterns.
"""

from django.urls import path

from ..views import (
    ChangePasswordView,
    CookieTokenRefreshView,
    DeactivateAccountView,
    LoginView,
    LogoutView,
    RegisterView,
)

app_name = "auth"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("deactivate/", DeactivateAccountView.as_view(), name="deactivate"),
]
