import random
from datetime import timedelta

from django.utils import timezone

from .models import OTPVerification


# ==================================================
# GENERATE OTP
# ==================================================

def generate_otp():
    """Generate a 6-digit OTP code."""

    return str(
        random.randint(
            100000,
            999999
        )
    )


# ==================================================
# CREATE OTP
# ==================================================

def create_otp(phone_number):
    """Create a new OTP and print it in terminal."""

    otp_code = generate_otp()

    expires_at = (
        timezone.now()
        + timedelta(minutes=5)
    )

    OTPVerification.objects.update_or_create(
        phone_number=phone_number,
        defaults={
            "otp_code": otp_code,
            "expires_at": expires_at,
            "attempts": 0,
        }
    )

    # Development only:
    # Print OTP in terminal instead of sending SMS.
    print()
    print("=" * 50)
    print("TaskFlow OTP")
    print(f"Phone: {phone_number}")
    print(f"OTP: {otp_code}")
    print("Expires in: 5 minutes")
    print("=" * 50)
    print()

    return otp_code


# ==================================================
# VERIFY OTP
# ==================================================

def verify_otp(phone_number, otp_code):
    """Verify an OTP code."""

    try:

        verification = OTPVerification.objects.get(
            phone_number=phone_number
        )

    except OTPVerification.DoesNotExist:

        return False, "کد تأییدی وجود ندارد."

    # Check expiration
    if timezone.now() > verification.expires_at:

        verification.delete()

        return False, "کد تأیید منقضی شده است."

    # Limit attempts
    if verification.attempts >= 3:

        verification.delete()

        return False, "تعداد تلاش‌ها بیش از حد مجاز است."

    # Count the current attempt
    verification.attempts += 1

    verification.save(
        update_fields=["attempts"]
    )

    # Check OTP code
    if verification.otp_code != otp_code:

        return False, "کد تأیید اشتباه است."

    # OTP is valid
    verification.delete()

    return True, None