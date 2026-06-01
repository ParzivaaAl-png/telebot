# Atlas Fleet — Space Gamification System for Couriers

Welcome to **Atlas Fleet**, a space-themed gamification and motivation console designed for delivery couriers and taxi drivers. This project is structured as an npm workspaces monorepo.

---

## Project Structure

```text
/apps
  /frontend-miniapp  - React driver console (glowing dark themes, RPG trees, circular progress rings)
  /admin-panel       - React administration console (couriers list, analytics, CSV import, audit logs)
  /backend           - NestJS API (Prisma ORM, PostgreSQL, JWT, Telegram initData validation)
  /bot               - Node.js Telegraf Bot (notifies users, accepts commands /start, /profile)
/packages
  /shared-types      - TypeScript interfaces sharing data shapes between services
/docker
  - Docker configurations and Nginx proxy configs
```

---

## Technology Stack

- **Frontend**: React, Vite, TailwindCSS, Framer Motion, TanStack Query, Zustand
- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL, Passport JWT, bcrypt, Helmet
- **Bot**: Telegraf
- **Ops**: Docker, Docker Compose, Nginx

---

## Local Setup & Development

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
Ensure you set your `TELEGRAM_BOT_TOKEN` in the `.env` file.

### 2. Install Monorepo Dependencies
From the root of the workspace, run:
```bash
npm install
```

### 3. Build Shared Packages
Build the shared types first so TypeScript can resolve them:
```bash
npm run --prefix packages/shared-types build
```

### 4. Setup Database
Generate Prisma client and apply seed data:
```bash
npm run db:generate
npm run db:seed
```
*Note: The seed script hashes credentials and creates a default admin: `admin` / `adminpassword123`.*

### 5. Start Development Servers
You can start components concurrently or selectively:
- Backend API: `npm run dev:backend` (Runs on http://localhost:3000)
- Driver Mini App: `npm run dev:miniapp` (Runs on http://localhost:5173)
- Admin Panel: `npm run dev:admin` (Runs on http://localhost:5174)
- Telegram Bot: `npm run dev:bot`

---

## Docker Deployment (Production Ready)

To boot up the entire stack (PostgreSQL, NestJS API, bot, admin panel, mini app, and Nginx proxy) in containers:
```bash
docker-compose up --build
```
The services will be exposed via the Nginx proxy on `http://localhost`:
- Driver Mini App: `http://localhost/`
- Admin Panel: `http://localhost/admin/`
- Backend API: `http://localhost/api/`

---

## Security Features Included

1. **HMAC WebApp signature check**: The backend checks HMAC-SHA256 signature on the Mini App query string.
2. **Passport JWT Guard**: Secure REST APIs for administrative options.
3. **Password hashing**: Secure password management using bcrypt.
4. **Helmet & CORS**: Protect headers and control cross-origin requests.
5. **Logs Audit**: Tracks all administrator updates in the database.
