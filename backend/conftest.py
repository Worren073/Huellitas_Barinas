"""
pytest conftest with factories and fixtures.
"""
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def superadmin(db):
    return User.objects.create_superuser(
        username='superadmin', email='super@admin.com',
        password='pass1234', role='superadmin'
    )


@pytest.fixture
def center_admin(db):
    from apps.centers.models import Center
    center = Center.objects.create(
        name='Centro Test', address='Dir Test',
        phone='04121234567', email='center@test.com',
        description='Test center', max_capacity=50,
        status=Center.Status.ACTIVE
    )
    user = User.objects.create_user(
        username='admin_center', email='adminc@test.com',
        password='pass1234', role='center_admin', center=center
    )
    return user, center


@pytest.fixture
def adopter(db):
    return User.objects.create_user(
        username='adopter', email='adopter@test.com',
        password='pass1234', role='adoptante'
    )


@pytest.fixture
def pet(center_admin):
    _, center = center_admin
    from apps.pets.models import Pet
    return Pet.objects.create(
        name='Firulais', species='dog', breed='Labrador',
        age_months=24, gender='M', size='medium',
        description='Perro amigable', status='available',
        center=center
    )


@pytest.fixture
def adoption(adopter, pet, center_admin):
    _, center = center_admin
    from apps.adoptions.models import Adoption
    return Adoption.objects.create(
        pet=pet, applicant=adopter, center=center,
        motivation='Quiero adoptar', experience='Si',
        home_type='house', has_yard=True, has_other_pets=False,
        family_members=3, status='pending'
    )
