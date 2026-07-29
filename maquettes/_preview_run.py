import os
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8753"
OUT = os.path.join(os.path.dirname(__file__), "_shots")
os.makedirs(OUT, exist_ok=True)

console_errors = {}

def grab(page, name):
    path = os.path.join(OUT, name + ".png")
    page.screenshot(path=path, full_page=True)
    print("  shot:", name)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    errs = []
    page.on("console", lambda m: errs.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: errs.append(f"pageerror: {e}"))

    def go(path):
        errs.clear()
        page.goto(f"{BASE}/{path}", wait_until="networkidle")
        page.wait_for_timeout(400)

    # --- index ---
    go("index.html")
    grab(page, "00-index")
    console_errors["index"] = list(errs)

    # --- homepage: open an FAQ accordion item ---
    go("01-homepage.html")
    grab(page, "01-homepage-top")
    try:
        # FAQ items usually toggle on click; click first faq question if present
        faq = page.locator(".faq-item, .faq-q, [class*=faq]").first
        if faq.count():
            faq.click()
            page.wait_for_timeout(400)
            faq.scroll_into_view_if_needed()
            page.screenshot(path=os.path.join(OUT, "01b-homepage-faq.png"))
            print("  shot: 01b-homepage-faq (clicked FAQ)")
    except Exception as e:
        print("  homepage interaction skipped:", e)
    console_errors["homepage"] = list(errs)

    # --- packages ---
    go("02-packages.html")
    grab(page, "02-packages")
    console_errors["packages"] = list(errs)

    # --- booking: try advancing the wizard ---
    go("03-booking.html")
    grab(page, "03-booking-step1")
    try:
        # click first selectable package card, then a Next/Continue button
        card = page.locator("[onclick*=select], .package-card, .pkg-card, .select-card").first
        if card.count():
            card.click()
            page.wait_for_timeout(300)
        nxt = page.locator("text=/next|continue|volgende/i").first
        if nxt.count():
            nxt.click()
            page.wait_for_timeout(500)
            page.screenshot(path=os.path.join(OUT, "03b-booking-step2.png"))
            print("  shot: 03b-booking-step2 (advanced wizard)")
    except Exception as e:
        print("  booking interaction skipped:", e)
    console_errors["booking"] = list(errs)

    # --- student dashboard ---
    go("04-student-dashboard.html")
    grab(page, "04-student-dashboard")
    console_errors["dashboard"] = list(errs)

    # --- quiz: start quiz, select an answer, check ---
    go("05-quiz.html")
    grab(page, "05-quiz-modules")
    try:
        page.evaluate("typeof startQuiz==='function' && startQuiz()")
        page.wait_for_timeout(600)
        page.screenshot(path=os.path.join(OUT, "05b-quiz-question.png"))
        print("  shot: 05b-quiz-question (started quiz)")
        page.evaluate("typeof selectAns==='function' && selectAns(0)")
        page.wait_for_timeout(300)
        page.evaluate("typeof checkAnswer==='function' && checkAnswer()")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUT, "05c-quiz-checked.png"))
        print("  shot: 05c-quiz-checked (answer checked)")
        # jump to score screen via demo toggle if present
        page.evaluate("typeof toggleScore==='function' && toggleScore()")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUT, "05d-quiz-score.png"))
        print("  shot: 05d-quiz-score")
    except Exception as e:
        print("  quiz interaction skipped:", e)
    console_errors["quiz"] = list(errs)

    # --- admin: open a modal if available ---
    go("06-admin-dashboard.html")
    grab(page, "06-admin-dashboard")
    try:
        modalbtn = page.locator("[onclick*=odal], [onclick*=confirm], button:has-text('Confirm')").first
        if modalbtn.count():
            modalbtn.click()
            page.wait_for_timeout(400)
            page.screenshot(path=os.path.join(OUT, "06b-admin-modal.png"))
            print("  shot: 06b-admin-modal (opened modal)")
    except Exception as e:
        print("  admin interaction skipped:", e)
    console_errors["admin"] = list(errs)

    browser.close()

print("\n=== CONSOLE ERRORS / WARNINGS ===")
any_err = False
for k, v in console_errors.items():
    if v:
        any_err = True
        print(f"[{k}]")
        for line in v:
            print("   ", line)
if not any_err:
    print("None — all pages clean.")
