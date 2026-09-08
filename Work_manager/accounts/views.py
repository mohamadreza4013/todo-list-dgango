# Create your views here.
from django.contrib.auth import login
from django.shortcuts import render, redirect

from .forms import SignUpForm
def signup(request):

    if request.method == "POST":

        form = SignUpForm(request.POST)

        if form.is_valid():

            user = form.save()

            login(request, user)

            return redirect("home")

    else:

        form = SignUpForm()

    return render(
    request,
    "accounts/signup.html",
    {
        "form": form
    }
)

def signup(request):

    if request.method == "POST":

        form = SignUpForm(request.POST)

        if form.is_valid():

            user = form.save()

            login(request, user)

            return redirect("home")

    else:

        form = SignUpForm()

    return render(
        request,
        "accounts/signup.html",
        {
            "form": form
        }
    )

def logout_confirm(request):
    return render(
    request,
    "accounts/logout.html"
    )
