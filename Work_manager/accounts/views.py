# Import Django authentication login function
from django.contrib.auth import login
from django.shortcuts import render, redirect
# Import the custom signup form
from .forms import SignUpForm


# ==================================================
# USER SIGNUP
# ==================================================

def signup(request):

    # Check if the signup form was submitted
    if request.method == "POST":

        # Create the form using submitted data
        form = SignUpForm(request.POST)

        # Validate the submitted form
        if form.is_valid():

            # Create and save the new user
            user = form.save()

            # Log in the newly registered user
            login(request, user)

            # Redirect the user to the home page
            return redirect("home")

    else:

        # Create an empty signup form for a new request
        form = SignUpForm()

    # Render the signup page and pass the form to the template
    return render(
        request,
        "accounts/signup.html",
        {
            "form": form
        }
    )


# ==================================================
# LOGOUT CONFIRMATION
# ==================================================

def logout_confirm(request):

    # Display the logout confirmation page
    return render(
        request,
        "accounts/logout.html"
    )