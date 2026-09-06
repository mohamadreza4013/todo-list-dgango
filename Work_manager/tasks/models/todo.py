from django.db import models


# ==================================================
# TODO MODEL
# ==================================================

class Todo(models.Model):

    # Title of the task
    # Limited to 200 characters
    title = models.CharField(
        max_length=200
    )


    # Optional description for the task
    # blank=True allows the user to leave it empty
    description = models.TextField(
        blank=True
    )


    # Automatically stores the date and time
    # when the task is created
    created_at = models.DateTimeField(
        auto_now_add=True
    )


    # Optional date associated with the task
    # null=True allows NULL values in the database
    # blank=True allows the field to be empty in forms
    start_date = models.DateField(
        null=True,
        blank=True
    )


    # Indicates whether the task has been completed
    # New tasks are incomplete by default
    completed = models.BooleanField(
        default=False
    )


    # Indicates whether the task is marked as important
    # New tasks are not important by default
    important = models.BooleanField(
        default=False
    )


    # Defines how the Todo object is displayed as a string
    # For example, it returns the task title
    def __str__(self):
        return self.title