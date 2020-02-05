from django.shortcuts import render, redirect
from .forms import SignupForm, LoginForm, ResetPasswordForm, NewPasswordForm
from .aws_cognito_helpers import initiate_auth, sign_up, reset_password, set_new_password, logout_user
from django.contrib import messages
from .decorators import login_required

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
	if request.method == 'POST':
		form = ResetPasswordForm(request.POST)
		if form.is_valid():
			email = form.cleaned_data.get('email')
			status = reset_password(email)
			if status:
				return redirect('/reset-password')
			else:
				pass
	else:
		form = ResetPasswordForm()

	context = {
		"form":form
	}
	return render(request, 'recovery-password.html', context)

def reset_pass(request):
	if request.method == 'POST':
		form = NewPasswordForm(request.POST)
		if form.is_valid():
			email = form.cleaned_data.get('email')
			code = form.cleaned_data.get('code')
			password = form.cleaned_data.get('password')
			status = set_new_password(code,email, password)
			if status:
				return redirect('/login')
			else:
				pass
	else:
		form = NewPasswordForm()

	context = {
		"form":form
	}
	return render(request, 'reset-pass.html', context)

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


#oauth callback for google
def google_oauth_callback(request):
	
	return render(request, 'google-callback-temp.html')
@login_required
def logout(request, username, idtoken):
	#status = logout_user(username, idtoken)
	#remove cookie
	resp = redirect('/detailpage')
	resp.set_cookie('IdToken', '')
	return resp
