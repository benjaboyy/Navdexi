# Navdexi Arcade Scoreboard Setup

## Requirements
- Node.js 18+
- npm 9+
- Firebase account + project (create at <https://console.firebase.google.com>)

## Environment
Create a `.env` file based on `.env.example`:

```
cp .env.example .env
```

Set `VITE_ADMIN_PASS` to the password that unlocks the admin tools and `VITE_FIREBASE_URL` to your database URL.

## Local Development
```
npm install
npm run dev
```
Run the Firebase emulators (or point to a real Realtime Database via `VITE_FIREBASE_URL`) so the Vue app talks to the same backend you use in production.

## Realtime Database Configuration
1. Edit `database.rules.json` (created by `firebase init`) to restrict writes, e.g.:
   ```json
   {
     "rules": {
       "scores": {
         ".read": true,
         ".write": "auth != null"
       }
     }
   }
   ```
2. Deploy rules:
   ```
   firebase deploy --only database
   ```
3. Seed data using the Firebase console or REST API (`POST https://<db>.firebasedatabase.app/scores.json`).
4. Point the app at Firebase by updating `.env`:
   ```
   VITE_FIREBASE_URL=https://navdexi-default-rtdb.firebaseio.com/
   ```
5. `__FIREBASE_URL__` is injected globally for REST calls to Firebase.

## API Backend Deployment
1. Install backend deps:
```
cd functions
npm install
```
2. Deploy the HTTPS function:
```
npm run deploy
```
3. Hosting now rewrites `POST /api/scores` to the `apiScores` Cloud Function (see `firebase.json`).
4. To test locally use the Firebase emulator:
```
firebase emulators:start --only functions,hosting,database
```
5. Production requests should hit `https://<project-id>.web.app/api/scores` and persist into Realtime Database under `submissions/`. Include a `password` field in the JSON body that matches the shared secret (set via `firebase functions:config:set scores.password=...` or the `SCORES_API_PASSWORD` env var for local emulation).

## API
`POST /api/scores`
```json
{
  "gamertag": "string",
  "score": 12345,
  "gameId": "GALAXY",
  "locationId": "HQ",
  "mode": "solo" // optional
}
```
- Returns `{ success: true, submission }` on success.
- On validation failure returns `{ success: false, error }` with `400`.
- Payload must also include `password` with the shared secret; missing or invalid passwords return `401`.

## Verification Checklist
- `.env` configured with admin password + Firebase URL.
- `npm run build` succeeds locally before deploy.
- `firebase deploy --only hosting` publishes latest build.
- `firebase deploy --only database` applies rule updates.
- Manual submission via `/submit` reflects inside admin panel and Firebase data viewer.
- External POST to `/api/scores` returns `201` and appears under `submissions/` in the database.
