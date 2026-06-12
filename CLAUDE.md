# CLAUDE.md — GP Tournament Manager

Gestor de torneos de BJJ en tiempo real (brackets/llaves en vivo). Cliente + servidor con
sincronización por WebSocket. Repo: `samxssj/GP-TournamentManager`. Relacionado con
Grapplers Paradise.

> Preferencias globales en `~/.claude/CLAUDE.md`.

## Arquitectura
- `client/` — SPA React (Vite). Tiempo real vía `socket.io-client`. Estado con **zustand**.
  Drag & drop de llaves con **@dnd-kit**. Rutas con react-router. framer-motion.
- `server/` — API + WebSocket (Express + **socket.io**). Estado en memoria/`data/`. UUID, CORS, dotenv.

## Comandos
```bash
# client/
npm run dev       # vite
npm run build     # vite build
npm run preview   # vite preview

# server/
npm run dev       # node --watch index.js
npm start         # node index.js
npm test          # vitest run
```

## Convenciones
- Comunicación cliente↔servidor por eventos socket.io (no REST para el estado en vivo).
- Variables de entorno por `.env` en el server (nunca hardcodeadas).
- Despliegue: Docker tras Traefik en red `homelab` (sin binding directo de puertos).
- Montserrat. Estética sobria.

## Estado (jun 2026)
Rama `main`. Última: routing por Traefik homelab, sin port binding directo. Sin cambios pendientes.
