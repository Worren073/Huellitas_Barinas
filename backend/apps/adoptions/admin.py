from django.contrib import admin

from .models import Adoption, AdoptionTimeline


class AdoptionTimelineInline(admin.TabularInline):
    model = AdoptionTimeline
    extra = 0
    readonly_fields = ("old_status", "new_status", "changed_by", "notes", "created_at")


@admin.register(Adoption)
class AdoptionAdmin(admin.ModelAdmin):
    list_display = ("id", "pet", "applicant", "status", "center", "created_at")
    list_filter = ("status", "home_type", "created_at")
    search_fields = ("pet__name", "applicant__username", "motivation")
    readonly_fields = ("created_at", "updated_at", "reviewed_at", "completed_at")
    ordering = ("-created_at",)
    inlines = [AdoptionTimelineInline]


@admin.register(AdoptionTimeline)
class AdoptionTimelineAdmin(admin.ModelAdmin):
    list_display = ("adoption", "old_status", "new_status", "changed_by", "created_at")
    list_filter = ("new_status", "created_at")
    readonly_fields = ("created_at",)
