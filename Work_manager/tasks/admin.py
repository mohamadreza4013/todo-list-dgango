from django.contrib import admin

from .models import Todo, Topic


# ==================================================
# TODO ADMIN
# ==================================================

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "category",
        "topic",
        "user",
        "completed",
        "important",
    )

    list_filter = (
        "category",
        "topic",
        "completed",
        "important",
    )

    search_fields = (
        "title",
        "description",
    )


# ==================================================
# TOPIC ADMIN
# ==================================================

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "is_public",
        "user",
        "is_active",
    )

    list_filter = (
        "is_public",
        "is_active",
    )

    search_fields = (
        "name",
    )