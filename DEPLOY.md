# Deployment Runbook

## 1. Prepare Environment

Backend (`.env`):
- Copy from `.env.production.example`
- Set `ALLOWED_ORIGINS` to your real frontend domain
- Set all Firebase Admin values

Frontend (`frontend/.env.production`):
- Copy from `frontend/.env.production.example`
- Keep `VITE_BACKEND_URL=` empty for single-domain deployment
- Set Firebase web config values

## 2. Pre-Deploy Validation

Run from repo root:
```bash
npm --prefix frontend run lint
npm --prefix frontend run test
npm --prefix frontend run build
```

## 3. Build and Start (Single-Domain)

From repo root:
```bash
npm install
npm run build
npm start
```

This serves frontend from `frontend/dist` and API from the same server.

## 4. Post-Deploy Smoke Test

Run against local or production URL:
```bash
node scripts/smoke-check.mjs --base=https://your-domain.com
```

Expected:
- `PASS health`
- `PASS careers`
- `PASS search`
- `PASS profile unauthorized`
- `All smoke checks passed.`

## 5. Conference Day Quick Check

Before demo:
- Open homepage
- Search careers
- Open a career details page
- Login with Google
- Verify profile-protected flow does not error
