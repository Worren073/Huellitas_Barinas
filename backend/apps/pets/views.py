"""
Pet views (View layer).
Delegates to services (Presenter layer).
"""

from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Pet, PetImage
from .permissions import IsCenterAdminOrSuperAdmin
from .serializers import PetCreateSerializer, PetImageSerializer, PetSerializer
from .services import PetService


class PetViewSet(viewsets.ModelViewSet):
    """
    Manage pets.

    Public endpoints:
        - GET /pets/
        - GET /pets/{id}/
        - GET /pets/available/

    CenterAdmin/SuperAdmin only:
        - POST /pets/
        - PUT/PATCH /pets/{id}/
        - DELETE /pets/{id}/
        - GET /pets/stats/
        - POST /pets/{id}/mark_adopted/
        - POST /pets/{id}/mark_in_process/
    """

    queryset = Pet.objects.select_related("center").prefetch_related("images")
    serializer_class = PetSerializer
    search_fields = ["name", "breed", "description"]
    ordering_fields = ["created_at", "name", "age_months"]
    ordering = ["-created_at"]

    def get_permissions(self):
        public_actions = {"list", "retrieve", "available"}
        if self.action in public_actions:
            return [permissions.AllowAny()]
        return [IsCenterAdminOrSuperAdmin()]

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return PetCreateSerializer
        return PetSerializer

    def get_queryset(self):
        queryset = Pet.objects.select_related("center").prefetch_related("images")

        user = self.request.user
        if user.is_authenticated and user.role == "center_admin" and user.center:
            queryset = queryset.filter(center=user.center)

        species = self.request.query_params.get("species")
        if species:
            queryset = queryset.filter(species=species)

        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        center = self.request.query_params.get("center")
        if center:
            queryset = queryset.filter(center_id=center)

        size = self.request.query_params.get("size")
        if size:
            queryset = queryset.filter(size=size)

        gender = self.request.query_params.get("gender")
        if gender:
            queryset = queryset.filter(gender=gender)

        return queryset

    @action(detail=False, methods=["get"])
    def available(self, request):
        """Get all available pets (public)."""
        available = PetService.get_available_pets()
        serializer = PetSerializer(available, many=True)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsCenterAdminOrSuperAdmin],
    )
    def stats(self, request):
        """Get dashboard stats, scoped to center for center_admins."""
        return Response(PetService.get_stats(request.user))

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsCenterAdminOrSuperAdmin],
    )
    def export(self, request):
        """Export pets to Word document."""
        return PetService.export_to_docx(self.get_queryset())

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsCenterAdminOrSuperAdmin],
    )
    def mark_adopted(self, request, pk=None):
        """Mark a pet as adopted."""
        pet = self.get_object()
        service = PetService(pet)
        service.mark_as_adopted()
        return Response(PetSerializer(pet).data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsCenterAdminOrSuperAdmin],
    )
    def mark_in_process(self, request, pk=None):
        """Mark a pet as in adoption process."""
        pet = self.get_object()
        service = PetService(pet)
        service.mark_as_in_process()
        return Response(PetSerializer(pet).data)


class PetImageViewSet(viewsets.ModelViewSet):
    """Manage pet images."""

    queryset = PetImage.objects.all()
    serializer_class = PetImageSerializer

    def get_permissions(self):
        public_actions = {"list", "retrieve"}
        if self.action in public_actions:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = PetImage.objects.all()
        pet_id = self.kwargs.get("pet_pk")
        if pet_id:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset

    def perform_create(self, serializer):
        pet_id = self.kwargs.get("pet_pk")
        serializer.save(pet_id=pet_id)
