import pathlib, datetime
from playwright.sync_api import sync_playwright

url = pathlib.Path(__file__).with_name("03-booking.html").as_uri()
now = datetime.datetime.now()
expected_month = now.strftime("%B %Y")  # e.g. "June 2026"

errs = []
results = []
def check(label, cond, detail=""):
    results.append((label, bool(cond), detail))

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.on("console", lambda m: errs.append(f"{m.type}: {m.text}") if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: errs.append(f"pageerror: {e}"))
    pg.goto(url, wait_until="networkidle")
    pg.wait_for_timeout(300)

    # 1) calendar shows current month, not May 2025
    pg.evaluate("goStep(3)")
    pg.wait_for_timeout(200)
    label = pg.inner_text("#cal-month-label")
    check("Calendar shows current month", label == expected_month, f"got '{label}', expected '{expected_month}'")

    # 2) package selection updates summary
    pg.evaluate("goStep(1)")
    pg.locator('.pkg-option[data-name="Premium"]').click()
    pg.wait_for_timeout(150)
    check("Package name updates", pg.inner_text("#sum-pkg") == "Premium", pg.inner_text("#sum-pkg"))
    check("Total price updates", pg.inner_text("#sum-total") == "SRD 3,200", pg.inner_text("#sum-total"))

    # 3) instructor selection updates summary + subtitle
    pg.evaluate("goStep(2)")
    pg.locator('.instructor-option[data-name="Roy Apensa"]').click()
    pg.wait_for_timeout(150)
    check("Instructor name updates", pg.inner_text("#sum-inst") == "Roy Apensa", pg.inner_text("#sum-inst"))
    sub = pg.inner_text("#slot-subtitle")
    check("Slot subtitle names instructor", "Roy Apensa" in sub, sub)

    # 4) date selection updates summary + subtitle (no 'Not selected')
    pg.evaluate("goStep(3)")
    first_day = pg.locator(".cal-day.available").first
    day_txt = first_day.inner_text()
    first_day.click()
    pg.wait_for_timeout(150)
    sd = pg.inner_text("#sum-date")
    check("Date no longer 'Not selected'", sd != "Not selected" and sd.strip() != "", sd)
    sub2 = pg.inner_text("#slot-subtitle")
    check("Subtitle has instructor + date (no 'Not selected')", ("Roy Apensa" in sub2 and " on " in sub2 and "Not selected" not in sub2), sub2)

    # 5) payment updates
    pg.evaluate("goStep(5)")
    pg.locator('.pay-option[data-name="Bank Transfer"]').click()
    pg.wait_for_timeout(150)
    check("Payment updates", pg.inner_text("#sum-pay") == "Bank Transfer", pg.inner_text("#sum-pay"))

    pg.evaluate("goStep(3)")
    pg.wait_for_timeout(200)
    pg.screenshot(path=str(pathlib.Path(__file__).with_name("_shots") / "fix-booking-calendar.png"), full_page=True)
    b.close()

print("Expected current month:", expected_month)
print("-" * 60)
allpass = True
for label, ok, detail in results:
    print(f"[{'PASS' if ok else 'FAIL'}] {label}" + (f"  -> {detail}" if not ok else ""))
    allpass = allpass and ok
print("-" * 60)
print("Console errors/warnings:", errs if errs else "NONE")
print("RESULT:", "ALL PASS" if allpass and not errs else "SEE ABOVE")
