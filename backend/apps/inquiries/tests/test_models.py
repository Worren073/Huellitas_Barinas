import pytest

from apps.inquiries.models import HelpRequest


@pytest.mark.django_db
class TestHelpRequestModel:
    def test_create_help_request(self):
        hr = HelpRequest.objects.create(
            request_type="volunteer",
            first_name="Juan",
            last_name="Pérez",
            email="juan@example.com",
            description="Quiero ser voluntario",
        )
        assert hr.pk is not None
        assert hr.is_read is False
        assert str(hr) == "Voluntariado - Juan Pérez"

    def test_become_center_request(self):
        hr = HelpRequest.objects.create(
            request_type="become_center",
            first_name="Centro",
            last_name="Feliz",
            email="centro@example.com",
            state="Barinas",
        )
        assert hr.request_type == "become_center"
        assert hr.get_request_type_display() == "Convertirse en Centro"
