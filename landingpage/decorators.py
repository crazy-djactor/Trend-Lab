def login_required():
    """
    Login required but with jwt tokens used instead
    """
    def wrapper(f):
        @wraps(f)
        def wrapped(request, *args,**kwargs):
            #decode jwt token
            token = request.COOKIES['IdToken']
            print(token)

            if is_token_valid(token):
                return f(request,*args, **kwargs)
            else:
                return redirect('/login')
        return wrapped
    return wrapper


def is_token_valid(token):
    return True
