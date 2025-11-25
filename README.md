# yurt_market

Multi-dorm student marketplace built with Django, Django REST Framework, and a modular clean architecture. The platform enables students to order snacks from sellers inside their dorm while enforcing product limits, subscriptions, order workflows, notifications, analytics, and payments.

## High-level architecture

- **Config**: Django project configuration with environment-specific settings.
- **Core**: Cross-cutting abstractions (events, repositories, exceptions, utilities).
- **Modules**: Feature packages (`users`, `dorms`, `products`, `orders`, `subscription`, `notifications`, `analytics`, `payments`) that encapsulate models, repositories, services, and API endpoints.
- **Scripts**: Operational helpers (migrations, data seeding, background jobs).

### Principles

- SOLID, Clean Architecture, and modular monolith boundaries.
- Repository + service layer patterns for all business logic (views stay thin).
- Domain event dispatching for stock, subscription, and notification workflows.
- Event-driven integrations (SMTP alerts, analytics updates, cache busting).

## Local development

1. Create and activate a virtual environment targeting Python 3.11+.
2. Install dependencies:
   ```bash
   pip install -e .[dev]
   ```
3. Create `.env` file in the project root (same directory as `manage.py`):
   ```bash
   # .env file location: C:\yedekler\OneDrive\Masaüstü\yurt-market-v1\.env
   
   # Django Settings
   DJANGO_SECRET_KEY=your-secret-key-here
   DJANGO_DEBUG=True
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
   
   # Database (Development uses SQLite by default)
   # Set DB_USE_SQLITE=false to use PostgreSQL in development
   DB_USE_SQLITE=true
   
   # PostgreSQL (only needed if DB_USE_SQLITE=false)
   DB_NAME=yurt_market
   DB_USER=yurt
   DB_PASSWORD=yurt
   DB_HOST=localhost
   DB_PORT=5432
   
   # Redis (optional for development)
   REDIS_URL=redis://localhost:6379/0
   
   # CORS
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   
   # Email (SMTP - optional for development)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASSWORD=
   DEFAULT_FROM_EMAIL=no-reply@yurtmarket.local
   PAYMENT_PROVIDER=dummy
   PAYMENT_SUCCESS_URL=http://localhost:3000/payment/success
   PAYMENT_CANCEL_URL=http://localhost:3000/payment/cancel
   API_THROTTLE_RATE_ANON=50/minute
   API_THROTTLE_RATE_USER=200/minute
   ```
4. Run migrations, seed data, and start the development server:
   ```bash
   python manage.py migrate
   python scripts/seed_data.py
   python manage.py createsuperuser
   python manage.py runserver
   ```

**Note**: Development uses SQLite by default (no PostgreSQL required). For production, PostgreSQL is mandatory.

### Tests

```bash
pytest
```

### Background workers

Run Celery (after Redis is available):

```bash
celery -A config worker --loglevel=info
```

`modules.analytics.tasks.refresh_popular_sellers` is queued automatically when orders are approved.

### Operations

- `GET /health/` → overall health & database connectivity
- `POST /api/payments/webhook` → payment provider callback endpoint
- Swagger UI: `/api/schema/swagger-ui/`

### Outstanding backend items

- Replace dummy payment adapter with real Stripe/LemonSqueezy integration
- Add automated job (Celery/cron) for refreshing analytics, stock alerts, notifications
- Expand unit/integration test suite for services and API endpoints
- Harden error handling/logging with structured context for each module

### Security defaults

- Rate limiting via DRF throttles (`50/min` anon, `200/min` authenticated — configurable via env).
- Healthcheck endpoint returns minimal info intended for monitoring (add auth in prod as needed).
- Remember to rotate secrets (`DJANGO_SECRET_KEY`, DB credentials) if `.env` was exposed.

## Testing

```bash
pytest
```

The included pytest configuration uses `config.settings.dev` and auto-discovers `tests/`.

