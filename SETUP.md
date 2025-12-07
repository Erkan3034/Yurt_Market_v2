# Yurt Market - Kurulum Rehberi


## 📋 İçindekiler

1. [Sistem Gereksinimleri](#sistem-gereksinimleri)
2. [Adım Adım Kurulum](#adım-adım-kurulum)
3. [Projeyi Çalıştırma](#projeyi-çalıştırma)
4. [İlk Çalıştırma Kontrol Listesi](#ilk-çalıştırma-kontrol-listesi)
5. [Yaygın Sorunlar ve Çözümleri](#yaygın-sorunlar-ve-çözümleri)
6. [Test Etme](#test-etme)
7. [Proje Yapısı](#proje-yapısı)

## Sistem Gereksinimleri

### Backend
- **Python**: 3.11 veya üzeri
- **PostgreSQL**: (Opsiyonel - Development için SQLite kullanılabilir)
- **Redis**: (Opsiyonel - Celery için gerekli, development için opsiyonel)

### Frontend
- **Node.js**: 20.19.0 veya üzeri (LTS önerilir)
- **npm**: 10.8.2 veya üzeri

### Kontrol Komutları
```bash
python --version  # Python 3.11+ olmalı
node --version     # Node 20.19.0+ olmalı
npm --version      # npm 10.8.2+ olmalı
```

## Adım Adım Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd yurt-market-v2
```

### 2. Backend Kurulumu

#### 2.1. Sanal Ortam Oluşturun

**Windows (PowerShell):**
```powershell
python -m venv venv
venv\Scripts\activate
```

**Windows (CMD):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Not:** Sanal ortam aktif olduğunda terminalinizde `(venv)` öneki görünecektir.

#### 2.2. Bağımlılıkları Kurun

```bash
# Önerilen yöntem (requirements.txt kullanarak)
pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Alternatif (pyproject.toml kullanarak)
pip install -e .[dev]
```

**Kontrol:** Kurulum başarılı oldu mu?
```bash
python manage.py --version  # Django versiyonunu gösterir
```

#### 2.3. Environment Variables Ayarlayın

1. Proje kök dizininde `.env` dosyası oluşturun:

   **Windows:**
   ```powershell
   # PowerShell
   New-Item .env -ItemType File
   
   # Veya CMD
   type nul > .env
   ```

   **Linux/Mac:**
   ```bash
   touch .env
   ```

2. `.env` dosyasını düzenleyin ve aşağıdaki değerleri ekleyin:

   ```env
   # Django Ayarları
   DJANGO_SECRET_KEY=your-secret-key-here
   DJANGO_DEBUG=True
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

   # Veritabanı (Development için SQLite kullanın)
   DB_USE_SQLITE=true

   # CORS Ayarları (Frontend URL'leri)
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

   # Redis (Opsiyonel - Celery için)
   REDIS_URL=redis://localhost:6379/1

   # API Throttling (Opsiyonel)
   API_THROTTLE_RATE_ANON=50/minute
   API_THROTTLE_RATE_USER=200/minute

   # Email (Opsiyonel - Development için console backend kullanılır)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASSWORD=
   DEFAULT_FROM_EMAIL=no-reply@yurtmarket.local

   # Payment (Opsiyonel)
   PAYMENT_PROVIDER=dummy
   PAYMENT_SUCCESS_URL=http://localhost:5173/payment/success
   PAYMENT_CANCEL_URL=http://localhost:5173/payment/cancel

   # Sentry (Opsiyonel - Production için)
   SENTRY_DSN=
   SENTRY_TRACES_SAMPLE_RATE=0.0

   # Admin IP Restriction (Opsiyonel)
   ADMIN_ALLOWED_IPS=
   ```

   **Önemli:** `DJANGO_SECRET_KEY` için güvenli bir key oluşturun:
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

   Bu komutu çalıştırın ve çıktıyı `.env` dosyasındaki `DJANGO_SECRET_KEY` değerine yapıştırın.

#### 2.4. Veritabanı Migrasyonlarını Çalıştırın

```bash
python manage.py migrate
```

**Kontrol:** Migration'lar başarılı oldu mu?
```bash
python manage.py showmigrations  # Tüm migration'ların durumunu gösterir
```

#### 2.5. Seed Data (Örnek Veriler) Ekleyin

```bash
python scripts/seed_data.py
```

Bu script:
- 10 örnek yurt oluşturur (Yıldız Kız Öğrenci Yurdu, Marmara Erkek Öğrenci Yurdu, vb.)
- Abonelik planlarını oluşturur (Standard plan: 199₺/ay, 25 ürün limiti)

**Kontrol:** Veriler oluşturuldu mu?
```bash
python manage.py shell
>>> from modules.dorms.models import Dorm
>>> Dorm.objects.count()  # 10 döndürmeli
>>> exit()
```

#### 2.6. Superuser (Admin) Oluşturun

**Yöntem 1: Script Kullanarak (Önerilen)**

```bash
python scripts/create_superuser.py
```

Bu script varsayılan olarak şu bilgilerle admin kullanıcı oluşturur:
- **Email:** `admin@yurtmarket.local`
- **Password:** `admin123`

Özel email ve şifre kullanmak isterseniz:
```bash
# Windows PowerShell
$env:SUPERUSER_EMAIL="your-email@example.com"
$env:SUPERUSER_PASSWORD="your-password"
python scripts/create_superuser.py

# Linux/Mac
export SUPERUSER_EMAIL="your-email@example.com"
export SUPERUSER_PASSWORD="your-password"
python scripts/create_superuser.py
```

**Yöntem 2: Django Komutu ile**

```bash
python manage.py createsuperuser
```

İnteraktif olarak email ve şifre gireceksiniz.

**Not:** Admin kullanıcı oluşturulduktan sonra:
- Django Admin Panel: `http://127.0.0.1:8000/admin/`
- Frontend Admin Panel: `http://localhost:5173/app/admin/` (giriş yaptıktan sonra)

#### 2.7. Backend Sunucusunu Başlatın

```bash
python manage.py runserver
```

Backend şu adreste çalışacak: `http://127.0.0.1:8000`

**Kontrol:** Tarayıcıda `http://127.0.0.1:8000/health/` adresine gidin, `{"status": "ok"}` yanıtı almalısınız.

**Alternatif Port:** Port 8000 kullanılıyorsa:
```bash
python manage.py runserver 8001
```

### 3. Frontend Kurulumu

#### 3.1. Frontend Dizinine Geçin

```bash
cd frontend
```

#### 3.2. Node Bağımlılıklarını Kurun

```bash
npm install
```

**Kontrol:** Kurulum başarılı oldu mu?
```bash
npm list --depth=0  # Kurulu paketleri gösterir
```

#### 3.3. Environment Variables Ayarlayın

1. `frontend/.env.example` dosyasını `.env` olarak kopyalayın:

   **Windows:**
   ```powershell
   copy .env.example .env
   ```

   **Linux/Mac:**
   ```bash
   cp .env.example .env
   ```

2. `frontend/.env` dosyasını kontrol edin:

   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```

   **Not:** Backend farklı bir portta çalışıyorsa (örn: 8001), buraya yazın:
   ```env
   VITE_API_URL=http://127.0.0.1:8001
   ```

#### 3.4. Frontend Development Sunucusunu Başlatın

```bash
npm run dev
```

Frontend şu adreste çalışacak: `http://localhost:5173`

**Kontrol:** Tarayıcıda `http://localhost:5173` adresine gidin, landing page görünmelidir.

**Alternatif Port:** Port 5173 kullanılıyorsa Vite otomatik olarak bir sonraki portu kullanır (5174, 5175, vb.).

### 4. (Opsiyonel) Celery Worker Kurulumu

Celery, arka plan görevleri için kullanılır (analytics, bildirimler vb.). Development için zorunlu değildir.

#### 4.1. Redis Kurulumu

**Windows:**
- [Redis for Windows](https://github.com/microsoftarchive/redis/releases) indirin
- Veya WSL2 kullanarak Linux Redis'i çalıştırın
- Veya Docker kullanın: `docker run -d -p 6379:6379 redis`

**Linux:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis  # Otomatik başlatma için
```

**Mac:**
```bash
brew install redis
brew services start redis
```

**Kontrol:** Redis çalışıyor mu?
```bash
redis-cli ping  # "PONG" yanıtı almalısınız
```

#### 4.2. Celery Worker'ı Başlatın

Yeni bir terminal açın ve backend dizininde:

```bash
# Sanal ortamı aktif edin
venv\Scripts\activate  # Windows
# veya
source venv/bin/activate  # Linux/Mac

# Celery worker'ı başlatın
celery -A config worker --loglevel=info
```

**Not:** Celery çalışmazsa, `.env` dosyasında `REDIS_URL` değerini kontrol edin.

## Projeyi Çalıştırma

### Tam Kurulum Sonrası

1. **Terminal 1 - Backend:**
   ```bash
   cd yurt-market-v2
   venv\Scripts\activate  # Windows (veya source venv/bin/activate)
   python manage.py runserver
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd yurt-market-v2/frontend
   npm run dev
   ```

3. **Terminal 3 - Celery (Opsiyonel):**
   ```bash
   cd yurt-market-v2
   venv\Scripts\activate
   celery -A config worker --loglevel=info
   ```

### Tarayıcıda Test

- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:8000
- **Django Admin Panel:** http://127.0.0.1:8000/admin/
- **Frontend Admin Panel:** http://localhost:5173/app/admin/ (admin kullanıcı ile giriş yaptıktan sonra)
- **API Docs (Swagger):** http://127.0.0.1:8000/api/schema/swagger-ui/

## İlk Çalıştırma Kontrol Listesi

Kurulumun başarılı olduğunu doğrulamak için aşağıdaki adımları takip edin:

### ✅ Backend Kontrolleri

- [ ] `python manage.py migrate` hatasız çalıştı
- [ ] `python scripts/seed_data.py` hatasız çalıştı
- [ ] `python scripts/create_superuser.py` hatasız çalıştı
- [ ] `python manage.py runserver` hatasız başladı
- [ ] `http://127.0.0.1:8000/health/` yanıt veriyor (`{"status": "ok"}`)
- [ ] `http://127.0.0.1:8000/admin/` açılıyor ve admin ile giriş yapılabiliyor

### ✅ Frontend Kontrolleri

- [ ] `npm install` hatasız çalıştı
- [ ] `frontend/.env` dosyası oluşturuldu ve `VITE_API_URL` doğru
- [ ] `npm run dev` hatasız başladı
- [ ] `http://localhost:5173` açılıyor ve landing page görünüyor
- [ ] Console'da CORS hatası yok

### ✅ Test Kullanıcıları

1. **Admin Kullanıcı:**
   - Email: `admin@yurtmarket.local`
   - Password: `admin123`
   - Frontend'de giriş yapın: `http://localhost:5173/auth/login`
   - Admin paneline erişin: `http://localhost:5173/app/admin/`

2. **Yeni Kullanıcı Kaydı:**
   - `http://localhost:5173/auth/register` adresine gidin
   - Yeni bir kullanıcı kaydedin (Student veya Seller)
   - Giriş yapın ve sayfaları test edin

### ✅ Sayfa Kontrolleri

- [ ] Landing Page (`/`) görünüyor
- [ ] Login Page (`/auth/login`) çalışıyor
- [ ] Register Page (`/auth/register`) çalışıyor
- [ ] Explore Page (`/app/explore`) - Ürünler listeleniyor
- [ ] Orders Page (`/app/orders`) - Siparişler görünüyor
- [ ] Seller Dashboard (`/seller/dashboard`) - Satıcı girişi ile erişilebiliyor
- [ ] Admin Dashboard (`/app/admin/dashboard`) - Admin girişi ile erişilebiliyor

## Yaygın Sorunlar ve Çözümleri

### 1. "ModuleNotFoundError: No module named 'celery'"

**Çözüm:**
```bash
pip install celery>=5.4.0
```

### 2. CORS Hatası (Frontend'den API'ye istek atılamıyor)

**Sorun:** `Access-Control-Allow-Origin` hatası

**Çözüm:**
1. `.env` dosyasında `CORS_ALLOWED_ORIGINS` değerini kontrol edin:
   ```env
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```
2. Frontend URL'ini ekleyin (eğer farklı bir port kullanıyorsanız)
3. Backend sunucusunu yeniden başlatın

### 3. "Port 8000 already in use"

**Çözüm:**
```bash
# Farklı port kullanın
python manage.py runserver 8001

# Veya .env dosyasında port değiştirin (eğer yapılandırılmışsa)
```

**Not:** Port değiştirdiyseniz, `frontend/.env` dosyasındaki `VITE_API_URL` değerini de güncelleyin.

### 4. "Port 5173 already in use"

**Çözüm:**
```bash
# Vite otomatik olarak bir sonraki portu kullanır
# Veya manuel port belirtin
npm run dev -- --port 5174
```

### 5. Database Migration Hataları

**Çözüm:**
```bash
# Tüm migration'ları sıfırlayın (DİKKAT: Veriler silinir!)
python manage.py flush
python manage.py migrate
python scripts/seed_data.py
python scripts/create_superuser.py
```

### 6. Node.js Versiyon Uyumsuzluğu

**Sorun:** Node.js 21.0.0 gibi eski versiyonlar Vite/Vitest ile uyumsuz olabilir

**Çözüm:**
- Node.js LTS versiyonunu (20.19.0 veya 22.12.0+) kullanın
- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) kullanarak versiyon yönetimi yapın

**Windows için nvm:**
- [nvm-windows](https://github.com/coreybutler/nvm-windows) kullanın

### 7. "Cannot find module '@tailwindcss/typography'"

**Çözüm:**
```bash
cd frontend
npm install @tailwindcss/typography
```

### 8. Frontend'de API İstekleri Çalışmıyor

**Kontrol Listesi:**
1. Backend sunucusu çalışıyor mu? (`http://127.0.0.1:8000/health/`)
2. `frontend/.env` dosyasında `VITE_API_URL` doğru mu?
3. CORS ayarları doğru mu? (`.env` dosyasında `CORS_ALLOWED_ORIGINS`)
4. Frontend sunucusunu yeniden başlatın (`.env` değişiklikleri için)

### 9. "DJANGO_SECRET_KEY" Hatası

**Sorun:** `.env` dosyasında `DJANGO_SECRET_KEY` eksik veya yanlış

**Çözüm:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Çıktıyı `.env` dosyasına ekleyin:
```env
DJANGO_SECRET_KEY=django-insecure-xxxxx-xxxxx-xxxxx
```

### 10. Admin Panel'e Erişilemiyor (403 Forbidden)

**Sorun:** Kullanıcı admin değil (`is_staff=False` veya `is_superuser=False`)

**Çözüm:**
```bash
python manage.py shell
>>> from modules.users.models import User
>>> user = User.objects.get(email='your-email@example.com')
>>> user.is_staff = True
>>> user.is_superuser = True
>>> user.save()
>>> exit()
```

Veya `scripts/create_superuser.py` script'ini kullanın.

### 11. "No module named 'django_environ'"

**Çözüm:**
```bash
pip install django-environ
```

### 12. SQLite Veritabanı Bulunamıyor

**Sorun:** `db.sqlite3` dosyası oluşturulmamış

**Çözüm:**
```bash
python manage.py migrate
```

Bu komut `db.sqlite3` dosyasını oluşturur ve tüm migration'ları çalıştırır.

## Test Etme

### Backend Testleri

```bash
# Tüm testleri çalıştır
pytest

# Belirli bir test dosyası
pytest tests/test_smoke.py

# Verbose mod
pytest -v
```

### Frontend Testleri

```bash
cd frontend
npm run test

# Watch mod
npm run test -- --watch
```

## Proje Yapısı

```
yurt-market-v1/
├── config/              # Django proje ayarları
│   ├── settings/        # Environment-specific settings (dev, prod)
│   ├── urls.py          # Ana URL yapılandırması
│   └── celery.py        # Celery yapılandırması
├── core/                # Çekirdek modüller
│   ├── events/          # Domain event sistemi
│   ├── exceptions/      # Exception handlers
│   ├── middleware/      # Custom middleware
│   ├── repository/      # Repository pattern base classes
│   └── utils/           # Utility functions
├── modules/             # İş modülleri
│   ├── admin/           # Admin panel API endpoints
│   ├── analytics/       # Analytics ve raporlama
│   ├── dorms/           # Yurt yönetimi
│   ├── notifications/   # Bildirim sistemi
│   ├── orders/          # Sipariş yönetimi
│   ├── payments/        # Ödeme entegrasyonları
│   ├── products/        # Ürün yönetimi
│   ├── subscription/    # Abonelik yönetimi
│   └── users/           # Kullanıcı yönetimi
├── scripts/             # Yardımcı scriptler
│   ├── create_superuser.py  # Admin kullanıcı oluşturma
│   └── seed_data.py     # Örnek veri oluşturma
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React bileşenleri
│   │   │   ├── landing/    # Landing page bileşenleri
│   │   │   ├── layout/      # Layout bileşenleri
│   │   │   ├── orders/      # Sipariş bileşenleri
│   │   │   ├── routing/     # Routing bileşenleri
│   │   │   └── ui/          # UI bileşenleri (Modal, Spinner, vb.)
│   │   ├── pages/       # Sayfa bileşenleri
│   │   │   ├── admin/       # Admin panel sayfaları
│   │   │   ├── auth/        # Authentication sayfaları
│   │   │   ├── customer/   # Müşteri sayfaları
│   │   │   ├── landing/    # Landing page
│   │   │   └── seller/      # Satıcı sayfaları
│   │   ├── services/    # API servisleri
│   │   ├── store/       # Zustand state yönetimi
│   │   ├── types/       # TypeScript type tanımları
│   │   └── layouts/    # Layout bileşenleri
│   ├── public/         # Static dosyalar
│   ├── .env.example    # Frontend environment variables örneği
│   └── package.json
├── tests/              # Backend testleri
├── media/              # Upload edilen dosyalar (ürün resimleri, vb.)
├── static/             # Static dosyalar
├── requirements.txt     # Python production bağımlılıkları
├── requirements-dev.txt  # Python development bağımlılıkları
├── .env                # Backend environment variables (oluşturulmalı)
├── .env.example        # Backend environment variables örneği (yoksa oluşturulmalı)
├── db.sqlite3          # SQLite veritabanı (migrate sonrası oluşur)
└── manage.py           # Django yönetim scripti
```

## Sonraki Adımlar

1. ✅ Projeyi çalıştırdınız
2. ✅ Admin kullanıcı oluşturdunuz
3. ✅ Seed data eklediniz
4. ✅ Frontend ve backend çalışıyor

**Şimdi yapabilecekleriniz:**

- **Django Admin Panel:** `http://127.0.0.1:8000/admin/` - Veritabanı yönetimi
- **Frontend Admin Panel:** `http://localhost:5173/app/admin/` - Admin dashboard, kullanıcılar, ürünler, siparişler
- **API Dokümantasyonu:** `http://127.0.0.1:8000/api/schema/swagger-ui/` - Tüm API endpoint'leri
- **Yeni Kullanıcı Kaydı:** `http://localhost:5173/auth/register` - Test kullanıcıları oluşturun
- **Ürün Keşfetme:** `http://localhost:5173/app/explore` - Ürünleri görüntüleyin ve sipariş verin

## Yardım

Sorun yaşarsanız:

1. Bu dokümantasyonu tekrar kontrol edin
2. `README.md` dosyasını okuyun
3. Yaygın sorunlar bölümünü inceleyin
4. GitHub Issues'da arama yapın
5. Yeni bir issue oluşturun

## Notlar

- **Development için SQLite kullanın** - PostgreSQL kurulumu gerekmez
- **Redis opsiyonel** - Celery kullanmayacaksanız Redis'e ihtiyacınız yok
- **Environment variables** - `.env` dosyalarını asla git'e commit etmeyin
- **Secret keys** - Production'da mutlaka güvenli secret key'ler kullanın
- **Admin kullanıcı** - `scripts/create_superuser.py` script'ini kullanarak kolayca admin oluşturabilirsiniz
- **Port değişiklikleri** - Backend veya frontend portunu değiştirdiyseniz, ilgili `.env` dosyalarını güncelleyin

## Hızlı Referans

### Backend Komutları
```bash
# Sanal ortamı aktif et
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Migration çalıştır
python manage.py migrate

# Seed data ekle
python scripts/seed_data.py

# Admin oluştur
python scripts/create_superuser.py

# Sunucuyu başlat
python manage.py runserver
```

### Frontend Komutları
```bash
cd frontend

# Bağımlılıkları kur
npm install

# Development sunucusunu başlat
npm run dev

# Build (production)
npm run build

# Test çalıştır
npm run test
```

---

**İyi çalışmalar! 🚀**
