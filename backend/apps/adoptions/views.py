"""
Adoption views (View layer).
Delegates to services (Presenter layer).
"""

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .models import Adoption
from .permissions import IsAdminOrCenterAdmin, IsApplicantOrCenterAdmin
from .serializers import (
    AdoptionCreateSerializer,
    AdoptionSerializer,
    AdoptionTimelineSerializer,
)
from .services import AdoptionService


class AdoptionViewSet(viewsets.ModelViewSet):
    """
    Manage adoption requests.

    Authenticated users (applicants):
        - POST /adoptions/ (create request)
        - GET /adoptions/ (own requests)
        - GET /adoptions/{id}/ (own request)
        - POST /adoptions/{id}/submit/
        - GET /adoptions/{id}/timeline/

    CenterAdmin / SuperAdmin only:
        - POST /adoptions/{id}/start_review/
        - POST /adoptions/{id}/approve/
        - POST /adoptions/{id}/reject/
        - POST /adoptions/{id}/complete/
    """

    queryset = Adoption.objects.select_related("pet", "applicant", "center", "reviewed_by")
    serializer_class = AdoptionSerializer

    def get_permissions(self):
        admin_actions = {"start_review", "approve", "reject", "complete", "export"}
        if self.action in admin_actions:
            return [permissions.IsAuthenticated(), IsAdminOrCenterAdmin()]
        return [permissions.IsAuthenticated(), IsApplicantOrCenterAdmin()]

    def get_queryset(self):
        user = self.request.user
        qs = Adoption.objects.select_related("pet", "applicant", "center", "reviewed_by")
        pet_id = self.request.query_params.get("pet")
        if pet_id:
            qs = qs.filter(pet_id=pet_id)
        if self.request.query_params.get("mine") == "true":
            return qs.filter(applicant=user)
        if user.is_superuser:
            return qs.all()
        elif user.role == "center_admin":
            return qs.filter(center=user.center)
        return qs.filter(applicant=user)

    def get_serializer_class(self):
        if self.action == "create":
            return AdoptionCreateSerializer
        return AdoptionSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_throttles(self):
        throttles = super().get_throttles()
        if self.action == "create":
            throttles.append(ScopedRateThrottle())
            self.throttle_scope = "adoption_create"
        return throttles

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated, IsAdminOrCenterAdmin],
    )
    def export(self, request):
        """Export adoptions to Word document."""
        return AdoptionService.export_to_docx(self.get_queryset())

    def perform_create(self, serializer):
        try:
            adoption = AdoptionService.create_and_submit(
                validated_data=serializer.validated_data,
                applicant=self.request.user,
            )
            serializer.instance = adoption
        except ValidationError as e:
            raise ValidationError({"error": str(e)}) from e

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        """Submit an adoption request."""
        adoption = self.get_object()
        service = AdoptionService(adoption)

        try:
            service.submit()
            return Response(AdoptionSerializer(adoption).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAdminOrCenterAdmin],
    )
    def start_review(self, request, pk=None):
        """Start reviewing an adoption request (admin only)."""
        adoption = self.get_object()
        service = AdoptionService(adoption)

        try:
            service.start_review(reviewed_by=request.user)
            return Response(AdoptionSerializer(adoption).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAdminOrCenterAdmin],
    )
    def approve(self, request, pk=None):
        """Approve an adoption request (admin only)."""
        adoption = self.get_object()
        service = AdoptionService(adoption)
        notes = request.data.get("notes", "")

        try:
            service.approve(approved_by=request.user, notes=notes)
            return Response(AdoptionSerializer(adoption).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAdminOrCenterAdmin],
    )
    def reject(self, request, pk=None):
        """Reject an adoption request (admin only)."""
        adoption = self.get_object()
        service = AdoptionService(adoption)
        reason = request.data.get("reason", "")

        try:
            service.reject(rejected_by=request.user, reason=reason)
            return Response(AdoptionSerializer(adoption).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAdminOrCenterAdmin],
    )
    def complete(self, request, pk=None):
        """Mark adoption as completed (admin only)."""
        adoption = self.get_object()
        service = AdoptionService(adoption)

        try:
            service.complete(completed_by=request.user)
            return Response(AdoptionSerializer(adoption).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def timeline(self, request, pk=None):
        """Get adoption timeline."""
        adoption = self.get_object()
        service = AdoptionService(adoption)
        timeline = service.get_timeline()

        return Response(AdoptionTimelineSerializer(timeline, many=True).data)
