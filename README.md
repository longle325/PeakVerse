# LitMatch

A gamified Vietnamese literature learning app. Swipe to discover characters, chat with source-grounded AI personas, complete challenges, climb the leaderboard.

## Stack

- **Frontend**: React 18 + TypeScript + Vite, Zustand, TanStack Query, react-tinder-card
- **Backend**: FastAPI, SQLAlchemy (async), Postgres + pgvector, OpenAI GPT-4o + `text-embedding-3-large`, SSE streaming
- **Infra**: Postgres in Docker (`pgvector/pgvector:pg17`)

## Prerequisites

- Node 18+, npm
- Python 3.11+
- Docker Desktop for Mac installed and running (`docker --version` and `docker compose version` should both work)
- An OpenAI API key

## First-time setup

Run these commands from the project root unless a step explicitly changes
directory.

```sh
# 1. Env
cp .env.example .env   # then add OPENAI_API_KEY

# 2. Frontend dependencies
cd frontend
npm install
cd ..

# 3. Backend dependencies
cd backend
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
cd ..

# 4. Postgres + schema + seed (characters, challenges, demo users)
docker compose up -d postgres

# Wait until `docker compose ps postgres` shows the service as healthy.
# If your shell exports DEBUG=release, unset it first because the backend
# expects DEBUG to be a boolean.
unset DEBUG
cd backend
./.venv/bin/python scripts/seed_database.py
cd ..

# 5. Knowledge-base embeddings — restore the team's pre-embedded
#    pgvector dump from Drive (no OpenAI cost, ~1s):
#    https://drive.google.com/file/d/1cGlRIXH9EOJEwfb22USsUhSV6NCAcq_D/view
bash scripts/restore-knowledge-chunks.sh
```

## Run locally

```sh
# Terminal 1: database, from the project root
docker compose up -d postgres

# Terminal 2: backend API, from the project root
unset DEBUG
cd backend
./.venv/bin/python -m uvicorn main:app --reload --port 8081

# Terminal 3: frontend, from the project root
cd frontend
npm run dev
```

Open <http://127.0.0.1:5173/>.

## Troubleshooting Setup

- `npm ERR! enoent Could not read package.json`: run npm commands from
  `frontend/`, or use `npm --prefix frontend run dev` from the project root.
- `cd: no such file or directory: backend`: you are already inside `backend/`.
  Run `pwd` to confirm, then run `./.venv/bin/python scripts/seed_database.py`
  directly.
- `ConnectionResetError: [Errno 54] Connection reset by peer` while seeding:
  Postgres may still be finishing first-time initialization. Wait until
  `docker compose ps postgres` shows `healthy`, then rerun the seed command.
- `DEBUG Input should be a valid boolean`: your shell is overriding `.env` with
  a non-boolean value such as `DEBUG=release`. Run `unset DEBUG`, or prefix the
  command with `env DEBUG=false`.

## Project layout

```
frontend/        React 18 + TS + Vite + Capacitor (Android/iOS)
backend/         FastAPI + PostgreSQL + pgvector + OpenAI
scripts/         Bash: dump/restore knowledge-chunks
docs/
  API.md         Backend API contract
  DEPLOYMENT.md  Full deployment guide (Cloud Run, Android APK, mobile testing)
PRD.md, task.md  Product spec + task tracker
```

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the complete guide covering:
- Local development (frontend-only and full-stack)
- Frontend ↔ Backend connection (mock/real endpoint switching)
- Cloud Run deployment (GCP + Workload Identity Federation)
- Android APK build (CI and local CLI)
- Mobile testing (WiFi, ngrok, Capacitor live reload)
- Environment variables reference
- CI/CD workflows
- Troubleshooting

## Notes

- `VITE_REAL_ENDPOINTS` in `.env` whitelists which endpoints hit the real backend; empty = all mock (no backend needed for offline UI demos).
- The FE persists user state to `localStorage` under `litmatch-state`. Reset via `/profile` → **Đặt lại dữ liệu thử nghiệm**.
