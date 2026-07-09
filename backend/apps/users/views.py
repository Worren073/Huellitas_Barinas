"""
User views (View layer).
Delegates to services (Presenter layer).
"""

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .permissions import IsSuperAdmin
from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    UserCreateSerializer,
    UserListSerializer,
    UserSerializer,
    UserUpdateRoleSerializer,
)
from .services import UserService

User = get_user_model()


def _set_auth_cookies(response, access_token, refresh_token):
    """Set httpOnly cookies for JWT tokens on the response."""
    is_secure = not settings.DEBUG
    samesite = "Lax"

    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=is_secure,
        samesite=samesite,
        max_age=900,  # 15 min
        path="/",
    )
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=is_secure,
        samesite=samesite,
        max_age=604800,  # 7 days
        path="/",
    )


def _clear_auth_cookies(response):
    """Clear auth cookies on the response."""
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


class RegisterView(generics.CreateAPIView):
    """Register a new user."""

    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth_register"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Login and obtain JWT tokens as httpOnly cookies."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth_login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        # Check if user exists and is locked before authenticating
        try:
            user = User.objects.get(email=email)
            if user.is_locked:
                remaining = int((user.locked_until - timezone.now()).total_seconds() // 60)
                return Response(
                    {"error": f"Cuenta bloqueada. Intenta de nuevo en {remaining} minutos."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
        except User.DoesNotExist:
            pass

        user = authenticate(email=email, password=password)

        if user is None:
            # Record failed attempt
            try:
                user = User.objects.get(email=email)
                UserService.record_failed_login(user)
            except User.DoesNotExist:
                pass
            return Response(
                {"error": "Credenciales inválidas."}, status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"error": "La cuenta está desactivada."}, status=status.HTTP_403_FORBIDDEN
            )

        UserService.reset_failed_login(user)
        refresh = RefreshToken.for_user(user)
        response = Response({"detail": "Inicio de sesión exitoso"})
        _set_auth_cookies(response, str(refresh.access_token), str(refresh))
        return response


class LogoutView(APIView):
    """Clear auth cookies and blacklist refresh token."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        response = Response({"detail": "Sesión cerrada exitosamente"})
        _clear_auth_cookies(response)
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """
    Refresh JWT access token.

    Reads the refresh_token from httpOnly cookie if not provided in request body.
    Sets new httpOnly cookies on success.
    """

    def post(self, request, *args, **kwargs):
        # If refresh not in body, try reading from cookie
        data = request.data.copy() if hasattr(request.data, "copy") else {}
        if "refresh" not in data:
            refresh_from_cookie = request.COOKIES.get("refresh_token")
            if refresh_from_cookie:
                data["refresh"] = refresh_from_cookie

        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            response = Response(
                {"detail": "Token de actualización inválido o expirado."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            _clear_auth_cookies(response)
            return response

        response = Response({"detail": "Token renovado exitosamente"})
        _set_auth_cookies(
            response,
            str(serializer.validated_data["access"]),
            str(serializer.validated_data["refresh"]),
        )
        return response


class DeactivateAccountView(APIView):
    """Allow authenticated users to request deletion of their own account."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        UserService.request_deactivation(request.user)
        return Response(
            {"message": "Tu cuenta será eliminada en 30 días. Durante este período no podrás acceder."},
            status=status.HTTP_200_OK,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update current user profile."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    """
    Manage users.

    SuperAdmin only:
        - GET /users/
        - GET /users/{id}/
        - PUT/PATCH /users/{id}/
        - DELETE /users/{id}/
        - POST /users/{id}/deactivate/
        - POST /users/{id}/restore/
    """

    queryset = User.objects.select_related("center").all()
    serializer_class = UserListSerializer

    def get_permissions(self):
        return [IsSuperAdmin()]

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)
        deleted = self.request.query_params.get("deleted")
        if deleted:
            queryset = queryset.filter(deletion_requested_at__isnull=False)
        return queryset

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return UserUpdateRoleSerializer
        return UserListSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(UserListSerializer(instance).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(UserListSerializer(instance).data)

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        """Super admin deactivates a user account."""
        user = self.get_object()
        if user == request.user:
            return Response(
                {"error": "No puedes desactivar tu propia cuenta desde aquí. Usa Eliminar Cuenta en Mis Solicitudes."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        UserService.request_deactivation(user)
        return Response({"message": f"Cuenta de {user.get_full_name()} programada para eliminación en 30 días."})

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        """Super admin restores a deactivated account within the grace period."""
        user = self.get_object()
        UserService.restore_account(user)
        return Response({"message": f"Cuenta de {user.get_full_name()} restaurada exitosamente."})


class ChangePasswordView(generics.UpdateAPIView):
    """Change current user password."""

    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = self.get_object()
        UserService.update_user(user, password=serializer.validated_data["new_password"])

        return Response({"message": "Contraseña actualizada exitosamente."})


class AuthStatusView(APIView):
    """Return auth status. Always 200 — no 401 for unauthenticated users."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                "authenticated": True,
                "user": UserSerializer(request.user).data,
            })
        return Response({"authenticated": False})


class HealthCheckView(APIView):
    """Health check endpoint — returns 200 immediately (no DB dependency)."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "healthy"})
