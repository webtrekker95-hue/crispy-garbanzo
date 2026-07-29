import pathlib
from playwright.sync_api import sync_playwright

base = pathlib.Path(__file__).with_name("05-quiz.html").as_uri()
errs, results = [], []
def check(label, cond, detail=""):
    results.append((label, bool(cond), detail))

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.on("console", lambda m: errs.append(f"{m.type}: {m.text}") if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: errs.append(f"pageerror: {e}"))

    # --- default load: timer leak + demo hidden on score screen ---
    pg.goto(base, wait_until="networkidle")
    pg.wait_for_timeout(300)
    pg.evaluate("startQuiz()")
    pg.wait_for_timeout(1200)
    running_text = pg.inner_text("#timer")
    check("Timer running during quiz", "Done" not in running_text and ":" in running_text, running_text)
    pg.evaluate("submitQuiz()")  # -> score screen active
    pg.wait_for_timeout(200)
    t1 = pg.inner_text("#timer")
    pg.wait_for_timeout(1600)  # if interval still alive it would overwrite 'Done'
    t2 = pg.inner_text("#timer")
    check("Timer shows Done on submit", "Done" in t1, t1)
    check("Timer stays stopped after submit (no leak)", "Done" in t2, t2)
    check("Demo button hidden on score screen by default", not pg.locator("#demo-toggle").is_visible())

    # --- ?demo load: button visible once on score screen ---
    pg.goto(base + "?demo", wait_until="networkidle")
    pg.wait_for_timeout(300)
    pg.evaluate("startQuiz(); submitQuiz();")  # navigate to score screen
    pg.wait_for_timeout(300)
    check("Demo button visible on score screen with ?demo", pg.locator("#demo-toggle").is_visible())

    b.close()

print("-" * 60)
allpass = True
for label, ok, detail in results:
    print(f"[{'PASS' if ok else 'FAIL'}] {label}" + (f"  -> {detail}" if not ok else ""))
    allpass = allpass and ok
print("-" * 60)
print("Console errors/warnings:", errs if errs else "NONE")
print("RESULT:", "ALL PASS" if allpass and not errs else "SEE ABOVE")
