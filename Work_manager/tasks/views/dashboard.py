from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

import jdatetime

from ..models import Todo, GoogleAccount
from ..services.google_calendar import create_google_event


# ==================================================
# DIGIT CONVERSION
# ==================================================

def to_english_digits(value):
    """Convert Persian digits to English digits."""

    if value is None:
        return ""

    return str(value).translate(
        str.maketrans(
            "۰۱۲۳۴۵۶۷۸۹",
            "0123456789"
        )
    )


def to_persian_digits(value):
    """Convert English digits to Persian digits."""

    if value is None:
        return ""

    return str(value).translate(
        str.maketrans(
            "0123456789",
            "۰۱۲۳۴۵۶۷۸۹"
        )
    )


# ==================================================
# JALALI DATE HELPERS
# ==================================================

def parse_jalali_date(value):
    """Convert a Jalali date string to jdatetime.date."""

    if not value:
        return None

    value = to_english_digits(
        str(value).strip()
    )

    value = value.replace(
        "-",
        "/"
    )

    try:

        year, month, day = map(
            int,
            value.split("/")
        )

        return jdatetime.date(
            year,
            month,
            day
        )

    except (ValueError, TypeError):

        return None


def format_jalali_date(value):
    """Format a Jalali date using Persian digits."""

    if not value:
        return ""

    return to_persian_digits(
        value.strftime("%Y/%m/%d")
    )


# ==================================================
# DASHBOARD / HOME
# ==================================================

