"""
Center views (View layer).
Delegates to services (Presenter layer).
"""

from django.db.models import Count
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Center
from .serializers import CenterSerializer, CenterCreateSerializer
from .services import CenterService
from .permissions import IsCenterAdminOrReadOnly


class CenterViewSet(viewsets.ModelViewSet):
    """ViewSet for managing adoption centers."""
    queryset = Center.objects.annotate(pets_count=Count('pets'))
    serializer_class = CenterSerializer
    permission_classes = [IsCenterAdminOrReadOnly]
    search_fields = ['name', 'description', 'address']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CenterCreateSerializer
        return CenterSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def activate(self, request, pk=None):
        """Activate a center (admin only)."""
        center = self.get_object()
        center = CenterService.activate_center(center, request.user)
        return Response(CenterSerializer(center).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def deactivate(self, request, pk=None):
        """Deactivate a center (admin only)."""
        center = self.get_object()
        center = CenterService.deactivate_center(center, request.user)
        return Response(CenterSerializer(center).data)

    @action(detail=True, methods=['get'])
    def pets(self, request, pk=None):
        """Get pets for a center."""
        center = self.get_object()
        pets = center.pets.all()
        from apps.pets.serializers import PetSerializer
        return Response(PetSerializer(pets, many=True).data)
