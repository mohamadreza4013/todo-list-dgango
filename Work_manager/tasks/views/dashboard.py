from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

import jdatetime

from ..models import Todo, GoogleAccount
from ..services.google_calendar import create_google_event
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

        title = request.POST.get("title")
        description = request.POST.get("description")

        category = request.POST.get(
            "category",
            "personal"
        )

        start_date_str = request.POST.get(
            "start_date"
        )

        deadline_str = request.POST.get(
            "deadline"
        )


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

                iso_start = start_date_str.replace(
                    "/",
                    "-"
                )

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

                iso_deadline = deadline_str.replace(
                    "/",
                    "-"
                )

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

                # Do not prevent TaskFlow
                # from creating the Todo.
                print(
                    "Google Calendar sync error:",
                    error
                )


        # ==================================================
        # CONVERT DATES TO JALALI STRINGS
        # ==================================================

        start_date_jalali = (

            todo.start_date.strftime(
                "%Y/%m/%d"
            )

            if todo.start_date

            else ""

        )


        deadline_jalali = (

            todo.deadline.strftime(
                "%Y/%m/%d"
            )

            if todo.deadline

            else ""

        )


        created_at_jalali = (

            jdatetime.datetime.fromgregorian(
                datetime=todo.created_at
            ).strftime(
                "%Y/%m/%d"
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

        todos = Todo.objects.filter(
            user=request.user
        )

        my_tasks = True

    else:

        todos = Todo.objects.filter(

            category="public"

        ) | Todo.objects.filter(

            category="personal",
            user=request.user

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

        # Creation date

        todo.created_at_jalali_str = (

            jdatetime.datetime.fromgregorian(
                datetime=todo.created_at
            ).strftime(
                "%Y/%m/%d"
            )

        )


        # Start date

        if todo.start_date:

            todo.start_date_jalali_str = (
                todo.start_date.strftime(
                    "%Y/%m/%d"
                )
            )

        else:

            todo.start_date_jalali_str = None


        # Completion date

        if todo.end_date:

            todo.end_date_jalali_str = (
                todo.end_date.strftime(
                    "%Y/%m/%d"
                )
            )

        else:

            todo.end_date_jalali_str = None


        # Deadline

        if todo.deadline:

            todo.deadline_jalali_str = (
                todo.deadline.strftime(
                    "%Y/%m/%d"
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

        "todos": todos,

        "filter_type": filter_type,

        "my_tasks": my_tasks,

        "total_tasks": total_tasks,

        "completed_tasks": completed_tasks,

        "remaining_tasks": remaining_tasks,

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