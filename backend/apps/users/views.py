"""
User views (View layer).
Delegates to services (Presenter layer).
"""

from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

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
    """Login and obtain JWT tokens."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth_login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = authenticate(email=email, password=password)

        if user is None:
            return Response(
                {"error": "Credenciales inválidas."}, status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"error": "La cuenta está desactivada."}, status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }
        )


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


class HealthCheckView(APIView):
    """Health check endpoint — returns 200 immediately (no DB dependency)."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "healthy"})
