"""
Adoption views (View layer).
Delegates to services (Presenter layer).
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Adoption
from .serializers import (
    AdoptionSerializer,
    AdoptionCreateSerializer,
    AdoptionTimelineSerializer,
)
from .services import AdoptionService
from .permissions import IsApplicantOrCenterAdmin, IsAdminOrCenterAdmin


class AdoptionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing adoption requests."""
    queryset = Adoption.objects.select_related('pet', 'applicant', 'center', 'reviewed_by')
    serializer_class = AdoptionSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicantOrCenterAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = Adoption.objects.select_related('pet', 'applicant', 'center', 'reviewed_by')
        if user.is_superuser:
            return qs.all()
        elif user.role == 'center_admin':
            return qs.filter(center=user.center)
        else:
            return qs.filter(applicant=user)

    def get_serializer_class(self):
        if self.action in ['create']:
            return AdoptionCreateSerializer
        return AdoptionSerializer

    def perform_create(self, serializer):
        adoption = serializer.save(applicant=self.request.user)
        service = AdoptionService(adoption)
        service.submit()

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit an adoption request."""
        adoption = self.get_object()
        service = AdoptionService(adoption)

        try:
            service.submit()
            return Response(AdoptionSerializer(adoption).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrCenterAdmin])
    def start_review(self, request, pk=None):
        """Start reviewing an adoption request (admin only)."""
        adoption = self.get_object()
        service = AdoptionService(adoption)

        try:
            service.start_review(reviewed_by=request.user)
            return Response(AdoptionSerializer(adoption).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrCenterAdmin])
    def approve(self, request, pk=None):
        """Approve an adoption request (admin only)."""
        adoption = self.get_object()
        service = AdoptionService(adoption)
        notes = request.data.get('notes', '')

        try:
            service.approve(approved_by=request.user, notes=notes)
            return Response(AdoptionSerializer(adoption).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrCenterAdmin])
    def reject(self, request, pk=None):
        """Reject an adoption request (admin only)."""
        adoption = self.get_object()
        service = AdoptionService(adoption)
        reason = request.data.get('reason', '')

        try:
            service.reject(rejected_by=request.user, reason=reason)
            return Response(AdoptionSerializer(adoption).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrCenterAdmin])
    def complete(self, request, pk=None):
        """Mark adoption as completed (admin only)."""
        adoption = self.get_object()
        service = AdoptionService(adoption)

        try:
            service.complete(completed_by=request.user)
            return Response(AdoptionSerializer(adoption).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """Get adoption timeline."""
        adoption = self.get_object()
        service = AdoptionService(adoption)
        timeline = service.get_timeline()

        return Response(AdoptionTimelineSerializer(timeline, many=True).data)
