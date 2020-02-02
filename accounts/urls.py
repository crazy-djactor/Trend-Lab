"""TrendLab URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
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
from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('confirm-email/', views.confirm_email_notification, name='confirm_email_prompt'),
    path('login/', views.login, name='login'),
    path('recovery-password/', views.recoverypassword, name='recoverypassword'),
    path('reset-password/', views.reset_pass, name='pass_reset'),
    path('logout/', views.logout, name='logout'),
]
