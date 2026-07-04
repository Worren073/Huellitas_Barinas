"""Tests for pets permission classes."""

from rest_framework.views import APIView

from apps.pets.permissions import IsAdminRole, IsCenterAdminOrSuperAdmin, IsSuperAdmin


class MockRequest:
    def __init__(self, user, method="GET"):
        self.user = user
        self.method = method


class MockView(APIView):
    pass


class TestIsCenterAdminOrSuperAdmin:
    def setup_method(self):
        self.perm = IsCenterAdminOrSuperAdmin()

    def test_safe_method_denied_anonymous(self, db):
        req = MockRequest(None, "GET")
        assert not self.perm.has_permission(req, MockView())

    def test_safe_method_allowed_authenticated(self, db, adopter):
        req = MockRequest(adopter, "GET")
        assert self.perm.has_permission(req, MockView())

    def test_write_denied_unauthenticated(self, db):
        req = MockRequest(None, "POST")
        assert not self.perm.has_permission(req, MockView())

    def test_write_allowed_superadmin(self, db, superadmin):
        req = MockRequest(superadmin, "POST")
        assert self.perm.has_permission(req, MockView())

    def test_write_allowed_center_admin(self, db, center_admin):
        user, _ = center_admin
        req = MockRequest(user, "PATCH")
        assert self.perm.has_permission(req, MockView())

    def test_write_denied_adopter(self, db, adopter):
        req = MockRequest(adopter, "DELETE")
        assert not self.perm.has_permission(req, MockView())


class TestIsSuperAdmin:
    def setup_method(self):
        self.perm = IsSuperAdmin()

    def test_superadmin_allowed(self, db, superadmin):
        assert self.perm.has_permission(MockRequest(superadmin), MockView())

    def test_center_admin_denied(self, db, center_admin):
        user, _ = center_admin
        assert not self.perm.has_permission(MockRequest(user), MockView())

    def test_adopter_denied(self, db, adopter):
        assert not self.perm.has_permission(MockRequest(adopter), MockView())

    def test_unauthenticated_denied(self, db):
        assert not self.perm.has_permission(MockRequest(None), MockView())


class TestIsAdminRole:
    def setup_method(self):
        self.perm = IsAdminRole()

    def test_superadmin_allowed(self, db, superadmin):
        assert self.perm.has_permission(MockRequest(superadmin), MockView())

    def test_center_admin_allowed(self, db, center_admin):
        user, _ = center_admin
        assert self.perm.has_permission(MockRequest(user), MockView())

    def test_adopter_denied(self, db, adopter):
        assert not self.perm.has_permission(MockRequest(adopter), MockView())
