# Code style and architecture (public demo)

## Layout

| Path | Role |
|------|------|
| `frontend/` | Expo (React Native) app — Expo Router, Clerk, TanStack Query, React Native Track Player |
| `backend/` | Express API, MongoDB, demo song seed |

## Frontend

- Routes under `frontend/app/`: `(auth)/` for sign-in, `(index)/` for main tabs.
- Player state: `store/queue.tsx` (optimistic UI + queue ids), `controllers/track-player-controller.ts`.
- API client: `api/song-library-api.ts`; hooks in `hooks/cache/`.

## Backend

- Entry: `backend/src/app.ts`
- Features: `backend/src/features/{songs,liked-songs,users}/`
- Demo data: `backend/fixtures/demo-songs.json`, `npm run seed:demo`

## Conventions

- Frontend imports: `@/*` → `frontend/` root.
- Tests: `frontend/__tests__/`
