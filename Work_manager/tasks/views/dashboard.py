from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import jdatetime

from ..models import Todo


# ==================================================
# DASHBOARD / HOME
# ==================================================

@login_required
def home(request):
    """
    Display the dashboard and handle task creation.
    """

    # =========================
    # Add a new task
    # =========================
    if request.method == "POST":

        title = request.POST.get("title")
        description = request.POST.get("description")

        category = request.POST.get(
            "category",
            "personal"
        )

        start_date_str = request.POST.get("start_date")
        deadline_str = request.POST.get("deadline")


        # =========================
        # Validate category
        # =========================

        if category not in ["personal", "public"]:
            category = "personal"


        # =========================
        # Convert Jalali start date
        # =========================

        start_date = None

        if start_date_str:

            try:

                iso_start = start_date_str.replace("/", "-")

                start_date = jdatetime.date.fromisoformat(
                    iso_start
                )

            except ValueError:

                start_date = None


        # =========================
        # Convert Jalali deadline
        # =========================

        deadline = None

        if deadline_str:

            try:

                iso_deadline = deadline_str.replace("/", "-")

                deadline = jdatetime.date.fromisoformat(
                    iso_deadline
                )

            except ValueError:

                deadline = None


        # =========================
        # Create task
        # =========================

        todo = Todo.objects.create(

            user=request.user,

            title=title,

            description=description,

            category=category,

            start_date=start_date,

            deadline=deadline,
        )


        # =========================
        # Convert dates to Jalali
        # =========================

        start_date_jalali = (

            todo.start_date.strftime("%Y/%m/%d")

            if todo.start_date

            else ""

        )


        deadline_jalali = (

            todo.deadline.strftime("%Y/%m/%d")

            if todo.deadline

            else ""

        )


        created_at_jalali = (

            jdatetime.datetime.fromgregorian(
                datetime=todo.created_at
            ).strftime("%d %b %Y")

        )


        # =========================
        # Return JSON response
        # =========================

        return JsonResponse({

            "success": True,

            "todo_id": todo.id,

            "title": todo.title,

            "description": todo.description,

            "category": todo.category,

            "start_date": start_date_jalali,

            "deadline": deadline_jalali,

            "created_at": created_at_jalali,
        })


    # =========================
    # Display dashboard
    # =========================

    # Show:
    # 1. Personal tasks belonging to the current user
    # 2. Public tasks belonging to all users

    todos = Todo.objects.filter(

        category="public"

    ) | Todo.objects.filter(

        category="personal",
        user=request.user

    )


    # Keep newest tasks first

    todos = todos.order_by("-created_at")


    # =========================
    # Statistics
    # =========================

    total_tasks = todos.count()

    completed_tasks = todos.filter(
        completed=True
    ).count()

    remaining_tasks = todos.filter(
        completed=False
    ).count()


    # =========================
    # Task filters
    # =========================

    filter_type = request.GET.get("filter")


    if filter_type == "active":

        todos = todos.filter(
            completed=False
        )


    elif filter_type == "completed":

        todos = todos.filter(
            completed=True
        )


    # =========================
    # Prepare Jalali dates
    # =========================

    for todo in todos:


        # Creation date

        todo.created_at_jalali_str = (

            jdatetime.datetime.fromgregorian(
                datetime=todo.created_at
            ).strftime("%d %b %Y")

        )


        # Start date

        if todo.start_date:

            todo.start_date_jalali_str = (

                todo.start_date.strftime(
                    "%d %b %Y"
                )

            )

        else:

            todo.start_date_jalali_str = None


        # Completion date

        if todo.end_date:

            todo.end_date_jalali_str = (

                todo.end_date.strftime(
                    "%d %b %Y"
                )

            )

        else:

            todo.end_date_jalali_str = None


        # Deadline

        if todo.deadline:

            todo.deadline_jalali_str = (

                todo.deadline.strftime(
                    "%d %b %Y"
                )

            )

        else:

            todo.deadline_jalali_str = None


    # =========================
    # Template context
    # =========================

    context = {

        "todos": todos,

        "filter_type": filter_type,

        "total_tasks": total_tasks,

        "completed_tasks": completed_tasks,

        "remaining_tasks": remaining_tasks,

    }


    return render(
        request,
        "tasks/home.html",
        context
    )