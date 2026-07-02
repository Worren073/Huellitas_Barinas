from django.contrib import admin
from .models import Pet, PetImage


class PetImageInline(admin.TabularInline):
    model = PetImage
    extra = 1


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ('name', 'species', 'breed', 'status', 'center', 'created_at')
    list_filter = ('species', 'status', 'size', 'gender', 'is_sterilized', 'is_vaccinated')
    search_fields = ('name', 'breed', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    inlines = [PetImageInline]
