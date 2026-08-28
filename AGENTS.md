# Base44 Dev Environment — Zoology Animal Club (ZAC)

## Stack
- Next.js 16 (App Router) + React 19 + framer-motion, TypeScript (build errors ignored in next.config).
- MongoDB via Mongoose (`src/lib/mongodb.ts`), URI from `MONGODB_URI` (defaults to `mongodb://localhost:27017/zac`).
- Public iNaturalist API (`api.inaturalist.org`) used for featured/endangered/deep-sea/extinct pages — no API key required.
- JSON file fallbacks exist for users (`src/lib/db-fallback.ts`) and blog posts (`src/lib/blog-fallback.ts`).

## Running
- `docker compose -f docker-compose.base44.yml up -d --build`
- Web service bind-mounts `./zac-app` and runs `next dev -H 0.0.0.0 -p 3000` (live reload, polling enabled for bind mounts).
- MongoDB runs as a compose service with generated credentials; `MONGODB_URI` is wired into the web service.
- Preview is served on host port 3000. Next.js `allowedDevOrigins` is derived from `BASE44_PUBLIC_HOST_SUFFIX` in `next.config.ts` so the preview origin is accepted.

## Seeding
- Visit `/api/seed` (or `/api/seed?force=true` to re-seed) to populate MongoDB with the initial animal/fact catalog defined in `src/app/api/seed/route.ts`.
- Public pages (home, animals, red-list, deep-sea, extinct) work without seeding — they pull from iNaturalist.

## Secrets
- None required. `SESSION_SECRET` has a built-in default in `src/lib/auth.ts`. No external credentials.

## Verify
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` returns the landing page.
- `curl -sf http://localhost:3000/api/inat/featured` returns a featured animal JSON.
