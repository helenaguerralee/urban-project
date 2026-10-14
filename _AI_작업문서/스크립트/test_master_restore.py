import os
from playwright.sync_api import sync_playwright

AI_DIR = os.path.join(os.getcwd(), "_AI_작업문서")
DATA_DIR = os.path.join(AI_DIR, "데이터_조서")
os.makedirs(DATA_DIR, exist_ok=True)

html_path = os.path.abspath("index.html")
file_url = f"file:///{html_path.replace(os.sep, '/')}"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.on("dialog", lambda d: d.accept())

    page.goto(file_url, wait_until="domcontentloaded")
    page.wait_for_timeout(500)

    # Login as admin
    page.fill("#portalLoginId", "admin")
    page.fill("#portalLoginPassword", "Dltjgus411!")
    page.click("button[type='submit']")
    page.wait_for_timeout(1000)

    proj_count = page.evaluate("() => store.projects.length")
    proj_names = page.evaluate("() => store.projects.map(p => p.name)")
    print(f"Master projects count: {proj_count}")
    print(f"Master project names: {proj_names}")

    assert proj_count == 5, f"Expected 5 projects, got {proj_count}!"

    # Verify Yongin and Bundang are in the DOM
    yongin_vis = page.locator("#projectCardsGrid h4:has-text('용인시 노후계획도시기본계획')").is_visible()
    bundang_vis = page.locator("#projectCardsGrid h4:has-text('분당 노후계획도시')").is_visible()
    print(f"Yongin Visible: {yongin_vis}")
    print(f"Bundang Visible: {bundang_vis}")

    assert yongin_vis, "Yongin project must be visible!"
    assert bundang_vis, "Bundang project must be visible!"

    # Check that [🔄 마스터 데이터 복구] button exists in header
    restore_btn_vis = page.locator("button:has-text('🔄 마스터 데이터 복구')").is_visible()
    print(f"Restore Button in Header: {restore_btn_vis}")
    assert restore_btn_vis, "Restore button should be visible in header!"

    # Take screenshot
    shot = os.path.join(DATA_DIR, "screenshot_master_fully_restored.png")
    page.screenshot(path=shot, full_page=False)
    print(f"Master fully restored screenshot: {shot}")

    browser.close()
    print("MASTER PROJECTS 100% RESTORED AND VERIFIED!")
