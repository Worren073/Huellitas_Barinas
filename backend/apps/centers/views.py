"""
Center views (View layer).
Delegates to services (Presenter layer).
"""

from django.db.models import Count
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.pets.serializers import PetSerializer
from apps.users.permissions import IsSuperAdmin

from .models import Center
from .serializers import CenterCreateSerializer, CenterSerializer
from .services import CenterService


class CenterViewSet(viewsets.ModelViewSet):
    """
    Manage adoption centers.

    Public endpoints:
        - GET /centers/
        - GET /centers/{id}/
        - GET /centers/{id}/pets/

    SuperAdmin only:
        - POST /centers/
        - PUT/PATCH /centers/{id}/
        - DELETE /centers/{id}/
        - POST /centers/{id}/activate/
        - POST /centers/{id}/deactivate/
    """

    serializer_class = CenterSerializer

    search_fields = ["name", "description", "address"]
    ordering_fields = ["created_at", "name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        Base queryset.

        Annotate pets_count to avoid N+1 queries in the serializer.
        Supports ?state= filter for public browsing.
        """
        qs = Center.objects.annotate(pets_count=Count("pets"))
        state = self.request.query_params.get("state")
        if state:
            qs = qs.filter(state__iexact=state)
        return qs

    def get_permissions(self):
        """
        Allow public read access while restricting write operations
        to SuperAdmin users.
        """
        public_actions = {
            "list",
            "retrieve",
            "pets",
        }

        if self.action in public_actions:
            return [permissions.AllowAny()]

        return [IsSuperAdmin()]

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return CenterCreateSerializer

        return CenterSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsSuperAdmin],
    )
    def activate(self, request, pk=None):
        """Activate a center."""
        center = self.get_object()
        center = CenterService.activate_center(center, request.user)
        return Response(CenterSerializer(center).data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsSuperAdmin],
    )
    def deactivate(self, request, pk=None):
        """Deactivate a center."""
        center = self.get_object()
        center = CenterService.deactivate_center(center, request.user)
        return Response(CenterSerializer(center).data)

    @action(detail=True, methods=["get"])
    def pets(self, request, pk=None):
        """
        Return all pets that belong to this adoption center.
        """
        center = self.get_object()

        pets = center.pets.all().prefetch_related("images")

        serializer = PetSerializer(
            pets,
            many=True,
            context={"request": request},
        )

        return Response(serializer.data)
