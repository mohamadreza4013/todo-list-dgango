from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import (
    get_object_or_404,
    redirect,
    render,
)

import jdatetime

from ..models import (
    Todo,
    GoogleAccount,
    Topic,
)

from ..services.google_calendar import (
    create_google_event,
    update_google_event,
    delete_google_event,
)


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

    value = value.replace("-", "/")

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
# TOGGLE TODO COMPLETION
# ==================================================

@login_required
def toggle_todo(request, todo_id):

    # Only POST requests are allowed.
    if request.method != "POST":

        return JsonResponse(
            {
                "success": False,
                "error": "درخواست نامعتبر است."
            },
            status=400
        )

    # Get the selected Todo.
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

    # --------------------------------------------------
    # TOGGLE COMPLETION
    # --------------------------------------------------

    if not todo.completed:

        # Mark the task as completed.
        todo.completed = True

        # Store the completion date.
        todo.end_date = jdatetime.date.today()

    else:

        # Mark the task as incomplete.
        todo.completed = False

        # Remove the completion date.
        todo.end_date = None

    # Save only the changed fields.
    todo.save(
        update_fields=[
            "completed",
            "end_date",
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
            ),
        }
    )


# ==================================================
# EDIT TODO
# ==================================================

@login_required
def edit_todo(request, todo_id):

    # Get the selected Todo.
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

    # ==================================================
    # POST
    # ==================================================

    if request.method == "POST":

        # Save the old deadline before changing the Todo.
        old_deadline = todo.deadline

        # --------------------------------------------------
        # TITLE
        # --------------------------------------------------

        todo.title = request.POST.get(
            "title",
            ""
        ).strip()

        # --------------------------------------------------
        # DESCRIPTION
        # --------------------------------------------------

        todo.description = request.POST.get(
            "description",
            ""
        )

        # --------------------------------------------------
        # CATEGORY
        # --------------------------------------------------

        category = request.POST.get(
            "category",
            "personal"
        )

        if category not in [
            "personal",
            "public",
        ]:

            category = "personal"

        todo.category = category

        # --------------------------------------------------
        # TOPIC
        # --------------------------------------------------

        topic_id = request.POST.get(
            "topic",
            ""
        ).strip()

        topic = None

        if topic_id:

            try:

                # Get only an active topic.
                selected_topic = Topic.objects.get(
                    id=topic_id,
                    is_active=True
                )

                # --------------------------------------------------
                # PUBLIC TASK
                # --------------------------------------------------

                if category == "public":

                    # Public tasks can only use public topics.
                    if selected_topic.is_public:

                        topic = selected_topic

                # --------------------------------------------------
                # PERSONAL TASK
                # --------------------------------------------------

                else:

                    # Personal tasks can only use
                    # the current user's personal topics.
                    if (
                        not selected_topic.is_public
                        and selected_topic.user == request.user
                    ):

                        topic = selected_topic

            except (
                Topic.DoesNotExist,
                ValueError,
                TypeError,
            ):

                topic = None

        # Save the validated topic.
        todo.topic = topic

        # --------------------------------------------------
        # START DATE
        # --------------------------------------------------

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

        else:

            todo.start_date = None

        # --------------------------------------------------
        # DEADLINE
        # --------------------------------------------------

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

        else:

            todo.deadline = None

        # --------------------------------------------------
        # SAVE TODO
        # --------------------------------------------------

        todo.save()

        # ==================================================
        # GOOGLE CALENDAR SYNC
        # ==================================================

        google_connected = (
            GoogleAccount.objects.filter(
                user=request.user
            ).exists()
        )

        if google_connected:

            try:

                # --------------------------------------------------
                # CASE 1: DEADLINE REMOVED
                # --------------------------------------------------

                if (
                    old_deadline
                    and not todo.deadline
                    and todo.google_event_id
                ):

                    delete_google_event(
                        todo
                    )

                # --------------------------------------------------
                # CASE 2: EXISTING EVENT SHOULD BE UPDATED
                # --------------------------------------------------

                elif (
                    todo.deadline
                    and todo.google_event_id
                ):

                    update_google_event(
                        todo
                    )

                # --------------------------------------------------
                # CASE 3: CREATE NEW EVENT
                # --------------------------------------------------

                elif (
                    todo.deadline
                    and not todo.google_event_id
                ):

                    create_google_event(
                        todo
                    )

            except Exception as error:

                # Google Calendar errors should not
                # break TaskFlow.
                print(
                    "Google Calendar sync error:",
                    error
                )

        return redirect("home")

    # ==================================================
    # GET
    # ==================================================

    start_date_jalali = format_jalali_date(
        todo.start_date
    )

    deadline_jalali = format_jalali_date(
        todo.deadline
    )

    # --------------------------------------------------
    # PUBLIC TOPICS
    # --------------------------------------------------

    public_topics = Topic.objects.filter(
        is_public=True,
        is_active=True
    ).order_by(
        "name"
    )

    # --------------------------------------------------
    # PERSONAL TOPICS
    # --------------------------------------------------

    personal_topics = Topic.objects.filter(
        user=request.user,
        is_public=False,
        is_active=True
    ).order_by(
        "name"
    )

    # ==================================================
    # CONTEXT
    # ==================================================

    context = {
        "todo": todo,

        "start_date_jalali": start_date_jalali,
        "deadline_jalali": deadline_jalali,

        "public_topics": public_topics,
        "personal_topics": personal_topics,
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

    # Only POST requests are allowed.
    if request.method != "POST":

        return JsonResponse(
            {
                "success": False,
                "error": "درخواست نامعتبر است."
            },
            status=400
        )

    # --------------------------------------------------
    # GET TODO
    # --------------------------------------------------

    todo = get_object_or_404(
        Todo,
        id=todo_id
    )

    # --------------------------------------------------
    # PERMISSION CHECK
    # --------------------------------------------------

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

    # ==================================================
    # GOOGLE CALENDAR SYNC
    # ==================================================

    google_connected = (
        GoogleAccount.objects.filter(
            user=request.user
        ).exists()
    )

    if (
        google_connected
        and todo.google_event_id
    ):

        try:

            # Delete the related Google Calendar event.
            delete_google_event(
                todo
            )

        except Exception as error:

            # Keep TaskFlow working even if
            # Google Calendar deletion fails.
            print(
                "Google Calendar delete error:",
                error
            )

    # ==================================================
    # DELETE TODO
    # ==================================================

    todo.delete()

    # ==================================================
    # RETURN RESPONSE
    # ==================================================

    return JsonResponse(
        {
            "success": True,
            "todo_id": todo_id,
        }
    )


# ==================================================
# TOGGLE IMPORTANT STATUS
# ==================================================

@login_required
def toggle_important(request, todo_id):

    # Only POST requests are allowed.
    if request.method != "POST":

        return JsonResponse(
            {
                "success": False,
                "error": "درخواست نامعتبر است."
            },
            status=400
        )

    # Get the selected Todo.
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

    # Toggle the important status.
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