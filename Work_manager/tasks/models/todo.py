# =========================================================
# IMPORTS
# =========================================================
from django.db import models

from django.conf import settings

# Jalali date fields provided by django-jalali
# We use jmodels to store and work with Persian/Jalali dates.
from django_jalali.db import models as jmodels


# =========================================================
# TODO MODEL
# =========================================================

# The Todo model represents a task in the application.
#
# Each Todo contains information such as:
#
# - Owner
# - Title
# - Description
# - Category
# - Creation date
# - Start date
# - Completion date
# - Deadline
# - Completion status
# - Importance status
class Todo(models.Model):


    # =====================================================
    # CATEGORY CHOICES
    # =====================================================

    # Available categories for a Todo.
    #
    # The first value is stored in the database.
    # The second value is displayed to the user.
    #
    CATEGORY_CHOICES = [
        ("personal", "شخصی"),
        ("public", "عمومی"),
    ]


    # =====================================================
    # USER / OWNER
    # =====================================================

    # Defines the user who owns this Todo.
    #
    # ForeignKey means that:
    # - Each Todo belongs to one User.
    # - One User can have multiple Todos.
    #
    # settings.AUTH_USER_MODEL:
    # Uses the User model configured in the project settings.
    #
    # on_delete=models.CASCADE:
    # If the User is deleted, all of their Todos
    # will also be deleted.
    #
    # related_name="todos":
    # Allows us to access a user's Todos like this:
    #
    # request.user.todos.all()
    #
    # null=True and blank=True:
    # Currently allow a Todo to exist without an assigned User.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="todos",
        null=True,
        blank=True
    )


    # =====================================================
    # TITLE
    # =====================================================

    # The title of the Todo.
    #
    # max_length=200:
    # The title can contain up to 200 characters.
    title = models.CharField(
        max_length=200
    )


    # =====================================================
    # DESCRIPTION
    # =====================================================

    # Additional information or details about the Todo.
    #
    # TextField is used for longer text.
    #
    # blank=True:
    # The description is optional.
    description = models.TextField(
        blank=True
    )


    # =====================================================
    # CATEGORY
    # =====================================================

    # Defines whether the Todo is Personal or Public.
    #
    # choices:
    # Restricts the value to the options defined in
    # CATEGORY_CHOICES.
    #
    # The database stores:
    #
    # "personal"
    # or
    # "public"
    #
    # While the user sees:
    #
    # "شخصی"
    # or
    # "عمومی"
    #
    # default="personal":
    # New Todos are Personal by default.
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="personal"
    )


    # =====================================================
    # CREATED AT
    # =====================================================

    # Stores the date and time when the Todo was created.
    #
    # auto_now_add=True:
    # Django automatically sets this value when the Todo
    # is created.
    #
    # The value will not automatically change when the
    # Todo is updated.
    created_at = models.DateTimeField(
        auto_now_add=True
    )


    # =====================================================
    # START DATE
    # =====================================================

    # The date when the Todo starts.
    #
    # jDateField is provided by django-jalali and is used
    # for Jalali/Persian dates.
    #
    # null=True:
    # Allows NULL to be stored in the database.
    #
    # blank=True:
    # Makes the field optional in Django forms.
    start_date = jmodels.jDateField(
        null=True,
        blank=True
    )


    # =====================================================
    # END DATE
    # =====================================================

    # The actual date when the Todo was completed.
    #
    # According to the application's logic:
    #
    # When the Todo is marked as completed:
    #     end_date gets a value.
    #
    # When the Todo is marked as incomplete again:
    #     end_date becomes None.
    #
    # This is also a Jalali date field.
    end_date = jmodels.jDateField(
        null=True,
        blank=True
    )


    # =====================================================
    # DEADLINE
    # =====================================================

    # The deadline set by the user for completing the Todo.
    #
    # Difference between deadline and end_date:
    #
    # deadline:
    # The date by which the task should be completed.
    #
    # end_date:
    # The date when the task was actually completed.
    #
    # This is also a Jalali date field.
    deadline = jmodels.jDateField(
        null=True,
        blank=True
    )


    # =====================================================
    # COMPLETED
    # =====================================================

    # Indicates whether the Todo has been completed.
    #
    # False:
    # The Todo is not completed.
    #
    # True:
    # The Todo is completed.
    #
    # default=False:
    # New Todos are not completed by default.
    completed = models.BooleanField(
        default=False
    )


    # =====================================================
    # IMPORTANT
    # =====================================================

    # Indicates whether the Todo is marked as important.
    #
    # False:
    # The Todo is a normal task.
    #
    # True:
    # The Todo is marked as important.
    important = models.BooleanField(
        default=False
    )


    # =====================================================
    # STRING REPRESENTATION
    # =====================================================

    # Defines how a Todo is represented as a string.
    #
    # Instead of displaying something like:
    #
    # Todo object (1)
    #
    # Django will display the Todo's title.
    #
    # Example:
    #
    # "Buy a book"
    #
    # This is especially useful in the Django Admin panel
    # and while debugging.
    def __str__(self):
        return self.title