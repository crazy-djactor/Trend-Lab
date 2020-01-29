from functools import wraps
from django.http import redirect

def login_required(f):
    """
    Login required but with jwt tokens used instead
    """
    def wrapper(request, *args, **kwargs):
        #decode jwt token
        token = request.COOKIES['IdToken']
        print(token)

        if is_token_valid(token):
            return f(request,*args, **kwargs)
        else:
            return redirect('/login')

        return wrapper


def is_token_valid(token):
    pass
