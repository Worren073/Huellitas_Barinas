"""Tests for AdoptionViewSet permissions."""
from rest_framework.test import APIClient
from rest_framework import status


class TestAdoptionViewSetAuth:
    def setup_method(self):
        self.client = APIClient()

    def test_list_denied_anonymous(self, db):
        res = self.client.get('/api/v1/adoptions/')
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_allowed_adopter(self, db, adopter):
        self.client.force_authenticate(user=adopter)
        res = self.client.get('/api/v1/adoptions/')
        assert res.status_code == status.HTTP_200_OK

    def test_adopter_sees_own_only(self, db, adopter):
        self.client.force_authenticate(user=adopter)
        res = self.client.get('/api/v1/adoptions/')
        assert res.status_code == status.HTTP_200_OK
        for item in res.data.get('results', [] if isinstance(res.data, dict) else res.data):
            assert item.get('applicant') == adopter.id

    def test_create_adoption(self, db, adopter, pet, center_admin):
        _, center = center_admin
        self.client.force_authenticate(user=adopter)
        res = self.client.post('/api/v1/adoptions/', {
            'pet': pet.id, 'center': center.id,
            'motivation': 'Quiero adoptar', 'experience': 'Si',
            'home_type': 'house'
        })
        assert res.status_code == status.HTTP_201_CREATED

    def test_start_review_denied_adopter(self, db, adoption, adopter):
        self.client.force_authenticate(user=adopter)
        res = self.client.post(f'/api/v1/adoptions/{adoption.id}/start_review/')
        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_start_review_allowed_center_admin(self, db, adoption, center_admin):
        user, _ = center_admin
        self.client.force_authenticate(user=user)
        res = self.client.post(f'/api/v1/adoptions/{adoption.id}/start_review/')
        assert res.status_code == status.HTTP_200_OK

    def test_approve_flow(self, db, adoption, superadmin):
        self.client.force_authenticate(user=superadmin)
        self.client.post(f'/api/v1/adoptions/{adoption.id}/start_review/')
        res = self.client.post(f'/api/v1/adoptions/{adoption.id}/approve/')
        assert res.status_code == status.HTTP_200_OK
        adoption.refresh_from_db()
        assert adoption.status == 'approved'

    def test_reject_requires_reason(self, db, adoption, superadmin):
        self.client.force_authenticate(user=superadmin)
        self.client.post(f'/api/v1/adoptions/{adoption.id}/start_review/')
        res = self.client.post(f'/api/v1/adoptions/{adoption.id}/reject/', {})
        assert res.status_code == status.HTTP_400_BAD_REQUEST

    def test_complete_flow(self, db, adoption, superadmin):
        self.client.force_authenticate(user=superadmin)
        self.client.post(f'/api/v1/adoptions/{adoption.id}/start_review/')
        self.client.post(f'/api/v1/adoptions/{adoption.id}/approve/')
        res = self.client.post(f'/api/v1/adoptions/{adoption.id}/complete/')
        assert res.status_code == status.HTTP_200_OK
        adoption.refresh_from_db()
        assert adoption.status == 'completed'
