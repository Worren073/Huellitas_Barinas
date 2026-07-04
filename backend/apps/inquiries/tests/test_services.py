import pytest
from django.core.exceptions import ValidationError

from apps.centers.models import Center
from apps.inquiries.models import HelpRequest
from apps.inquiries.services import HelpRequestService


@pytest.mark.django_db
class TestHelpRequestService:
    def test_process_volunteer_request(self):
        hr = HelpRequest.objects.create(
            request_type="volunteer",
            first_name="Ana",
            last_name="Martínez",
            email="ana@example.com",
            description="Voluntaria",
        )
        HelpRequestService.process_request(hr)
        assert HelpRequest.objects.count() == 1

    def test_process_become_center_creates_center(self):
        hr = HelpRequest.objects.create(
            request_type="become_center",
            first_name="Centro",
            last_name="Nuevo",
            email="nuevo@centro.com",
            state="Barinas",
        )
        HelpRequestService.process_request(hr)
        assert Center.objects.filter(email="nuevo@centro.com").exists()

    def test_process_duplicate_center_email_raises(self):
        Center.objects.create(
            name="Existente",
            email="duplicado@centro.com",
            phone="04121234567",
            address="Barinas",
            status=Center.Status.ACTIVE,
        )
        hr = HelpRequest.objects.create(
            request_type="become_center",
            first_name="Otro",
            last_name="Centro",
            email="duplicado@centro.com",
        )
        with pytest.raises(ValidationError, match="Ya existe un centro registrado"):
            HelpRequestService.process_request(hr)

    def test_mark_as_read(self):
        hr = HelpRequest.objects.create(
            request_type="volunteer",
            first_name="Test",
            last_name="User",
            email="test@example.com",
        )
        assert hr.is_read is False
        HelpRequestService.mark_as_read(hr)
        hr.refresh_from_db()
        assert hr.is_read is True
