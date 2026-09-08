import calendar as gregorian_calendar
import jdatetime

from django.shortcuts import render
from tasks.models import Todo


PERSIAN_MONTHS = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
]

PERSIAN_WEEKDAYS = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
]


def gregorian_to_jalali(value):
    """
    Convert Gregorian date/datetime to Jalali string.
    """

    if not value:
        return ""

    if hasattr(value, "date"):
        value = value.date()

    jd = jdatetime.date.fromgregorian(
        year=value.year,
        month=value.month,
        day=value.day,
    )

    return f"{jd.year:04d}/{jd.month:02d}/{jd.day:02d}"


def get_jalali_month_days(year, month):
    """
    Return all days of a Jalali month.
    """

    if month <= 6:
        return 31

    if month <= 11:
        return 30

    # اسفند
    return 30 if jdatetime.date(year, 12, 1).isleap() else 29


def calendar_view(request):

    today = jdatetime.date.today()

    try:
        year = int(request.GET.get("year", today.year))
        month = int(request.GET.get("month", today.month))
    except (ValueError, TypeError):
        year = today.year
        month = today.month

    # Previous month
    if month < 1:
        month = 12
        year -= 1

    # Next month
    if month > 12:
        month = 1
        year += 1

    days_in_month = get_jalali_month_days(year, month)

    first_day = jdatetime.date(year, month, 1)

    # jdatetime weekday:
    # Saturday = 0 ... Friday = 6
    first_weekday = first_day.weekday()

    total_cells = first_weekday + days_in_month
    number_of_rows = (total_cells + 6) // 7

    # Create calendar cells
    calendar_days = []

    for _ in range(first_weekday):
        calendar_days.append(None)

    for day in range(1, days_in_month + 1):
        calendar_days.append(day)

    while len(calendar_days) < number_of_rows * 7:
        calendar_days.append(None)

    # Fetch tasks
    todos = Todo.objects.all().order_by("-created_at")

    # Map tasks to Jalali date
    tasks_by_day = {}

    for todo in todos:

        dates = []

        if todo.start_date:
            start_jalali = jdatetime.date.fromgregorian(
                year=todo.start_date.year,
                month=todo.start_date.month,
                day=todo.start_date.day,
            )

            if (
                start_jalali.year == year
                and start_jalali.month == month
            ):
                dates.append(
                    (
                        start_jalali.day,
                        "start",
                        todo,
                    )
                )

        if todo.deadline:
            deadline_jalali = jdatetime.date.fromgregorian(
                year=todo.deadline.year,
                month=todo.deadline.month,
                day=todo.deadline.day,
            )

            if (
                deadline_jalali.year == year
                and deadline_jalali.month == month
            ):
                dates.append(
                    (
                        deadline_jalali.day,
                        "deadline",
                        todo,
                    )
                )

        for day, task_type, task in dates:

            tasks_by_day.setdefault(day, []).append(
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "important": task.important,
                    "type": task_type,
                }
            )

    context = {
        "year": year,
        "month": month,
        "month_name": PERSIAN_MONTHS[month - 1],

        "today_year": today.year,
        "today_month": today.month,
        "today_day": today.day,

        "weekdays": PERSIAN_WEEKDAYS,

        "calendar_days": calendar_days,

        "days_in_month": days_in_month,

        "tasks_by_day": tasks_by_day,

        "previous_year": year if month > 1 else year - 1,
        "previous_month": month - 1 if month > 1 else 12,

        "next_year": year if month < 12 else year + 1,
        "next_month": month + 1 if month < 12 else 1,
    }

    return render(
        request,
        "calendar/calendar.html",
        context,
    )