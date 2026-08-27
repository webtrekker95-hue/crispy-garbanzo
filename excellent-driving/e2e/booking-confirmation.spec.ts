import { test, expect } from "@playwright/test";
import { registerStudent, uniqueEmail } from "./helpers";

/**
 * Claude.md AGENT 10 scenario: "Book a lesson -> receive WhatsApp
 * confirmation (mock)."
 *
 * The WhatsApp send itself happens server-side (Next.js API route ->
 * Meta Graph API), so it isn't something a browser-level Playwright test
 * can intercept or observe — there's no outbound request from the page
 * to mock. What this test verifies instead is the observable half of
 * that contract: booking succeeds and the confirmation the student sees
 * has the right details, which is exactly what triggers the
 * notification server-side. The notification dispatch logic itself
 * (WhatsApp -> email fallback, both configured/unconfigured, success
 * and failure) is covered separately and directly in
 * lib/__tests__/whatsapp.test.ts with a mocked fetch/Resend, since that
 * is where it's actually observable without a live Meta Business account.
 */
test("booking a lesson shows a correct confirmation (proxy for the server-side notification firing)", async ({ page }) => {
  const email = uniqueEmail("e2e-booking");
  await registerStudent(page, "Booking Confirm Test", email);

  await page.goto("/booking", { waitUntil: "networkidle" });

  const packageCards = page.locator('[role="button"][class*="pkg-option"]');
  const packageName = (await packageCards.nth(1).locator('[class*="pkg-opt-name"]').textContent())?.trim();
  await packageCards.nth(1).click();
  await page.getByRole("button", { name: "Continue →" }).click();

  const instructorCards = page.locator('[role="button"][class*="instructor-option"]');
  const instructorName = (await instructorCards.first().locator('[class*="inst-name"]').textContent())?.trim();
  await instructorCards.first().click();
  await page.getByRole("button", { name: "Continue →" }).click();

  await page.locator('[class*="cal-day"][class*="available"]').first().click();
  await page.getByRole("button", { name: "Continue →" }).click();
  await page.waitForTimeout(500);

  const slotButton = page.locator('button[class*="time-slot"]:not([class*="booked"])').first();
  const timeSlot = (await slotButton.textContent())?.trim();
  await slotButton.click();
  await page.getByRole("button", { name: "Continue →" }).click();

  await page.locator('[class*="pay-name"]', { hasText: "Bank Transfer" }).click();
  await page.getByRole("button", { name: /Confirm Booking/ }).click();

  await expect(page.getByText("Booking Confirmed!")).toBeVisible({ timeout: 10_000 });
  const details = page.locator('[class*="confirm-details"]');
  await expect(details).toContainText(packageName!);
  await expect(details).toContainText(instructorName!);
  await expect(details).toContainText(timeSlot!);
  await expect(details).toContainText("Pending Payment");
});
