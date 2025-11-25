from __future__ import annotations

import os
from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env = environ.Env(
    DJANGO_DEBUG=(bool, False),
    DJANGO_ALLOWED_HOSTS=(list, []),
    CORS_ALLOWED_ORIGINS=(list, []),
    DB_NAME=(str, "yurt_market"),
    DB_USER=(str, "yurt"),
    DB_PASSWORD=(str, "yurt"),
    DB_HOST=(str, "localhost"),
    DB_PORT=(str, "5432"),
    DB_USE_SQLITE=(bool, True),
    REDIS_URL=(str, "redis://localhost:6379/0"),
    PAYMENT_PROVIDER=(str, "dummy"),
    PAYMENT_SUCCESS_URL=(str, "http://localhost:3000/payment/success"),
    PAYMENT_CANCEL_URL=(str, "http://localhost:3000/payment/cancel"),
    API_THROTTLE_RATE_ANON=(str, "50/minute"),
    API_THROTTLE_RATE_USER=(str, "200/minute"),
)

environ.Env.read_env(env_file=BASE_DIR / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY", default="change-me-in-production")
DEBUG = env("DJANGO_DEBUG")
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["*"])

SITE_ID = 1

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    # Third-party
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "drf_spectacular",
    "django_filters",
    # Core + modules
    "core",
    "modules.users",
    "modules.dorms",
    "modules.products",
    "modules.orders",
    "modules.subscription",
    "modules.notifications",
    "modules.analytics",
    "modules.payments",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "tr-tr"
TIME_ZONE = "Europe/Istanbul"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "users.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
    "EXCEPTION_HANDLER": "core.exceptions.handlers.drf_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": env("API_THROTTLE_RATE_ANON"),
        "user": env("API_THROTTLE_RATE_USER"),
    },
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Yurt Market API",
    "DESCRIPTION": "Multi-dorm student marketplace API.",
    "VERSION": "0.1.0",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS", default=["http://localhost:3000", "http://127.0.0.1:3000"]
)

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": env("REDIS_URL"),
    }
}

SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = env("SMTP_HOST", default="smtp.gmail.com")
EMAIL_PORT = env("SMTP_PORT", default=587)
EMAIL_HOST_USER = env("SMTP_USER", default="")
EMAIL_HOST_PASSWORD = env("SMTP_PASSWORD", default="")
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="no-reply@yurtmarket.local")

REDIS_URL = env("REDIS_URL")
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL

PAYMENT_PROVIDER = env("PAYMENT_PROVIDER")
PAYMENT_SUCCESS_URL = env("PAYMENT_SUCCESS_URL")
PAYMENT_CANCEL_URL = env("PAYMENT_CANCEL_URL")

STRUCTLOG_CONFIG = {
    "processors": [
        "structlog.processors.JSONRenderer",
    ],
    "context_class": dict,
}

