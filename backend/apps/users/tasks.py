"""
Celery tasks for users app.
"""

from celery import shared_task

from apps.users.services import UserService


@shared_task
def cleanup_expired_deletions():
    """Anonymize users whose 30-day deletion period has expired."""
    count = UserService.process_pending_deletions()
    return f"Cleanup complete: {count} users anonymized"
