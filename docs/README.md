# SmartEV docs

Read these before changing the project.

| Doc | What it covers |
| --- | --- |
| [architecture.md](architecture.md) | How the system works today: frontend, Apps Script backend, Google Sheet, env vars, deploy, known issues |
| [plans/login-supabase.md](plans/login-supabase.md) | Plan for login + roles with Supabase Auth (not implemented yet) |

## Conventions for docs

- Plans go in `docs/plans/<topic>.md`. Each starts with a **Status** line (`Proposed`, `In progress`, `Done`) and is updated as work lands.
- When a plan is finished, move the lasting facts into `architecture.md` and mark the plan `Done`.
- Docs are in English. The app's UI text is in Malay; keep it Malay.
