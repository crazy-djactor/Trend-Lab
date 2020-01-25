from .commonsettings import *

DEBUG = True

# ALLOWED_HOSTS = []

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#     }
# }

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": "trendlab_db",
        "USER": "hectorvidal",
        "PASSWORD": "",
        "HOST": "localhost",
        "PORT": "",
    }
}
