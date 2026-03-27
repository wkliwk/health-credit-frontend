# Health Credit — Frontend

## Product
Private health document sharing platform. Users upload health documents (STI results, vaccinations, blood work), generate expiring private links to share with others. Privacy-first: encrypted storage, granular sharing controls, auto-expiry.

**Sub-line: HC Trust** — sexual health vertical targeting dating contexts.

## Tech Stack
- React 18 + TypeScript
- Vite
- MUI (Material UI)
- React Router
- PWA (Progressive Web App)
- Client-side encryption (Web Crypto API)

## Key Architecture
- `src/pages/` — route-level components
- `src/components/` — shared UI components
- `src/services/` — API client, encryption utilities
- `src/hooks/` — custom React hooks
- `src/context/` — auth, theme providers

## Anti-Goals
- No over-engineering — ship fast, iterate
- No server-side access to plaintext documents (zero-knowledge encryption)
- No social features in Phase 1
- No AI/scoring in Phase 1

## Commands
```bash
npm install        # install deps
npm run dev        # local dev server
npm run build      # production build
npm run preview    # preview production build
```

## Deploy
Vercel — auto-deploy on push to main.

## Related
- Backend: https://github.com/wkliwk/health-credit-backend
- Board: https://github.com/users/wkliwk/projects/7

## Decisions
Log non-obvious decisions in `decisions.jsonl` (one JSON object per line):
```json
{"date":"2026-03-27","decision":"Zero-knowledge encryption — client encrypts before upload, server never sees plaintext","reason":"Core privacy differentiator vs competitors like Zults"}
```
