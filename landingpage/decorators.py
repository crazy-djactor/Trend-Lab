from functools import wraps
from django.shortcuts import redirect
import json
import time
import urllib.request
from jose import jwk, jwt
from jose.utils import base64url_decode
import os

region = os.getenv('REGION')
userpool_id = os.getenv('USER_POOL_ID')
app_client_id = os.getenv('CLIENT_ID')

public_key_url = 'https://cognito-idp.{}.amazonaws.com/{}/.well-known/jwks.json'.format(region,userpool_id)

with urllib.request.urlopen(public_key_url) as f:
  response = f.read()
keys = json.loads(response.decode('utf-8'))['keys']


def login_required(f):
    """
    Login required but with jwt tokens used instead
    """
    def wrapper(request, *args, **kwargs):
        #decode jwt token
        try:
            token = request.COOKIES['IdToken']
            if token == '':
                return redirect('/login')
        except:
            return redirect('/login')

        status, claims = is_token_valid(token)
        if status:
            return f(request,claims['email'], idtoken=token, *args, **kwargs)
        else:
            return redirect('/login')

    return wrapper

#optional login decorator
def login_optional(f):
    """
    Injects user details into view but does not redirect logged out users to login page

    """
    def wrapper(request, *args, **kwargs):
        #decode jwt token
        try:
            token = request.COOKIES['IdToken']
            if token == '':
                return f(request,None, idtoken=None, *args, **kwargs)
        except:
            return f(request,None, idtoken=None, *args, **kwargs)

        status, claims = is_token_valid(token)
        if status:
            return f(request,claims['email'], idtoken=token, *args, **kwargs)
        else:
            return f(request,None, idtoken=None, *args, **kwargs)

    return wrapper

def is_token_valid(token):
    headers = jwt.get_unverified_headers(token)
    kid = headers['kid']
    # search for the kid in the downloaded public keys
    key_index = -1
    for i in range(len(keys)):
        if kid == keys[i]['kid']:
            key_index = i
            break
    if key_index == -1:
        print('Public key not found.')
        return False, None

    public_key = jwk.construct(keys[key_index])
    message, encoded_signature = str(token).rsplit('.', 1)
    decoded_signature = base64url_decode(encoded_signature.encode('utf-8'))

    # verify the signature
    if not public_key.verify(message.encode("utf8"), decoded_signature):
        print('Signature could not be verified')
        return False, None

    #get claims - these are key,value pairs of email, usernames etc
    claims = jwt.get_unverified_claims(token)

    #check expiration
    if time.time() > claims['exp']:
        print('Tokens expired.')
        return False, None

    #verify audience for access tokens exclusively
    print(claims)
    # if claims['aud'] != app_client_id:
    #     print('Token was not issued for this audience')
    #     return False, None

    return True, claims
