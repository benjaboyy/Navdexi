# Navdexi Arcade Scoreboard

Simple Vue 3 + Vite dashboard for arcade high scores, admin moderation, and a mocked ingestion API.

## Features
- High-score overview per game sourced from `src/data/seed.json`.
- Password-gated admin panel to delete submissions and manage games/locations.
- Manual submission form mirroring the API contract.
- Vite dev-server middleware that mocks `POST /api/scores`.

## Quick Start
```
npm install
cp .env.example .env # set VITE_ADMIN_PASS
npm run dev
```

Visit `http://localhost:5173`. Pages:
- `/scores` – leaderboard cards.
- `/submit` – simple score tester.
- `/admin` – tools with the password from `VITE_ADMIN_PASS`.

## API
`POST /api/scores`
```json
{
  "gamertag": "NovaJet",
  "score": 98210,
  "gameId": "GALAXY",
  "locationId": "HQ",
  "mode": "solo"
}
```
`201` response:
```json
{
  "success": true,
  "submission": {
    "id": "api-...",
    "timestamp": "2025-12-25T00:00:00.000Z",
    "gamertag": "NovaJet",
    "score": 98210,
    "gameId": "GALAXY",
    "locationId": "HQ",
    "mode": "solo"
  }
}
```
Misconfigured payloads return `400` with `{ success: false, error }`.

## Firebase
`VITE_FIREBASE_URL` is exposed to the client via `__FIREBASE_URL__` define for future REST calls. Swap the mock store logic with Firebase SDK / REST integration when ready.

More detail in `docs/setup.md`.
