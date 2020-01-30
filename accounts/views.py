from django.shortcuts import render, redirect
from .forms import SignupForm, LoginForm
from .aws_cognito_helpers import initiate_auth, sign_up
from django.contrib import messages

# Create your views here.
def signup(request):
	if request.method == "POST":
		form = SignupForm(request.POST)
		if form.is_valid():
			email = form.cleaned_data.get('email')
			password1 = form.cleaned_data.get('password1')
			password2 = form.cleaned_data.get('password2')
			firstname = form.cleaned_data.get('firstname')
			lastname = form.cleaned_data.get('lastname')
			if password1 == password2:
				cognito_resp = sign_up(
					email,
					password1,
					firstname,
					lastname
				)
				if cognito_resp != None:
					return redirect('/confirm-email')

	else:
		form = SignupForm()

	context = {
	 "form": form
	}

	return render(request, 'signup.html', context)

def confirm_email_notification(request):
	return render(request, 'conf-email.html')

def recoverypassword(request):
	return render(request, 'recovery-password.html')


def login(request):
	if request.method == "POST":
		form = LoginForm(request.POST)
		if form.is_valid():
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
