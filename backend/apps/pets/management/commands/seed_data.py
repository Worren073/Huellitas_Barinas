"""
Management command to seed the database with the superuser.
Usage: python manage.py seed_data
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Create the superuser if it doesn't exist"

    def handle(self, *args, **options):
        admin, created = User.objects.get_or_create(
            username="worren",
            defaults={
                "email": "worrenalexanderbz@gmail.com",
                "first_name": "Worren",
                "last_name": "Barrios",
                "role": "superadmin",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin.set_password("Atreus.30707073")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created superuser: Worren Barrios"))
        else:
            self.stdout.write("Superuser already exists, skipping")
