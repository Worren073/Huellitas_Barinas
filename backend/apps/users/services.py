"""
User services (Presenter layer).
Handles business logic for user operations.
"""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone

MAX_FAILED_ATTEMPTS = 10
LOCKOUT_DURATION_MINUTES = 30

from apps.adoptions.services import AdoptionService

User = get_user_model()


class UserService:
    """Service class for user-related operations."""

    @staticmethod
    def create_user(**kwargs):
        """Create a new user with validation."""
        password = kwargs.pop("password", None)
        user = User(**kwargs)
        if password:
            user.set_password(password)
        user.full_clean()
        user.save()
        return user

    @staticmethod
    def update_user(user, **kwargs):
        """Update user with validation."""
        password = kwargs.pop("password", None)
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

    @staticmethod
    def request_deactivation(user):
        """Deactivate account and schedule deletion in 30 days.
        Active adoptions (pending, under_review) are cancelled first.
        """
        user.is_active = False
        user.deletion_requested_at = timezone.now()
        user.save(update_fields=["is_active", "deletion_requested_at"])

        # Cancel all non-completed adoptions
        for adoption in user.adoption_requests.exclude(
            status__in=["completed", "cancelled", "rejected"]
        ):
            AdoptionService.cancel(adoption, cancelled_by=user)

        return user

    @staticmethod
    def restore_account(user):
        """Restore a deactivated account within the 30-day grace period."""
        user.is_active = True
        user.deletion_requested_at = None
        user.save(update_fields=["is_active", "deletion_requested_at"])
        return user

    @staticmethod
    def process_pending_deletions():
        """Anonymize users whose 30-day deletion period has expired."""
        cutoff = timezone.now() - timedelta(days=30)
        expired = User.objects.filter(
            deletion_requested_at__lte=cutoff, is_active=False
        )
        count = 0
        for user in expired:
            user.email = f"deleted-{user.id}@anonymized.com"
            user.username = f"deleted-{user.id}"
            user.first_name = "Usuario"
            user.last_name = "Eliminado"
            user.phone = ""
            user.address = ""
            user.avatar = None
            user.is_verified = False
            user.deletion_requested_at = None
            user.save(
                update_fields=[
                    "email", "username", "first_name", "last_name",
                    "phone", "address", "avatar", "is_verified",
                    "deletion_requested_at",
                ]
            )
            count += 1
        return count

    @staticmethod
    def record_failed_login(user):
        """Increment failed login counter and lock if threshold reached."""
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.locked_until = timezone.now() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
        user.save(update_fields=["failed_login_attempts", "locked_until"])
        return user

    @staticmethod
    def reset_failed_login(user):
        """Reset failed login counter and unlock."""
        if user.failed_login_attempts > 0 or user.locked_until is not None:
            user.failed_login_attempts = 0
            user.locked_until = None
            user.save(update_fields=["failed_login_attempts", "locked_until"])
        return user
