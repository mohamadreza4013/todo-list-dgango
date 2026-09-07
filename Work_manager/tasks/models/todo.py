from django.db import models
from django.conf import settings
from django_jalali.db import models as jmodels


class Todo(models.Model):
    #user = models.ForeignKey(
     #   settings.AUTH_USER_MODEL,
      #  on_delete=models.CASCADE,
       # related_name="todos"
    #)

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)  # میلادی (Gregorian)
    start_date = jmodels.jDateField(null=True, blank=True)  # شمسی (Jalali)
    deadline = jmodels.jDateField(null=True, blank=True)    # شمسی (Jalali)

    completed = models.BooleanField(default=False)
    important = models.BooleanField(default=False)

    def __str__(self):
        return self.title