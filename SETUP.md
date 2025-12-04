# Yurt Market - Kurulum Rehberi

Bu dokümantasyon, projeyi yeni bir geliştiricinin bilgisayarında çalıştırmak için gereken tüm adımları içerir.

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
cd yurt-market-v1
```

### 2. Backend Kurulumu

#### 2.1. Sanal Ortam Oluşturun

**Windows:**
```powershell
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2.2. Bağımlılıkları Kurun

```bash
# Önerilen yöntem
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Alternatif (pyproject.toml kullanarak)
pip install -e .[dev]
```

#### 2.3. Environment Variables Ayarlayın

1. `.env.example` dosyasını `.env` olarak kopyalayın:
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```

2. `.env` dosyasını düzenleyin ve gerekli değerleri ayarlayın:
   ```env
   DJANGO_SECRET_KEY=your-secret-key-here  # Django secret key oluşturun
   DJANGO_DEBUG=True
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
   DB_USE_SQLITE=true  # Development için SQLite kullanın
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```

   **Önemli:** `DJANGO_SECRET_KEY` için güvenli bir key oluşturun:
   ```python
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

#### 2.4. Veritabanı Migrasyonlarını Çalıştırın

```bash
python manage.py migrate
```

#### 2.5. Seed Data (Örnek Veriler) Ekleyin

```bash
python scripts/seed_data.py
```

Bu script:
- 10 örnek yurt oluşturur
- Abonelik planlarını oluşturur

#### 2.6. Superuser (Admin) Oluşturun

```bash
python manage.py createsuperuser
```

Kullanıcı adı, e-posta ve şifre girin.

#### 2.7. Backend Sunucusunu Başlatın

```bash
python manage.py runserver
```

Backend şu adreste çalışacak: `http://127.0.0.1:8000`

**Kontrol:** Tarayıcıda `http://127.0.0.1:8000/health/` adresine gidin, `{"status": "ok"}` yanıtı almalısınız.

### 3. Frontend Kurulumu

#### 3.1. Frontend Dizinine Geçin

```bash
cd frontend
```

#### 3.2. Node Bağımlılıklarını Kurun

```bash
npm install
```

#### 3.3. Environment Variables Ayarlayın

1. `frontend/.env.example` dosyasını `.env` olarak kopyalayın:
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```

2. `.env` dosyasını kontrol edin:
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```

   Backend farklı bir portta çalışıyorsa (örn: 8001), buraya yazın.

#### 3.4. Frontend Development Sunucusunu Başlatın

```bash
npm run dev
```

Frontend şu adreste çalışacak: `http://localhost:5173`

### 4. (Opsiyonel) Celery Worker Kurulumu

Celery, arka plan görevleri için kullanılır (analytics, bildirimler vb.).

#### 4.1. Redis Kurulumu

**Windows:**
- [Redis for Windows](https://github.com/microsoftarchive/redis/releases) indirin
- Veya WSL2 kullanarak Linux Redis'i çalıştırın

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Mac:**
```bash
brew install redis
brew services start redis
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

## Projeyi Çalıştırma

### Tam Kurulum Sonrası

1. **Terminal 1 - Backend:**
   ```bash
   cd yurt-market-v1
   venv\Scripts\activate  # veya source venv/bin/activate
   python manage.py runserver
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd yurt-market-v1/frontend
   npm run dev
   ```

3. **Terminal 3 - Celery (Opsiyonel):**
   ```bash
   cd yurt-market-v1
   venv\Scripts\activate
   celery -A config worker --loglevel=info
   ```

### Tarayıcıda Test

- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:8000
- **Admin Panel:** http://127.0.0.1:8000/admin/
- **API Docs (Swagger):** http://127.0.0.1:8000/api/schema/swagger-ui/

## Yaygın Sorunlar ve Çözümleri

### 1. "ModuleNotFoundError: No module named 'celery'"

**Çözüm:**
```bash
pip install celery>=5.4.0
```

### 2. CORS Hatası (Frontend'den API'ye istek atılamıyor)

**Sorun:** `Access-Control-Allow-Origin` hatası

**Çözüm:**
- `.env` dosyasında `CORS_ALLOWED_ORIGINS` değerini kontrol edin
- Frontend URL'ini ekleyin: `http://localhost:5173`
- Backend sunucusunu yeniden başlatın

### 3. "Port 8000 already in use"

**Çözüm:**
```bash
# Farklı port kullanın
python manage.py runserver 8001

# Veya .env dosyasında port değiştirin (eğer yapılandırılmışsa)
```

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
```

### 6. Node.js Versiyon Uyumsuzluğu

**Sorun:** Node.js 21.0.0 gibi eski versiyonlar Vite/Vitest ile uyumsuz olabilir

**Çözüm:**
- Node.js LTS versiyonunu (20.19.0 veya 22.12.0+) kullanın
- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) kullanarak versiyon yönetimi yapın

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

## Test Etme

### Backend Testleri

```bash
pytest
```

### Frontend Testleri

```bash
cd frontend
npm run test
```

## Proje Yapısı

```
yurt-market-v1/
├── config/              # Django proje ayarları
├── core/                # Çekirdek modüller (events, repositories)
├── modules/             # İş modülleri (users, products, orders, vb.)
├── scripts/             # Yardımcı scriptler
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React bileşenleri
│   │   ├── pages/       # Sayfa bileşenleri
│   │   ├── services/    # API servisleri
│   │   └── store/       # Zustand state yönetimi
│   └── package.json
├── requirements.txt      # Python bağımlılıkları
├── requirements-dev.txt  # Development bağımlılıkları
├── .env.example         # Environment variables örneği
└── manage.py            # Django yönetim scripti
```

## Sonraki Adımlar

1. ✅ Projeyi çalıştırdınız
2. Admin panelinden (`/admin/`) superuser ile giriş yapın
3. Frontend'de kayıt olun ve test edin
4. API dokümantasyonunu inceleyin: `/api/schema/swagger-ui/`

## Yardım

Sorun yaşarsanız:
1. Bu dokümantasyonu tekrar kontrol edin
2. `README.md` dosyasını okuyun
3. GitHub Issues'da arama yapın
4. Yeni bir issue oluşturun

## Notlar

- **Development için SQLite kullanın** - PostgreSQL kurulumu gerekmez
- **Redis opsiyonel** - Celery kullanmayacaksanız Redis'e ihtiyacınız yok
- **Environment variables** - `.env` dosyalarını asla git'e commit etmeyin
- **Secret keys** - Production'da mutlaka güvenli secret key'ler kullanın

