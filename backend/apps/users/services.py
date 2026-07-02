"""
User services (Presenter layer).
Handles business logic for user operations.
"""

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class UserService:
    """Service class for user-related operations."""

    @staticmethod
    def create_user(**kwargs):
        """Create a new user with validation."""
        password = kwargs.pop('password', None)
        user = User(**kwargs)
        if password:
            user.set_password(password)
        user.full_clean()
        user.save()
        return user

    @staticmethod
    def update_user(user, **kwargs):
        """Update user with validation."""
        password = kwargs.pop('password', None)
        for key, value in kwargs.items():
            setattr(user, key, value)
        if password:
            user.set_password(password)
        user.full_clean()
        user.save()
        return user

    @staticmethod
    def verify_user(user):
        """Mark a user as verified."""
        user.is_verified = True
        user.save()
        return user

    @staticmethod
    def assign_to_center(user, center):
        """Assign a user to a center."""
        user.center = center
        user.save()
        return user
