# Phase 4 QA — Excellent Driving

Per `Claude.md`'s AGENT 10 scope. This document records what was tested,
how, and the outcome — not just a checklist of intentions.

## Automated test suites

Two permanent, checked-in suites (distinct from the many one-off
Playwright scripts used to verify Phases 1-3 live, which were scratch
tooling and discarded):

```bash
npm test          # Jest unit tests — 48 tests, 4 suites
npm run test:e2e  # Playwright E2E — 3 scenarios, matching Claude.md exactly
```

### Unit tests (`lib/__tests__/`)

| File | Covers |
|---|---|
| `quiz.test.ts` | Quiz pass/fail scoring — perfect score, zero score, right at/below the passing threshold, custom passing scores, unanswered questions treated as wrong (not a crash), zero-question edge case, extra answers ignored. |
| `slots.test.ts` | Booking slot availability — day-of-week mapping, slot-label format/parse round-trip, hourly slot generation across full/short/exact-fit schedule windows. |
| `route-guard.test.ts` | Auth middleware role checks — ADMIN/STUDENT/unauthenticated against `/admin` and `/student`, nested sub-paths, unrelated paths left alone. |
| `whatsapp.test.ts` | WhatsApp → email notification fallback chain, with `fetch` and the `resend` package mocked — success on WhatsApp (email never touched), fallback when unconfigured, fallback when the API call itself fails, no-phone-on-file case, both-channels-unavailable case (never throws), template interpolation. |

`quiz.ts` and `route-guard.ts` were extracted from inline logic in the
progress API route and `proxy.ts` specifically to make this suite
possible — see the Phase 4 SITREP entry.

### E2E tests (`e2e/`), matching Claude.md's three scenarios exactly

1. **`student-onboarding.spec.ts`** — register → book a package → course
   content (My Lessons) is visible with Module 1 unlocked.
2. **`booking-confirmation.spec.ts`** — book a lesson → confirmation
   shows the correct package/instructor/time/status. The actual
   WhatsApp send happens server-side (Next.js API route → Meta Graph
   API), so there's no outbound browser request to intercept — the
   fallback-chain logic itself is what `whatsapp.test.ts` verifies
   directly; this test verifies the client-observable half of the same
   contract.
3. **`admin-creates-package.spec.ts`** — admin creates a package → an
   unauthenticated visitor sees it on `/packages` without the page
   crashing → a logged-in student can select it in the booking wizard.
   **This is a real regression test**, not a hypothetical: running
   exactly this flow during Phase 3 caught a genuine crash bug (see
   below). Deactivates the package it creates so repeat runs don't
   accumulate data.

Run against the local dev Postgres DB (no separate test database is set
up) — a known simplification for a project this size, not a production
practice. Each test cleans up the data it creates.

## Bugs found and fixed via this phase's testing

None of these were caught by `npm run build` or TypeScript — all found
by actually driving the app.

1. **Public `/packages` page crashed for any admin-created package**
   outside a hardcoded four-name lookup (`packages-grid.tsx`, from
   Phase 2, first actually exercised with a real admin-created package
   in Phase 3). Fixed with a generic fallback derived from real fields.
2. **`/admin/students` N+1 query** — a 2-query unlock-state function
   called once per student; crashed the dev server outright with 15
   accumulated test students. Fixed to 3 bulk queries total.
3. **Mobile nav overflow on every public page** — `.nav-actions`
   (language switcher + Login + Book Now) had no mobile treatment at
   all and rendered alongside the hamburger button, overflowing the
   viewport (375px viewport rendered at 462px). Pre-existing in the
   maquette itself, never caught because Phase 0's accessibility pass
   didn't include a mobile-viewport visual check. Fixed by folding both
   into one collapsible mobile panel.
4. **Mobile overflow on the student dashboard** (400px vs 375px) — a
   classic CSS Grid bug: `grid-template-columns: 1fr` doesn't let a
   track shrink below its content's min-content width even after the
   breakpoint collapses to one column, because bare `1fr` is
   `minmax(auto, 1fr)`. Fixed by using `minmax(0, 1fr)` on the
   dashboard's stat/content grids. (Checked all other
   `grid-template-columns` declarations app-wide by actually testing
   each page at 375px rather than patching speculatively — every other
   page was already clean.)
