# Excellent Driving — Project Sitrep

Running log of work done, phase by phase, per the build order in `Claude.md`.
Append a new dated section per work session; don't rewrite history above it.

---

## Phase 0 — Interactive Maquettes (Design & Prototype)

### 2026-08-18 — Functional/technical hardening pass

**Context:** GLM-5.2 review (`maquettes/_review_output.md`) had flagged design,
UX, accessibility, and responsiveness issues across all 6 maquettes + index.
A prior session had already fixed: mobile nav toggle (hamburger/sidebar),
booking calendar defaulting to a real current month + live summary sidebar,
admin modal data binding (real row data instead of hardcoded), quiz timer
memory leak, demo-button gating behind `?demo`, and partial keyboard support
(`tabindex`/`role=button`/Enter-Space) on several pages.

This session tackled the remaining functional/technical bugs, easiest to
hardest, skipping two open decisions that need the owner's input first:
- **Quiz diagram generation approach** — parked; an in-progress scenario
  question with a hand-built SVG diagram (T-junction paved/unpaved
  right-of-way) and a reference image `priority_situation.png` were reverted
  at the owner's request pending more thought on the diagram approach.
- **Language switcher (EN/NL) functional scope** — still cosmetic-only
  (buttons exist, don't translate content). Flagged as needing an explicit
  decision: leave as a visual mockup for stakeholder review, or wire up now.

**Fixed this session:**

| Item | Fix |
|---|---|
| Homepage FAQ answer clipped at fixed 200px | Dynamic `max-height` via `scrollHeight` in `toggleFAQ` |
| Homepage FAQ grid ignored mobile breakpoint | Moved inline grid style to `.faq-grid` class, added to media query |
| Homepage hero cert-text contrast (45% opacity) | Bumped to 72% opacity |
| Packages filter substring bug (`tags.includes`) | Split tags into array, exact match |
| Packages "Showing 4 packages" hardcoded | Count now computed live from filter results |
| Packages Refresher card not centered | `margin: 0 auto` |
| Packages Refresher inner grid broke on mobile | Added mobile collapse to 1 column |
| Packages comparison table overflow on mobile | Wrapped in `overflow-x: auto` |
| Booking ✅ emoji confirmation icon | Replaced with inline SVG checkmark |
| Booking disabled-state contrast (gray-200 on white) | Darkened to a new `--gray-400` token |
| Dashboard off-brand blue gradient on "Next Lesson" card | Swapped to amber-tinted brand gradient |
| Admin fake search `<div>` | Replaced with real `<input type="search">` |
| Emoji read literally by screen readers | `aria-hidden="true"` added to ~45 icon-only elements across all 7 files |
| Icon-only buttons with no accessible name | `aria-label` added (notif bells ×2, packages WhatsApp float) |
| No `:focus-visible` anywhere | Added one rule per file (7 files) covering links/buttons/inputs/custom controls |
| Quiz "Previous" wiped selected answer + highlight | Added `answered[]` state array, extracted shared `revealAnswer()`, restored on re-render |
| Quiz accordion had no expand/collapse indicator | Added rotating chevron + `aria-expanded` wiring |
| Admin tabs didn't switch content (largest item) | Built real Bookings/Students/Revenue panels with proper tablist/tab/tabpanel ARIA roles, rewired `switchTab` |
| Admin modals lacked dialog semantics (largest item) | Added `role="dialog"`/`aria-modal`/`aria-labelledby`, focus-trap on Tab, Escape-to-close, focus restore to trigger button |

**Known gap (not silently dropped, explicitly deferred):**
- `check-icon`/`cross-icon` in the packages comparison table were deliberately
  left *not* `aria-hidden` — they carry meaning (included vs. not) that isn't
  restated elsewhere in the text; hiding them would be a regression, not a fix.
- Inline emoji+text combos (status badges like "💵 Cash", "🔒 Locked") were not
  touched — screen readers still read those emoji literally. Small residual
  gap, not full coverage.

**Verification method:** initially static only (HTML tag-balance + JS
brace-balance checks, all clean) since the sandbox had no browser tooling.
Node, Chromium, and `playwright-core` were installed mid-session (see below)
and used to live-verify the two highest-risk items:
- Admin tabs: clicking `#tab-bookings` correctly shows `#panel-bookings` and
  hides `#panel-overview` (screenshot confirmed clean layout).
- Admin modals: opening "Confirm Pay" moves focus into the dialog
  (`aria-modal="true"` present), Tab cycles through 10 presses without ever
  leaving the modal (focus trap holds), and Escape closes it and returns
  focus to the trigger button.
- Quiz: selecting an answer on Q1, clicking Next then Previous restores the
  `selected`/`revealed` classes and the explanation panel — state is no
  longer wiped.
- Packages: filtering to "Exam Prep" updates the "Showing N packages" count
  from 4 to 2, matching the actually-visible card count.

All four passed. One cosmetic non-issue surfaced: emoji icons render as
empty boxes in this container's screenshots (no emoji font installed) — a
rendering-environment gap, not an app bug.

**Browser tooling now available for future sessions:** installed
`nodejs`/`npm`/`chromium` via apt and `playwright-core` via npm (global).
Captured the working setup — including the `NODE_PATH` gotcha and a script
template — as a project skill at `.claude/skills/run/SKILL.md` so future
phases don't have to rediscover it.

**Still open before Phase 0 can close (owner review gate):**
1. Decide the quiz diagram generation approach (parked above).
2. Decide language-switcher scope (cosmetic vs. functional) before stakeholder review.
3. Owner review/approval of all 6 maquettes — the formal Phase 0 exit gate.

---

### 2026-08-19 — Language switcher: minimal real EN/NL translation

**Context:** Owner decided (asked to clarify scope, then chose) "wire up
minimal real translation" over leaving the switcher cosmetic or removing it.
Implemented across the three maquettes that actually have a switcher —
`01-homepage.html`, `02-packages.html`, `04-student-dashboard.html`. The
switcher does not exist on `03-booking.html`, `05-quiz.html`, or
`06-admin-dashboard.html` — adding one there is a separate, still-open decision.

**Pattern used (identical in all 3 files):** lang buttons gained
`data-lang="en"/"nl"`; every translatable leaf element gained
`data-en="<original English>" data-nl="<Dutch>"` (so `data-en` mirrors the
text already on the page — zero visual change until NL is clicked); a
`setLang(lang)` function swaps `textContent` on every `[data-en]` element and
sets `document.documentElement.lang`. Elements mixing an icon + text (e.g.
sidebar nav items) had the bare text wrapped in a small span so the icon
isn't touched. Headings containing a `<br>` (e.g. the hero H1) were split into
per-line spans so the linebreak stays real markup instead of literal text
inside an attribute.

**Scope — translated (~45 strings across 3 files):** nav links, Login/Book
Now buttons, hero headline/subtext/CTAs, stats bar labels, "How It Works"
steps, package card names/taglines/CTA buttons, comparison table headers,
CTA banners, footer link labels/headers (homepage), filter tabs and the
"Showing N packages" copy (packages), sidebar nav items, welcome banner,
stat card labels, card titles, quick links (dashboard).

**Scope — deliberately left English-only:** FAQ question/answer bodies,
instructor bios, footer address/legal text, WhatsApp buttons (homepage);
package include/exclude feature lines, comparison table body cells
(packages); student's own name/data, activity feed entries, module/lesson
names, and the hero-card "Learning Journey" checklist (dashboard — this last
one wasn't explicitly scoped in either direction, defaulted to excluding it
to keep the pass genuinely "minimal"). This is intentionally partial i18n,
not the full `next-i18next` system that's still AGENT 8's job in Phase 1 —
the file should not be read as claiming full coverage.

**Verification (live, in-browser, not just static):** served the maquettes
and drove them with the now-installed Chromium + `playwright-core`. For each
of the 3 files: sampled 5 translated elements, clicked NL, confirmed the
text actually changed (4/5 on homepage and packages — "Starter" is
identically spelled in both languages by design, not a miss; 5/5 on
dashboard), then clicked back to EN and confirmed every sampled string
reverted to *exactly* the original text (catches any `data-en` drift from
the real markup). All checks passed. Took a full-page NL screenshot of the
homepage — layout held up cleanly, including the two-line hero heading.
HTML tag-balance and JS brace-balance checks also passed on all 3 files.

**Still open before Phase 0 can close (updated):**
1. Decide the quiz diagram generation approach (parked, unchanged).
2. ~~Decide language-switcher scope~~ — resolved this entry.
3. ~~Decide whether the language switcher should be added to booking/quiz/admin~~
   — resolved 2026-08-19: staying dashboard-only (booking/quiz/admin get no
   switcher). Public site (homepage/packages) + student dashboard only.
4. Owner review/approval of all 6 maquettes — the formal Phase 0 exit gate.
   All functional/technical/accessibility hardening for this phase is done;
   this is now the only remaining blocker before Phase 1 can start.

---

### 2026-08-19 — Published maquettes for owner review

**Context:** owner chose to conduct the review via shareable links rather
than locally. Published all 7 maquette files (index overview + 6 screens) as
private Claude Artifacts — technical adaptation only (stripped the
doctype/html/head wrapper the Artifact platform requires), no visual
redesign, since the maquettes' existing navy/amber design system is the
thing being reviewed. Rewrote every internal cross-link (nav, CTAs, "back to
overview") from relative filenames to the real published URLs in a second
publish pass, so the prototype is click-through-able exactly as designed —
clicking "Book Now" on the homepage artifact lands on the actual booking
artifact, etc.

**Links (private — share from each page's share menu when ready for the
actual owner to review):**
- Overview (start here): https://claude.ai/code/artifact/fa7e8a50-4577-4c4e-aa70-af61d23031c4
- Homepage: https://claude.ai/code/artifact/67d8686c-112d-4452-9dad-bad332740ed1
- Packages: https://claude.ai/code/artifact/bd361f50-8c07-47bf-8b82-44e597393ef4
- Booking flow: https://claude.ai/code/artifact/f80a427f-85ec-4208-b081-cca41aba4279
- Student dashboard: https://claude.ai/code/artifact/d87598d8-52cb-4b33-bcd2-4de5cb781172
- Quiz: https://claude.ai/code/artifact/d6c4ef47-b9a6-44f3-ba11-0e14be493ead
- Admin dashboard: https://claude.ai/code/artifact/d2a3b613-4d6a-431e-a1b8-ae994dc1aea9

**Verification:** confirmed all 7 publish calls succeeded and the overview
URL returns HTTP 200. Full interactive click-through wasn't verifiable from
this sandbox's headless Chrome, since Artifacts are private and require the
owner's logged-in session — that check falls to whoever opens the links.
Cross-link rewriting itself was verified locally before publishing (exact
count of relative hrefs replaced, checked per file).

**Phase 0 status:** all dev work complete. The only remaining step is the
actual human review/approval of the links above — this sitrep entry is the
handoff point.

**Sharing note:** Artifacts publish private by default — a private/incognito
browser (no session) initially got "Page not found" on the overview link.
Fixed by setting "Anyone with the link" via that page's share menu, confirmed
working in a private browser afterward. Each of the 7 published pages is a
*separate* artifact with its own independent share setting — sharing the
overview does not cascade to the 6 screens it links to. Owner needs to
confirm all 7 are set to "Anyone with the link" before the full click-through
review works end to end, not just the overview.

**ngrok tunnel decommissioned:** the maquettes had previously been exposed
for owner review via an ngrok tunnel (`https://croak-unlimited-harmony.ngrok-free.dev`
→ local `:8642`, running since 2026-07-30, 124 recorded connections — real
usage). With the maquettes now published as Artifact links above, that
tunnel is redundant. Stopped the ngrok process; the local server on `:8642`
was left running untouched, just no longer publicly reachable. If Phase 1
needs remote access to a local dev server again, ngrok (or a proper Vercel
staging deploy — already the plan per `Claude.md`'s deployment notes) will
need to be brought back at that point.

---

## Phase 1 — Foundation

### 2026-08-27 — Scaffold, schema, auth: AGENT 1 + 2 + 3

**Context:** Owner made one content change to the maquettes first (package
cards: practical lessons no longer included, packages are theory-only —
applied across `01-homepage.html` and `02-packages.html`), confirmed Phase 0
was done, and had that committed (`2a556de`) and pushed before Phase 1
started.

**AGENT 1 — Scaffold & config:** `excellent-driving/` created with
`create-next-app` — Next.js 16 (App Router, Turbopack), TypeScript, Tailwind
v4. Deviations from the literal `Claude.md` spec, made deliberately since
the spec pins versions/libraries that have moved on:
- Next.js 14 → 16 (14 is EOL-adjacent; App Router API is the same shape).
- `next-i18next` → `next-intl` swapped in as a dependency only — not wired
  up yet. `next-i18next` targets the Pages Router; App Router needs
  `next-intl` or equivalent. Full i18n wiring is still AGENT 8 (Phase 3).
- `prisma`/`@prisma/client` pinned to **6.19.3**, not latest. Prisma 7 (the
  `latest` npm tag) removed schema-file `url = env("DATABASE_URL")` in favor
  of a driver-adapter pattern requiring `prisma.config.ts` — a bigger
  architecture change than this phase needed. 6.x keeps the classic,
  widely-documented flow the rest of the spec assumes.
- `next-auth` stayed on stable v4 (`^4.24.15`), not the v5/Auth.js beta —
  the spec's described API (`CredentialsProvider`, `middleware.ts`, Prisma
  adapter) is v4-shaped.
- Brand theme (navy `#0F1F3D` / amber `#F5A623`, Sora + Inter fonts) pulled
  from the maquettes' actual CSS, not re-derived from `Claude.md`'s prose
  description, so Phase 2 pages match pixel-for-pixel later.
- Folder structure follows `Claude.md`'s architecture tree: route groups
  `(public)`, `(auth)`, `(student)`, `(admin)`, plus `api/`, `components/`,
  `lib/`, `prisma/`, `types/`.

**AGENT 2 — DB schema:** Full `prisma/schema.prisma` — every model from the
spec (User, Package, Booking, Instructor, Schedule, Module, Lesson,
StudentProgress, FAQ) plus NextAuth's required Account/Session/
VerificationToken models, merged into the same schema. `prisma/seed.ts`
creates 1 admin (`admin@excellentdriving.sr` / `ChangeMe123!`), 1 instructor
with a Mon–Sat schedule, 1 package (`lessonCount: 0`, reflecting the
theory-only pivot from the maquette change above), and FAQ rows in both
languages.

**AGENT 3 — Auth:** NextAuth Credentials provider (bcrypt, JWT sessions,
Prisma adapter), `/api/register`, real `/login` and `/register` forms.
Route protection via `proxy.ts` — Next.js 16 renamed the `middleware.ts`
convention; used the new name from the start rather than shipping on a
deprecated one. Protects `/student/*`, `/admin/*`, `/booking/*` and checks
role, not just "is logged in."

**Database setup (this session, interactively):** No passwordless `sudo` in
this sandbox, so Postgres install and role/db creation needed the owner to
run commands directly (`sudo -u postgres psql ...`) in a separate terminal —
walked through in three round trips: install postgres, create the
`excellent_driving` role + database, then grant it `CREATEDB` (needed for
Prisma's migrate-dev shadow database). `DATABASE_URL` lives in **two**
files: `.env` (Prisma CLI only reads `.env`, not `.env.local`) and
`.env.local` (what Next.js actually reads at runtime) — both gitignored,
kept in sync manually.

**Verification (live, not just `npm run build`):** hit a real bug mid-session
— an old `next dev` process from an earlier, aborted server start had
survived a `kill` and kept serving port 3000 with stale (placeholder)
DB credentials, silently shadowing the freshly-configured one. Caught via
Playwright driving the login/register flow and seeing an unexpected 401,
traced through `/tmp/nextdev.log`, fixed by hard-killing all `next`-related
processes and restarting clean. After that: registered a new student
end-to-end (auto-login → lands on `/student/dashboard` with correct
name/role), logged in as the seeded admin (→ `/admin/dashboard`), and
confirmed the admin account is correctly *blocked* from `/student/dashboard`
(redirected to `/login`) — proving the route guard checks role, not just
session presence.

**Committed:** `19f0c03` (scaffold + schema + auth) and `4f81e72` (initial
migration, generated and applied against the real local Postgres — not
committed until it had actually been run against a live database). Not yet
pushed — pending owner confirmation per session convention.

**Still open before Phase 1 can be called done:**
1. All 12 non-index public/student/admin/booking pages are placeholder stubs
   marked "AGENT 4/5/6/7, Phase 2/3" — real page content comes later, on
   schedule per the build order, not a gap in this phase.
2. i18n is dependency-installed only (`next-intl`), not wired up — AGENT 8,
   Phase 3.
3. WhatsApp/Resend integrations untouched — AGENT 9, Phase 3.

---

## Phase 2 — Core Features (not started)

## Phase 3 — Admin + Integrations (not started)

## Phase 4 — QA (not started)

---

## End-to-end overview

*(To be filled in once all phases are complete — full start-to-finish summary
of what was built, key decisions made along the way, and how the final app
maps back to the original brief.)*
