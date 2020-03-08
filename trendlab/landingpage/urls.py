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
	path('', views.index, name='index'),
    path('search/', views.search_results, name='search'),
    path('privacy/', views.privacy, name='privacy'),
    path('terms-and-conditions/', views.termsandconditions, name='termsandcondition'),
    path('settings/', views.settings, name='settings'),
    path('search/autocomplete/', views.search_autocomplete, name='autocomplete'),
    path('get-wiki-summary', views.load_wikipedia_summary, name='load_wiki_summary'),
    # path('get-search_result/', views.get_search_result, name='get_search_result')
]
#
# path('signup/', views.signup, name='signup'),
# path('login/', views.login, name='login'),
# path('recovery-password/', views.recoverypassword, name='recoverypassword'),
