---
description: Serve and browser-drive the Excellent Driving maquettes (and, later, the real Next.js app) using the locally installed Chromium + Playwright-core. Use whenever asked to run, screenshot, or verify a change in this project.
---

# Running this project

## Current phase: static maquettes (`/maquettes/*.html`)

No build step. Serve the directory and drive it with a small Playwright
script — `chromium-cli` is not installed in this environment, so don't look
for it; this is the working fallback.

### Serve

```bash
cd /home/demo/STEVEN_EXCELLENT_DRIVING/maquettes
lsof -ti:8765 -sTCP:LISTEN | xargs -r kill 2>/dev/null
nohup python3 -m http.server 8765 > /tmp/http.log 2>&1 &
disown
timeout 15 bash -c 'until curl -sf http://localhost:8765 >/dev/null; do sleep 0.5; done'
```

Stop with the same `lsof -ti:8765 ... | xargs -r kill` line before relaunching.

### Drive

Installed: system `nodejs`/`npm`, `chromium` (binary at `/usr/bin/chromium`),
and `playwright-core` installed **globally** (not locally per-project) via
`sudo npm install -g playwright-core`. Because it's global, every script
needs `NODE_PATH` set to the global root or `require()` fails:

```bash
export NODE_PATH=$(npm root -g)
node your-script.js
```

Script template — write one per verification task (there's no persistent
REPL set up; see gotcha below if that'd help):

```js
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.goto('http://localhost:8765/06-admin-dashboard.html');
  await page.waitForSelector('.tabs');
  await page.click('#tab-bookings');
  await page.screenshot({ path: '/path/to/scratchpad/out.png' });
  console.log('errors:', errors);

  await browser.close();
})();
```

### One representative interaction (proven working 2026-08-18)

Admin dashboard tabs: `page.click('#tab-bookings')` then
`page.isVisible('#panel-bookings')` → `true` and `#panel-overview` → `false`.
Modal focus trap: open via the "Confirm Pay" button, Tab 10x and confirm
`document.activeElement` stays inside `#modal-confirm .modal`, `Escape`
closes it and returns focus to the trigger button. Both verified live.

### Gotchas

- **No emoji font in this container.** Icon emoji (🔍, 🏠, 📅, etc.) render
  as empty tofu boxes in screenshots. This is a rendering-environment gap,
  not an app bug — don't file it as a regression. Install
  `fonts-noto-color-emoji` via apt if accurate emoji screenshots are needed.
- **`playwright-core` is global, not local** — always `export NODE_PATH=$(npm root -g)`
  before running a driver script, or every `require('playwright-core')` fails
  with `MODULE_NOT_FOUND`.
- **`--no-sandbox` is required** — this container has no user namespaces set
  up for Chromium's sandbox; omitting the flag makes `launch()` hang/crash.
- Static HTML pages navigated directly as `file://` mostly work too, but some
  relative asset/font loads behave oddly without an HTTP server — prefer the
  `http.server` approach above.

## Later phases: real Next.js app

Once Phase 1 scaffolds the actual app (see `Claude.md` / `SITREP.md`), this
section should be replaced with the real dev command (`npm run dev`, likely
port 3000) and the same Playwright driving approach adapted to a live app
with auth, following the same NODE_PATH / executablePath pattern above.
