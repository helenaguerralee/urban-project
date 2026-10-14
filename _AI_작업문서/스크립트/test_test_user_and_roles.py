import os
import sys
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

    page.on("dialog", lambda dialog: dialog.accept())

    # Pre-populate localStorage with user 'test' so we can test login immediately
    page.goto(file_url, wait_until="domcontentloaded")
    page.wait_for_timeout(500)

    # 1. First, register user 'test' via portal signup if not present
    print("1. Testing signup / ensuring user 'test' exists...")
    page.click("#tabBtnSignup")
    page.wait_for_timeout(300)
    page.fill("#signupId", "test")
    page.fill("#signupName", "테스트 실무자")
    page.fill("#signupDept", "도시계획설계부")
    page.fill("#signupPassword", "1234")
    page.fill("#signupPasswordConfirm", "1234")
    page.click("#portalSignupForm button[type='submit']")
    page.wait_for_timeout(1000)

    # Check if 'test' is logged in right after signup
    portal_display = page.evaluate("() => document.getElementById('loginLandingPortal').style.display")
    main_display = page.evaluate("() => document.getElementById('mainAppContainer').style.display")
    print(f"After signup: portal={portal_display}, main={main_display}")

    test_logged_in_shot = os.path.join(DATA_DIR, "screenshot_test_user_logged_in.png")
    page.screenshot(path=test_logged_in_shot, full_page=False)
    print(f"Test user workspace screenshot saved: {test_logged_in_shot}")

    # 2. Logout test user
    print("2. Logging out test user...")
    page.click("button:has-text('🚪 로그아웃')")
    page.wait_for_timeout(500)

    # 3. Test logging in as 'test' with password '1234'
    print("3. Testing Login as 'test' on Portal Login Form...")
    page.fill("#portalLoginId", "test")
    page.fill("#portalLoginPassword", "1234")
    page.click("button[type='submit']")
    page.wait_for_timeout(1000)

    portal_display_after_login = page.evaluate("() => document.getElementById('loginLandingPortal').style.display")
    main_display_after_login = page.evaluate("() => document.getElementById('mainAppContainer').style.display")
    print(f"After test user login: portal={portal_display_after_login}, main={main_display_after_login}")

    assert portal_display_after_login == "none", "Portal should be hidden after test user login!"
    assert main_display_after_login == "flex", "Main app should be displayed after test user login!"

    # 4. Logout test user and login as 'admin'
    print("4. Logging in as admin to check Member Admin Role Selector...")
    page.click("button:has-text('🚪 로그아웃')")
    page.wait_for_timeout(500)

    page.fill("#portalLoginId", "admin")
    page.fill("#portalLoginPassword", "Dltjgus411!")
    page.click("button[type='submit']")
    page.wait_for_timeout(1000)

    # Open Member Admin Modal
    page.click("button:has-text('👥 구성원 관리')")
    page.wait_for_timeout(500)

    modal_visible = page.locator("#memberAdminModal").is_visible()
    print(f"Member Admin Modal Visible: {modal_visible}")

    # Check if select dropdown exists for role
    role_select_count = page.locator("#memberAdminTableBody select").count()
    print(f"Interactive role select dropdowns found: {role_select_count}")

    roles_shot = os.path.join(DATA_DIR, "screenshot_member_admin_roles.png")
    page.screenshot(path=roles_shot, full_page=False)
    print(f"Member admin roles screenshot saved: {roles_shot}")

    browser.close()
    print("ALL TESTS PASSED SUCCESSFULLY!")
