import { test, expect } from "@playwright/test";
import { loginAsAdmin, registerStudent, uniqueEmail } from "./helpers";

/**
 * Claude.md AGENT 10 scenario: "Admin creates package -> student can see
 * it." This is a real regression test, not a hypothetical: exercising
 * exactly this flow during Phase 3 development caught a genuine bug
 * where the public /packages page hard-crashed for any package outside
 * a hardcoded four-name lookup table, because nothing had previously
 * created a package through the admin UI. See the AGENT 7 commit
 * message for the fix. Deactivates the package it creates at the end so
 * repeated runs don't accumulate test data.
 *
 * Each browser context is closed as soon as its assertions are done
 * rather than held open until the end — this test opens four contexts
 * in sequence, and running them concurrently was enough to exhaust this
 * dev sandbox's memory and hang the run.
 */
test("a package created in the admin panel appears correctly on the public site and in booking", async ({ browser }) => {
  const packageName = `E2E Test Package ${Date.now()}`;

  await test.step("admin creates the package", async () => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAsAdmin(adminPage);

    await adminPage.goto("/admin/packages", { waitUntil: "networkidle" });
    await adminPage.getByRole("button", { name: "+ Add Package" }).click();
    await adminPage.locator("#pkg-name-en").fill(packageName);
    await adminPage.locator("#pkg-name-nl").fill(packageName);
    await adminPage.locator("#pkg-desc-en").fill("Created by the automated E2E suite.");
    await adminPage.locator("#pkg-desc-nl").fill("Created by the automated E2E suite.");
    await adminPage.locator("#pkg-price").fill("4200");
    await adminPage.locator("#pkg-lessons").fill("0");

    const [createRes] = await Promise.all([
      adminPage.waitForResponse((r) => r.url().includes("/api/admin/packages") && r.request().method() === "POST"),
      adminPage.getByRole("button", { name: "Save Package" }).click(),
    ]);
    expect(createRes.status()).toBe(201);
    await adminContext.close();
  });

  await test.step("an unauthenticated visitor sees it without the page crashing", async () => {
    const visitorContext = await browser.newContext();
    const visitorPage = await visitorContext.newPage();
    await visitorPage.goto("/packages", { waitUntil: "networkidle" });
    await expect(visitorPage.locator("body")).toContainText(packageName);
    await visitorContext.close();
  });

  await test.step("a logged-in student can select it in the booking wizard", async () => {
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();
    await registerStudent(studentPage, "Package Visibility Test", uniqueEmail("e2e-pkg-visible"));
    await studentPage.goto("/booking", { waitUntil: "networkidle" });
    await expect(studentPage.locator("body")).toContainText(packageName);
    await studentContext.close();
  });

  await test.step("teardown: deactivate the test package", async () => {
    const cleanupContext = await browser.newContext();
    const cleanupPage = await cleanupContext.newPage();
    await loginAsAdmin(cleanupPage);
    await cleanupPage.goto("/admin/packages", { waitUntil: "networkidle" });
    const row = cleanupPage.locator("tr", { hasText: packageName });
    await row.getByRole("button", { name: "Deactivate" }).click();
    await cleanupContext.close();
  });
});
