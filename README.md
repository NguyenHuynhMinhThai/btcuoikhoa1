# Movie Booking - Đồ án cuối khóa

Dự án đặt vé xem phim (React + TypeScript + Node.js + MySQL).

## Cấu trúc thư mục

```
btcuoikhoa/
├── src/                    # Frontend (React + Vite + TypeScript)
│   ├── api/                # API client
│   ├── components/         # React components
│   ├── models/             # TypeScript interfaces
│   ├── pages/              # Trang màn hình
│   └── routes/             # React Router
├── server/                  # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── data/           # Mock data (nếu dùng)
│   │   └── sql/            # SQL init scripts
│   └── dist/               # Build output
├── docs/                   # Tài liệu & API
│   └── postman/            # Postman collection
├── dist/                   # Frontend build output
├── docker-compose.yml      # Docker (MySQL + API)
├── Dockerfile
├── package.json
└── vite.config.ts
```

## Chạy dự án

### Cách 1: Docker (khuyến nghị)

```bash
docker compose up -d --build
```

- API: http://localhost:4001
- MySQL: localhost:3307 (user: movie_user, pass: movie_pass)

### Cách 2: Local

```bash
npm install
npm run db:up        # MySQL
npm run server       # API port 4000
npm run dev          # Frontend
```

## Test API (Postman)

Import file `docs/postman/Movie-Booking-API.postman_collection.json` vào Postman.
