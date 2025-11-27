# Yurt Market Frontend

React + Vite + TypeScript uygulaması. Tailwind, React Query, Zustand ve react-hot-toast ile inşa edildi.

## Gereksinimler

- Node.js **20.19+** (veya 22.12+). Node 21, Vite tarafından resmi olarak desteklenmediği için uyarılar verir.
- npm 10+

## Kurulum

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

`.env` içindeki `VITE_API_URL` değeri backend'in çalıştığı adres olmalı (örn. `http://127.0.0.1:8000`).

## Scriptler

| Komut           | Açıklama                           |
| --------------- | ---------------------------------- |
| `npm run dev`   | Vite geliştirme sunucusu           |
| `npm run build` | Prod derlemesi (`dist/`)           |
| `npm run preview` | Prod build önizlemesi           |

## Teknolojiler

- React Router 6 (landing + auth + dashboard rotaları)
- Tailwind + custom design tokens
- React Query (API cache)
- Axios + interceptors (JWT + refresh)
- Zustand (auth store)
- react-hot-toast (global bildirim)

## Notlar

- API URL'i `.env` dosyasından gelir.
- Backend 401 ürettiğinde refresh token otomatik yenilenir, başarısız olursa kullanıcı logout edilir.
- Landing sayfasında login olmayan kullanıcılar en fazla 10 ürünü görebilir; CTA ile kayıt sayfasına yönlendirilir.
