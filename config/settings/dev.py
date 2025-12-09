from pathlib import Path

from .base import *  # noqa: F401,F403

DEBUG = True

# Use SQLite for development if PostgreSQL is not available
# Override with DB_USE_SQLITE=false in .env to force PostgreSQL
USE_SQLITE = env("DB_USE_SQLITE")  # type: ignore[name-defined]

if USE_SQLITE:
    DATABASES = {  # type: ignore[name-defined]
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",  # type: ignore[name-defined]
        }
    }

# Add debug_toolbar if installed
try:
    import debug_toolbar  # noqa: F401

    INSTALLED_APPS += ["debug_toolbar"]  # type: ignore[name-defined]
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")  # type: ignore[name-defined]
except ImportError:
    pass

INTERNAL_IPS = ["127.0.0.1"]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"




# Development için Redis olmadan çalış (locmem cache kullan)
CACHES = {  # type: ignore[name-defined]
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

# Session için database backend kullan (Redis gerektirmez)
<<<<<<< Updated upstream
SESSION_ENGINE = "django.contrib.sessions.backends.db"

=======
SESSION_ENGINE = "django.contrib.sessions.backends.db"
>>>>>>> Stashed changes
