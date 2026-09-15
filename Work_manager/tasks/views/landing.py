from django.contrib.auth.decorators import login_required
from django.db.models import Q, Count, OuterRef, Subquery
from django.shortcuts import render

import jdatetime

from ..models import Todo, Topic, TodoComment


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
# DATE FORMAT
# ==================================================

def format_jalali_date(value):
    """Format a Jalali date using Persian digits."""

    if not value:
        return ""

    return to_persian_digits(
        value.strftime("%Y/%m/%d")
    )


# ==================================================
# HOME / OVERVIEW
# ==================================================

@login_required
def landing(request):
    """
    Display the main TaskFlow overview page.
    """

    # ==================================================
    # LATEST COMMENTER
    # ==================================================

    # Get the username of the most recent commenter
    # for each task.

    latest_comment_author = Subquery(
        TodoComment.objects.filter(
            todo=OuterRef("pk")
        ).order_by(
            "-created_at"
        ).values(
            "user__username"
        )[:1]
    )

    # ==================================================
    # ACCESSIBLE TASKS
    # ==================================================

    # Annotate every accessible task with:
    #
    # 1. comment_count:
    #    Total number of comments.
    #
    # 2. last_comment_author:
    #    Username of the person who wrote the latest comment.

    accessible_tasks = (
        Todo.objects
        .select_related("topic")
        .annotate(
            comment_count=Count("comments"),
            last_comment_author=latest_comment_author,
        )
        .filter(
            Q(category="public")
            |
            Q(
                category="personal",
                user=request.user
            )
        )
    )

    # ==================================================
    # STATISTICS
    # ==================================================

    total_tasks = accessible_tasks.count()

    completed_tasks = accessible_tasks.filter(
        completed=True
    ).count()

    remaining_tasks = accessible_tasks.filter(
        completed=False
    ).count()

    important_tasks_count = accessible_tasks.filter(
        important=True
    ).count()

    # ==================================================
    # TODAY
    # ==================================================

    # Get today's Jalali date.

    today = jdatetime.date.today()

    # ==================================================
    # LATEST CREATED TASKS
    # ==================================================

    # Show the five most recently created accessible tasks.

    latest_tasks = list(
        accessible_tasks.order_by(
            "-created_at"
        )[:5]
    )

    # ==================================================
    # UPCOMING TASKS
    # ==================================================

    # Show incomplete tasks whose start date
    # is today or in the future.
    #
    # The closest start date appears first.

    upcoming_tasks = list(
        accessible_tasks.filter(
            completed=False,
            start_date__isnull=False,
            start_date__gte=today
        ).order_by(
            "start_date"
        )[:5]
    )

    # ==================================================
    # IMPORTANT TASKS
    # ==================================================

    # Show incomplete important tasks.
    #
    # The newest important tasks appear first.

    important_tasks = list(
        accessible_tasks.filter(
            important=True,
            completed=False
        ).order_by(
            "-created_at"
        )[:5]
    )

    # ==================================================
    # UPCOMING DEADLINES
    # ==================================================

    # Show incomplete tasks whose deadline
    # is today or in the future.
    #
    # The closest deadline appears first.

    upcoming_deadlines = list(
        accessible_tasks.filter(
            completed=False,
            deadline__isnull=False,
            deadline__gte=today
        ).order_by(
            "deadline"
        )[:5]
    )

    # ==================================================
    # PREPARE DATES
    # ==================================================

    # Prepare dates for every task that can appear
    # in one of the landing page sections.

    all_display_tasks = (
        latest_tasks
        + upcoming_tasks
        + important_tasks
        + upcoming_deadlines
    )

    # Prevent duplicate date preparation.

    seen_task_ids = set()

    for todo in all_display_tasks:

        if todo.id in seen_task_ids:
            continue

        seen_task_ids.add(todo.id)

        # --------------------------------------------------
        # CREATION DATE
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
        # START DATE
        # --------------------------------------------------

        if todo.start_date:

            todo.start_date_jalali_str = (
                format_jalali_date(
                    todo.start_date
                )
            )

        else:

            todo.start_date_jalali_str = None

        # --------------------------------------------------
        # DEADLINE
        # --------------------------------------------------

        if todo.deadline:

            todo.deadline_jalali_str = (
                format_jalali_date(
                    todo.deadline
                )
            )

        else:

            todo.deadline_jalali_str = None

        # --------------------------------------------------
        # END DATE
        # --------------------------------------------------

        if todo.end_date:

            todo.end_date_jalali_str = (
                format_jalali_date(
                    todo.end_date
                )
            )

        else:

            todo.end_date_jalali_str = None

    # ==================================================
    # TOPICS
    # ==================================================

    # Public topics are available to every user.

    public_topics = Topic.objects.filter(
        is_public=True,
        is_active=True
    ).order_by(
        "name"
    )

    # Personal topics are available only to their owner.

    personal_topics = Topic.objects.filter(
        user=request.user,
        is_public=False,
        is_active=True
    ).order_by(
        "name"
    )

    # ==================================================
    # GOOGLE CALENDAR STATUS
    # ==================================================

    # Import here to avoid unnecessary dependency
    # when this view is used independently.

    from ..models import GoogleAccount

    google_connected = (
        GoogleAccount.objects.filter(
            user=request.user
        ).exists()
    )

    # ==================================================
    # CONTEXT
    # ==================================================

    context = {

        # --------------------------------------------------
        # Statistics
        # --------------------------------------------------

        "total_tasks": total_tasks,

        "completed_tasks": completed_tasks,

        "remaining_tasks": remaining_tasks,

        "important_tasks_count": important_tasks_count,

        # --------------------------------------------------
        # Landing page cards
        # --------------------------------------------------

        "latest_tasks": latest_tasks,

        "important_tasks": important_tasks,

        "upcoming_tasks": upcoming_tasks,

        "upcoming_deadlines": upcoming_deadlines,

        # --------------------------------------------------
        # Topics for Create Task modal
        # --------------------------------------------------

        "public_topics": public_topics,

        "personal_topics": personal_topics,

        # --------------------------------------------------
        # Google Calendar
        # --------------------------------------------------

        "google_connected": google_connected,

    }

    # ==================================================
    # RENDER
    # ==================================================

    return render(
        request,
        "tasks/landing.html",
        context
    )