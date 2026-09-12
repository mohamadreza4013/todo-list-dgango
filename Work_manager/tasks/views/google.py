from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect

from ..models import GoogleAccount
from ..services.google_auth import get_google_flow


# ==================================================
# GOOGLE CONNECT
# ==================================================

@login_required
def google_connect(request):

    # Create OAuth flow with PKCE
    flow = get_google_flow()

    # Generate Google authorization URL
    authorization_url, state = (
        flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )
    )

    # Save OAuth state
    request.session["google_oauth_state"] = state

    # Save PKCE code verifier
    request.session["google_code_verifier"] = (
        flow.code_verifier
    )

    # Redirect user to Google
    return redirect(
        authorization_url
    )


# ==================================================
# GOOGLE CALLBACK
# ==================================================

@login_required
def google_callback(request):

    # Get OAuth state
    state = request.session.get(
        "google_oauth_state"
    )

    # Get PKCE code verifier
    code_verifier = request.session.get(
        "google_code_verifier"
    )

    # Stop if required OAuth data is missing
    if not state or not code_verifier:
        return redirect("home")

    # Create the same OAuth flow
    # using the original state and verifier
    flow = get_google_flow(
        state=state,
        code_verifier=code_verifier,
    )

    # Exchange authorization code
    # for access and refresh tokens
    flow.fetch_token(
        authorization_response=request.build_absolute_uri()
    )

    credentials = flow.credentials

    # Save Google account information
    GoogleAccount.objects.update_or_create(
        user=request.user,

        defaults={
            "access_token": credentials.token,

            "refresh_token": (
                credentials.refresh_token or ""
            ),

            "token_expiry": credentials.expiry,
        }
    )

    # Remove temporary OAuth data
    request.session.pop(
        "google_oauth_state",
        None
    )

    request.session.pop(
        "google_code_verifier",
        None
    )

    # Return to dashboard
    return redirect("home")