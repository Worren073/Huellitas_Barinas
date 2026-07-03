"""Tests for adoptions permission classes."""
from rest_framework.views import APIView

from apps.adoptions.permissions import IsApplicantOrCenterAdmin, IsAdminOrCenterAdmin


class MockRequest:
    def __init__(self, user, method='GET'):
        self.user = user
        self.method = method


class TestIsApplicantOrCenterAdmin:
    def setup_method(self):
        self.perm = IsApplicantOrCenterAdmin()

    def test_authenticated_allowed(self, db, adopter):
        req = MockRequest(adopter, 'GET')
        assert self.perm.has_permission(req, APIView())

    def test_unauthenticated_denied(self, db):
        assert not self.perm.has_permission(MockRequest(None), APIView())

    def test_superadmin_has_object_permission(self, db, superadmin, adoption):
        assert self.perm.has_object_permission(
            MockRequest(superadmin, 'GET'), APIView(), adoption
        )

    def test_adopter_owns_object(self, db, adopter, adoption):
        assert self.perm.has_object_permission(
            MockRequest(adopter, 'GET'), APIView(), adoption
        )

    def test_adopter_not_owner_denied(self, db, adoption):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        other = User.objects.create_user(
            username='other', email='other@test.com', password='pass',
            role='adoptante'
        )
        assert not self.perm.has_object_permission(
            MockRequest(other, 'DELETE'), APIView(), adoption
        )


class TestIsAdminOrCenterAdmin:
    def setup_method(self):
        self.perm = IsAdminOrCenterAdmin()

    def test_superadmin_allowed(self, db, superadmin):
        assert self.perm.has_permission(MockRequest(superadmin), APIView())

    def test_center_admin_allowed(self, db, center_admin):
        user, _ = center_admin
        assert self.perm.has_permission(MockRequest(user), APIView())

    def test_adopter_denied(self, db, adopter):
        assert not self.perm.has_permission(MockRequest(adopter), APIView())

    def test_unauthenticated_denied(self, db):
        assert not self.perm.has_permission(MockRequest(None), APIView())

    def test_superadmin_has_object_permission(self, db, superadmin, adoption):
        assert self.perm.has_object_permission(
            MockRequest(superadmin), APIView(), adoption
        )

    def test_center_admin_own_center(self, db, center_admin, adoption):
        user, _ = center_admin
        assert self.perm.has_object_permission(
            MockRequest(user), APIView(), adoption
        )
