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

This starts Vite with the mock API middleware at `POST /api/scores`. The mock server only validates payloads and appends to the in-memory store; hook up Firebase once ready.

## Firebase CLI & Project Setup
1. Install the CLI globally (once per machine):
   ```
   npm install -g firebase-tools
   ```
2. Authenticate the CLI:
   ```
   firebase login
   ```
3. Initialize the project inside this repo (choose Hosting + Realtime Database):
   ```
   firebase init
   ```
   - Select or create your Firebase project.
   - **Hosting**:
     - Public directory: `dist` (run `npm run build` before deploying).
     - Configure as SPA: **Yes** (all routes rewrite to `/index.html`).
     - Use GitHub Actions: optional.
   - **Realtime Database**:
     - Accept default location.
     - CLI creates `database.rules.json`; edit it to match your security model (example below).

## Hosting Deployment Workflow
1. Build the Vite app:
   ```
   npm run build
   ```
2. Deploy hosting (production):
   ```
   firebase deploy --only hosting
   ```
3. Optional preview channel for QA:
   ```
   firebase hosting:channel:deploy staging
   ```
4. Verify at `https://<project-id>.web.app` and ensure SPA routes (`/scores`, `/submit`, `/admin`) resolve.

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
3. Seed data (optional) using the Firebase console or REST API (`POST https://<db>.firebasedatabase.app/scores.json`).
4. Point the app at Firebase by updating `.env`:
   ```
   VITE_FIREBASE_URL=https://navdexi-default-rtdb.firebaseio.com/
   ```
5. Replace the mock store logic with Firebase SDK/REST calls when ready; `__FIREBASE_URL__` is injected globally for this purpose.

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

## Verification Checklist
- `.env` configured with admin password + Firebase URL.
- `npm run build` succeeds locally before deploy.
- `firebase deploy --only hosting` publishes latest build.
- `firebase deploy --only database` applies rule updates.
- Manual submission via `/submit` reflects inside admin panel and Firebase data viewer.
