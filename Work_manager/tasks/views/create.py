from datetime import datetime, time

import jdatetime

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone

from ..models import Todo, Topic


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
# JALALI DATE PARSER
# ==================================================

def parse_jalali_date(value):
    """Parse a Jalali date from Persian or English digits."""

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


# ==================================================
# JALALI DATE FORMATTER
# ==================================================

def format_jalali_date(value):
    """Format a Jalali date using Persian digits."""

    if not value:
        return ""

    return to_persian_digits(
        value.strftime("%Y/%m/%d")
    )


# ==================================================
# CREATE TODO
# ==================================================

@login_required
def create_todo(request):
    """
    Create a new Todo and return JSON.

    This endpoint is used by the create-task AJAX form.
    """

    # ==================================================
    # METHOD CHECK
    # ==================================================

    if request.method != "POST":

        return JsonResponse(
            {
                "success": False,
                "error": "روش درخواست نامعتبر است."
            },
            status=405
        )


    # ==================================================
    # GET FORM DATA
    # ==================================================

    title = request.POST.get(
        "title",
        ""
    ).strip()

    description = request.POST.get(
        "description",
        ""
    ).strip()

    category = request.POST.get(
        "category",
        "personal"
    ).strip()

    topic_id = request.POST.get(
        "topic",
        ""
    ).strip()

    start_date_str = request.POST.get(
        "start_date",
        ""
    ).strip()

    deadline_str = request.POST.get(
        "deadline",
        ""
    ).strip()


    # ==================================================
    # TITLE VALIDATION
    # ==================================================

    if not title:

        return JsonResponse(
            {
                "success": False,
                "error": "عنوان وظیفه الزامی است."
            },
            status=400
        )


    # ==================================================
    # CATEGORY VALIDATION
    # ==================================================

    valid_categories = {
        "personal",
        "public",
    }

    if category not in valid_categories:

        category = "personal"


    # ==================================================
    # PARSE DATES
    # ==================================================

    start_date = None
    deadline = None


    if start_date_str:

        start_date = parse_jalali_date(
            start_date_str
        )

        if start_date is None:

            return JsonResponse(
                {
                    "success": False,
                    "error": "تاریخ شروع نامعتبر است."
                },
                status=400
            )


    if deadline_str:

        deadline = parse_jalali_date(
            deadline_str
        )

        if deadline is None:

            return JsonResponse(
                {
                    "success": False,
                    "error": "مهلت نامعتبر است."
                },
                status=400
            )


    # ==================================================
    # TOPIC
    # ==================================================

    topic = None

    if topic_id:

        try:

            topic = Topic.objects.get(
                id=int(topic_id)
            )

        except (
            ValueError,
            TypeError,
            Topic.DoesNotExist
        ):

            return JsonResponse(
                {
                    "success": False,
                    "error": "موضوع انتخاب‌شده معتبر نیست."
                },
                status=400
            )


        # --------------------------------------------------
        # Topic access validation
        # --------------------------------------------------

        if topic.is_public:

            pass

        elif topic.user_id != request.user.id:

            return JsonResponse(
                {
                    "success": False,
                    "error": "شما به این موضوع دسترسی ندارید."
                },
                status=403
            )


    # ==================================================
    # CREATE TODO
    # ==================================================

    todo = Todo.objects.create(

        user=request.user,

        title=title,

        description=description,

        category=category,

        topic=topic,

        start_date=start_date,

        deadline=deadline,

        completed=False,

        important=False,
    )


    # ==================================================
    # FORMAT RESPONSE DATES
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
            ).strftime("%Y/%m/%d")
        )
    )


    # ==================================================
    # JSON RESPONSE
    # ==================================================

    return JsonResponse(
        {
            "success": True,

            "todo_id": todo.id,

            "title": todo.title,

            "description": todo.description,

            "category": todo.category,

            "topic": (
                {
                    "id": todo.topic.id,
                    "name": todo.topic.name,
                }
                if todo.topic
                else None
            ),

            "start_date": start_date_jalali,

            "deadline": deadline_jalali,

            "created_at": created_at_jalali,

            "completed": todo.completed,

            "important": todo.important,
        }
    )