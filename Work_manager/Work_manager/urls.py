"""
URL configuration for Work_manager project.
"""
from django.contrib import admin
from django.urls import path

from tasks.views import (
    home,
    toggle_todo,
    edit_todo,
    delete_todo,
    toggle_important,
    important_tasks,
    register_view,
    login_view,
    logout_view
)


urlpatterns = [

    # Admin
    path(
        "admin/",
        admin.site.urls
    ),
  #  path("register/", register_view, name="register"),
 #   path("login/", login_view, name="login"),
  #  path("logout/", logout_view, name="logout"),

    # Home
    path(
        "",
        home,
        name="home"
    ),


    # Todo - Complete
    path(
        "todo/<int:todo_id>/toggle/",
        toggle_todo,
        name="toggle_todo"
    ),


    # Todo - Important
    path(
        "todo/<int:todo_id>/toggle-important/",
        toggle_important,
        name="toggle_important"
    ),


    # Todo - Edit
    path(
        "todo/<int:todo_id>/edit/",
        edit_todo,
        name="edit_todo"
    ),


    # Todo - Delete
    path(
        "todo/<int:todo_id>/delete/",
        delete_todo,
        name="delete_todo"
    ),


    # Important Tasks Page
    path(
        "important/",
        important_tasks,
        name="important_tasks"
    ),
]