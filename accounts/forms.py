from django import forms

class SignupForm(forms.Form):
    #attributes corresponding to the general style of the template used
    firstname_attrs = {
    "type":"text", "id":"firstname", "class":"form-control pl-5", "placeholder":"First Name", "name":"s", "required":""
    }
    lastname_attrs = {
    "type":"text", "id":"lastname", "class":"form-control pl-5", "placeholder":"Last Name", "name":"s", "required":""
    }
    email_attrs = {
    "type":"email", "id":"email", "class":"form-control pl-5", "placeholder":"Email", "name":"email", "required":""
    }
    password1_attrs = {
    "type":"password", "id":"password1", "class":"form-control pl-5", "placeholder":"password", "name":"s", "required":""
    }
    password2_attrs = {
    "type":"password", "id":"password2", "class":"form-control pl-5", "placeholder":"confirm password", "name":"s", "required":""
    }
    agree_tos_attrs = {
    "type":"checkbox", "id":"customCheck1", "class":"custom-control-input", "name":"s", "required":""
    }
    firstname = forms.CharField(max_length=100, widget=forms.TextInput(attrs=firstname_attrs))
    lastname = forms.CharField(max_length=100, widget=forms.TextInput(attrs=lastname_attrs))
    email = forms.EmailField(max_length=100, widget=forms.TextInput(attrs=email_attrs))
    password1 = forms.CharField(max_length=80, widget=forms.TextInput(attrs=password1_attrs))
    password2 = forms.CharField(max_length=80, widget=forms.TextInput(attrs=password2_attrs))
    agree_tos = forms.BooleanField(widget=forms.CheckboxInput(attrs=agree_tos_attrs))



class LoginForm(forms.Form):
    email_attrs = {
    "type":"email", "id":"email", "class":"form-control pl-5", "placeholder":"Email", "name":"email", "required":""
    }
    password_attrs = {
    "type":"password", "id":"password", "class":"form-control pl-5", "placeholder":"password", "name":"s", "required":""
    }
    agree_tos_attrs = {
    "type":"checkbox", "id":"customCheck1", "class":"custom-control-input"
    }
    email = forms.EmailField(max_length=100, widget=forms.TextInput(attrs=email_attrs))
    password = forms.CharField(max_length=80, widget=forms.TextInput(attrs=password_attrs))
    remember_me = forms.BooleanField(initial=False, required=False,widget=forms.CheckboxInput(attrs=agree_tos_attrs))
