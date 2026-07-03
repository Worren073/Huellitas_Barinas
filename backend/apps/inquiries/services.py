from django.db import transaction
from .models import HelpRequest
from apps.centers.models import Center


class HelpRequestService:

    @staticmethod
    def create_request(data):
        with transaction.atomic():
            help_request = HelpRequest.objects.create(**data)

            if data.get('request_type') == 'become_center':
                Center.objects.create(
                    name=f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
                    email=data.get('email', ''),
                    phone=data.get('phone', ''),
                    state=data.get('state', 'Barinas'),
                    description=data.get('description', ''),
                    status=Center.Status.PENDING,
                )

            return help_request
