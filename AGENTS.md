# Agent instructions

**Before doing anything, read [docs/README.md](docs/README.md)** and the docs it links to, especially [docs/architecture.md](docs/architecture.md). If the task touches login, users or roles, also read [docs/plans/login-supabase.md](docs/plans/login-supabase.md) and follow its rollout order.

## Commands

```bash
npm install
npm run dev      # needs .env.local (copy .env.example)
npm run lint     # must pass
npm run build    # must pass
```

## Rules

- **No secrets in the frontend.** Every `VITE_*` variable ships in the public JS bundle. Telegram tokens live in Apps Script Script Properties. Never use the Supabase secret / `service_role` key anywhere in this repo.
- **Never commit `.env.local`** or any real `.env*` file; only `.env.example`.
- **Backend is `backend/stock.gs` (Google Apps Script).** Deploying it is manual (paste the code into Apps Script, then publish a new version of the existing deployment). When you change it, say so clearly in your summary, and keep the frontend working against the currently deployed version until the user confirms the deploy.
- **Apps Script can't handle CORS preflight.** Browser requests must stay simple: `FormData` or query params, no custom headers.
- **Don't reorder Google Sheet columns.** Add new columns at the end; the script reads columns by index.
- **The UI text is Malay.** Code, comments and docs are in English.
- Match the existing style: Tailwind classes, the `theme` prop for colours, `font-display` for headings, and small components in `src/components/` and `src/pages/`.
- Update `docs/` when behaviour or architecture changes. Plans keep a **Status** line.