@login_required
def home(request):
    """
    Display the dashboard and handle task creation.
    """

    # ==================================================
    # ADD NEW TASK
    # ==================================================

    if request.method == "POST":

        title = request.POST.get(
            "title",
            ""
        ).strip()

        description = request.POST.get(
            "description",
            ""
        )

        category = request.POST.get(
            "category",
            "personal"
        )

        start_date_str = request.POST.get(
            "start_date",
            ""
        )

        deadline_str = request.POST.get(
            "deadline",
            ""
        )

        # ==================================================
        # VALIDATE CATEGORY
        # ==================================================

        if category not in [
            "personal",
            "public",
        ]:

            category = "personal"

        # ==================================================
        # CONVERT JALALI START DATE
        # ==================================================

        start_date = parse_jalali_date(
            start_date_str
        )

        # ==================================================
        # CONVERT JALALI DEADLINE
        # ==================================================

        deadline = parse_jalali_date(
            deadline_str
        )

        # ==================================================
        # CREATE TASK
        # ==================================================

        todo = Todo.objects.create(

            user=request.user,

            title=title,

            description=description,

            category=category,

            start_date=start_date,

            deadline=deadline,

        )

        # ==================================================
        # GOOGLE CALENDAR SYNC
        # ==================================================

        google_calendar_synced = False
        google_event_link = None

        # Only sync when:
        # 1. The task has a deadline.
        # 2. The current user connected Google Calendar.
        # 3. The task does not already have a Google event.

        if (
            deadline
            and GoogleAccount.objects.filter(
                user=request.user
            ).exists()
            and not todo.google_event_id
        ):

            try:

                google_event = create_google_event(
                    todo
                )

                if google_event:

                    google_calendar_synced = True

                    google_event_link = (
                        google_event.get(
                            "htmlLink"
                        )
                    )

            except Exception as error:

                # Keep TaskFlow working even if
                # Google Calendar has an error.
                print(
                    "Google Calendar sync error:",
                    error
                )

        # ==================================================
        # CONVERT DATES TO JALALI STRINGS
        # ==================================================

        start_date_jalali = (
            format_jalali_date(
                todo.start_date
            )
            if todo.start_date
            else ""
        )

        deadline_jalali = (
            format_jalali_date(
                todo.deadline
            )
            if todo.deadline
            else ""
        )

        created_at_jalali = (
            to_persian_digits(
                jdatetime.datetime.fromgregorian(
                    datetime=todo.created_at
                ).strftime(
                    "%Y/%m/%d"
                )
            )
        )

        # ==================================================
        # RETURN JSON RESPONSE
        # ==================================================

        return JsonResponse({

            "success": True,

            "todo_id": todo.id,

            "title": todo.title,

            "description": todo.description,

            "category": todo.category,

            "start_date": start_date_jalali,

            "deadline": deadline_jalali,

            "created_at": created_at_jalali,

            "google_calendar_synced": (
                google_calendar_synced
            ),

            "google_event_link": (
                google_event_link
            ),

        })

    # ==================================================
    # GET FILTER PARAMETERS
    # ==================================================

    scope = request.GET.get(
        "scope"
    )

    filter_type = request.GET.get(
        "filter"
    )

    # ==================================================
    # TASK SCOPE
    # ==================================================

    if scope == "my":

        # Show only the current user's tasks.
        todos = Todo.objects.filter(
            user=request.user
        )

        my_tasks = True

    else:

        # Show:
        # - all public tasks
        # - current user's personal tasks
        todos = (
            Todo.objects.filter(
                category="public"
            )
            |
            Todo.objects.filter(
                category="personal",
                user=request.user
            )
        )

        my_tasks = False

    # ==================================================
    # TASK STATUS FILTER
    # ==================================================

    if filter_type == "active":

        todos = todos.filter(
            completed=False
        )

    elif filter_type == "completed":

        todos = todos.filter(
            completed=True
        )

    # ==================================================
    # ORDER TASKS
    # ==================================================

    todos = todos.order_by(
        "-created_at"
    )

    # ==================================================
    # STATISTICS
    # ==================================================

    # Calculate statistics BEFORE pagination.
    # This ensures the numbers represent all matching tasks.
    total_tasks = todos.count()

    completed_tasks = todos.filter(
        completed=True
    ).count()

    remaining_tasks = todos.filter(
        completed=False
    ).count()

    # ==================================================
    # PAGINATION
    # ==================================================

    # Number of tasks displayed on each page.
    paginator = Paginator(
        todos,
        5
    )

    # Get requested page number.
    page_number = request.GET.get(
        "page"
    )

    # Get current page.
    page_obj = paginator.get_page(
        page_number
    )

    # ==================================================
    # COMPACT PAGE NUMBERS
    # ==================================================

    # Example:
    # 1, 2, 3, ..., 9, 10

    raw_page_numbers = paginator.get_elided_page_range(
        number=page_obj.number,
        on_each_side=1,
        on_ends=1
    )

    page_numbers = []

    for page in raw_page_numbers:

        # Django uses this value for the ellipsis.
        if page == paginator.ELLIPSIS:

            page_numbers.append({
                "number": None,
                "display": "…",
            })

        else:

            page_numbers.append({
                "number": page,
                "display": to_persian_digits(
                    page
                ),
            })

    # ==================================================
    # PREPARE DATES FOR CURRENT PAGE
    # ==================================================

    # Only prepare dates for tasks
    # shown on the current page.
    for todo in page_obj:

        # --------------------------------------------------
        # Creation date
        # --------------------------------------------------

        todo.created_at_jalali_str = (
            to_persian_digits(
                jdatetime.datetime.fromgregorian(
                    datetime=todo.created_at
                ).strftime(
                    "%Y/%m/%d"
                )
            )
        )

        # --------------------------------------------------
        # Start date
        # --------------------------------------------------

        if todo.start_date:

            todo.start_date_jalali_str = (
                to_persian_digits(
                    todo.start_date.strftime(
                        "%Y/%m/%d"
                    )
                )
            )

        else:

            todo.start_date_jalali_str = None

        # --------------------------------------------------
        # Completion date
        # --------------------------------------------------

        if todo.end_date:

            todo.end_date_jalali_str = (
                to_persian_digits(
                    todo.end_date.strftime(
                        "%Y/%m/%d"
                    )
                )
            )

        else:

            todo.end_date_jalali_str = None

        # --------------------------------------------------
        # Deadline
        # --------------------------------------------------

        if todo.deadline:

            todo.deadline_jalali_str = (
                to_persian_digits(
                    todo.deadline.strftime(
                        "%Y/%m/%d"
                    )
                )
            )

        else:

            todo.deadline_jalali_str = None

    # ==================================================
    # GOOGLE CALENDAR CONNECTION STATUS
    # ==================================================

    google_connected = (
        GoogleAccount.objects.filter(
            user=request.user
        ).exists()
    )

    # ==================================================
    # TEMPLATE CONTEXT
    # ==================================================

    context = {

        # Current page of Todo objects.
        "todos": page_obj,

        # Django pagination object.
        "page_obj": page_obj,

        # Compact pagination numbers.
        "page_numbers": page_numbers,

        # Current filters.
        "filter_type": filter_type,

        "my_tasks": my_tasks,

        # Statistics.
        "total_tasks": total_tasks,

        "completed_tasks": completed_tasks,

        "remaining_tasks": remaining_tasks,

        # Google Calendar status.
        "google_connected": google_connected,

    }

    # ==================================================
    # RENDER HOME PAGE
    # ==================================================

    return render(
        request,
        "tasks/home.html",
        context
    )