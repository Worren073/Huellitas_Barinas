import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.inquiries.models import HelpRequest


@pytest.mark.django_db
class TestHelpRequestViewSet:
    def test_create_public(self):
        client = APIClient()
        data = {
            "request_type": "volunteer",
            "first_name": "Luis",
            "last_name": "García",
            "email": "luis@example.com",
            "description": "Quiero ayudar",
        }
        res = client.post("/api/v1/help-requests/", data, format="json")
        assert res.status_code == status.HTTP_201_CREATED
        assert res.data["first_name"] == "Luis"
        assert "id" in res.data

    def test_list_requires_admin(self):
        client = APIClient()
        res = client.get("/api/v1/help-requests/")
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_allowed_superadmin(self, superadmin):
        client = APIClient()
        client.force_authenticate(user=superadmin)
        res = client.get("/api/v1/help-requests/")
        assert res.status_code == status.HTTP_200_OK

    def test_mark_read(self, superadmin):
        hr = HelpRequest.objects.create(
            request_type="volunteer",
            first_name="Mark",
            last_name="Test",
            email="mark@example.com",
        )
        client = APIClient()
        client.force_authenticate(user=superadmin)
        res = client.post(f"/api/v1/help-requests/{hr.id}/mark_read/")
        assert res.status_code == status.HTTP_200_OK
        hr.refresh_from_db()
        assert hr.is_read is True
