# GP Tournament Manager

[![CI](https://github.com/samxssj/GP-TournamentManager/actions/workflows/ci.yml/badge.svg)](https://github.com/samxssj/GP-TournamentManager/actions/workflows/ci.yml)

Real-time Brazilian Jiu-Jitsu tournament manager: build brackets, run matches and drive a live public scoreboard — all synchronized over WebSockets. A control panel for the organizer and a separate public display for competitors and audience.

## Overview

- **Control panel** (`/control`) — manage tournaments, categories, athletes, brackets and live matches.
- **Public view** (`/view`) — scoreboard, bracket screen, podium and waiting screens for a projector or second display.
- **Live sync** — match state (timer, scores, bracket progression) is pushed to every connected screen in real time via socket.io; the live state travels over socket events rather than REST.

## Tech stack

| Layer | Technologies |
|---|---|
| Client | React + Vite · socket.io-client · Zustand (state) · @dnd-kit (drag-and-drop brackets) · React Router · Framer Motion |
| Server | Node.js + Express · socket.io · JSON file storage |
| Testing | Vitest (bracket / match / storage services) |
| Deploy | Docker + Docker Compose |

## Getting started

```bash
# Server
cd server && npm install && npm run dev      # node --watch index.js

# Client (in another terminal)
cd client && npm install && npm run dev      # vite
```

Or run the whole stack with Docker:

```bash
docker compose up --build        # or ./deploy.sh  (Linux/Mac) / deploy.bat (Windows)
```

## Scripts

```bash
# server/
npm run dev     # dev server (watch)
npm start       # production
npm test        # vitest

# client/
npm run dev     # dev server
npm run build   # production build
npm run preview # preview build
```

## Configuration

See `.env.example`. Key variables: `PORT`, `DATA_DIR`, `CORS_ORIGIN` (set the latter to allow other
devices on the local network to open the public view).

## License

[MIT](LICENSE) © Samuel Bermúdez
