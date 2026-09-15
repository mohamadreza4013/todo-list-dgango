# =========================================================
# IMPORTS
# =========================================================

from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import JsonResponse

from ..models import Todo, TodoComment


# =========================================================
# TODO ACCESS
# =========================================================

def get_accessible_todo(user, todo_id):
    """
    Return a Todo if the current user has access to it.

    Public Todos are accessible to every authenticated user.

    Personal Todos are accessible only to their owner.
    """

    return Todo.objects.filter(
        id=todo_id
    ).filter(
        Q(category="public")
        |
        Q(
            category="personal",
            user=user
        )
    ).first()


# =========================================================
# LIST COMMENTS
# =========================================================

@login_required
def todo_comments(request, todo_id):
    """
    Return all comments belonging to a Todo.
    """

    todo = get_accessible_todo(
        request.user,
        todo_id
    )

    if not todo:

        return JsonResponse(
            {
                "success": False,
                "error": "دسترسی به این وظیفه امکان‌پذیر نیست.",
            },
            status=403
        )


    comments = (
        TodoComment.objects
        .filter(todo=todo)
        .select_related("user")
        .order_by("created_at")
    )


    data = []

    for comment in comments:

        data.append(
            {
                "id": comment.id,

                "text": comment.text,

                "user_id": comment.user_id,

                "username": (
                    comment.user.get_full_name()
                    or comment.user.username
                ),

                "created_at": (
                    comment.created_at.strftime(
                        "%Y/%m/%d %H:%M"
                    )
                ),

                "updated_at": (
                    comment.updated_at.strftime(
                        "%Y/%m/%d %H:%M"
                    )
                ),

                "is_owner": (
                    comment.user_id ==
                    request.user.id
                ),
            }
        )


    return JsonResponse(
        {
            "success": True,

            "todo_id": todo.id,

            "comments": data,

            "count": len(data),
        }
    )


# =========================================================
# CREATE COMMENT
# =========================================================

@login_required
def create_todo_comment(request, todo_id):
    """
    Create a new comment for a Todo.
    """

    # Only POST requests are allowed.

    if request.method != "POST":

        return JsonResponse(
            {
                "success": False,
                "error": "درخواست نامعتبر است.",
            },
            status=405
        )


    # =====================================================
    # CHECK TODO ACCESS
    # =====================================================

    todo = get_accessible_todo(
        request.user,
        todo_id
    )

    if not todo:

        return JsonResponse(
            {
                "success": False,
                "error": "دسترسی به این وظیفه امکان‌پذیر نیست.",
            },
            status=403
        )


    # =====================================================
    # GET COMMENT TEXT
    # =====================================================

    text = request.POST.get(
        "text",
        ""
    ).strip()


    # =====================================================
    # VALIDATE COMMENT
    # =====================================================

    if not text:

        return JsonResponse(
            {
                "success": False,
                "error": "متن کامنت را وارد کنید.",
            },
            status=400
        )


    # =====================================================
    # CREATE COMMENT
    # =====================================================

    comment = TodoComment.objects.create(
        todo=todo,
        user=request.user,
        text=text
    )


    # =====================================================
    # RETURN CREATED COMMENT
    # =====================================================

    return JsonResponse(
        {
            "success": True,

            "comment": {
                "id": comment.id,

                "text": comment.text,

                "user_id": comment.user_id,

                "username": (
                    request.user.get_full_name()
                    or request.user.username
                ),

                "created_at": (
                    comment.created_at.strftime(
                        "%Y/%m/%d %H:%M"
                    )
                ),

                "updated_at": (
                    comment.updated_at.strftime(
                        "%Y/%m/%d %H:%M"
                    )
                ),

                "is_owner": True,
            },

            "count": TodoComment.objects.filter(
                todo=todo
            ).count(),
        }
    )