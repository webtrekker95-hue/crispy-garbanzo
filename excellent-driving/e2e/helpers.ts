import { Page } from "@playwright/test";

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

export async function registerStudent(page: Page, name: string, email: string) {
  await page.goto("/register", { waitUntil: "networkidle" });
  const inputs = await page.$$("input");
  await inputs[0].fill(name);
  await inputs[1].fill(email);
  await inputs[2].fill("555-0100");
  await inputs[3].fill("password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/student/dashboard", { timeout: 10_000 });
}

export async function loginAsAdmin(page: Page) {
  await page.goto("/login", { waitUntil: "networkidle" });
  const inputs = await page.$$("input");
  await inputs[0].fill("admin@excellentdriving.sr");
  await inputs[1].fill("ChangeMe123!");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin/dashboard", { timeout: 10_000 });
}
