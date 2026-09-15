from django.db import models

from django.conf import settings

class Topic(models.Model):

    name = models.CharField(
        max_length=50
    )

    is_public = models.BooleanField(
        default=False
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="topics"
    )

    is_active = models.BooleanField(
        default=True
    )

    def __str__(self):
        return self.name
