import { Browser, Page, expect } from "@playwright/test";

// The suite runs against `next dev`, which compiles each page and API
// route the first time it is hit; that alone can take longer than 10s.
export const SLOW_STEP_TIMEOUT = 30_000;

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

/**
 * Fills the page's text inputs in order. The auth forms are controlled
 * React inputs, so anything typed before hydration finishes is reset to
 * empty and the submit is then blocked by the `required` check. Wait for
 * React to attach to the form first, and re-fill if a value was lost.
 */
async function fillAuthForm(page: Page, values: string[]) {
  await page.waitForFunction(
    () => {
      const button = document.querySelector('button[type="submit"]');
      return !!button && Object.keys(button).some((key) => key.startsWith("__reactProps"));
    },
    undefined,
    { timeout: SLOW_STEP_TIMEOUT }
  );
  const inputs = page.locator("input");
  await expect(async () => {
    for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i]);
    for (let i = 0; i < values.length; i++) await expect(inputs.nth(i)).toHaveValue(values[i], { timeout: 1_000 });
  }).toPass({ timeout: SLOW_STEP_TIMEOUT });
}

export async function registerStudent(page: Page, name: string, email: string) {
  await page.goto("/register", { waitUntil: "networkidle" });
  await fillAuthForm(page, [name, email, "555-0100", "password123"]);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/student/dashboard", { timeout: SLOW_STEP_TIMEOUT });
}

export async function loginAsAdmin(page: Page) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await fillAuthForm(page, ["admin@excellentdriving.sr", "ChangeMe123!"]);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin/dashboard", { timeout: SLOW_STEP_TIMEOUT });
}

/**
 * From the booking wizard's date step: walks the available days until one
 * still has a free slot, selects that slot and returns its label. Leaves
 * the wizard on the time-slot step.
 */
export async function pickDayWithFreeSlot(page: Page) {
  const days = page.locator('[class*="cal-day"][class*="available"]');
  const anySlot = page.locator('button[class*="time-slot"]');
  const freeSlot = page.locator('button[class*="time-slot"]:not([class*="booked"])').first();
  const dayCount = await days.count();

  for (let i = 0; i < dayCount; i++) {
    await days.nth(i).click();
    await page.getByRole("button", { name: "Continue →" }).click();
    await anySlot.or(page.getByText("No slots available")).first().waitFor({ timeout: SLOW_STEP_TIMEOUT });

    if ((await freeSlot.count()) > 0) {
      const label = (await freeSlot.textContent())?.trim() ?? "";
      await freeSlot.click();
      return label;
    }
    await page.getByRole("button", { name: "← Back" }).click();
  }
  throw new Error("No free time slot on any available day this month.");
}

/** Clicks Confirm on the payment step, waits for the confirmation screen and returns the new booking's id. */
export async function confirmBooking(page: Page) {
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith("/api/bookings") && r.request().method() === "POST", {
      timeout: SLOW_STEP_TIMEOUT,
    }),
    page.getByRole("button", { name: /Confirm Booking/ }).click(),
  ]);
  expect(res.status()).toBe(201);
  const { booking } = await res.json();
  await expect(page.getByText("Booking Confirmed!")).toBeVisible({ timeout: SLOW_STEP_TIMEOUT });
  return booking.id as string;
}

/**
 * Frees the slot a test booked. Without this every run permanently takes
 * a slot from the first instructor's first available day, and the suite
 * starts failing once that day is full.
 */
export async function cancelBookingAsAdmin(browser: Browser, bookingId: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await loginAsAdmin(page);
  const res = await page.request.patch(`/api/admin/bookings/${bookingId}/cancel`);
  expect(res.ok()).toBe(true);
  await context.close();
}
