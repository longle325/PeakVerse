# PeakVerse

PeakVerse is an interactive Vietnamese literature experience built around
AI-generated character journeys. Students swipe through literary characters,
watch cinematic three-phase video previews, chat with source-grounded personas,
complete challenges, and climb a learning leaderboard.

The project started from the
[longle325/LitMatch](https://github.com/longle325/LitMatch) codebase and now
focuses on the PixVerse-powered video experience for the Film & Entertainment
track: video is not just playback, it is a preview layer that drives discovery,
profile exploration, chat, and challenge flow.

## Video Preview System

PeakVerse supports character video previews through a generic convention:

```txt
frontend/public/character-videos/<character-id>/<character-id>-three-phase-demo.mp4
```

Examples:

```txt
frontend/public/character-videos/mi/mi-three-phase-demo.mp4
frontend/public/character-videos/chi-dau/chi-dau-three-phase-demo.mp4
frontend/public/character-videos/lao-hac/lao-hac-three-phase-demo.mp4
```

If a character id is listed in
`frontend/src/data/characterVideos.ts`, the frontend automatically adds the
video to:

- the Discover swipe gallery, after the character images
- the Character Profile page, in the journey video section
- the custom video player with play/pause, seek, fullscreen, poster, and
  optional Vietnamese subtitles

Generated MP4 files are intentionally ignored by git because they are large.
To enable a local preview, place the final MP4 in the matching folder above.
Small `.vtt` subtitle files can be committed next to the MP4:

```txt
frontend/public/character-videos/chi-dau/chi-dau-three-phase-demo.vtt
frontend/public/character-videos/lao-hac/lao-hac-three-phase-demo.vtt
```

Per-phase render files such as `phase-1.mp4`, `phase-2.mp4`, and `phase-3.mp4`
are workflow artifacts. The app only needs the final
`<character-id>-three-phase-demo.mp4`.

## Current Featured Videos

- **Mị**: three phases from youthful vitality, to debt bondage, to rescuing A
  Phủ.
- **Chị Dậu**: three phases from protecting her family in the tax season, to
  resisting the bailiff, to escaping into the dark uncertainty of poverty.
- **Lão Hạc**: three phases from tenderness toward Cậu Vàng, to grief after
  selling the dog, to preserving the garden for his son.

## Stack

- **Frontend**: React 18, TypeScript, Vite, Zustand, TanStack Query,
  react-tinder-card
- **Backend**: FastAPI, SQLAlchemy async, Postgres, pgvector, OpenAI chat and
  embedding models, SSE streaming
- **Infra**: Docker Compose with Postgres + pgvector

## First-Time Setup

Run these commands from the project root unless a step explicitly changes
directory.

```sh
# 1. Environment
cp .env.example .env
# Add OPENAI_API_KEY when using real backend AI/RAG features.

# 2. Frontend dependencies
cd frontend
npm install
cd ..

# 3. Backend dependencies
cd backend
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
cd ..

# 4. Postgres + seed data
docker compose up -d postgres

# Wait until postgres is healthy.
unset DEBUG
cd backend
./.venv/bin/python scripts/seed_database.py
cd ..
```

## Run Locally

```sh
# Terminal 1: database
docker compose up -d postgres

# Terminal 2: backend API
unset DEBUG
cd backend
./.venv/bin/python -m uvicorn main:app --reload --port 8081

# Terminal 3: frontend
cd frontend
npm run dev
```

Open <http://127.0.0.1:5173/>.

For a frontend-only demo, leave `VITE_REAL_ENDPOINTS` empty so the app uses
mock data and local character/video assets.

## Adding A New Character Video

1. Generate the final PixVerse video.
2. Put it at:

   ```txt
   frontend/public/character-videos/<character-id>/<character-id>-three-phase-demo.mp4
   ```

3. Add the character id and optional description/captions flag to:

   ```txt
   frontend/src/data/characterVideos.ts
   ```

4. If subtitles exist, add:

   ```txt
   frontend/public/character-videos/<character-id>/<character-id>-three-phase-demo.vtt
   ```

5. Run:

   ```sh
   cd frontend
   npm run test
   npm run build
   ```

## Project Layout

```txt
frontend/        React + TypeScript + Vite app
backend/         FastAPI + PostgreSQL + pgvector backend
scripts/         Data and knowledge-base helper scripts
docs/            API and deployment documentation
PRD.md           Product requirements
task.md          Implementation tracker
```

## Notes

- Generated `.mp4` files under `frontend/public/character-videos/` are ignored
  by git. Keep them in local/demo storage or upload them through the release
  pipeline when needed.
- The frontend persists local demo state in `localStorage`.
- Real backend mode merges backend character cards with frontend seed metadata,
  so video preview metadata can remain frontend-owned.
