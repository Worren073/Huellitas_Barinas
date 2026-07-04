from django.core.exceptions import ValidationError

from apps.centers.models import Center
from apps.centers.services import CenterService


class HelpRequestService:
    @staticmethod
    def process_request(help_request):
        if help_request.request_type == "become_center":
            if not help_request.email:
                raise ValidationError("El email es requerido para registrar un centro")

            name = f"{help_request.first_name} {help_request.last_name}".strip()
            if not name:
                raise ValidationError("El nombre es requerido para registrar un centro")

            if Center.objects.filter(email=help_request.email).exists():
                raise ValidationError("Ya existe un centro registrado con este email")

            phone = help_request.phone if help_request.phone else None

            address = f"Solicitud desde {help_request.state or 'Barinas'}"
            desc = help_request.description or f"Solicitud de registro de {name}"
            ph = phone or "Sin teléfono"
            CenterService.create_center(
                name=name,
                email=help_request.email,
                phone=ph,
                state=help_request.state or "Barinas",
                description=desc,
                address=address,
                status=Center.Status.PENDING,
            )

    @staticmethod
    def mark_as_read(help_request):
        help_request.is_read = True
        help_request.save(update_fields=["is_read"])
