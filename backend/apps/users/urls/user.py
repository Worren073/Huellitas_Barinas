"""
User URL patterns.
"""

from django.urls import path
from ..views import ProfileView

app_name = 'users'

urlpatterns = [
    path('me/', ProfileView.as_view(), name='profile'),
]
