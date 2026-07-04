from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from apps.users.permissions import IsSuperAdmin

from .models import HelpRequest
from .serializers import HelpRequestCreateSerializer, HelpRequestSerializer
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

    def get_throttles(self):
        throttles = super().get_throttles()
        if self.action == "create":
            throttles.append(ScopedRateThrottle())
            self.throttle_scope = "help_request"
        return throttles

    def get_serializer_class(self):
        if self.action == "create":
            return HelpRequestCreateSerializer
        return HelpRequestSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        HelpRequestService.process_request(instance)

    @action(detail=True, methods=["post"], permission_classes=[IsSuperAdmin])
    def mark_read(self, request, pk=None):
        help_request = self.get_object()
        HelpRequestService.mark_as_read(help_request)
        return Response(HelpRequestSerializer(help_request).data)
