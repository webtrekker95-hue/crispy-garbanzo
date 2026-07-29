import pathlib
from playwright.sync_api import sync_playwright

d = pathlib.Path(__file__).parent
results, errs = [], []
def check(label, cond, detail=""):
    results.append((label, bool(cond), detail))

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.on("console", lambda m: errs.append(f"{m.type}: {m.text}") if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: errs.append(f"pageerror: {e}"))

    # Homepage desktop: hamburger hidden, nav links visible
    pg.goto((d / "01-homepage.html").as_uri(), wait_until="networkidle"); pg.wait_for_timeout(200)
    check("Home desktop: hamburger hidden", not pg.locator("#hamburger").is_visible())
    check("Home desktop: nav links visible", pg.locator("#primary-menu").is_visible())

    # Dashboard desktop: toggle hidden, sidebar on-screen (x>=0), backdrop hidden
    pg.goto((d / "04-student-dashboard.html").as_uri(), wait_until="networkidle"); pg.wait_for_timeout(200)
    check("Dash desktop: toggle hidden", not pg.locator("#sidebar-toggle").is_visible())
    check("Dash desktop: sidebar visible on-screen", pg.locator("#sidebar").bounding_box()["x"] >= 0)
    check("Dash desktop: backdrop hidden", not pg.locator(".sidebar-backdrop").is_visible())
    check("Dash desktop: title still reads Dashboard", pg.inner_text(".topbar-left h1") == "Dashboard")

    # Admin desktop (1280 > 1024): toggle hidden, sidebar on-screen
    pg.goto((d / "06-admin-dashboard.html").as_uri(), wait_until="networkidle"); pg.wait_for_timeout(200)
    check("Admin desktop: toggle hidden", not pg.locator("#sidebar-toggle").is_visible())
    check("Admin desktop: sidebar visible on-screen", pg.locator("#sidebar").bounding_box()["x"] >= 0)
    check("Admin desktop: backdrop hidden", not pg.locator(".sidebar-backdrop").is_visible())

    b.close()

print("-" * 60)
allpass = True
for label, ok, detail in results:
    print(f"[{'PASS' if ok else 'FAIL'}] {label}" + (f"  -> {detail}" if not ok else ""))
    allpass = allpass and ok
print("-" * 60)
print("Console errors/warnings:", errs if errs else "NONE")
print("RESULT:", "ALL PASS" if allpass and not errs else "SEE ABOVE")
