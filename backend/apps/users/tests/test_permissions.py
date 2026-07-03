"""Tests for users permission classes."""

from rest_framework.views import APIView

from apps.users.permissions import IsAdopter, IsCenterAdmin, IsSuperAdmin, IsVolunteer


class MockRequest:
    def __init__(self, user):
        self.user = user


class TestIsCenterAdmin:
    def setup_method(self):
        self.perm = IsCenterAdmin()

    def test_center_admin_allowed(self, db, center_admin):
        user, _ = center_admin
        assert self.perm.has_permission(MockRequest(user), APIView())

    def test_superadmin_denied(self, db, superadmin):
        assert not self.perm.has_permission(MockRequest(superadmin), APIView())

    def test_adopter_denied(self, db, adopter):
        assert not self.perm.has_permission(MockRequest(adopter), APIView())

    def test_unauthenticated_denied(self, db):
        assert not self.perm.has_permission(MockRequest(None), APIView())


class TestIsVolunteer:
    def setup_method(self):
        self.perm = IsVolunteer()
        from django.contrib.auth import get_user_model

        self.User = get_user_model()

    def test_volunteer_allowed(self, db):
        user = self.User.objects.create_user(
            username="vol", email="vol@test.com", password="pass", role="voluntario"
        )
        assert self.perm.has_permission(MockRequest(user), APIView())

    def test_center_admin_denied(self, db, center_admin):
        user, _ = center_admin
        assert not self.perm.has_permission(MockRequest(user), APIView())


class TestIsAdopter:
    def setup_method(self):
        self.perm = IsAdopter()

    def test_adopter_allowed(self, db, adopter):
        assert self.perm.has_permission(MockRequest(adopter), APIView())

    def test_superadmin_denied(self, db, superadmin):
        assert not self.perm.has_permission(MockRequest(superadmin), APIView())


class TestIsSuperAdmin:
    def setup_method(self):
        self.perm = IsSuperAdmin()

    def test_superadmin_allowed(self, db, superadmin):
        assert self.perm.has_permission(MockRequest(superadmin), APIView())

    def test_center_admin_denied(self, db, center_admin):
        user, _ = center_admin
        assert not self.perm.has_permission(MockRequest(user), APIView())

    def test_unauthenticated_denied(self, db):
        assert not self.perm.has_permission(MockRequest(None), APIView())
