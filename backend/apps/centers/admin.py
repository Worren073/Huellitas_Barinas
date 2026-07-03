from django.contrib import admin
from .models import Center


@admin.register(Center)
class CenterAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'state', 'phone', 'email', 'created_at')
    list_filter = ('status', 'state', 'created_at')
    search_fields = ('name', 'description', 'address', 'phone', 'email')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
