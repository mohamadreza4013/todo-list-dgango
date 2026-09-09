from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render

import jdatetime

from ..models import Todo


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

    value = to_english_digits(str(value).strip())
    value = value.replace("-", "/")

    try:
        year, month, day = map(int, value.split("/"))

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
# TOGGLE TODO COMPLETION
# ==================================================

@login_required
def toggle_todo(request, todo_id):

    if request.method != "POST":
        return JsonResponse(
            {
                "success": False,
                "error": "درخواست نامعتبر است."
            },
            status=400
        )

    todo = get_object_or_404(
        Todo,
        id=todo_id
    )

    # Personal tasks can only be changed by their owner.
    if (
        todo.category == "personal"
        and todo.user != request.user
    ):
        return JsonResponse(
            {
                "success": False,
                "error": "شما اجازه تغییر این کار را ندارید."
            },
            status=403
        )

    # Complete the task.
    if not todo.completed:
        todo.completed = True
        todo.end_date = jdatetime.date.today()

    # Mark the task as incomplete.
    else:
        todo.completed = False
        todo.end_date = None

    todo.save(
        update_fields=[
            "completed",
            "end_date"
        ]
    )

    return JsonResponse(
        {
            "success": True,
            "completed": todo.completed,
            "end_date": (
                format_jalali_date(todo.end_date)
                if todo.end_date
                else None
            )
        }
    )


# ==================================================
# EDIT TODO
# ==================================================

@login_required
def edit_todo(request, todo_id):

    todo = get_object_or_404(
        Todo,
        id=todo_id
    )

    # Personal tasks can only be edited by their owner.
    if (
        todo.category == "personal"
        and todo.user != request.user
    ):
        return redirect("home")

    # --------------------------------------------------
    # POST
    # --------------------------------------------------

    if request.method == "POST":

        # Title
        todo.title = request.POST.get(
            "title",
            ""
        ).strip()

        # Description
        todo.description = request.POST.get(
            "description",
            ""
        )

        # Category
        category = request.POST.get(
            "category",
            "personal"
        )

        if category not in [
            "personal",
            "public"
        ]:
            category = "personal"

        todo.category = category

        # Start date
        start_date_str = request.POST.get(
            "start_date",
            ""
        ).strip()

        if start_date_str:
            start_date = parse_jalali_date(
                start_date_str
            )

            if start_date is not None:
                todo.start_date = start_date
        else:
            todo.start_date = None

        # Deadline
        deadline_str = request.POST.get(
            "deadline",
            ""
        ).strip()

        if deadline_str:
            deadline = parse_jalali_date(
                deadline_str
            )

            if deadline is not None:
                todo.deadline = deadline
        else:
            todo.deadline = None

        # Save changes
        todo.save()

        return redirect("home")

    # --------------------------------------------------
    # GET
    # --------------------------------------------------

    start_date_jalali = format_jalali_date(
        todo.start_date
    )

    deadline_jalali = format_jalali_date(
        todo.deadline
    )

    context = {
        "todo": todo,
        "start_date_jalali": start_date_jalali,
        "deadline_jalali": deadline_jalali,
    }

    return render(
        request,
        "tasks/edit_todo.html",
        context
    )


# ==================================================
# DELETE TODO
# ==================================================

@login_required
def delete_todo(request, todo_id):

    if request.method != "POST":
        return JsonResponse(
            {
                "success": False,
                "error": "درخواست نامعتبر است."
            },
            status=400
        )

    todo = get_object_or_404(
        Todo,
        id=todo_id
    )

    # Personal tasks can only be deleted by their owner.
    if (
        todo.category == "personal"
        and todo.user != request.user
    ):
        return JsonResponse(
            {
                "success": False,
                "error": "شما اجازه حذف این کار را ندارید."
            },
            status=403
        )

    todo.delete()

    return JsonResponse(
        {
            "success": True,
            "todo_id": todo_id
        }
    )


# ==================================================
# TOGGLE IMPORTANT STATUS
# ==================================================

@login_required
def toggle_important(request, todo_id):

    if request.method != "POST":
        return JsonResponse(
            {
                "success": False,
                "error": "درخواست نامعتبر است."
            },
            status=400
        )

    todo = get_object_or_404(
        Todo,
        id=todo_id
    )

    # Personal tasks can only be changed by their owner.
    if (
        todo.category == "personal"
        and todo.user != request.user
    ):
        return JsonResponse(
            {
                "success": False,
                "error": "شما اجازه تغییر این کار را ندارید."
            },
            status=403
        )

    todo.important = not todo.important
    todo.save(
        update_fields=["important"]
    )

    return JsonResponse(
        {
            "success": True,
            "important": todo.important,
            "todo_id": todo.id,
        }
    )