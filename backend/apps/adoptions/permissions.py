"""
Custom permissions for adoptions app.
"""

from rest_framework import permissions


class IsApplicantOrCenterAdmin(permissions.BasePermission):
    """Permission for adoption applicants and center admins."""

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return (
                obj.applicant == request.user or
                request.user.is_superuser or
                (request.user.role == 'center_admin' and obj.center == request.user.center)
            )

        return (
            obj.applicant == request.user or
            request.user.is_superuser or
            (request.user.role == 'center_admin' and obj.center == request.user.center)
        )


class IsAdminOrCenterAdmin(permissions.BasePermission):
    """Allow access only to superusers or center admins."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (request.user.is_superuser or request.user.role == 'center_admin')
        )

    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_superuser or
            (request.user.role == 'center_admin' and obj.center == request.user.center)
        )
