"""Tests for PetViewSet permissions."""

from rest_framework import status
from rest_framework.test import APIClient


class TestPetViewSetPublic:
    """Public endpoints should be accessible without auth."""

    def setup_method(self):
        self.client = APIClient()

    def test_list_pets(self, db, pet):
        res = self.client.get("/api/v1/pets/")
        assert res.status_code == status.HTTP_200_OK

    def test_retrieve_pet(self, db, pet):
        res = self.client.get(f"/api/v1/pets/{pet.id}/")
        assert res.status_code == status.HTTP_200_OK

    def test_available_pets(self, db, pet):
        res = self.client.get("/api/v1/pets/available/")
        assert res.status_code == status.HTTP_200_OK

    def test_create_denied_anonymous(self, db):
        res = self.client.post("/api/v1/pets/", {"name": "Test"})
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_delete_denied_anonymous(self, db, pet):
        res = self.client.delete(f"/api/v1/pets/{pet.id}/")
        assert res.status_code == status.HTTP_401_UNAUTHORIZED


class TestPetViewSetAuth:
    """Authenticated endpoints should respect role permissions."""

    def setup_method(self):
        self.client = APIClient()

    def _create_pet_payload(self, center_id):
        return {
            "name": "Nuevo",
            "species": "dog",
            "breed": "Labrador",
            "age_months": 12,
            "gender": "M",
            "size": "medium",
            "description": "Test pet",
            "center": center_id,
        }

    def test_adopter_cannot_create(self, db, pet, adopter):
        self.client.force_authenticate(user=adopter)
        res = self.client.post("/api/v1/pets/", {"name": "Test", "species": "dog"})
        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_superadmin_can_create(self, db, superadmin, center_admin):
        _, center = center_admin
        self.client.force_authenticate(user=superadmin)
        res = self.client.post("/api/v1/pets/", self._create_pet_payload(center.id))
        assert res.status_code == status.HTTP_201_CREATED

    def test_center_admin_can_create(self, db, center_admin):
        user, center = center_admin
        self.client.force_authenticate(user=user)
        res = self.client.post("/api/v1/pets/", self._create_pet_payload(center.id))
        assert res.status_code == status.HTTP_201_CREATED

    def test_mark_adopted_denied_adopter(self, db, pet, adopter):
        self.client.force_authenticate(user=adopter)
        res = self.client.post(f"/api/v1/pets/{pet.id}/mark_adopted/")
        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_mark_adopted_allowed_center_admin(self, db, pet, center_admin):
        user, _ = center_admin
        self.client.force_authenticate(user=user)
        res = self.client.post(f"/api/v1/pets/{pet.id}/mark_adopted/")
        assert res.status_code == status.HTTP_200_OK

    def test_mark_in_process_allowed_superadmin(self, db, pet, superadmin):
        self.client.force_authenticate(user=superadmin)
        res = self.client.post(f"/api/v1/pets/{pet.id}/mark_in_process/")
        assert res.status_code == status.HTTP_200_OK

    def test_stats_accessible_by_any_authenticated(self, db, pet, adopter):
        self.client.force_authenticate(user=adopter)
        res = self.client.get("/api/v1/pets/stats/")
        assert res.status_code == status.HTTP_200_OK

    def test_stats_allowed_center_admin(self, db, pet, center_admin):
        user, _ = center_admin
        self.client.force_authenticate(user=user)
        res = self.client.get("/api/v1/pets/stats/")
        assert res.status_code == status.HTTP_200_OK
