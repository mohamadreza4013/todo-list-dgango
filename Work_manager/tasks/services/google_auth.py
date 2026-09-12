from django.conf import settings

from google_auth_oauthlib.flow import Flow


def get_google_flow(
    state=None,
    code_verifier=None,
):
    """
    Create the Google OAuth flow.
    """

    flow = Flow.from_client_secrets_file(
        settings.GOOGLE_CLIENT_SECRET_FILE,
        scopes=settings.GOOGLE_CALENDAR_SCOPES,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,

        # Enable PKCE
        autogenerate_code_verifier=(
            code_verifier is None
        ),

        # Restore the verifier during callback
        code_verifier=code_verifier,
    )

    if state:
        flow.state = state

    return flow