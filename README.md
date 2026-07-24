# 1909 Cunda Menü

Next.js ve PostgreSQL tabanlı dijital menü ve yönetim paneli.

## Kurulum

1. PostgreSQL'i Docker ile başlatın:

```bash
docker compose up -d
```

2. `.env.example` dosyasını `.env.local` adıyla kopyalayıp yönetici şifresi ile oturum
   anahtarını değiştirin.
3. Uygulamayı başlatın:

```bash
npm install
npm run dev
```

Uygulama ilk bağlantıda tabloları ve indeksleri otomatik oluşturur. Veritabanı boşsa eski
`index.html` içindeki 10 kategori ve 89 ürün bir kez otomatik aktarılır.

- Menü: `http://localhost:3000`
- Yönetim paneli: `http://localhost:3000/admin`

## Ortam değişkenleri

- `DATABASE_URL`: PostgreSQL bağlantı adresi.
- `POSTGRES_SSL`: Sağlayıcı SSL istiyorsa `true`.
- `ADMIN_PASSWORD`: Panel giriş şifresi.
- `SESSION_SECRET`: Oturum imzası için uzun ve rastgele bir değer.

Üretimde örnek şifreleri kullanmayın. `SESSION_SECRET` için parola yöneticisi veya güvenli
bir rastgele değer üretici kullanın.

Docker PostgreSQL host üzerinde `5433` portunu kullanır; böylece bilgisayarda kurulu yerel
PostgreSQL'in varsayılan `5432` portuyla çakışmaz.
