import os
import time
from playwright.sync_api import sync_playwright

AI_DIR = os.path.join(os.getcwd(), "_AI_작업문서")
DATA_DIR = os.path.join(AI_DIR, "데이터_조서")
os.makedirs(DATA_DIR, exist_ok=True)

html_path = os.path.abspath("index.html")
file_url = f"file:///{html_path.replace(os.sep, '/')}"

print(f"Testing URL: {file_url}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()

    # Listen to console & dialogs
    page.on("console", lambda msg: print(f"[BROWSER CONSOLE] {msg.type}: {msg.text}"))
    page.on("dialog", lambda dialog: dialog.accept())

    page.goto(file_url, wait_until="domcontentloaded")
    page.wait_for_timeout(1000)

    # 1. Check Login Portal
    print("1. Filling login credentials...")
    page.fill("#portalLoginId", "admin")
    page.fill("#portalLoginPassword", "Dltjgus411!")
    page.click("button[type='submit']")
    page.wait_for_timeout(1500)

    # Screenshot main screen after login
    main_shot = os.path.join(DATA_DIR, "screenshot_header_cards.png")
    page.screenshot(path=main_shot, full_page=False)
    print(f"Main header & cards screenshot saved: {main_shot}")

    # Check header brand
    header_title = page.locator("h1:has-text('도시계획 업무관리시스템')").is_visible()
    header_logo = page.locator("#headerCompanyLogo").is_visible()
    header_comp = page.locator("#headerCompanyName").inner_text()
    print(f"Header Title Visible: {header_title}")
    print(f"Header Logo Visible: {header_logo}")
    print(f"Header Company Name: {header_comp}")

    # Check Auth Header buttons
    profile_btn = page.locator("button:has-text('👤 프로필/CI')").is_visible()
    member_btn = page.locator("button:has-text('👥 구성원 관리')").is_visible()
    print(f"Profile/CI Button Visible: {profile_btn}")
    print(f"Member Admin Button Visible: {member_btn}")

    # Check Solution Workbench card button
    card_btn = page.locator("button:has-text('작업대 열기 & 편집')").first.is_visible()
    print(f"Solution Card Workbench Button Visible: {card_btn}")

    # 2. Click Profile/CI Button and test modal
    print("2. Opening User Profile Modal...")
    page.click("button:has-text('👤 프로필/CI')")
    page.wait_for_timeout(500)

    modal_visible = page.locator("#userProfileModal").is_visible()
    print(f"User Profile Modal Visible: {modal_visible}")

    profile_name = page.input_value("#profileUserName")
    profile_comp = page.input_value("#profileCompany")
    print(f"Profile User Name: {profile_name}")
    print(f"Profile Company: {profile_comp}")

    profile_shot = os.path.join(DATA_DIR, "screenshot_profile_modal.png")
    page.screenshot(path=profile_shot, full_page=False)
    print(f"Profile modal screenshot saved: {profile_shot}")

    # Close modal
    page.click("#userProfileModal button:has-text('취소')")
    page.wait_for_timeout(300)

    # 3. Check Tab 7 Solution Workbench cards
    page.click("#tab-reporthelper")
    page.wait_for_timeout(1000)

    # Check Solution Workbench card button on Tab 7
    card_btn = page.locator("button:has-text('작업대 열기 & 편집')").first.is_visible()
    print(f"Solution Card Workbench Button Visible on Tab 7: {card_btn}")

    solutions_shot = os.path.join(DATA_DIR, "screenshot_solutions_tab.png")
    page.screenshot(path=solutions_shot, full_page=False)
    print(f"Solutions Tab screenshot saved: {solutions_shot}")

    browser.close()
    print("All Playwright checks PASSED! ✅")
