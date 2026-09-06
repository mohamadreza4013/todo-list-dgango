from django.shortcuts import render, redirect
from .models import Todo
from django.http import JsonResponse

def home(request):

    if request.method == "POST":

        title = request.POST.get("title")
        description = request.POST.get("description")
        start_date = request.POST.get("start_date")

        todo = Todo.objects.create(
            title=title,
            description=description,
            start_date=start_date if start_date else None
        )

        return JsonResponse({
            "success": True,
            "todo_id": todo.id,
            "title": todo.title,
            "description": todo.description,
            "start_date": todo.start_date.strftime("%b %d, %Y") if todo.start_date else "",
            "created_at": todo.created_at.strftime("%b %d, %Y"),
        })

    todos = Todo.objects.all().order_by("-created_at")

    total_tasks = todos.count()
    completed_tasks = todos.filter(completed=True).count()
    remaining_tasks = todos.filter(completed=False).count()

    filter_type = request.GET.get("filter")

    if filter_type == "active":
        todos = todos.filter(completed=False)

    elif filter_type == "completed":
        todos = todos.filter(completed=True)

    context = {
        "todos": todos,
        "filter_type": filter_type,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "remaining_tasks": remaining_tasks,
    }

    return render(request, "tasks/home.html", context)
def toggle_todo(request, todo_id):
    todo = Todo.objects.get(id=todo_id)

    todo.completed = not todo.completed
    todo.save()

    return JsonResponse({
        "success": True,
        "completed": todo.completed,
        "todo_id": todo.id,
    })
def edit_todo(request, todo_id):
    todo = Todo.objects.get(id=todo_id)

    if request.method == "POST":
        todo.title = request.POST.get("title")
        todo.description = request.POST.get("description")
        todo.save()

        return redirect("home")

    return render(request, "tasks/edit_todo.html", {
        "todo": todo
    })
def delete_todo(request, todo_id):

    if request.method == "POST":

        todo = Todo.objects.get(id=todo_id)

        todo.delete()

        return JsonResponse({
            "success": True,
            "todo_id": todo_id
        })
def toggle_important(request, todo_id):
    todo = Todo.objects.get(id=todo_id)

    todo.important = not todo.important
    todo.save()

    return JsonResponse({
        "success": True,
        "important": todo.important,
        "todo_id": todo.id,
    })
def important_tasks(request):
    todos = Todo.objects.filter(important=True).order_by("-created_at")

    total_tasks = todos.count()
    completed_tasks = todos.filter(completed=True).count()
    remaining_tasks = todos.filter(completed=False).count()

    context = {
        "todos": todos,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "remaining_tasks": remaining_tasks,
    }

    return render(request, "tasks/important.html", context)