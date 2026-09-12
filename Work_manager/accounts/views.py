from django.contrib.auth import login
from django.shortcuts import render, redirect
from django.utils import timezone
from .forms import SignUpForm

from .otp import create_otp, verify_otp
from .models import (
    PendingSignup,
    OTPVerification,
)
# ==================================================
# USER SIGNUP
# ==================================================

def signup(request):

    # Check if the signup form was submitted
    if request.method == "POST":

        form = SignUpForm(
            request.POST
        )

        # Validate signup data
        if form.is_valid():

            # Extract validated form data
            username = form.cleaned_data["username"]
            first_name = form.cleaned_data["first_name"]
            last_name = form.cleaned_data["last_name"]
            email = form.cleaned_data["email"]
            phone_number = form.cleaned_data["phone_number"]
            password = form.cleaned_data["password1"]

            # Hash the password before temporary storage
            temp_user = form.save(
                commit=False
            )

            password_hash = (
                temp_user.password
            )

            # Save pending signup data
            PendingSignup.objects.update_or_create(

                phone_number=phone_number,

                defaults={

                    "username": username,

                    "first_name": first_name,

                    "last_name": last_name,

                    "email": email,

                    "password_hash": password_hash,
                }
            )

            # Generate and print OTP
            create_otp(
                phone_number
            )

            # Store phone number in session
            request.session["otp_phone"] = (
                phone_number
            )

            # Redirect to OTP page
            return redirect(
                "verify_signup_otp"
            )

    else:

        form = SignUpForm()

    return render(
        request,
        "accounts/signup.html",
        {
            "form": form
        }
    )


# ==================================================
# VERIFY SIGNUP OTP
# ==================================================

# ==================================================
# VERIFY SIGNUP OTP
# ==================================================

def verify_signup_otp(request):

    # Get phone number from session
    phone_number = request.session.get(
        "otp_phone"
    )

    # Redirect if signup process does not exist
    if not phone_number:
        return redirect("signup")

    try:

        pending_signup = PendingSignup.objects.get(
            phone_number=phone_number
        )

    except PendingSignup.DoesNotExist:

        return redirect("signup")

    # Get OTP verification record
    try:

        otp_verification = OTPVerification.objects.get(
            phone_number=phone_number
        )

    except OTPVerification.DoesNotExist:

        return redirect("signup")

    # Calculate remaining time in seconds
    remaining_seconds = max(
        0,
        int(
            (
                otp_verification.expires_at
                - timezone.now()
            ).total_seconds()
        )
    )

    # --------------------------------------------------
    # POST
    # --------------------------------------------------

    if request.method == "POST":

        otp_code = request.POST.get(
            "otp",
            ""
        ).strip()

        success, error = verify_otp(
            phone_number,
            otp_code
        )

        if success:

            user = pending_signup

            from django.contrib.auth.models import User

            new_user = User(
                username=user.username,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
            )

            # Use the already hashed password
            new_user.password = user.password_hash

            new_user.save(
                force_insert=True
            )

            login(
                request,
                new_user
            )

            pending_signup.delete()

            request.session.pop(
                "otp_phone",
                None
            )

            return redirect("home")

        return render(
            request,
            "accounts/verify_otp.html",
            {
                "phone_number": phone_number,
                "error": error,
                "remaining_seconds": remaining_seconds,
            }
        )

    # --------------------------------------------------
    # GET
    # --------------------------------------------------

    return render(
        request,
        "accounts/verify_otp.html",
        {
            "phone_number": phone_number,
            "remaining_seconds": remaining_seconds,
        }
    )

# ==================================================
# LOGOUT CONFIRMATION
# ==================================================

def logout_confirm(request):

    return render(
        request,
        "accounts/logout.html"
    )
# ==================================================
# RESEND SIGNUP OTP
# ==================================================

def resend_signup_otp(request):

    # Only accept POST requests
    if request.method != "POST":
        return redirect("signup")

    # Get phone number from session
    phone_number = request.session.get(
        "otp_phone"
    )

    if not phone_number:
        return redirect("signup")

    # Make sure a pending signup exists
    if not PendingSignup.objects.filter(
        phone_number=phone_number
    ).exists():

        return redirect("signup")

    # Generate a new OTP
    create_otp(
        phone_number
    )

    return redirect(
        "verify_signup_otp"
    )