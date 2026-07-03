"""
Custom permissions for users app.
"""

from rest_framework import permissions


class IsCenterAdmin(permissions.BasePermission):
    """Permission for center administrators."""

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.role == "center_admin"
        )


class IsVolunteer(permissions.BasePermission):
    """Permission for volunteers."""

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.role == "voluntario"
        )


class IsAdopter(permissions.BasePermission):
    """Permission for adopters."""

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.role == "adoptante"
        )


class IsSuperAdmin(permissions.BasePermission):
    """Permission for super administrators."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)
