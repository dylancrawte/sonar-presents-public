# Demo API

Express + MongoDB backend for the public portfolio repo.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
npm run seed:demo
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API with nodemon + tsx |
| `npm run seed:demo` | Upsert songs from `fixtures/demo-songs.json` |

## Routes

- `GET /` — health JSON
- `GET /api/songs/fetch` — all songs
- `GET /api/songs/by-playlist?playlist=...` — filter by playlist name
- `GET/POST/DELETE /api/liked-songs/*` — liked tracks (requires `userID` from Clerk)
- `POST /api/webhooks/clerk` — Clerk user sync (requires `CLERK_WEBHOOK_SIGNING_SECRET`)

Production-only tooling (Drive → R2 migration, CSV artist intake) is intentionally omitted from this repo.
