from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import render

import jdatetime

from ..models import Todo, GoogleAccount


# ==================================================
# DIGIT CONVERSION
# ==================================================

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
# IMPORTANT TASKS
# ==================================================

@login_required
def important_tasks(request):

    # ==================================================
    # GET IMPORTANT TASKS
    # ==================================================

    # Get:
    # - all important public tasks
    # - important personal tasks belonging to the current user
    #
    # select_related("topic") loads the related Topic
    # together with each Todo object.
    todos = Todo.objects.select_related(
        "topic"
    ).filter(
        Q(
            category="public",
            important=True
        )
        |
        Q(
            category="personal",
            user=request.user,
            important=True
        )
    ).order_by(
        "-created_at"
    )


    # ==================================================
    # CALCULATE TASK STATISTICS
    # ==================================================

    # Statistics must be calculated BEFORE pagination
    # so they represent all important tasks.
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

    # Show 5 tasks on each page.
    paginator = Paginator(
        todos,
        5
    )

    # Get the requested page number from the URL.
    page_number = request.GET.get(
        "page"
    )

    # get_page() handles invalid and missing page numbers safely.
    page_obj = paginator.get_page(
        page_number
    )


    # ==================================================
    # FORMAT JALALI DATES
    # ==================================================

    # Only format dates for tasks on the current page.
    for todo in page_obj:

        # --------------------------------------------------
        # CREATION DATE
        # --------------------------------------------------

        created_at_jalali = (
            jdatetime.datetime.fromgregorian(
                datetime=todo.created_at
            ).strftime(
                "%Y/%m/%d"
            )
        )

        todo.created_at_jalali_str = (
            to_persian_digits(
                created_at_jalali
            )
        )


        # --------------------------------------------------
        # START DATE
        # --------------------------------------------------

        if todo.start_date:

            start_date_jalali = (
                todo.start_date.strftime(
                    "%Y/%m/%d"
                )
            )

            todo.start_date_jalali_str = (
                to_persian_digits(
                    start_date_jalali
                )
            )

        else:

            todo.start_date_jalali_str = None


        # --------------------------------------------------
        # END DATE
        # --------------------------------------------------

        if todo.end_date:

            end_date_jalali = (
                todo.end_date.strftime(
                    "%Y/%m/%d"
                )
            )

            todo.end_date_jalali_str = (
                to_persian_digits(
                    end_date_jalali
                )
            )

        else:

            todo.end_date_jalali_str = None


        # --------------------------------------------------
        # DEADLINE
        # --------------------------------------------------

        if todo.deadline:

            deadline_jalali = (
                todo.deadline.strftime(
                    "%Y/%m/%d"
                )
            )

            todo.deadline_jalali_str = (
                to_persian_digits(
                    deadline_jalali
                )
            )

        else:

            todo.deadline_jalali_str = None


    # ==================================================
    # PAGINATION PAGE NUMBERS
    # ==================================================

    # Prepare Persian page numbers for the template.
    page_numbers = [
        {
            "number": page,
            "display": to_persian_digits(page),
        }
        for page in page_obj.paginator.page_range
    ]


    # ==================================================
    # GOOGLE CALENDAR CONNECTION
    # ==================================================

    # Check whether the current user has connected
    # their Google Calendar account.
    google_connected = GoogleAccount.objects.filter(
        user=request.user
    ).exists()


    # ==================================================
    # FORMAT STATISTICS WITH PERSIAN DIGITS
    # ==================================================

    total_tasks_display = to_persian_digits(
        total_tasks
    )

    completed_tasks_display = to_persian_digits(
        completed_tasks
    )

    remaining_tasks_display = to_persian_digits(
        remaining_tasks
    )


    # ==================================================
    # CONTEXT
    # ==================================================

    context = {

        # Current page of Todo objects.
        "todos": page_obj,

        # Django pagination object.
        "page_obj": page_obj,

        # Persian statistics.
        "total_tasks": total_tasks_display,
        "completed_tasks": completed_tasks_display,
        "remaining_tasks": remaining_tasks_display,

        # Persian page numbers.
        "page_numbers": page_numbers,

        # Google Calendar connection status.
        "google_connected": google_connected,
    }


    # ==================================================
    # RENDER PAGE
    # ==================================================

    return render(
        request,
        "tasks/important.html",
        context
    )