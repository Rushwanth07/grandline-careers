# GrandLine Careers

Express backend with a Vite/React frontend (served from `frontend/dist` in production).

## Features
- Public career APIs (`/api/careers`, `/api/careers/:id`, `/api/search`)
- Multi-agent career guidance API (`/api/agents/career-guidance`)
- Firebase-authenticated profile APIs (`/api/profile`)
- CORS allowlist support via `ALLOWED_ORIGINS`

## Setup
1. Install dependencies:
```bash
npm install
cd frontend && npm install
```

2. Create `.env` from `.env.example`.

3. Run backend locally:
```bash
npm run dev
```

4. Run frontend locally (separate terminal):
```bash
cd frontend
npm run dev
```

## Environment Variables
Backend (`.env`):
- `PORT`
- `ALLOWED_ORIGINS` (comma-separated)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Frontend (`frontend/.env`):
- `VITE_BACKEND_URL` (optional; leave empty for same-origin deployment)

## API Endpoints
- `GET /api/health`
- `GET /api/careers`
- `GET /api/careers/:id`
- `GET /api/search?q=...`
- `POST /api/agents/career-guidance`
- `GET /api/profile` (requires Firebase ID token)
- `POST /api/profile` (requires Firebase ID token)

## Deployment
Recommended for fast delivery: deploy as a single Express app that serves the built frontend and API on the same domain.