5. **Two WCAG AA contrast failures**, found by computing actual
   luminance-based contrast ratios for the repeated color pairs used
   throughout, not by eyeballing: `--amber-dark` (2.48:1) used directly
   as small text color in ~8 places (card links, instructor experience
   labels, quiz question badges), and the green badge/pill text
   `#059669` on its own tinted background (3.43:1, e.g. "✓ Confirmed").
   Both inherited unchanged from the maquette's original design tokens.
   Fixed with a new `--amber-text` token (darker, same hue, 4.75:1) for
   the first and `#047857` (already used elsewhere in the app, 4.99:1)
   for the second — without touching `--amber-dark` itself, since its
   other use (button hover backgrounds) wasn't broken.
6. **Missing accessible names** on several form inputs added during
   Phase 3: the admin quiz-builder's answer-option text inputs (had a
   placeholder only, not a real accessible name), the instructor
   schedule editor's per-day start/end time inputs, and the students
   search bar. Fixed with `aria-label`.

## Manual QA checklist (Claude.md)

| Item | Result |
|---|---|
| Mobile responsiveness on all pages | Tested every public page, booking wizard, student dashboard/learn/quiz/bookings/profile, and admin dashboard at a 375×812 viewport, checking `scrollWidth` vs `clientWidth` (not just eyeballing a screenshot). Two real bugs found and fixed (#3, #4 above); everything else was already clean. |
| Language switch EN ↔ NL works correctly | Verified: default English with no preference, automatic Dutch for `Accept-Language: nl` on first visit, same-page re-render within 500ms of clicking NL (measured, not guessed), persistence across navigation and to a logged-in user's `User.language` row. Scope is intentionally partial — see the Phase 3 SITREP entry for which pages translate and why. |
| Quiz: pass unlocks next lesson, fail allows retry | Verified live in Phase 2 and again here: failed a quiz on purpose (wrong answers, correct 0% + FAILED screen), retried and passed (100% + PASSED screen + next lesson unlocked). Also covered by `quiz.test.ts`'s scoring logic directly. |
| Booking: double booking same slot is blocked | Verified live in Phase 2: two students booking the same instructor/date/time — the second sees the slot marked booked and the server transaction re-checks for a clash immediately before insert. |
| Admin: can confirm payment → student gets WhatsApp | Verified the confirm-payment action updates booking status live; the WhatsApp/email dispatch itself is covered directly by `whatsapp.test.ts` (mocked), since no real Meta credentials exist to verify actual delivery. |

## Accessibility

| Item | Result |
|---|---|
| All forms have labels | Audited every file containing `<input>`/`<select>`/`<textarea>` app-wide. Found and fixed three gaps (#6 above); everything else already had proper `<label htmlFor>` or `aria-label`. |
| Color contrast passes WCAG AA | Computed actual WCAG relative-luminance contrast ratios (not visual guessing) for every repeated color pair in the design system, including against their real tinted backgrounds where relevant (not just against plain white). Found and fixed two failures (#5 above). `--gray-400` on white (2.54:1) is used only for disabled/past-date UI, which WCAG 1.4.3 explicitly exempts from the contrast minimum. |
| Keyboard navigable | The booking wizard's custom `role="button"` cards (package/instructor/payment selection, calendar days) all have `tabIndex={0}` and Enter/Space handling, carried forward from the Phase 0 maquette pattern. Admin/student modals use native `<button>`/`<input>`/`<select>` elements throughout, which are keyboard-operable by default. |

## Known limitations (not fixed, by design)

- E2E tests run against the shared local dev database rather than an
  isolated test database — acceptable at this project's current size,
  worth revisiting if the team or test suite grows.
- i18n coverage is intentionally partial (nav/footer/homepage/packages/
  student dashboard) — see the Phase 3 SITREP entry for the reasoning.
- WhatsApp/email delivery can't be verified end-to-end without real
  Meta Business and Resend credentials — the dispatch *logic* is fully
  unit-tested with mocks instead.
