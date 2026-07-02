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
from .permissions import IsCenterAdminOrSuperAdmin


class PetViewSet(viewsets.ModelViewSet):
    """ViewSet for managing pets."""
    queryset = Pet.objects.select_related('center').prefetch_related('images')
    serializer_class = PetSerializer
    search_fields = ['name', 'breed', 'description']
    ordering_fields = ['created_at', 'name', 'age_months']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'available']:
            return [permissions.AllowAny()]
        if self.action in ['stats', 'mark_adopted', 'mark_in_process', 'create', 'update', 'partial_update', 'destroy']:
            return [IsCenterAdminOrSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PetCreateSerializer
        return PetSerializer

    def get_queryset(self):
        queryset = Pet.objects.select_related('center').prefetch_related('images')

        # center_admin only sees their center's pets
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'role') and user.role == 'center_admin':
            if hasattr(user, 'center') and user.center:
                queryset = queryset.filter(center=user.center)

        species = self.request.query_params.get('species')
        if species:
            queryset = queryset.filter(species=species)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

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

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get general stats for the dashboard. center_admin scoped to their center."""
        user = request.user
        base_qs = Pet.objects
        if user.is_authenticated and hasattr(user, 'role') and user.role == 'center_admin':
            if hasattr(user, 'center') and user.center:
                base_qs = base_qs.filter(center=user.center)

        total_pets = base_qs.count()
        available = base_qs.filter(status='available').count()
        in_process = base_qs.filter(status='in_process').count()
        adopted = base_qs.filter(status='adopted').count()
        return Response({
            'pets_count': total_pets,
            'available_pets': available,
            'in_process_pets': in_process,
            'adopted_pets': adopted,
        })

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

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = PetImage.objects.all()
        pet_id = self.kwargs.get('pet_pk')
        if pet_id:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset
