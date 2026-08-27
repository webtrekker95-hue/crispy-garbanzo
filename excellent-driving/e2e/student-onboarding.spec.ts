import { test, expect } from "@playwright/test";
import { registerStudent, uniqueEmail } from "./helpers";

/**
 * Claude.md AGENT 10 scenario: "Register as student -> buy package ->
 * see course content." There's no separate "purchase" step in this app —
 * booking a package via the booking wizard is how a student commits to
 * one — so this walks register -> book a package -> confirm course
 * content (My Lessons) is reachable and starts unlocked.
 */
test("register, book a package, and see course content unlocked", async ({ page }) => {
  const email = uniqueEmail("e2e-onboard");
  await registerStudent(page, "Onboarding Test", email);

  await expect(page.locator('[class*="welcome-title"]')).toContainText("Onboarding");

  await page.goto("/booking", { waitUntil: "networkidle" });
  await page.locator('[role="button"][class*="pkg-option"]').first().click();
  await page.getByRole("button", { name: "Continue →" }).click();
  await page.locator('[role="button"][class*="instructor-option"]').first().click();
  await page.getByRole("button", { name: "Continue →" }).click();
  await page.locator('[class*="cal-day"][class*="available"]').first().click();
  await page.getByRole("button", { name: "Continue →" }).click();
  await page.waitForTimeout(500);
  await page.locator('button[class*="time-slot"]:not([class*="booked"])').first().click();
  await page.getByRole("button", { name: "Continue →" }).click();
  await page.getByRole("button", { name: /Confirm Booking/ }).click();
  await expect(page.getByText("Booking Confirmed!")).toBeVisible({ timeout: 10_000 });

  // Course content: Module 1 should be immediately visible and unlocked
  // for a freshly registered (and now enrolled) student.
  await page.goto("/student/learn", { waitUntil: "networkidle" });
  const unlockedModules = page.locator('a[class*="module-card"]');
  await expect(unlockedModules).toHaveCount(1);
  await expect(unlockedModules.first()).toContainText("Module 1");
});
