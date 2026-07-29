import pathlib
from playwright.sync_api import sync_playwright

d = pathlib.Path(__file__).parent
results, errs = [], []
def check(label, cond, detail=""):
    results.append((label, bool(cond), detail))

def uri(name):
    return (d / name).as_uri()

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)

    # ---------- HOMEPAGE (mobile 390) ----------
    pg = b.new_page(viewport={"width": 390, "height": 800})
    pg.on("console", lambda m: errs.append(f"home {m.type}: {m.text}") if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: errs.append(f"home pageerror: {e}"))
    pg.goto(uri("01-homepage.html"), wait_until="networkidle"); pg.wait_for_timeout(250)
    check("Home: hamburger visible on mobile", pg.locator("#hamburger").is_visible())
    check("Home: menu hidden initially", not pg.locator("#primary-menu").is_visible())
    pg.locator("#hamburger").click(); pg.wait_for_timeout(250)
    check("Home: menu opens on tap", pg.locator("#primary-menu").is_visible())
    check("Home: aria-expanded true when open", pg.locator("#hamburger").get_attribute("aria-expanded") == "true")
    pg.locator("#hamburger").click(); pg.wait_for_timeout(250)
    check("Home: menu closes on second tap", not pg.locator("#primary-menu").is_visible())
    check("Home: aria-expanded false when closed", pg.locator("#hamburger").get_attribute("aria-expanded") == "false")
    pg.close()

    # ---------- DASHBOARD (mobile 390) ----------
    pg = b.new_page(viewport={"width": 390, "height": 800})
    pg.on("console", lambda m: errs.append(f"dash {m.type}: {m.text}") if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: errs.append(f"dash pageerror: {e}"))
    pg.goto(uri("04-student-dashboard.html"), wait_until="networkidle"); pg.wait_for_timeout(250)
    check("Dash: toggle visible on mobile", pg.locator("#sidebar-toggle").is_visible())
    closed_x = pg.locator("#sidebar").bounding_box()["x"]
    check("Dash: sidebar off-canvas initially (x<0)", closed_x < 0, f"x={closed_x}")
    pg.locator("#sidebar-toggle").click(); pg.wait_for_timeout(350)
    open_x = pg.locator("#sidebar").bounding_box()["x"]
    check("Dash: sidebar slides in on tap (x>=0)", open_x >= -1, f"x={open_x}")
    check("Dash: aria-expanded true", pg.locator("#sidebar-toggle").get_attribute("aria-expanded") == "true")
    check("Dash: backdrop shown when open", pg.locator(".sidebar-backdrop").is_visible())
    pg.mouse.click(340, 400); pg.wait_for_timeout(350)  # tap exposed backdrop area (right of 240px sidebar)
    check("Dash: sidebar closes via backdrop (x<0)", pg.locator("#sidebar").bounding_box()["x"] < 0)
    check("Dash: aria-expanded false after close", pg.locator("#sidebar-toggle").get_attribute("aria-expanded") == "false")
    pg.close()

    # ---------- ADMIN (mobile 390, breakpoint <=1024) ----------
    pg = b.new_page(viewport={"width": 390, "height": 800})
    pg.on("console", lambda m: errs.append(f"admin {m.type}: {m.text}") if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: errs.append(f"admin pageerror: {e}"))
    pg.goto(uri("06-admin-dashboard.html"), wait_until="networkidle"); pg.wait_for_timeout(250)
    check("Admin: toggle visible on mobile", pg.locator("#sidebar-toggle").is_visible())
    closed_x = pg.locator("#sidebar").bounding_box()["x"]
    check("Admin: sidebar off-canvas initially (x<0)", closed_x < 0, f"x={closed_x}")
    pg.locator("#sidebar-toggle").click(); pg.wait_for_timeout(350)
    open_x = pg.locator("#sidebar").bounding_box()["x"]
    check("Admin: sidebar slides in on tap (x>=0)", open_x >= -1, f"x={open_x}")
    check("Admin: aria-expanded true", pg.locator("#sidebar-toggle").get_attribute("aria-expanded") == "true")
    pg.screenshot(path=str(d / "_shots" / "fix-admin-mobile-sidebar.png"))
    pg.close()

    b.close()

print("-" * 60)
allpass = True
for label, ok, detail in results:
    print(f"[{'PASS' if ok else 'FAIL'}] {label}" + (f"  -> {detail}" if not ok else ""))
    allpass = allpass and ok
print("-" * 60)
print("Console errors/warnings:", errs if errs else "NONE")
print("RESULT:", "ALL PASS" if allpass and not errs else "SEE ABOVE")
