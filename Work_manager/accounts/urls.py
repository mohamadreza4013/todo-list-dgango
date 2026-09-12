from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
urlpatterns = [
    path(
        'login/',
        auth_views.LoginView.as_view(
            template_name='accounts/login.html'
        ),
        name='login'
    ),
    path(
        'logout/',
        auth_views.LogoutView.as_view(),
        name='logout'
    ),
    path(
        "signup/",
        views.signup,
        name="signup" ),
    path(
        "signup/verify/",
        views.verify_signup_otp,
        name="verify_signup_otp"
    ),
    path("logout-confirm/",
         views.logout_confirm,
         name="logout_confirm"),
    path(
        "signup/verify/resend/",
        views.resend_signup_otp,
        name="resend_signup_otp"
    ),
]