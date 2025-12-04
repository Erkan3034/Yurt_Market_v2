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

## 🚀 Hızlı Başlangıç

**Yeni geliştiriciler için:** Detaylı kurulum adımları için [`SETUP.md`](SETUP.md) dosyasını okuyun.

## Local development

### Sistem Gereksinimleri
- **Python**: 3.11+
- **Node.js**: 20.19.0+ (LTS önerilir)
- **npm**: 10.8.2+

### Backend Kurulumu

1. Create and activate a virtual environment targeting Python 3.11+.
2. Install dependencies:
   ```bash
   # Option 1: Using requirements.txt (recommended for new developers)
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # For development tools
   
   # Option 2: Using pyproject.toml (if using setuptools)
   pip install -e .[dev]
   ```
3. Create `.env` file from `.env.example`:
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```
   
   Then edit `.env` and set required values (see `.env.example` for reference):
   ```bash
   See `.env.example` for all available environment variables.
   
   **Important:** Generate a secure `DJANGO_SECRET_KEY`:
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```
4. Run migrations, seed data, and start the development server:
   ```bash
   python manage.py migrate
   python scripts/seed_data.py
   python manage.py createsuperuser
   python manage.py runserver
   ```

**Note**: Development uses SQLite by default (no PostgreSQL required). For production, PostgreSQL is mandatory.

### Frontend Kurulumu

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

Frontend will be available at `http://localhost:5173`

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

### Deployment

See `DEPLOYMENT.md` for end-to-end deployment instructions (PostgreSQL, Redis, Celery workers, Sentry).

### Outstanding backend items

- Replace dummy payment adapter with real Stripe/LemonSqueezy integration
- Add automated job (Celery/cron) for refreshing analytics, stock alerts, notifications
- Expand unit/integration test suite for services and API endpoints
- Harden error handling/logging with structured context for each module
 - Build PaymentTransaction model for stronger audit trail

### Security & Monitoring

- Rate limiting via DRF throttles (`API_THROTTLE_RATE_*`). For production için daha düşük değerler kullanabilirsiniz (örn. `20/min` anon).
- `ADMIN_ALLOWED_IPS` ile admin paneline IP bazlı kısıt getirildi.
- Sentry entegrasyonu `SENTRY_DSN` ile aktif olur, örnek: `https://<key>@o123.ingest.sentry.io/456`.
- Healthcheck endpoint (`/health/`) monitoring aracı için kullanılabilir; prod’da auth eklemeyi düşünün.
- Secrets (`DJANGO_SECRET_KEY`, DB, SENTRY)` sızdıysa hemen değiştirin.

## Testing

```bash
pytest
```

The included pytest configuration uses `config.settings.dev` and auto-discovers `tests/`.

