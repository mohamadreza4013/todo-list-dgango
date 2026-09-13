from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from ..models import Topic


# ==================================================
# CREATE PERSONAL TOPIC
# ==================================================

@login_required
@require_POST
def create_topic(request):

    # Get the topic name from the request.
    name = request.POST.get(
        "name",
        ""
    ).strip()

    # Validate topic name.
    if not name:

        return JsonResponse(
            {
                "success": False,
                "error": "نام موضوع نمی‌تواند خالی باشد.",
            },
            status=400
        )

    # Maximum topic name length.
    if len(name) > 50:

        return JsonResponse(
            {
                "success": False,
                "error": "نام موضوع نمی‌تواند بیشتر از ۵۰ کاراکتر باشد.",
            },
            status=400
        )

    # Prevent duplicate personal topics
    # for the same user.
    topic_exists = Topic.objects.filter(
        user=request.user,
        is_public=False,
        name__iexact=name
    ).exists()

    if topic_exists:

        return JsonResponse(
            {
                "success": False,
                "error": "این موضوع قبلاً ایجاد شده است.",
            },
            status=400
        )

    # Create the new personal topic.
    topic = Topic.objects.create(
        name=name,
        is_public=False,
        user=request.user,
        is_active=True,
    )

    return JsonResponse(
        {
            "success": True,
            "topic": {
                "id": topic.id,
                "name": topic.name,
            },
        }
    )