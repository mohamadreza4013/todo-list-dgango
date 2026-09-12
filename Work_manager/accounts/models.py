from django.db import models
from django.contrib.auth.models import User
# Create your models here.
from django.db import models


# ==================================================
# PENDING SIGNUP
# ==================================================

class PendingSignup(models.Model):

    username = models.CharField(
        max_length=150
    )

    first_name = models.CharField(
        max_length=150,
        blank=True
    )

    last_name = models.CharField(
        max_length=150,
        blank=True
    )

    email = models.EmailField()

    phone_number = models.CharField(
        max_length=20,
        unique=True
    )

    password_hash = models.CharField(
        max_length=128
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.phone_number


# ==================================================
# OTP VERIFICATION
# ==================================================

class OTPVerification(models.Model):

    phone_number = models.CharField(
        max_length=20,
        unique=True
    )

    otp_code = models.CharField(
        max_length=6
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    expires_at = models.DateTimeField()

    attempts = models.PositiveIntegerField(
        default=0
    )

    def __str__(self):
        return self.phone_number