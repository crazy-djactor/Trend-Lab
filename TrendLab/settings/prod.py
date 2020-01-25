from .commonsettings import *

DEBUG = False

# ALLOWED_HOSTS = ["TrendLab-test.eu-west-1.elasticbeanstalk.com"]

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql_psycopg2",
#         "NAME": "TrendLab_dev",
#         "USER": "hectorvidal",
#         "PASSWORD": "",
#         "HOST": "localhost",
#         "PORT": "",
#     }
# }
