"""Tests for Center model."""
import pytest
from apps.centers.models import Center


class TestCenterModel:
    def test_create_center(self, db):
        center = Center.objects.create(
            name='Centro Prueba', address='Dir Test',
            phone='04121234567', email='test@center.com',
            description='Test center', max_capacity=30
        )
        assert center.name == 'Centro Prueba'
        assert center.status == Center.Status.PENDING
        assert str(center) == 'Centro Prueba'

    def test_current_capacity(self, db, center_admin):
        _, center = center_admin
        assert center.current_capacity == 0
        assert not center.is_full

    def test_is_full(self, db, center_admin):
        _, center = center_admin
        center.max_capacity = 0
        center.save()
        assert center.is_full
