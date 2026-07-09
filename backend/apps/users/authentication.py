from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken


class EmailAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()  # noqa: N806
        email = kwargs.get("email") or username
        if email is None:
            return None
        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None


class CookieJWTAuthentication(JWTAuthentication):
    """
    JWT authentication that reads tokens from httpOnly cookies as fallback.

    Priority:
        1. Authorization: Bearer header (for API clients / dev)
        2. access_token cookie (for browser-based auth)
    """

    def authenticate(self, request):
        # First try header-based auth (standard SimpleJWT behavior)
        try:
            result = super().authenticate(request)
            if result is not None:
                return result
        except (InvalidToken, TokenError):
            pass

        # Fallback: read access_token from cookie
        raw_token = request.COOKIES.get("access_token")
        if raw_token is None:
            return None

        try:
            validated_token = AccessToken(raw_token)
        except (InvalidToken, TokenError):
            return None

        user = self.get_user(validated_token)
        if user is None or not user.is_active:
            return None

        return (user, validated_token)
