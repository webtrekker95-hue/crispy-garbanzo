import pathlib
from playwright.sync_api import sync_playwright

d = pathlib.Path(__file__).parent
results, errs = [], []
def check(label, cond, detail=""):
    results.append((label, bool(cond), detail))
def uri(n): return (d / n).as_uri()

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.on("console", lambda m: errs.append(f"{m.type}: {m.text}") if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: errs.append(f"pageerror: {e}"))

    # --- QUIZ: keyboard-select an answer ---
    pg.goto(uri("05-quiz.html"), wait_until="networkidle"); pg.wait_for_timeout(200)
    pg.evaluate("startQuiz()"); pg.wait_for_timeout(300)
    opt = pg.locator("#opt-2")
    check("Quiz: answer has role=button", opt.get_attribute("role") == "button")
    check("Quiz: answer is focusable (tabindex0)", opt.get_attribute("tabindex") == "0")
    opt.focus(); pg.keyboard.press("Enter"); pg.wait_for_timeout(200)
    check("Quiz: Enter selects the focused answer", "selected" in (opt.get_attribute("class") or ""), opt.get_attribute("class"))

    # --- BOOKING: keyboard-select a package via Space ---
    pg.goto(uri("03-booking.html"), wait_until="networkidle"); pg.wait_for_timeout(200)
    pg.evaluate("goStep(1)")
    prem = pg.locator('.pkg-option[data-name="Premium"]')
    check("Booking: option has role=button", prem.get_attribute("role") == "button")
    prem.focus(); pg.keyboard.press(" "); pg.wait_for_timeout(200)
    check("Booking: Space activates option (summary updates)", pg.inner_text("#sum-pkg") == "Premium", pg.inner_text("#sum-pkg"))
    # calendar day focusable
    pg.evaluate("goStep(3)"); pg.wait_for_timeout(200)
    day = pg.locator(".cal-day.available").first
    check("Booking: calendar day focusable", day.get_attribute("tabindex") == "0" and day.get_attribute("role") == "button")

    # --- HOMEPAGE: keyboard-open an FAQ ---
    pg.goto(uri("01-homepage.html"), wait_until="networkidle"); pg.wait_for_timeout(200)
    faq = pg.locator(".faq-item:not(.open) .faq-q").first
    check("Home: FAQ question has role=button", faq.get_attribute("role") == "button")
    faq.focus(); pg.keyboard.press("Enter"); pg.wait_for_timeout(200)
    opened = pg.evaluate("document.activeElement.closest('.faq-item').classList.contains('open')")
    check("Home: Enter opens focused FAQ", opened)

    # --- DASHBOARD / ADMIN: nav emoji hidden from screen readers ---
    pg.goto(uri("04-student-dashboard.html"), wait_until="networkidle"); pg.wait_for_timeout(200)
    total = pg.locator(".nav-icon").count()
    hidden = pg.locator('.nav-icon[aria-hidden="true"]').count()
    check("Dash: all nav emoji aria-hidden", total > 0 and total == hidden, f"{hidden}/{total}")
    check("Dash: nav items keyboard-operable", pg.locator('.nav-item[role="button"][tabindex="0"]').count() == pg.locator(".nav-item").count())

    pg.goto(uri("06-admin-dashboard.html"), wait_until="networkidle"); pg.wait_for_timeout(200)
    total = pg.locator(".nav-icon").count()
    hidden = pg.locator('.nav-icon[aria-hidden="true"]').count()
    check("Admin: all nav emoji aria-hidden", total > 0 and total == hidden, f"{hidden}/{total}")
    check("Admin: nav links keyboard-operable", pg.locator('.nav-link[role="button"][tabindex="0"]').count() == pg.locator(".nav-link").count())

    b.close()

print("-" * 60)
allpass = True
for label, ok, detail in results:
    print(f"[{'PASS' if ok else 'FAIL'}] {label}" + (f"  -> {detail}" if not ok else ""))
    allpass = allpass and ok
print("-" * 60)
print("Console errors/warnings:", errs if errs else "NONE")
print("RESULT:", "ALL PASS" if allpass and not errs else "SEE ABOVE")
