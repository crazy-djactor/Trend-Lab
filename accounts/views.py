from django.shortcuts import render, redirect
from .forms import SignupForm, LoginForm
from .aws_cognito_helpers import initiate_auth
from django.contrib import messages

# Create your views here.
def signup(request):
	if request.method == "POST":
		form = SignupForm(request.POST)
		if form.is_valid():
			#print(form.cleaned_data.get('password1')) ==> isolate validated fields this way
			pass

	else:
		form = SignupForm()

	context = {
	 "form": form
	}

	return render(request, 'signup.html', context)

def recoverypassword(request):
	return render(request, 'recovery-password.html')


def login(request):
	if request.method == "POST":
		form = LoginForm(request.POST)
		print(request.POST)
		if form.is_valid():
			print("form valid")
			resp, msg = initiate_auth(form.cleaned_data.get('email'),form.cleaned_data.get('password'))
			#check for errors, if not log in user by saving their token
			if msg != None:
				#raise django form notification of wrong credentials
				messages.error(request, 'Username/password is incorrect!')
			else:
				json_web_token = resp['AuthenticationResult']['IdToken']
				#set this in cookie
				resp = redirect('/detailpage')
				resp.set_cookie('IdToken', json_web_token)
				return resp


	else:
		form = LoginForm()

	context = {
		"form":form
	}

	return render(request, 'login.html', context)
