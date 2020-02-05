from django.shortcuts import render
from .decorators import login_required, login_optional

# Create your views here.
@login_optional
def index(request, username, idtoken):
	context = {
		"username": username
	}
	return render(request, 'landingpage.html', context)

@login_required
def detailpage(request, username, idtoken):
	context = {
		"username": username
	}
	return render(request, 'detailpage.html', context)

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
