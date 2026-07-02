"""
Pet views (View layer).
Delegates to services (Presenter layer).
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Pet, PetImage
from .serializers import PetSerializer, PetCreateSerializer, PetImageSerializer
from .services import PetService


class PetViewSet(viewsets.ModelViewSet):
    """ViewSet for managing pets."""
    queryset = Pet.objects.all()
    serializer_class = PetSerializer
    search_fields = ['name', 'breed', 'description']
    ordering_fields = ['created_at', 'name', 'age_months']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'available']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PetCreateSerializer
        return PetSerializer

    def get_queryset(self):
        queryset = Pet.objects.all()
        
        # Filter by species
        species = self.request.query_params.get('species')
        if species:
            queryset = queryset.filter(species=species)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by center
        center = self.request.query_params.get('center')
        if center:
            queryset = queryset.filter(center_id=center)
        
        return queryset

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get all available pets."""
        pets = PetService.get_available_pets()
        serializer = PetSerializer(pets, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_adopted(self, request, pk=None):
        """Mark a pet as adopted."""
        pet = self.get_object()
        pet = PetService.mark_as_adopted(pet)
        return Response(PetSerializer(pet).data)

    @action(detail=True, methods=['post'])
    def mark_in_process(self, request, pk=None):
        """Mark a pet as in adoption process."""
        pet = self.get_object()
        pet = PetService.mark_as_in_process(pet)
        return Response(PetSerializer(pet).data)


class PetImageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing pet images."""
    queryset = PetImage.objects.all()
    serializer_class = PetImageSerializer

    def get_queryset(self):
        queryset = PetImage.objects.all()
        pet_id = self.kwargs.get('pet_pk')
        if pet_id:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset
