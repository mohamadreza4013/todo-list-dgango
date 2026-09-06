from django.shortcuts import render
from django.http import JsonResponse

from ..models import Todo


# ==================================================
# DASHBOARD / HOME
# ==================================================

def home(request):

    # Handle the Add Task form submission
    if request.method == "POST":

        # Get form data sent by the user
        title = request.POST.get("title")
        description = request.POST.get("description")
        start_date = request.POST.get("start_date")

        # Create a new todo in the database
        todo = Todo.objects.create(
            title=title,
            description=description,
            start_date=start_date if start_date else None
        )

        # Return the newly created todo as JSON
        # so JavaScript can add it to the page
        # without reloading the browser
        return JsonResponse({
            "success": True,
            "todo_id": todo.id,
            "title": todo.title,
            "description": todo.description,
            "start_date": (
                todo.start_date.strftime("%b %d, %Y")
                if todo.start_date
                else ""
            ),
            "created_at": todo.created_at.strftime("%b %d, %Y"),
        })


    # Get all todos from the database
    # Newest todos appear first
    todos = Todo.objects.all().order_by("-created_at")


    # Calculate task statistics
    total_tasks = todos.count()

    completed_tasks = todos.filter(
        completed=True
    ).count()

    remaining_tasks = todos.filter(
        completed=False
    ).count()


    # Get the selected filter from the URL
    # Example:
    # /?filter=active
    # /?filter=completed
    filter_type = request.GET.get("filter")


    # Show only active tasks
    if filter_type == "active":

        todos = todos.filter(
            completed=False
        )


    # Show only completed tasks
    elif filter_type == "completed":

        todos = todos.filter(
            completed=True
        )


    # Data that will be sent to the HTML template
    context = {
        "todos": todos,
        "filter_type": filter_type,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "remaining_tasks": remaining_tasks,
    }


    # Render the dashboard HTML page
    # and pass the context data to it
    return render(
        request,
        "tasks/home.html",
        context
    )