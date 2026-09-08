from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import jdatetime

from ..models import Todo


# ==================================================
# DASHBOARD / HOME
# ==================================================

#@login_required
def home(request):
    """
    نمایش داشبورد و مدیریت افزودن تسک
    """

    # =========================
    # افزودن تسک جدید (AJAX)
    # =========================
    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description")
        start_date_str = request.POST.get("start_date")   # تاریخ شمسی به‌صورت رشته
        deadline_str = request.POST.get("deadline")       # تاریخ شمسی به‌صورت رشته

        # تبدیل رشته شمسی به jdatetime.date (بدون تبدیل به میلادی)
        start_date = None
        deadline = None

        if start_date_str:
            try:
                iso_start = start_date_str.replace("/", "-")
                start_date = jdatetime.date.fromisoformat(iso_start)
            except ValueError:
                start_date = None

        if deadline_str:
            try:
                iso_deadline = deadline_str.replace("/", "-")
                deadline = jdatetime.date.fromisoformat(iso_deadline)
            except ValueError:
                deadline = None

        # ایجاد تسک جدید برای کاربر جاری
        # فیلدهای start_date و deadline از نوع jmodels.jDateField هستند
        # و به‌طور مستقیم شیء jdatetime.date را می‌پذیرند
        todo = Todo.objects.create(
            #user=request.user,
            title=title,
            description=description,
            start_date=start_date,   # jdatetime.date
            deadline=deadline,       # jdatetime.date
        )

        # تبدیل تاریخ‌ها به رشته شمسی برای ارسال در JSON
        start_date_jalali = (
            todo.start_date.strftime("%Y/%m/%d")
            if todo.start_date else ""
        )

        deadline_jalali = (
            todo.deadline.strftime("%Y/%m/%d")
            if todo.deadline else ""
        )
        created_at_jalali = jdatetime.datetime.fromgregorian(
            datetime=todo.created_at
        ).strftime("%d %b %Y")

        return JsonResponse({
            "success": True,
            "todo_id": todo.id,
            "title": todo.title,
            "description": todo.description,
            "start_date": start_date_jalali,
            "deadline": deadline_jalali,
            "created_at": created_at_jalali,
        })

    # =========================
    # نمایش داشبورد
    # =========================

    # فقط تسک‌های کاربر جاری
    #todos = Todo.objects.filter(user=request.user).order_by("-created_at")
    todos = Todo.objects.order_by("-created_at")
    # آمار
    total_tasks = todos.count()
    completed_tasks = todos.filter(completed=True).count()
    remaining_tasks = todos.filter(completed=False).count()

    # فیلتر
    filter_type = request.GET.get("filter")

    if filter_type == "active":
        todos = todos.filter(completed=False)
    elif filter_type == "completed":
        todos = todos.filter(completed=True)

    # افزودن رشته‌های تاریخ شمسی به هر تسک برای نمایش در قالب
    for todo in todos:
        # تاریخ ایجاد (میلادی -> شمسی)
        todo.created_at_jalali_str = jdatetime.datetime.fromgregorian(
            datetime=todo.created_at
        ).strftime("%d %b %Y")

        # تاریخ شروع (شمسی)
        if todo.start_date:
            todo.start_date_jalali_str = todo.start_date.strftime("%d %b %Y")
        else:
            todo.start_date_jalali_str = None

        # مهلت (شمسی)
        if todo.deadline:
            todo.deadline_jalali_str = todo.deadline.strftime("%d %b %Y")
        else:
            todo.deadline_jalali_str = None

    context = {
        "todos": todos,
        "filter_type": filter_type,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "remaining_tasks": remaining_tasks,
    }

    return render(request, "tasks/home.html", context)