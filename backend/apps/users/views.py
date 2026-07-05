"""
User views (View layer).
Delegates to services (Presenter layer).
"""

from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, permissions, status, viewsets
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
    """Health check endpoint verifying DB and Redis connectivity."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.core.cache import cache
        from django.db import connections
        import time

        db_ok = False
        cache_ok = False

        # Check database with retry for cold start (Neon free tier)
        last_error = None
        for attempt in range(5):
            try:
                connections["default"].connect()
                with connections["default"].cursor() as cursor:
                    cursor.execute("SELECT 1")
                    cursor.fetchone()
                db_ok = True
                break
            except Exception as e:
                last_error = str(e)
                print(f"WARNING: Database health check (attempt {attempt + 1}/5): {e}")
                if attempt < 4:
                    time.sleep(3)

        # Check Redis / cache (non-blocking — Redis may be unavailable)
        try:
            cache.set("health_check", 1, 5)
            result = cache.get("health_check")
            cache_ok = result == 1
            if not cache_ok:
                print("WARNING: Cache write/read mismatch")
        except Exception as e:
            print(f"WARNING: Cache unavailable: {e}")

        if not db_ok:
            return Response(
                {"status": "unhealthy", "database": "unavailable", "error": last_error, "cache": "ok" if cache_ok else "unavailable"},
                status=503,
            )

        return Response(
            {
                "status": "healthy",
                "database": "ok",
                "cache": "ok" if cache_ok else "unavailable",
            }
        )
