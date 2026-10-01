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
  retries: 0,
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
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
