from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.permissions import IsSuperAdmin

from .models import HelpRequest
from .serializers import HelpRequestSerializer, HelpRequestCreateSerializer
from .services import HelpRequestService


class HelpRequestViewSet(viewsets.ModelViewSet):
    queryset = HelpRequest.objects.all()
    search_fields = ["first_name", "last_name", "email"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_permissions(self):
        public_actions = {"create"}
        if self.action in public_actions:
            return [permissions.AllowAny()]
        return [IsSuperAdmin()]

    def get_serializer_class(self):
        if self.action == "create":
            return HelpRequestCreateSerializer
        return HelpRequestSerializer

    def perform_create(self, serializer):
        data = serializer.validated_data
        HelpRequestService.create_request(data)

    @action(detail=True, methods=["post"], permission_classes=[IsSuperAdmin])
    def mark_read(self, request, pk=None):
        help_request = self.get_object()
        help_request.is_read = True
        help_request.save()
        return Response(HelpRequestSerializer(help_request).data)
