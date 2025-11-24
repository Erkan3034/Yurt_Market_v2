from .base import *  # noqa: F401,F403

DEBUG = False

# Production MUST use PostgreSQL - SQLite is not allowed
DATABASES = {  # type: ignore[name-defined]
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME"),  # type: ignore[name-defined]
        "USER": env("DB_USER"),  # type: ignore[name-defined]
        "PASSWORD": env("DB_PASSWORD"),  # type: ignore[name-defined]
        "HOST": env("DB_HOST"),  # type: ignore[name-defined]
        "PORT": env("DB_PORT"),  # type: ignore[name-defined]
        "OPTIONS": {
            "connect_timeout": 10,
        },
    }
}

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["yurtmarket.com"])  # type: ignore[name-defined]

