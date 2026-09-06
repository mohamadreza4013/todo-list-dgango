from django.shortcuts import render, redirect
from django.http import JsonResponse

from ..models import Todo


# ==================================================
# TOGGLE TODO COMPLETION
# ==================================================

def toggle_todo(request, todo_id):

    # Get the selected todo from the database
    todo = Todo.objects.get(id=todo_id)

    # Toggle the completion status
    # False -> True
    # True  -> False
    todo.completed = not todo.completed

    # Save the updated todo
    todo.save()

    # Return the updated status as JSON
    return JsonResponse({
        "success": True,
        "completed": todo.completed,
        "todo_id": todo.id,
    })


# ==================================================
# EDIT TODO
# ==================================================

def edit_todo(request, todo_id):

    # Get the selected todo from the database
    todo = Todo.objects.get(id=todo_id)

    # Handle the submitted edit form
    if request.method == "POST":

        # Update the todo title
        todo.title = request.POST.get("title")

        # Update the todo description
        todo.description = request.POST.get("description")

        # Save the changes to the database
        todo.save()

        # Redirect back to the dashboard
        return redirect("home")

    # Display the edit page for GET requests
    return render(
        request,
        "tasks/edit_todo.html",
        {
            "todo": todo
        }
    )


# ==================================================
# DELETE TODO
# ==================================================

def delete_todo(request, todo_id):

    # Only allow deletion through POST requests
    if request.method == "POST":

        # Get the selected todo from the database
        todo = Todo.objects.get(id=todo_id)

        # Delete the todo from the database
        todo.delete()

        # Return a JSON response to the JavaScript client
        return JsonResponse({
            "success": True,
            "todo_id": todo_id
        })


# ==================================================
# TOGGLE IMPORTANT STATUS
# ==================================================

def toggle_important(request, todo_id):

    # Get the selected todo from the database
    todo = Todo.objects.get(id=todo_id)

    # Toggle the important status
    # False -> True
    # True  -> False
    todo.important = not todo.important

    # Save the updated todo
    todo.save()

    # Return the updated status as JSON
    return JsonResponse({
        "success": True,
        "important": todo.important,
        "todo_id": todo.id,
    })