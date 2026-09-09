# Import Django form classes
from django import forms

# Import Django's built-in user creation form
from django.contrib.auth.forms import UserCreationForm

# Import Django's default User model
from django.contrib.auth.models import User


# ==================================================
# USER SIGNUP FORM
# ==================================================

class SignUpForm(UserCreationForm):

    # User's first name
    first_name = forms.CharField(
        max_length=150,
        required=False,
        label="نام"
    )

    # User's last name
    last_name = forms.CharField(
        max_length=150,
        required=False,
        label="نام خانوادگی"
    )

    # User's email address
    email = forms.EmailField(
        required=True,
        label="ایمیل"
    )


# ==================================================
# FORM META CONFIGURATION
# ==================================================

    class Meta:

        # Use Django's default User model
        model = User

        # Fields displayed and processed by the signup form
        fields = (
            "username",
            "first_name",
            "last_name",
            "email",
            "password1",
            "password2",
        )


# ==================================================
# SAVE USER
# ==================================================

    def save(self, commit=True):

        # Create the user object without saving it to the database yet
        user = super().save(commit=False)

        # Set the user's first name
        user.first_name = self.cleaned_data["first_name"]

        # Set the user's last name
        user.last_name = self.cleaned_data["last_name"]

        # Set the user's email address
        user.email = self.cleaned_data["email"]

        # Save the user to the database if requested
        if commit:
            user.save()

        # Return the created user object
        return user