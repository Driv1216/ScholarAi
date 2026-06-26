# ScholarAI Deployment

ScholarAI is a monorepo:

- Backend: `backend/` FastAPI app, entry point `app.main:app`
- Frontend: `frontend/` SvelteKit app

## Render Backend

- Service type: Web Service
- Root directory: `backend`
- Runtime: Python 3
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

Required environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `FRONTEND_URLS` as a comma-separated list, for example `http://localhost:5173,https://your-vercel-app.vercel.app`

`render.yaml` is included at the repo root if you prefer Render blueprint setup.

## Vercel Frontend

- Root directory: `frontend`
- Framework preset: SvelteKit
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: leave empty/default for SvelteKit

Set the install command explicitly in Vercel so it uses npm for this deployment.

Required environment variables:

- `PUBLIC_BACKEND_URL`, for example `https://your-render-service.onrender.com`
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

## Supabase Notes

- The frontend must only use the public anon or publishable key: `PUBLIC_SUPABASE_ANON_KEY`.
- The backend may use the service role key: `SUPABASE_SERVICE_ROLE_KEY`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in Vercel, frontend code, screenshots, client logs, or browser-visible env vars.
- In Supabase Auth settings, add your Vercel URL and callback URL: `https://your-vercel-app.vercel.app/auth/callback`.

## Post-Deploy Checklist

- Open `https://your-render-service.onrender.com/health` and confirm it returns `{"status":"ok"}`.
- Add the Render backend URL to Vercel as `PUBLIC_BACKEND_URL`.
- Add the Vercel frontend URL to Render as `FRONTEND_URLS`.
- In Supabase Auth, add the Vercel site URL and callback redirect URL.
- Test login, dashboard, scholarship matching, saved scholarships, and application tracking.
- Wake the Render service 2-3 minutes before the demo/interview.
