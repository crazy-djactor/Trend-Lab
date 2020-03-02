import json
import os

import boto3
import botocore.exceptions
import hmac
import hashlib
import base64
import uuid

USER_POOL_ID = os.getenv('USER_POOL_ID')
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')


def get_secret_hash(username):
    msg = username + CLIENT_ID
    dig = hmac.new(
        str(CLIENT_SECRET).encode('utf-8'),
        msg=str(msg).encode('utf-8'),
        digestmod=hashlib.sha256).digest()
    d2 = base64.b64encode(dig).decode()
    return d2


def lambda_handler(event, context):
    client = boto3.client('cognito-idp')
    try:
        username = event['username']
        response = client.forgot_password(
            ClientId=CLIENT_ID,
            SecretHash=get_secret_hash(username),
            Username=username,

        )
    except client.exceptions.UserNotFoundException:
        return {"error": True,
                "data": None,
                "success": False,
                "message": "Username doesnt exists"}

    except client.exceptions.InvalidParameterException:
        return {"error": True,
                "success": False,
                "data": None,
                "message": f"User <{username}> is not confirmed yet"}

    except client.exceptions.CodeMismatchException:
        return {"error": True,
                "success": False,
                "data": None,
                "message": "Invalid Verification code"}

    except client.exceptions.NotAuthorizedException:
        return {"error": True,
                "success": False,
                "data": None,
                "message": "User is already confirmed"}

    except Exception as e:
        return {"error": True,
                "success": False,
                "data": None,
                "message": f"Uknown    error {e.__str__()} "}

    return {
        "error": False,
        "success": True,
        "message": f"Please check your Registered email id for validation code",
        "data": None}