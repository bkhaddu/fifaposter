# Final Whistle Studio

A browser-based FIFA result poster generator inspired by the supplied Mexico vs South Africa template.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Built-in match feed

No API setup is required. The app uses the free, open World Cup 2026 feed at `worldcup26.ir` for the full tournament schedule, results, statuses, and scorer timestamps. If that service is unavailable, it automatically falls back to TheSportsDB's official free API.

The app checks for updates every 60 seconds by default. A custom JSON provider can still be selected in **Settings**.

## Google Drive

1. Enable the Google Drive API in Google Cloud.
2. Create an OAuth 2.0 Web client.
3. Add the app URL as an authorized JavaScript origin.
4. Paste the client ID into **Settings**.
5. Optionally paste a Drive folder ID.

The app requests the narrow `drive.file` scope and keeps connection settings in browser local storage.
