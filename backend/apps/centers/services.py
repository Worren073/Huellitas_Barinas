"""
Center services (Presenter layer).
Handles business logic for center operations.
"""

from django.core.exceptions import ValidationError

from .models import Center


class CenterService:
    """Service class for center operations."""

    @staticmethod
    def create_center(**kwargs):
        """Create a new center."""
        center = Center(**kwargs)
        center.full_clean()
        center.save()
        return center

    @staticmethod
    def update_center(center, **kwargs):
        """Update center with validation."""
        for key, value in kwargs.items():
            setattr(center, key, value)
        center.full_clean()
        center.save()
        return center

    @staticmethod
    def activate_center(center, user):
        """Activate a center (admin only)."""
        if not user.is_superuser:
            raise ValidationError("Solo los super administradores pueden activar centros.")
        center.status = Center.Status.ACTIVE
        center.save()
        return center

    @staticmethod
    def deactivate_center(center, user):
        """Deactivate a center (admin only)."""
        if not user.is_superuser:
            raise ValidationError("Solo los super administradores pueden desactivar centros.")
        center.status = Center.Status.INACTIVE
        center.save()
        return center

    @staticmethod
    def get_available_capacity(center):
        """Get remaining capacity for a center."""
        return center.max_capacity - center.current_capacity
