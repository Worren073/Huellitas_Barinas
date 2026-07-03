from django.core.exceptions import ValidationError
from django.db import transaction

from apps.centers.models import Center
from apps.centers.services import CenterService

from .models import HelpRequest


class HelpRequestService:
    @staticmethod
    def create_request(data):
        with transaction.atomic():
            help_request = HelpRequest.objects.create(**data)

            if data.get("request_type") == "become_center":
                if not data.get("email"):
                    raise ValidationError("El email es requerido para registrar un centro")

                name = f"{data.get('first_name', '')} {data.get('last_name', '')}".strip()
                if not name:
                    raise ValidationError("El nombre es requerido para registrar un centro")

                if Center.objects.filter(email=data["email"]).exists():
                    raise ValidationError("Ya existe un centro registrado con este email")

                CenterService.create_center(
                    name=name,
                    email=data["email"],
                    phone=data.get("phone", ""),
                    state=data.get("state", "Barinas"),
                    description=data.get("description", ""),
                    address=data.get("state", "Barinas"),
                    status=Center.Status.PENDING,
                )

            return help_request
