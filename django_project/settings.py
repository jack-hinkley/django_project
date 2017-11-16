"""
Django settings for django_project project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/dja

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'lgOZXXX1d17bdMYxskcN7Vmed6I71UiD9IxbGPG8gPFWQShe2w'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

TASTYPIE_FULL_DEBUG = True

TASTYPIE_DEFAULT_FORMATS = ['json']

ALLOWED_HOSTS = []

LOGIN_REDIRECT_URL = '/'

AUTHENTICATION_BACKENDS = ('django.contrib.auth.backends.ModelBackend',)

import paypalrestsdk

MODE =  "sandbox", # sandbox or live
CLIENT_ID =  "AX-Xwh9GUuBdqI22SfFmjxe4Cn5DoKf3DrF_SiXQisY2ao6UgicQXPmk4isD0xl7ny89iaEOaxUnAsPK",
CLIENT_SECRET = "EDBqD2LC-oUKefV5BU4iBjmZOVYr8RNu5dRUNPJ1BMl7cM9f03DmT0a49L_Fr4wjsZIY3voXko7w7Ifm" 

paypalrestsdk.configure({
  "mode": MODE, # sandbox or live
  "client_id": CLIENT_SECRET,
  "client_secret": CLIENT_SECRET })


# Application definition

INSTALLED_APPS = (
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'tastypie',
    'shell_plus',
    'httpproxy',
    'main',
    # 'smartbasket_sqlite3',
)

MIDDLEWARE_CLASSES = (
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)
# from corsheaders.defaults import default_headers
# from corsheaders.defaults import default_methods

# CORS_ALLOW_METHODS = default_methods
# CORS_ALLOW_HEADERS = default_headers
CORS_ORIGIN_ALLOW_ALL = True
# CORS_ALLOW_CREDENTIALS = False

# CORS_ORIGIN_WHITELIST = (
#     'http://107.170.86.88/'
# )

ROOT_URLCONF = 'django_project.urls'

# Add static folder to STATIC_DIRS
STATICFILES_DIRS = [
os.path.join(BASE_DIR, "static"),
]

TEMPLATE_DIRS = [
os.path.join(BASE_DIR, "templates"),
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ["templates"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


WSGI_APPLICATION = 'django_project.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
    # 'default': {
    #     'ENGINE': 'django.db.backends.postgresql_psycopg2',
    #     'NAME': 'django',
    #     'USER': 'django',
    #     'PASSWORD': 'MJyUOdJ6sU',
    #     'HOST': 'localhost',
    #     'PORT': '',
    # },
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'smartbasket_sqlite3.db'),
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_ROOT = '/static/'
STATIC_URL = '/static/'
