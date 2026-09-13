from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q

import jdatetime

from ..models import Todo, GoogleAccount, Topic
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

        # --------------------------------------------------
        # GET FORM DATA
        # --------------------------------------------------

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
        # VALIDATE CATEGORY
        # ==================================================

        if category not in [
            "personal",
            "public",
        ]:

            category = "personal"

        # ==================================================
        # VALIDATE TOPIC
        # ==================================================

        topic = None

        if topic_id:

            try:

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
                    # personal topics belonging to the user.

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

        # ==================================================
        # CONVERT DATES
        # ==================================================

        start_date = parse_jalali_date(
            start_date_str
        )

        deadline = parse_jalali_date(
            deadline_str
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

        )

        # ==================================================
        # GOOGLE CALENDAR SYNC
        # ==================================================

        google_calendar_synced = False
        google_event_link = None

        # Sync only when:
        # 1. Deadline exists.
        # 2. Google Calendar is connected.
        # 3. No event exists yet.

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

                # Google Calendar errors should not
                # break TaskFlow.

                print(
                    "Google Calendar sync error:",
                    error
                )

        # ==================================================
        # FORMAT DATES
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
        # JSON RESPONSE
        # ==================================================

        return JsonResponse({

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
        "scope",
        ""
    ).strip()

    filter_type = request.GET.get(
        "filter",
        ""
    ).strip()

    topic_id = request.GET.get(
        "topic",
        ""
    ).strip()

    # ==================================================
    # BASE TASK QUERY
    # ==================================================

    # Start with all Todo objects and load Topic
    # together with each task.

    todos = Todo.objects.select_related(
        "topic"
    )

    # ==================================================
    # TASK SCOPE
    # ==================================================

    if scope == "my":

        # --------------------------------------------------
        # MY TASKS
        # --------------------------------------------------
        #
        # Show only tasks created by the current user.
        #
        # This includes both:
        # - personal tasks created by the user
        # - public tasks created by the user

        todos = todos.filter(
            user=request.user
        )

        my_tasks = True

    else:

        # --------------------------------------------------
        # DASHBOARD
        # --------------------------------------------------
        #
        # Show:
        # - every public task
        # - personal tasks belonging to the user

        todos = todos.filter(
            Q(
                category="public"
            )
            |
            Q(
                category="personal",
                user=request.user
            )
        )

        my_tasks = False

    # ==================================================
    # STATUS / IMPORTANCE FILTER
    # ==================================================

    if filter_type == "active":

        # Show only incomplete tasks.

        todos = todos.filter(
            completed=False
        )

    elif filter_type == "completed":

        # Show only completed tasks.

        todos = todos.filter(
            completed=True
        )

    elif filter_type == "important":

        # Show only important tasks.

        todos = todos.filter(
            important=True
        )

    # ==================================================
    # TOPIC FILTER
    # ==================================================

    selected_topic = None

    if topic_id:

        try:

            selected_topic = Topic.objects.get(
                id=topic_id,
                is_active=True
            )

            # --------------------------------------------------
            # CHECK TOPIC ACCESS
            # --------------------------------------------------

            if selected_topic.is_public:

                # Public topics can be used by everyone.

                todos = todos.filter(
                    topic=selected_topic
                )

            elif selected_topic.user == request.user:

                # Personal topics can only be used
                # by their owner.

                todos = todos.filter(
                    topic=selected_topic
                )

            else:

                # Invalid personal topic.

                selected_topic = None

        except (
            Topic.DoesNotExist,
            ValueError,
            TypeError,
        ):

            selected_topic = None

    # ==================================================
    # ORDER TASKS
    # ==================================================

    todos = todos.order_by(
        "-created_at"
    )

    # ==================================================
    # STATISTICS
    # ==================================================

    # Calculate statistics before pagination.

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

    paginator = Paginator(
        todos,
        5
    )

    page_number = request.GET.get(
        "page"
    )

    page_obj = paginator.get_page(
        page_number
    )

    # ==================================================
    # COMPACT PAGE NUMBERS
    # ==================================================

    raw_page_numbers = (
        paginator.get_elided_page_range(
            number=page_obj.number,
            on_each_side=1,
            on_ends=1
        )
    )

    page_numbers = []

    for page in raw_page_numbers:

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
    # PREPARE JALALI DATES
    # ==================================================

    # Only prepare dates for tasks
    # displayed on the current page.

    for todo in page_obj:

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
                to_persian_digits(
                    todo.start_date.strftime(
                        "%Y/%m/%d"
                    )
                )
            )

        else:

            todo.start_date_jalali_str = None

        # --------------------------------------------------
        # COMPLETION DATE
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
        # DEADLINE
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
    # TOPIC LISTS
    # ==================================================

    # Public topics created by the admin.

    public_topics = Topic.objects.filter(
        is_public=True,
        is_active=True
    ).order_by(
        "name"
    )

    # Personal topics belonging to the current user.

    personal_topics = Topic.objects.filter(
        user=request.user,
        is_public=False,
        is_active=True
    ).order_by(
        "name"
    )

    # Topics available for the Topic filter.

    filter_topics = (
        list(public_topics)
        +
        list(personal_topics)
    )

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

        # Pagination numbers.
        "page_numbers": page_numbers,

        # Current status / importance filter.
        "filter_type": filter_type,

        # Current scope.
        "my_tasks": my_tasks,

        # Current Topic filter.
        "selected_topic": selected_topic,

        # Available Topic filters.
        "filter_topics": filter_topics,

        # Statistics.
        "total_tasks": total_tasks,

        "completed_tasks": completed_tasks,

        "remaining_tasks": remaining_tasks,

        # Topics for task creation.
        "public_topics": public_topics,

        "personal_topics": personal_topics,

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