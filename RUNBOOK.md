# EduPlatform Runbook

Operational playbooks for keeping EduPlatform healthy. You are the only operator — no rotation, but every incident gets an `uptime`-labeled GitHub issue automatically from the uptime monitor (`.github/workflows/uptime.yml`, every 15 min).

## Contact & surfaces
- WhatsApp: +44 7735 310744 · Call: 055 667 4353 · Email: sboaho@gmail.com
- Live site: https://eduplatformsoftware.com
- Backend API: https://school-saas-backend-fnqi.onrender.com (`/api/health` → `{"status":"ok"}`)
- Deploys/dashboards: Vercel (`npx.cmd vercel`) · Render (https://dashboard.render.com → `school-saas-backend`)
- Frontend repo: `sboaho-boop/school-saas` (master, tags `v1.0.x`)
- Backend repo: `sboaho-boop/school-saas-backend` (master, auto-deploy on push)
- Open incidents: `gh issue list --label uptime`

## RB-1: Frontend (site) is down
Symptom: eduplatformsoftware.com returns 5xx/timeout, or blank page.

1. Confirm: `curl -s -o /dev/null -w "%{http_code}" https://eduplatformsoftware.com`
2. Check latest prod deploy: `npx.cmd vercel ls --prod --yes` — note the current alias URL.
3. Read the deploy log for the failing build; if this appeared right after a deploy, see RB-3 (rollback).
4. Fastest fix: redeploy, which re-runs the build to recover transient state:
   `npx.cmd vercel --prod --yes --force`
5. Verify: site returns 200 and `/login` loads. Then `gh workflow run uptime.yml` for a clean sweep.

## RB-2: Backend/API is (partially) down
Symptom: frontend loads but logins/actions fail; `curl https://school-saas-backend-fnqi.onrender.com/api/health` is not 200 `ok`.

1. Confirm health: `curl -s https://school-saas-backend-fnqi.onrender.com/api/health` and `/api/version`.
2. Open Render dashboard → `school-saas-backend` → **Logs** tab (last hour) for crash/DB errors.
3. If logs point to DB problems: check Render → PostgreSQL → Metric/Logs. Note local `DATABASE_URL` also points at this prod DB — backend tests write to prod.
4. Try a **Restart** from the Render dashboard (Service → Manual Deploy → Restart). Sleep 20–30s, re-check `/api/health`.
5. If a bad deploy caused it: revert the backend commit and push to master (auto-deploys), or use Manual Deploy → Clear build cache & deploy.
6. Verify: `/api/health` returns 200 and `status: ok`; test a real login on the live site.

## RB-3: Rollback a bad release
Symptoms: outage or regression began exactly with deploy of v1.0.X.

1. See recent releases: `gh release list --limit 5`
2. Frontend — redeploy the previous commit:
   `git checkout <previous-release-tag> && npx.cmd vercel --prod --yes --force && git checkout master`
3. Backend — push a revert: `git log --oneline -5` → `git revert <bad-commit> && git push origin master` (auto-deploy runs migrations).
4. Verify health (RB-1/RB-2 checks), then `gh release create v1.0.X+1 --title ...` for the fixed state.

## RB-4: Users can't log in (but site is up)
Symptoms: `/login` loads but auth fails; edu_token cookie issues; passwords reset failures.

1. Confirm API is up (RB-2 step 1) — if the API is fine, this is likely a code/auth bug.
2. Check recent backend deploy (RB-3) and Auth middleware: `school-saas-backend/src/middleware/auth.js`.
3. Reproduce with demo creds (password123, demo school) from a fresh browser (no cache/old cookies).
4. Look for token/cookie regressions in the last frontend diff: `git log -5 --stat` (e.g., a change to `src/stores/auth.ts`).
5. If code is fine and it's transient, restart backend (RB-2 step 4). Otherwise triage as a bug → fix on a branch → release `v1.0.x`.

## RB-5: Latency spikes
Symptoms: slow page loads; uptime log shows ms climbing.

1. Check per-endpoint latency in the last uptime run: `gh run list --workflow uptime.yml` → open logs.
2. Slow frontend: likely hero video cold cache or large page — check `npx.cmd vercel inspect <alias-url>` for edge/CDN time; re-deploy to refresh (RB-1 step 4).
3. Slow API: Render dashboard → Memory/CPU + Logs; PostgreSQL slow queries on large school datasets; restart backend.
4. Escalate to Vercel/Render support if infra-side (rare for this scale).

## Routine
- After every release: run `gh workflow run uptime.yml && gh run watch --exit-status` (waits; fails on downtime).
- Weekly: scan open `uptime` issues → all should be closed. Opened ones auto-close on recovery.
- Keep `.env*` and `.vercel.env` out of git (already ignored). If Vercel deploy says "Not authorized", it's transient — retry.