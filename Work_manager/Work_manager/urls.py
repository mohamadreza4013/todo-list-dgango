"""
URL configuration for Work_manager project.
"""

from django.contrib import admin
from django.urls import path, include

from tasks.views.google import (
    google_connect,
    google_callback
)

from tasks.views.comments import (
    todo_comments,
    create_todo_comment
)

from tasks.views import (
    landing,
    home,
    create_todo,
    toggle_todo,
    edit_todo,
    delete_todo,
    toggle_important,
    important_tasks,
    create_topic,
    # register_view,
    # login_view,
    # logout_view
)


urlpatterns = [

    # ==================================================
    # ADMIN
    # ==================================================

    path(
        "admin/",
        admin.site.urls
    ),

    # path("register/", register_view, name="register"),
    # path("login/", login_view, name="login"),
    # path("logout/", logout_view, name="logout"),


    # ==================================================
    # MAIN HOME PAGE
    # ==================================================

    path(
        "",
        landing,
        name="home"
    ),


    # ==================================================
    # DASHBOARD
    # ==================================================

    path(
        "dashboard/",
        home,
        name="dashboard"
    ),


    # ==================================================
    # TODO - CREATE
    # ==================================================

    path(
        "todo/create/",
        create_todo,
        name="create_todo"
    ),


    # ==================================================
    # TODO - COMPLETE
    # ==================================================

    path(
        "todo/<int:todo_id>/toggle/",
        toggle_todo,
        name="toggle_todo"
    ),


    # ==================================================
    # TODO - IMPORTANT
    # ==================================================

    path(
        "todo/<int:todo_id>/toggle-important/",
        toggle_important,
        name="toggle_important"
    ),


    # ==================================================
    # TODO - EDIT
    # ==================================================

    path(
        "todo/<int:todo_id>/edit/",
        edit_todo,
        name="edit_todo"
    ),


    # ==================================================
    # TODO - DELETE
    # ==================================================

    path(
        "todo/<int:todo_id>/delete/",
        delete_todo,
        name="delete_todo"
    ),


    # ==================================================
    # TODO - COMMENTS
    # ==================================================

    path(
        "todo/<int:todo_id>/comments/",
        todo_comments,
        name="todo_comments"
    ),

    path(
        "todo/<int:todo_id>/comments/create/",
        create_todo_comment,
        name="create_todo_comment"
    ),


    # ==================================================
    # IMPORTANT TASKS PAGE
    # ==================================================

    path(
        "important/",
        important_tasks,
        name="important_tasks"
    ),


    # ==================================================
    # CALENDAR
    # ==================================================

    path(
        "calendar/",
        include("mycalendar.urls"),
        name="mycalendarurls"
    ),


    # ==================================================
    # ACCOUNTS
    # ==================================================

    path(
        "accounts/",
        include("accounts.urls"),
        name="accountsurls"
    ),


    # ==================================================
    # GOOGLE CALENDAR
    # ==================================================

    path(
        "google/connect/",
        google_connect,
        name="google_connect"
    ),

    path(
        "google/callback/",
        google_callback,
        name="google_callback"
    ),


    # ==================================================
    # TOPICS
    # ==================================================

    path(
        "topic/create/",
        create_topic,
        name="create_topic"
    ),
]