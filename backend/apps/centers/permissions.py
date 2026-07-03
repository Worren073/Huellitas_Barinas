"""
Custom permissions for centers app.
"""

from rest_framework import permissions


class IsCenterAdminOrReadOnly(permissions.BasePermission):
    """Permission that allows center admins to edit, but anyone to read."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and (
            request.user.is_superuser or request.user.role == "center_admin"
        )

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_superuser or (
            request.user.role == "center_admin" and obj == request.user.center
        )
