from datetime import datetime, time

from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone

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


def jalali_start_to_gregorian_datetime(value):
    """
    Convert a Jalali date to the beginning of that Gregorian day.
    """

    if not value:
        return None

    gregorian_date = value.togregorian()

    naive_datetime = datetime.combine(
        gregorian_date,
        time.min
    )

    return timezone.make_aware(
        naive_datetime,
        timezone.get_current_timezone()
    )


def jalali_end_to_gregorian_datetime(value):
    """
    Convert a Jalali date to the end of that Gregorian day.
    """

    if not value:
        return None

    gregorian_date = value.togregorian()

    naive_datetime = datetime.combine(
        gregorian_date,
        time.max
    )

    return timezone.make_aware(
        naive_datetime,
        timezone.get_current_timezone()
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

    # Status filter:
    # active / completed

    filter_type = request.GET.get(
        "filter",
        ""
    ).strip()

    # Independent important filter.
    #
    # This allows combinations such as:
    # active + important
    # completed + important
    # topic + important

    important_filter = (
        request.GET.get(
            "important",
            ""
        ).strip()
        == "1"
    )

    # Topic filter.

    topic_id = request.GET.get(
        "topic",
        ""
    ).strip()

    # ==================================================
    # SEARCH
    # ==================================================

    # Search in task title and description.

    search_query = request.GET.get(
        "search",
        ""
    ).strip()

    # ==================================================
    # GET DATE FILTER PARAMETERS
    # ==================================================

    # Start date.

    start_date_from_str = request.GET.get(
        "start_date_from",
        ""
    ).strip()

    start_date_to_str = request.GET.get(
        "start_date_to",
        ""
    ).strip()

    # Deadline.

    deadline_from_str = request.GET.get(
        "deadline_from",
        ""
    ).strip()

    deadline_to_str = request.GET.get(
        "deadline_to",
        ""
    ).strip()

    # Creation date.

    created_at_from_str = request.GET.get(
        "created_at_from",
        ""
    ).strip()

    created_at_to_str = request.GET.get(
        "created_at_to",
        ""
    ).strip()

    # Completion / end date.

    end_date_from_str = request.GET.get(
        "end_date_from",
        ""
    ).strip()

    end_date_to_str = request.GET.get(
        "end_date_to",
        ""
    ).strip()

    # ==================================================
    # PARSE DATE FILTERS
    # ==================================================

    # Start date.

    start_date_from = parse_jalali_date(
        start_date_from_str
    )

    start_date_to = parse_jalali_date(
        start_date_to_str
    )

    # Deadline.

    deadline_from = parse_jalali_date(
        deadline_from_str
    )

    deadline_to = parse_jalali_date(
        deadline_to_str
    )

    # Creation date.

    created_at_from = parse_jalali_date(
        created_at_from_str
    )

    created_at_to = parse_jalali_date(
        created_at_to_str
    )

    # Completion / end date.

    end_date_from = parse_jalali_date(
        end_date_from_str
    )

    end_date_to = parse_jalali_date(
        end_date_to_str
    )

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
        # This includes:
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
    # SEARCH FILTER
    # ==================================================

    if search_query:

        # Search both title and description.

        todos = todos.filter(
            Q(
                title__icontains=search_query
            )
            |
            Q(
                description__icontains=search_query
            )
        )

    # ==================================================
    # STATUS FILTER
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

    # ==================================================
    # IMPORTANT FILTER
    # ==================================================

    if important_filter:

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
    # START DATE FILTER
    # ==================================================

    if start_date_from:

        todos = todos.filter(
            start_date__gte=start_date_from
        )

    if start_date_to:

        todos = todos.filter(
            start_date__lte=start_date_to
        )

    # ==================================================
    # DEADLINE FILTER
    # ==================================================

    if deadline_from:

        todos = todos.filter(
            deadline__gte=deadline_from
        )

    if deadline_to:

        todos = todos.filter(
            deadline__lte=deadline_to
        )

    # ==================================================
    # CREATION DATE FILTER
    # ==================================================

    # created_at is a Gregorian DateTimeField.
    #
    # The user enters a Jalali date.
    # Convert the Jalali boundary to the corresponding
    # Gregorian datetime boundary.

    if created_at_from:

        created_at_from_datetime = (
            jalali_start_to_gregorian_datetime(
                created_at_from
            )
        )

        todos = todos.filter(
            created_at__gte=created_at_from_datetime
        )

    if created_at_to:

        created_at_to_datetime = (
            jalali_end_to_gregorian_datetime(
                created_at_to
            )
        )

        todos = todos.filter(
            created_at__lte=created_at_to_datetime
        )

    # ==================================================
    # COMPLETION / END DATE FILTER
    # ==================================================

    if end_date_from:

        todos = todos.filter(
            end_date__gte=end_date_from
        )

    if end_date_to:

        todos = todos.filter(
            end_date__lte=end_date_to
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

    # Calculate statistics after all filters
    # and before pagination.

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
    # FORMAT CURRENT FILTER VALUES
    # ==================================================

    # Start date.

    start_date_from_value = (
        format_jalali_date(
            start_date_from
        )
        if start_date_from
        else ""
    )

    start_date_to_value = (
        format_jalali_date(
            start_date_to
        )
        if start_date_to
        else ""
    )

    # Deadline.

    deadline_from_value = (
        format_jalali_date(
            deadline_from
        )
        if deadline_from
        else ""
    )

    deadline_to_value = (
        format_jalali_date(
            deadline_to
        )
        if deadline_to
        else ""
    )

    # Creation date.

    created_at_from_value = (
        format_jalali_date(
            created_at_from
        )
        if created_at_from
        else ""
    )

    created_at_to_value = (
        format_jalali_date(
            created_at_to
        )
        if created_at_to
        else ""
    )

    # Completion / end date.

    end_date_from_value = (
        format_jalali_date(
            end_date_from
        )
        if end_date_from
        else ""
    )

    end_date_to_value = (
        format_jalali_date(
            end_date_to
        )
        if end_date_to
        else ""
    )

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
    # ACTIVE FILTER QUERY
    # ==================================================

    # Build a query string without the page parameter.
    #
    # This is useful for pagination and for preserving
    # all active filters while moving between pages.

    filter_query_parts = []

    # --------------------------------------------------
    # SEARCH
    # --------------------------------------------------

    if search_query:

        filter_query_parts.append(
            "search="
            + search_query
        )

    # --------------------------------------------------
    # SCOPE
    # --------------------------------------------------

    if scope == "my":

        filter_query_parts.append(
            "scope=my"
        )

    # --------------------------------------------------
    # STATUS
    # --------------------------------------------------

    if filter_type in [
        "active",
        "completed",
    ]:

        filter_query_parts.append(
            f"filter={filter_type}"
        )

    # --------------------------------------------------
    # IMPORTANT
    # --------------------------------------------------

    if important_filter:

        filter_query_parts.append(
            "important=1"
        )

    # --------------------------------------------------
    # TOPIC
    # --------------------------------------------------

    if selected_topic:

        filter_query_parts.append(
            f"topic={selected_topic.id}"
        )

    # --------------------------------------------------
    # START DATE
    # --------------------------------------------------

    if start_date_from:

        filter_query_parts.append(
            "start_date_from="
            + start_date_from.strftime(
                "%Y/%m/%d"
            )
        )

    if start_date_to:

        filter_query_parts.append(
            "start_date_to="
            + start_date_to.strftime(
                "%Y/%m/%d"
            )
        )

    # --------------------------------------------------
    # DEADLINE
    # --------------------------------------------------

    if deadline_from:

        filter_query_parts.append(
            "deadline_from="
            + deadline_from.strftime(
                "%Y/%m/%d"
            )
        )

    if deadline_to:

        filter_query_parts.append(
            "deadline_to="
            + deadline_to.strftime(
                "%Y/%m/%d"
            )
        )

    # --------------------------------------------------
    # CREATION DATE
    # --------------------------------------------------

    if created_at_from:

        filter_query_parts.append(
            "created_at_from="
            + created_at_from.strftime(
                "%Y/%m/%d"
            )
        )

    if created_at_to:

        filter_query_parts.append(
            "created_at_to="
            + created_at_to.strftime(
                "%Y/%m/%d"
            )
        )

    # --------------------------------------------------
    # COMPLETION / END DATE
    # --------------------------------------------------

    if end_date_from:

        filter_query_parts.append(
            "end_date_from="
            + end_date_from.strftime(
                "%Y/%m/%d"
            )
        )

    if end_date_to:

        filter_query_parts.append(
            "end_date_to="
            + end_date_to.strftime(
                "%Y/%m/%d"
            )
        )

    filter_query = "&".join(
        filter_query_parts
    )

    # ==================================================
    # TEMPLATE CONTEXT
    # ==================================================

    context = {

        # --------------------------------------------------
        # TASKS
        # --------------------------------------------------

        "todos": page_obj,

        "page_obj": page_obj,

        # --------------------------------------------------
        # PAGINATION
        # --------------------------------------------------

        "page_numbers": page_numbers,

        "filter_query": filter_query,

        # --------------------------------------------------
        # SEARCH
        # --------------------------------------------------

        "search_query": search_query,

        # --------------------------------------------------
        # STATUS FILTER
        # --------------------------------------------------

        "filter_type": filter_type,

        # --------------------------------------------------
        # IMPORTANT FILTER
        # --------------------------------------------------

        "important_filter": important_filter,

        # --------------------------------------------------
        # SCOPE
        # --------------------------------------------------

        "my_tasks": my_tasks,

        # --------------------------------------------------
        # TOPIC FILTER
        # --------------------------------------------------

        "selected_topic": selected_topic,

        "filter_topics": filter_topics,

        # --------------------------------------------------
        # DATE FILTERS
        # --------------------------------------------------

        # Start date.

        "start_date_from_value": (
            start_date_from_value
        ),

        "start_date_to_value": (
            start_date_to_value
        ),

        # Deadline.

        "deadline_from_value": (
            deadline_from_value
        ),

        "deadline_to_value": (
            deadline_to_value
        ),

        # Creation date.

        "created_at_from_value": (
            created_at_from_value
        ),

        "created_at_to_value": (
            created_at_to_value
        ),

        # Completion / end date.

        "end_date_from_value": (
            end_date_from_value
        ),

        "end_date_to_value": (
            end_date_to_value
        ),

        # --------------------------------------------------
        # STATISTICS
        # --------------------------------------------------

        "total_tasks": total_tasks,

        "completed_tasks": completed_tasks,

        "remaining_tasks": remaining_tasks,

        # --------------------------------------------------
        # TOPICS FOR TASK CREATION
        # --------------------------------------------------

        "public_topics": public_topics,

        "personal_topics": personal_topics,

        # --------------------------------------------------
        # GOOGLE CALENDAR
        # --------------------------------------------------

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