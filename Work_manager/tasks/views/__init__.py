# ==================================================
# VIEW PACKAGE INITIALIZATION
# ==================================================

# This file provides a single entry point for importing
# all views used by the application.
# It allows other files, such as urls.py, to import views
# directly from the views package instead of importing
# them separately from each view module.


# Import the dashboard view
from .dashboard import home


# Import todo-related views
from .todo import (
    toggle_todo,
    edit_todo,
    delete_todo,
    toggle_important,
)


# Import the important tasks view
from .important import important_tasks
from .google import (
    google_connect,
    google_callback,
)
#from .user import (
#register_view,
#login_view,
#logout_view,
#)

