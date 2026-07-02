"""Tests for User model."""
import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()


class TestUserModel:
    def test_create_user(self, db):
        user = User.objects.create_user(
            username='testuser', email='test@test.com',
            password='pass1234', first_name='Test', last_name='User'
        )
        assert user.email == 'test@test.com'
        assert user.check_password('pass1234')
        assert not user.is_superuser

    def test_create_superuser(self, db):
        user = User.objects.create_superuser(
            username='admin', email='admin@test.com',
            password='admin123'
        )
        assert user.is_superuser
        assert user.is_staff

    def test_email_unique(self, db):
        User.objects.create_user(
            username='user1', email='same@test.com', password='pass1234'
        )
        with pytest.raises(IntegrityError):
            User.objects.create_user(
                username='user2', email='same@test.com', password='pass1234'
            )

    def test_user_str(self, db):
        user = User.objects.create_user(
            username='jdoe', email='j@test.com', password='pass1234',
            first_name='John', last_name='Doe', role='adoptante'
        )
        assert 'John Doe' in str(user)
        assert 'Adoptante' in str(user)

    def test_role_properties(self, db):
        user = User.objects.create_user(
            username='admin', email='a@test.com', password='pass1234',
            role='center_admin'
        )
        assert user.is_center_admin
        assert not user.is_volunteer
        assert not user.is_adopter
