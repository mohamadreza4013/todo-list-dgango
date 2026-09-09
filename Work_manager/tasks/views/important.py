from django.contrib.auth.decorators import login_required
from django.shortcuts import render

import jdatetime

from ..models import Todo


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

    # Get important public tasks and personal tasks
    # that belong to the current user
    todos = Todo.objects.filter(
        category="public",
        important=True
    ) | Todo.objects.filter(
        category="personal",
        user=request.user,
        important=True
    )

    # Show the newest tasks first
    todos = todos.order_by("-created_at")


    # ==================================================
    # CALCULATE TASK STATISTICS
    # ==================================================

    total_tasks = todos.count()

    completed_tasks = todos.filter(
        completed=True
    ).count()

    remaining_tasks = todos.filter(
        completed=False
    ).count()


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
    # FORMAT JALALI DATES
    # ==================================================

    for todo in todos:

        # Creation date

        created_at_jalali = (
            jdatetime.datetime.fromgregorian(
                datetime=todo.created_at
            ).strftime("%Y/%m/%d")
        )

        todo.created_at_jalali_str = to_persian_digits(
            created_at_jalali
        )


        # Start date

        if todo.start_date:

            start_date_jalali = (
                todo.start_date.strftime("%Y/%m/%d")
            )

            todo.start_date_jalali_str = to_persian_digits(
                start_date_jalali
            )

        else:

            todo.start_date_jalali_str = None


        # End date

        if todo.end_date:

            end_date_jalali = (
                todo.end_date.strftime("%Y/%m/%d")
            )

            todo.end_date_jalali_str = to_persian_digits(
                end_date_jalali
            )

        else:

            todo.end_date_jalali_str = None


        # Deadline

        if todo.deadline:

            deadline_jalali = (
                todo.deadline.strftime("%Y/%m/%d")
            )

            todo.deadline_jalali_str = to_persian_digits(
                deadline_jalali
            )

        else:

            todo.deadline_jalali_str = None


    # ==================================================
    # CONTEXT
    # ==================================================

    context = {
        "todos": todos,

        "total_tasks": total_tasks_display,

        "completed_tasks": completed_tasks_display,

        "remaining_tasks": remaining_tasks_display,
    }


    # ==================================================
    # RENDER PAGE
    # ==================================================

    return render(
        request,
        "tasks/important.html",
        context
    )