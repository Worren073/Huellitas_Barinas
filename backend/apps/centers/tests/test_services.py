"""Tests for CenterService."""
import pytest
from django.core.exceptions import ValidationError
from apps.centers.models import Center
from apps.centers.services import CenterService


class TestCenterService:
    def test_create_center(self, db, superadmin):
        center = CenterService.create_center(
            name='Nuevo Centro', address='Dir',
            phone='04121234567', email='nuevo@center.com',
            description='Test', created_by=superadmin
        )
        assert center.name == 'Nuevo Centro'
        assert center.status == Center.Status.PENDING

    def test_activate_center(self, db, center_admin, superadmin):
        _, center = center_admin
        result = CenterService.activate_center(center, superadmin)
        assert result.status == Center.Status.ACTIVE

    def test_deactivate_center(self, db, center_admin, superadmin):
        _, center = center_admin
        result = CenterService.deactivate_center(center, superadmin)
        assert result.status == Center.Status.INACTIVE

    def test_update_center(self, db, center_admin, superadmin):
        _, center = center_admin
        center.created_by = superadmin
        center.save()
        result = CenterService.update_center(center, name='Centro Actualizado')
        assert result.name == 'Centro Actualizado'
        center.refresh_from_db()
        assert center.name == 'Centro Actualizado'

    def test_get_available_capacity(self, db, center_admin, pet):
        _, center = center_admin
        cap = CenterService.get_available_capacity(center)
        assert cap == center.max_capacity - 1

    def test_non_superadmin_cannot_activate(self, db, center_admin):
        user, center = center_admin
        with pytest.raises(ValidationError, match='super administradores'):
            CenterService.activate_center(center, user)
