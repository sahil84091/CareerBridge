# CareerBridge

CareerBridge is a career intelligence app with a FastAPI backend and Next.js frontend. The API uses Google OIDC sessions, PostgreSQL, private resume object storage, Gemini for structured resume extraction and personalized roadmaps, and Adzuna for India job search.

## Local development

1. Copy `.env.example` to `.env` and set Google OAuth, Gemini, and Adzuna credentials. Configure the Google OAuth client callback as `http://localhost:8000/api/auth/google/callback`.
2. Install backend dependencies and start the API from the repository root:

   ```powershell
   python -m pip install -r backend/requirements.txt
   python -m backend.migrate
   python -m uvicorn backend.main:app --reload --port 8000
   ```

   Local resume files are stored under `.tmp/resumes`; the local SQLite database remains `careerbridge.db` unless `DATABASE_URL` is changed.
3. Start the frontend in another terminal:

   ```powershell
   cd frontend
   npm ci
   npm run dev
   ```

   Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` when the API is not at `http://127.0.0.1:8000`.

## Portable deployment

`docker compose up --build` starts PostgreSQL, MinIO (private local S3-compatible storage), the API, and the web app. Copy the root `.env.example` to `.env`, replace local secrets, and provide OAuth, Gemini, and Adzuna credentials. Configure OAuth’s callback and allowed origin to match the deployment URLs. For production, use a managed PostgreSQL database, an encrypted private S3 bucket, HTTPS, a long random `SESSION_SECRET`, and `SESSION_COOKIE_SECURE=true`; do not use the development credentials in Compose defaults.

The API applies Alembic migrations and loads public skill and career taxonomy at startup. `/api/health` reports process liveness; `/api/ready` checks database readiness. Migrations are additive for the existing SQLite database.

## Verification

Run backend tests from the repository root:

```powershell
python -m pytest backend/tests -q
```

Run frontend checks:

```powershell
cd frontend
npm run lint
npm run build
```

Integration tests stub Google, Gemini, Adzuna, and object storage boundaries. A real deployment still needs valid provider credentials and callback URLs for live external-service checks.
