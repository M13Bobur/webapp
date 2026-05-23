# Faiza Cafe — Telegram Food Ordering System

Production-ready monorepo for a restaurant/kitchen in Uzbekistan: Telegram Bot, customer Web App, and admin dashboard.

## Project Structure

```
faiza_cafe/
├── backend/          # Node.js + Express + MongoDB + Telegraf bot + Socket.IO
├── frontend/         # React + Vite — Telegram Web App (customers)
├── admin-panel/      # React + Vite — Admin dashboard
└── README.md
```

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Backend | Node.js, Express, Mongoose, Telegraf, Socket.IO, Joi, Multer, Sharp |
| Customer App | React, Vite, TailwindCSS, Zustand, Axios, React Router |
| Admin Panel | React, Vite, TailwindCSS, Recharts, Socket.IO client, Zustand |

## Prerequisites

- Node.js 18+
- MongoDB 6+
- Telegram Bot Token ([@BotFather](https://t.me/BotFather))

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT_SECRET, TELEGRAM_BOT_TOKEN, etc.
npm install
npm run seed    # optional: sample categories & products
npm run dev
```

API: `http://localhost:5000/api`  
Health: `GET /api/health`

**Default admin** (created on first start):

- Telefon: `+998901234567` (`.env` dagi `ADMIN_PHONE`)
- Password: `Admin123!`

### 2. Customer Web App

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open: `http://localhost:5173` (use HTTPS + Telegram for production Web App)

### 3. Admin Panel

```bash
cd admin-panel
cp .env.example .env
npm install
npm run dev
```

Open: `http://localhost:5174`

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for admin JWT |
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather |
| `TELEGRAM_WEBAPP_URL` | Public URL of customer frontend |
| `ADMIN_TELEGRAM_CHAT_ID` | Chat ID for new-order alerts |
| `CLIENT_URL` | Frontend origin (CORS) |
| `ADMIN_URL` | Admin panel origin (CORS) |

### Frontend / Admin

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base (`http://localhost:5000/api`) |
| `VITE_UPLOADS_URL` | Backend host for images |
| `VITE_SOCKET_URL` | Socket.IO server (admin only) |

## Telegram Bot Setup

1. Create bot via [@BotFather](https://t.me/BotFather)
2. Set Web App URL: `/setmenubutton` or Bot Settings → Menu Button → Web App URL
3. Point URL to your deployed frontend (HTTPS required in production)
4. Users must `/start` the bot and share phone number before ordering

## API Overview

### Public

- `GET /api/categories` — list categories
- `GET /api/products` — products (pagination, search)
- `GET /api/products/category/:categoryId`
- `GET /api/products/search?search=...`
- `POST /api/customers/telegram` — register customer (bot)

### Customer (header: `X-Telegram-Init-Data`)

- `POST /api/orders` — create order
- `GET /api/orders/my` — my orders

### Admin (header: `Authorization: Bearer <token>`)

- `POST /api/auth/login`
- `GET /api/orders/stats` — dashboard
- CRUD: `/api/categories`, `/api/products`, `/api/orders`, `/api/customers`

## Order Flow

1. Customer opens bot → shares phone → opens Web App
2. Adds items to cart → checkout
3. Order status: `pending` → `accepted` → `preparing` → `delivering` → `completed`
4. Bot notifies customer on status changes
5. Admin receives Telegram + Socket.IO + sound notification

## Production Deployment

1. Deploy backend (PM2/Docker) with HTTPS reverse proxy (nginx)
2. Set `NODE_ENV=production` and strong `JWT_SECRET`
3. Deploy frontend & admin to static hosting or same server
4. Configure Telegram Web App URL to production frontend
5. Use MongoDB Atlas or managed MongoDB

### Example nginx (API)

```nginx
location /api {
  proxy_pass http://localhost:5000;
}
location /uploads {
  proxy_pass http://localhost:5000;
}
location /socket.io {
  proxy_pass http://localhost:5000;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

## Security Features

- Helmet, CORS, rate limiting
- express-mongo-sanitize
- Joi validation
- Telegram WebApp initData verification
- bcrypt admin passwords
- JWT admin auth

## Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | all | Development server |
| `npm run build` | frontend, admin | Production build |
| `npm run seed` | backend | Seed sample menu |
| `npm start` | backend | Production start |

## License

MIT — Faiza Cafe
