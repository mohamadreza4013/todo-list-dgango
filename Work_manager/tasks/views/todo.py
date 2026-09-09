from django.shortcuts import render, redirect
from django.http import JsonResponse

from ..models import Todo
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
import jdatetime


# ==================================================
# TOGGLE TODO COMPLETION
# ==================================================


@login_required
def toggle_todo(request, todo_id):

    if request.method != "POST":
        return JsonResponse(
            {
                "success": False,
                "error": "درخواست نامعتبر است."
            },
            status=400
        )

    todo = get_object_or_404(
        Todo,
        id=todo_id
    )

    # ==================================================
    # PERSONAL TODO
    # ==================================================

    if todo.category == "personal":

        if todo.user != request.user:
            return JsonResponse(
                {
                    "success": False,
                    "error": "شما اجازه تغییر این کار را ندارید."
                },
                status=403
            )

    # ==================================================
    # COMPLETE
    # ==================================================

    if not todo.completed:

        todo.completed = True
        todo.end_date = jdatetime.date.today()

    # ==================================================
    # UNCOMPLETE
    # ==================================================

    else:

        todo.completed = False
        todo.end_date = None

    todo.save(
        update_fields=[
            "completed",
            "end_date"
        ]
    )

    return JsonResponse(
        {
            "success": True,
            "completed": todo.completed,
            "end_date": (
                todo.end_date.strftime("%Y/%m/%d")
                if todo.end_date
                else None
            )
        }
    )



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