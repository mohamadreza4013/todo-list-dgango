from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import jdatetime

from ..models import Todo


# ==================================================
# DASHBOARD / HOME
# ==================================================

def to_persian_digits(value):
    return str(value).translate(
        str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
    )


@login_required
def home(request):
    """
    Display the dashboard and handle task creation.
    """

    # ==================================================
    # ADD NEW TASK
    # ==================================================

    if request.method == "POST":

        title = request.POST.get("title")
        description = request.POST.get("description")

        category = request.POST.get(
            "category",
            "personal"
        )

        start_date_str = request.POST.get("start_date")
        deadline_str = request.POST.get("deadline")


        # ==================================================
        # VALIDATE CATEGORY
        # ==================================================

        if category not in ["personal", "public"]:
            category = "personal"


        # ==================================================
        # CONVERT JALALI START DATE
        # ==================================================

        start_date = None

        if start_date_str:

            try:

                iso_start = start_date_str.replace("/", "-")

                start_date = jdatetime.date.fromisoformat(
                    iso_start
                )

            except ValueError:

                start_date = None


        # ==================================================
        # CONVERT JALALI DEADLINE
        # ==================================================

        deadline = None

        if deadline_str:

            try:

                iso_deadline = deadline_str.replace("/", "-")

                deadline = jdatetime.date.fromisoformat(
                    iso_deadline
                )

            except ValueError:

                deadline = None


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
        # CONVERT DATES TO JALALI STRINGS
        # ==================================================

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
            ).strftime("%Y/%m/%d")

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
        })


    # ==================================================
    # GET FILTER PARAMETERS
    # ==================================================

    # "my" means that only tasks belonging to
    # the current user should be displayed.
    scope = request.GET.get("scope")

    # "active" and "completed" are status filters.
    filter_type = request.GET.get("filter")


    # ==================================================
    # TASK SCOPE
    # ==================================================

    if scope == "my":

        # Show only tasks created by the current user.
        todos = Todo.objects.filter(
            user=request.user
        )

        # Used by the template to highlight
        # the "My Tasks" navigation item.
        my_tasks = True

    else:

        # Show all public tasks and
        # personal tasks belonging to the current user.
        todos = Todo.objects.filter(

            category="public"

        ) | Todo.objects.filter(

            category="personal",
            user=request.user

        )

        # Used by the template to highlight
        # the dashboard navigation item.
        my_tasks = False


    # ==================================================
    # TASK STATUS FILTER
    # ==================================================

    # Apply the status filter after the task scope.
    # Therefore, when "My Tasks" is active,
    # these filters only affect the user's own tasks.

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

    # Keep newest tasks first.
    todos = todos.order_by(
        "-created_at"
    )


    # ==================================================
    # STATISTICS
    # ==================================================

    # Calculate statistics after applying
    # both the scope and status filter.

    total_tasks = todos.count()

    completed_tasks = todos.filter(
        completed=True
    ).count()

    remaining_tasks = todos.filter(
        completed=False
    ).count()


    # ==================================================
    # PREPARE JALALI DATES
    # ==================================================

    for todo in todos:


        # --------------------------------------------------
        # Creation date
        # --------------------------------------------------

        todo.created_at_jalali_str = (

            jdatetime.datetime.fromgregorian(
                datetime=todo.created_at
            ).strftime("%Y/%m/%d")

        )


        # --------------------------------------------------
        # Start date
        # --------------------------------------------------

        if todo.start_date:

            todo.start_date_jalali_str = (
                todo.start_date.strftime("%Y/%m/%d")
            )

        else:

            todo.start_date_jalali_str = None


        # --------------------------------------------------
        # Completion date
        # --------------------------------------------------

        if todo.end_date:

            todo.end_date_jalali_str = (
                todo.end_date.strftime("%Y/%m/%d")
            )

        else:

            todo.end_date_jalali_str = None


        # --------------------------------------------------
        # Deadline
        # --------------------------------------------------

        if todo.deadline:

            todo.deadline_jalali_str = (
                todo.deadline.strftime("%Y/%m/%d")
            )

        else:

            todo.deadline_jalali_str = None


    # ==================================================
    # TEMPLATE CONTEXT
    # ==================================================

    context = {

        "todos": todos,

        "filter_type": filter_type,

        "my_tasks": my_tasks,

        "total_tasks": total_tasks,

        "completed_tasks": completed_tasks,

        "remaining_tasks": remaining_tasks,

    }


    # ==================================================
    # RENDER HOME PAGE
    # ==================================================

    return render(
        request,
        "tasks/home.html",
        context
    )