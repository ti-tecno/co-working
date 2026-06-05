# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Install all dependencies (from root)
npm run install:all

# Run backend (port 6120 in prod, configurable via PORT)
cd backend && npm run dev      # nodemon
cd backend && npm start        # node

# Run frontend (localhost:5173)
cd frontend && npm run dev

# Build frontend for production
npm run build                  # or: cd frontend && npm run build
```

### Database

```bash
# Run migrations (idempotent — creates tables and seeds initial data)
cd backend && npm run migrate
```

> Migrations use a custom script ([backend/src/config/migrate.js](backend/src/config/migrate.js)), not Knex's built-in migration system. Adding new tables requires editing that file directly.

## Architecture

### Monorepo layout

```
/
├── backend/     Node.js + Express + Knex (CommonJS)
└── frontend/    React 18 + Vite (ES modules)
```

### Backend

- **Entry:** [backend/src/index.js](backend/src/index.js) — Express app, CORS, route mounting, HTTPS server (Let's Encrypt certs at `/etc/letsencrypt/live/api.eventopolis.com.mx/`)
- **Database:** [backend/src/config/database.js](backend/src/config/database.js) — Knex singleton using `mysql2`; all tables are prefixed `coworking_`
- **Auth middleware:** [backend/src/middleware/auth.js](backend/src/middleware/auth.js) — `authenticate` (verifies JWT, attaches `req.user`), `requireAdmin` (checks `req.user.role === 'admin'`)
- **Email:** [backend/src/services/emailService.js](backend/src/services/emailService.js) — Brevo SMTP via nodemailer; requires `BREVO_API_KEY`, `BREVO_SMTP_USER`, `EMAIL_FROM` env vars. Email failures on reservation creation are non-fatal (warned, not thrown).

Controllers are plain async functions — no try/catch wrapping by default; unhandled rejections will hit Express's generic error handler.

### Frontend

- **API client:** [frontend/src/services/api.js](frontend/src/services/api.js) — Axios instance reading `VITE_API_URL`; attaches `Authorization: Bearer <token>` from `localStorage`; auto-redirects to `/login` on 401.
- **Auth state:** [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx) — `AuthProvider` wraps the app; `useAuth()` exposes `{ user, loading, login, register, logout }`. Token persisted in `localStorage`.
- **Routing:** [frontend/src/App.jsx](frontend/src/App.jsx) — `ProtectedRoute` wraps auth-required pages; `adminOnly` prop restricts to `role === 'admin'`.
- **Styling:** Pure CSS with custom properties, no framework. Each page/component has a co-located `.css` file. Global variables in [frontend/src/styles/globals.css](frontend/src/styles/globals.css).

### Database schema

Four tables (all prefixed `coworking_`):

| Table | Key columns |
|---|---|
| `coworking_users` | `id`, `name`, `email`, `password` (bcrypt), `role` (user/admin) |
| `coworking_space_types` | `id`, `name`, `price_per_hour`, `color`, `is_active` |
| `coworking_reservations` | `id`, `user_id`, `space_type_id`, `reservation_date`, `start_time`, `end_time`, `total_cost`, `status` (active/cancelled) |
| `coworking_contact_messages` | `id`, `name`, `email`, `message`, `read` |

Business hours: **9:00–18:00** (enforced in [reservationController.js](backend/src/controllers/reservationController.js)). Conflict detection uses overlapping interval logic: `start_time < end_time_req AND end_time > start_time_req`.

## Environment variables

**Backend (`backend/.env`):** `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `BREVO_SMTP_HOST`, `BREVO_SMTP_PORT`, `BREVO_SMTP_USER`, `BREVO_API_KEY`, `EMAIL_FROM`, `WHATSAPP_NUMBER`

**Frontend (`frontend/.env`):** `VITE_API_URL`, `VITE_WHATSAPP_NUMBER`, `VITE_WHATSAPP_MESSAGE`

## Production notes

- Backend runs as HTTPS on port 6120 with PM2 (`pm2 start src/index.js --name coworking-api`)
- Default admin credentials after migrate: `admin@coworking.com` / `Admin123!`
- CORS origin defaults to `https://cowork.sofiai.com.mx/`
