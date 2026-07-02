from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsCenterAdminOrSuperAdmin(BasePermission):
    """
    Permite escritura solo a superadmin o center_admin.
    Permite lectura a cualquier usuario autenticado.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ('superadmin', 'center_admin')


class IsSuperAdmin(BasePermission):
    """Permite acceso solo a superadmin."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'superadmin'
        )


class IsAdminUser(BasePermission):
    """Permite acceso a superadmin y center_admin."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ('superadmin', 'center_admin')
        )
