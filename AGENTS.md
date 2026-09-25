# AGENTS.md

Astro 7 static site (ES/EN) for JCMF Constructora. Single package, Bun + Node >= 22.12, run inside Ubuntu/WSL. `CLAUDE.md` is a symlink to this file.

## Commands

- `bun install` (lockfile `bun.lock`; do not switch package managers).
- Dev server must run in background mode: `bun run dev -- --background`. Manage with `bun run astro dev status|logs|stop` (also `astro dev --background` directly). E2E and capture scripts expect it at http://localhost:4321.
- `bun run check` — `astro check` typecheck (tsconfig extends `astro/tsconfigs/strict`). Currently 0 errors; keep it that way.
- `bun run test` — 8 unit tests (Bun running `node:test`) in `tests/contact.test.ts`: Zod schema, i18n key parity, route uniqueness. Filter: `bun test tests/contact.test.ts -t "name"`.
- `bun run test:e2e` — Playwright specs in `tests/browser/`. Requires the dev server already running (playwright.config.ts has no `webServer`) and `bunx playwright install chromium`. One spec: `bunx playwright test tests/browser/site.spec.ts`.
- `bun run format` / `format:check` — Prettier with `prettier-plugin-astro`, single quotes. This is the only lint/format step; there is no ESLint.
- `node scripts/capture.mjs` — regenerates `test-results/screenshots/` and overwrites the committed `public/social-card.png`. Needs the dev server.

## Architecture

- Routing is generated, not hand-written: `src/pages/index.astro` + `src/pages/[...path].astro` build every page/project route from `src/i18n/routes.ts` (`routeMap`, `projectRoute`). Spanish at root, English under `/en/`, `trailingSlash: 'always'` — every route ends in `/`. Add routes there, not as new page files.
- Content lives in `src/i18n/es.ts` / `en.ts` (typed dictionaries; `es` defines the key structure via `Widen`, tests assert identical keys) and `src/data/projects.ts` (8 projects, `content` per locale). Brand/SEO config: `src/config/site.ts`.
- Astro renders full static HTML. React islands hydrate on `client:visible` in portfolio (`WorkCard.tsx`, `ProjectCaseStudy.tsx`, `ProjectPhoto.tsx` via `ProjectCard.astro` / `ProjectMedia.astro`) and `client:load` for the contact form.
- Images: import from `src/assets/images` in `projects.ts`; `getProjectPhoto()` in `src/lib/project-media.ts` runs `astro:assets` `getImage` at build time (WebP 480/800/1200/1600, per-image `position` crop) and passes only serializable props to the React islands — never pass `ImageMetadata` into `.tsx`.
- `src/scripts/site.ts` is vanilla JS (menu, theme, filters, scroll reveals) with listener cleanup; theme in localStorage is the only persisted preference.
- `src/styles/tokens.css` is the single source of theme values; `global.css` is the only stylesheet. Do not add a second override sheet or duplicate theme values in React components.

## Content constraints (easy to violate)

- All UI copy goes through the i18n dictionaries, in both languages in the same change (key parity is tested).
- Do not invent facts: no unverified figures, dates, client names, attributions, addresses, reviews, team identities, or metrics. Image provenance and identification limits are in `PORTFOLIO.md`; an image does not prove JCMF participation. `mediaType: 'reference'` marks reference-only images.
- The IDEI amount `+22.1MDP|22021-Actual` is deliberately kept raw in data and never rendered (`budget` is unused in views). Do not publish or "correct" it.
- Adding a project/image: follow the recipe in `PORTFOLIO.md`. Slug must be kebab-case (tested), and `tests/contact.test.ts` hardcodes 26 routes — update that count when pages or projects change.
- `src/assets/images/*:Zone.Identifier` are WSL/NTFS download artifacts that were committed by accident. They are not assets; never add more.

## Contact form

Demo only: `src/features/contact/` (React + Zod) validates client-side, keeps values on error, focuses the first invalid field, and makes no requests or storage. A valid form never implies a sent message. Keep that contract until a real endpoint exists (server re-validation, antispam/rate limit, email provider, approved privacy notice). Never put secrets in `PUBLIC_*` vars.

## SEO and env

- `.env` (from `.env.example`): `PUBLIC_SITE_URL` (real domain only when approved) and `PUBLIC_INDEXABLE`. Indexing needs **both** (`canIndex` in `src/config/site.ts`); otherwise canonical/hreflang are omitted, `robots.txt.ts` disallows all, and `sitemap.xml.ts` emits an empty sitemap. Keep `PUBLIC_INDEXABLE=false` while placeholders exist.
- Build output is static `dist/` including `404.html`; the host must serve it with HTTP 404. Deploying and configuring external services is out of scope.

## Design

- `DESIGN.md` is the visual identity source (the `impeccable` tooling also reads it as design-system context). Change colors/spacing only in `tokens.css` and mirror them in `DESIGN.md`. `premium-ui.json` records ownership decisions — the form select is explicitly native; keep it native.
- Spanish-first copy with complete English. Motion is finite, decorative, and must fully disappear under `prefers-reduced-motion`; content and navigation must work without JS.
- Two design variants live on separate branches: `modern_design` (original blue/isometric) and `design_minimal` (current marfil/oliva, this branch). Never mix palettes between them.
- Before calling UI work done: check both languages, both themes, mobile, keyboard focus, and reduced motion.

## Repo docs

`README.md` (setup, SEO, publishing) · `DESIGN.md` (identity/tokens/motion) · `PLAN.md` (progress log, verification history) · `PORTFOLIO.md` (image provenance, how to add projects).
