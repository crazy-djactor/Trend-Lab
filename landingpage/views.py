from django.shortcuts import render
from .decorators import login_required

# Create your views here.
def index(request):
	return render(request, 'landingpage.html')

@login_required
def detailpage(request):
	return render(request, 'detailpage.html')

def privacy(request):
	return render(request, 'privacy.html')

def termsandconditions(request):
	return render(request, 'terms-and-conditions.html')

def signup(request):
	return render(request, 'signup.html')

def login(request):
	return render(request, 'login.html')

def recoverypassword(request):
	return render(request, 'recovery-password.html')

def settings(request):
	return render(request, 'settings.html')
