# Sonar Presents — public portfolio demo

Cross-platform music app demo. This is **not** the production Sonar Presents service or artist catalog pipeline.

## Highlights

- **Expo Router** app with Clerk auth, TanStack Query, and tab navigation
- **React Native Track Player** with background audio and a custom floating mini-player
- **Express + Mongoose** API for songs and liked tracks
- **Jest** tests under `frontend/__tests__/`

## Prerequisites

- Node.js 22+
- Docker (optional, for Mongo + API)
- [Clerk](https://clerk.com) test application (publishable + secret keys)

## Quick start (local)

### 1. MongoDB

```bash
docker run -d --name sonar-demo-mongo -p 27017:27017 mongo:7
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: MONGO_URI, CLERK_SECRET_KEY (webhook secret optional for demo)
npm install
npm run dev
```

In another terminal, seed demo tracks (royalty-free sample URLs):

```bash
cd backend
npm run seed:demo
```

API: `http://localhost:3000` — `GET /api/songs/fetch` returns seeded songs.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY and EXPO_PUBLIC_API_URL (use LAN IP for physical devices)
npm install
npx expo start
```

Physical devices cannot use `localhost`; set `EXPO_PUBLIC_API_URL` to your machine's LAN address (e.g. `http://192.168.1.10:3000`).

## Docker Compose (API + Mongo)

```bash
cp backend/.env.example backend/.env
# Add CLERK_SECRET_KEY to backend/.env if testing auth webhooks
docker compose up --build
docker compose exec api npm run seed:demo
```

Then run Expo on the host pointing `EXPO_PUBLIC_API_URL` at `http://localhost:3000`.

## Optional: Clerk webhooks

User sync to Mongo requires `CLERK_WEBHOOK_SIGNING_SECRET` and a tunnel (e.g. ngrok) to `POST /api/webhooks/clerk`. Without it, the API returns `501` in demo mode — sign-in still works; users are not auto-synced until webhooks are configured.

## Project layout

See [code-style.md](code-style.md).

## Security

See [SECURITY.md](SECURITY.md). Never commit real `.env` files. Rotate credentials if they ever appeared in a private repository.

## License

MIT — see [LICENSE](LICENSE).
