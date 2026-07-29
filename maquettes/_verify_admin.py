import pathlib
from playwright.sync_api import sync_playwright

url = pathlib.Path(__file__).with_name("06-admin-dashboard.html").as_uri()
errs, results = [], []
def check(label, cond, detail=""):
    results.append((label, bool(cond), detail))

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1366, "height": 900})
    pg.on("console", lambda m: errs.append(f"{m.type}: {m.text}") if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: errs.append(f"pageerror: {e}"))
    pg.goto(url, wait_until="networkidle")
    pg.wait_for_timeout(300)

    # Confirm-pay from pending queue: Stefan Bakker (was hardcoded Kevin)
    pg.locator('.payment-item:has-text("Stefan Bakker") button.btn-success').click()
    pg.wait_for_timeout(200)
    check("Confirm modal shows clicked student (Stefan)", pg.inner_text("#cf-student") == "Stefan Bakker", pg.inner_text("#cf-student"))
    check("Confirm modal amount matches (SRD 2,000)", pg.inner_text("#cf-amount") == "SRD 2,000", pg.inner_text("#cf-amount"))
    check("Confirm modal visible", pg.locator("#modal-confirm.open").count() == 1)
    # close it (click overlay)
    pg.evaluate("document.getElementById('modal-confirm').classList.remove('open')")
    pg.wait_for_timeout(150)

    # Confirm-pay from pending queue: Marco Fong
    pg.locator('.payment-item:has-text("Marco Fong") button.btn-success').click()
    pg.wait_for_timeout(200)
    check("Confirm modal shows Marco Fong", pg.inner_text("#cf-student") == "Marco Fong", pg.inner_text("#cf-student"))
    check("Confirm modal pkg (Premium)", "Premium" in pg.inner_text("#cf-package"), pg.inner_text("#cf-package"))
    pg.evaluate("document.getElementById('modal-confirm').classList.remove('open')")
    pg.wait_for_timeout(150)

    # Cancel button that previously had NO handler: Reina Pansa row
    pg.locator('tr:has-text("Reina Pansa") button.btn-danger').click()
    pg.wait_for_timeout(200)
    check("Cancel modal opens for previously-dead button", pg.locator("#modal-cancel.open").count() == 1)
    check("Cancel modal shows Reina Pansa", pg.inner_text("#cx-student") == "Reina Pansa", pg.inner_text("#cx-student"))
    check("Cancel modal instructor (Roy Apensa)", pg.inner_text("#cx-inst") == "Roy Apensa", pg.inner_text("#cx-inst"))
    pg.screenshot(path=str(pathlib.Path(__file__).with_name("_shots") / "fix-admin-cancel-modal.png"))
    b.close()

print("-" * 60)
allpass = True
for label, ok, detail in results:
    print(f"[{'PASS' if ok else 'FAIL'}] {label}" + (f"  -> {detail}" if not ok else ""))
    allpass = allpass and ok
print("-" * 60)
print("Console errors/warnings:", errs if errs else "NONE")
print("RESULT:", "ALL PASS" if allpass and not errs else "SEE ABOVE")
