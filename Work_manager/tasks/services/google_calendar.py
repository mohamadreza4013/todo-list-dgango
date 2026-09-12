import json
from datetime import timedelta

from django.conf import settings

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from ..models import GoogleAccount


# ==================================================
# GOOGLE CALENDAR SERVICE
# ==================================================

def get_google_calendar_service(user):
    """
    Create an authenticated Google Calendar service
    for the given TaskFlow user.
    """

    account = GoogleAccount.objects.get(
        user=user
    )

    with open(
        settings.GOOGLE_CLIENT_SECRET_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        client_config = json.load(file)

    config = (
        client_config.get("web")
        or client_config.get("installed")
    )

    if not config:
        raise ValueError(
            "Invalid Google OAuth client configuration."
        )

    credentials = Credentials(
        token=account.access_token,
        refresh_token=account.refresh_token,
        token_uri=config["token_uri"],
        client_id=config["client_id"],
        client_secret=config["client_secret"],
        scopes=settings.GOOGLE_CALENDAR_SCOPES,
    )

    # Refresh access token when expired
    if credentials.expired and credentials.refresh_token:

        credentials.refresh(
            Request()
        )

        account.access_token = credentials.token
        account.token_expiry = credentials.expiry

        account.save(
            update_fields=[
                "access_token",
                "token_expiry",
            ]
        )

    return build(
        "calendar",
        "v3",
        credentials=credentials
    )


# ==================================================
# CREATE GOOGLE EVENT
# ==================================================

def create_google_event(todo):
    """
    Create an all-day Google Calendar event
    from a TaskFlow Todo.
    """

    if not todo.deadline:
        return None

    # Convert Jalali date to Gregorian
    gregorian_date = todo.deadline.togregorian()

    # Google Calendar uses an exclusive end date
    end_date = gregorian_date + timedelta(
        days=1
    )

    start_date = gregorian_date.strftime(
        "%Y-%m-%d"
    )

    google_end_date = end_date.strftime(
        "%Y-%m-%d"
    )

    service = get_google_calendar_service(
        todo.user
    )

    event = {
        "summary": todo.title,

        "description": todo.description,

        "start": {
            "date": start_date,
        },

        "end": {
            "date": google_end_date,
        },
    }

    created_event = (
        service.events()
        .insert(
            calendarId="primary",
            body=event
        )
        .execute()
    )

    todo.google_event_id = created_event["id"]

    todo.save(
        update_fields=[
            "google_event_id"
        ]
    )

    return created_event


# ==================================================
# UPDATE GOOGLE EVENT
# ==================================================

def update_google_event(todo):
    """
    Update the existing Google Calendar event
    belonging to a TaskFlow Todo.
    """

    if not todo.google_event_id:
        return None

    if not todo.deadline:
        return None

    gregorian_date = todo.deadline.togregorian()

    end_date = gregorian_date + timedelta(
        days=1
    )

    start_date = gregorian_date.strftime(
        "%Y-%m-%d"
    )

    google_end_date = end_date.strftime(
        "%Y-%m-%d"
    )

    service = get_google_calendar_service(
        todo.user
    )

    event = {
        "summary": todo.title,

        "description": todo.description,

        "start": {
            "date": start_date,
        },

        "end": {
            "date": google_end_date,
        },
    }

    updated_event = (
        service.events()
        .update(
            calendarId="primary",
            eventId=todo.google_event_id,
            body=event
        )
        .execute()
    )

    return updated_event


# ==================================================
# DELETE GOOGLE EVENT
# ==================================================

def delete_google_event(todo):
    """
    Delete the Google Calendar event
    belonging to a TaskFlow Todo.
    """

    if not todo.google_event_id:
        return False

    service = get_google_calendar_service(
        todo.user
    )

    try:

        service.events().delete(
            calendarId="primary",
            eventId=todo.google_event_id
        ).execute()

    except Exception as error:

        # Google may return an error if the event
        # was already deleted.
        print(
            "Google Calendar delete error:",
            error
        )

    todo.google_event_id = None

    todo.save(
        update_fields=[
            "google_event_id"
        ]
    )

    return True