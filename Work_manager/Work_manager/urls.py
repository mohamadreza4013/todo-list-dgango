"""
URL configuration for Work_manager project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from tasks.views import home, toggle_todo, edit_todo, delete_todo, toggle_important, important_tasks
urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home, name="home"),
    path("toggle/<int:todo_id>/", toggle_todo, name="toggle_todo"),
    path("edit/<int:todo_id>/", edit_todo, name="edit_todo"),
    path("delete/<int:todo_id>/", delete_todo, name="delete_todo"),
    path(
        "todo/<int:todo_id>/toggle-important/",
        toggle_important,
        name="toggle_important"
    ),
    path(
        "important/",
        important_tasks,
        name="important_tasks"
    ),
]
