from __future__ import print_function
import boto3
import botocore.exceptions
import hmac
import hashlib
import base64
import json
import uuid
import os

client = boto3.client('cognito-idp', region_name='us-east-1')

USER_POOL_ID = os.getenv('USER_POOL_ID')
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')


def get_secret_hash(username):
    msg = username + CLIENT_ID
    dig = hmac.new(str(CLIENT_SECRET).encode('utf-8'),
        msg = str(msg).encode('utf-8'), digestmod=hashlib.sha256).digest()
    d2 = base64.b64encode(dig).decode()
    return d2

ERROR = 0
SUCCESS = 1
USER_EXISTS = 2

def sign_up(username, password, firstname, lastname):
    try:
        resp = client.sign_up(
            ClientId=CLIENT_ID,
            SecretHash=get_secret_hash(username),
            Username=username,
            Password=password,
            UserAttributes=[
                {
                    'Name': 'name',
                    'Value': firstname
                },
                {
                    'Name': 'family_name',
                    'Value': lastname
                }
            ]
            )
    except client.exceptions.UsernameExistsException as e:
        print(e)
        return None
    except Exception as e:
        print(e)
        return None
    return resp

def initiate_auth(username, password):
    try:
        resp = client.admin_initiate_auth(
            UserPoolId=USER_POOL_ID,
            ClientId=CLIENT_ID,
            AuthFlow='ADMIN_NO_SRP_AUTH',
            AuthParameters={
                'USERNAME': username,
                'SECRET_HASH': get_secret_hash(username),
                'PASSWORD': password
            },
            ClientMetadata={
                'username': username,
                'password': password
            })
    except client.exceptions.NotAuthorizedException as e:
        return None, "The username or password is incorrect"
    except Exception as e:
        print(e)
        return None, "Unknown error"
    return resp, None


def reset_password(username):
    """
    Given a username (email in this case), call on cognito to resend this users password.
    An email is automatically sent to the user so as to reset their password

    Args:
        username(str): A username (email) of the account whose password needs to be reset

    Returns:
        Boolean: True if successful, False otherwise. This allows for redirection to page notifying them to check email for reset link
    """
    try:
        resp = client.forgot_password(
            ClientId=CLIENT_ID,
            SecretHash=get_secret_hash(username),
            Username=username
            )
        return True
    except client.exceptions.NotAuthorizedException as e:
        print("An error occurred")
        return False
    except Exception as e:
        print(e)
        return False


def set_new_password(code, username, password):
    """
    Using the code sent to the user email, resets user's password

    Args:
        code(str): Conformation code sent to the users email
        username(str): Email whose password is being reset
        password(str): Suitable new password

    Returns:
        Boolean()
    """
    try:
        resp = client.confirm_forgot_password(
            ClientId=CLIENT_ID,
            SecretHash=get_secret_hash(username),
            Username=username,
            ConfirmationCode=code,
            Password=password
            )
        print(resp)
        return True
    except client.exceptions.NotAuthorizedException as e:
        print("An error occurred, Not authorized ")
        return False
    except Exception as e:
        print(e)
        return False

def logout_user(username, token):
    """
    Given a username and token, calls on forget device method to invalidate the token and effectively log the user out

    Args:
        username(str): Email of user to be logged out
        token(str): The IdToken stored in session cookie used for auth

    Returns:
        Boolean: True if successful, false otherwise

    """
    try:
        resp = client.admin_forget_device(
            UserPoolId=USER_POOL_ID,
            Username=username,
            DeviceKey=token
            )
        return True
    except client.exceptions.NotAuthorizedException as e:
        print("Not authorized ")
        return False
    except Exception as e:
        print(e)
        return False

def lambda_handler(event, context):
    global client
    if client == None:
        client = boto3.client('cognito-idp')

    print(event)
    body = event
    action = body['action']

    username = body['username']
    password = body['password']
    is_new = "false"
    user_id = str(uuid.uuid4())
    if action == 'signup':
        firstname = body['firstname']
        lastname = body['lastname']



        signed_up = sign_up(username, password, firstname, lastname)
        if signed_up == ERROR:
            return {'status': 'fail', 'msg': 'failed to sign up'}
        if signed_up == SUCCESS:
            is_new = "true"
            #user_id = str(uuid.uuid4())

    resp, msg = initiate_auth(username, password)
    if msg != None:
        return {'status': 'fail', 'msg': msg}
    id_token = resp['AuthenticationResult']['IdToken']
    print('id token: ' + id_token)
    return {'status': 'success', 'id_token': id_token, 'user_id': user_id, 'is_new': is_new}
