from django.shortcuts import render

from ..models import Todo


# ==================================================
# IMPORTANT TASKS
# ==================================================

def important_tasks(request):

    # Get only the tasks marked as important
    # Newest tasks appear first
    todos = Todo.objects.filter(
        important=True
    ).order_by("-created_at")


    # Calculate the total number of important tasks
    total_tasks = todos.count()


    # Calculate the number of completed important tasks
    completed_tasks = todos.filter(
        completed=True
    ).count()


    # Calculate the number of remaining important tasks
    remaining_tasks = todos.filter(
        completed=False
    ).count()


    # Data that will be sent to the HTML template
    context = {
        "todos": todos,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "remaining_tasks": remaining_tasks,
        "page": "important",
    }


    # Render the Important Tasks page
    # and pass the context data to the template
    return render(
        request,
        "tasks/important.html",
        context
    )