import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * Some sandboxes have no internet access for Playwright's own browser
 * downloads, so tests prefer a system Chromium when one is installed
 * (see .claude/skills/run). Set PLAYWRIGHT_CHROMIUM_PATH to point at a
 * different binary; with neither, Playwright's managed browser is used
 * (`npx playwright install chromium`).
 */
const systemChromium = "/usr/bin/chromium";
const chromiumPath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ?? (existsSync(systemChromium) ? systemChromium : undefined);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: chromiumPath,
      args: ["--no-sandbox"],
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Tests run against a production build: `next dev` restarts itself when it
  // nears its memory limit ("Server is approaching the used memory threshold,
  // restarting..."), which drops whatever request a test has in flight.
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
