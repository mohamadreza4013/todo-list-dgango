# Import Django form classes
from django import forms

# Import Django's built-in user creation form
from django.contrib.auth.forms import UserCreationForm

# Import Django's default User model
from django.contrib.auth.models import User

import re


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

    # User's mobile phone number
    phone_number = forms.CharField(
        max_length=11,
        min_length=11,
        required=True,
        label="شماره موبایل",
        widget=forms.TextInput(
            attrs={
                "placeholder": "مثال: 09123456789",
                "inputmode": "numeric",
                "autocomplete": "tel",
            }
        )
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
            "phone_number",
            "password1",
            "password2",
        )


# ==================================================
# PHONE NUMBER VALIDATION
# ==================================================

    def clean_phone_number(self):

        # Get the submitted phone number
        phone_number = self.cleaned_data["phone_number"]

        # Remove spaces and common separators
        phone_number = phone_number.strip()
        phone_number = phone_number.replace(
            " ",
            ""
        )
        phone_number = phone_number.replace(
            "-",
            ""
        )

        # Convert Persian digits to English digits
        phone_number = phone_number.translate(
            str.maketrans(
                "۰۱۲۳۴۵۶۷۸۹",
                "0123456789"
            )
        )

        # Check Iranian mobile number format
        if not re.fullmatch(
            r"09\d{9}",
            phone_number
        ):

            raise forms.ValidationError(
                "شماره موبایل باید به صورت 09123456789 باشد."
            )

        return phone_number


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