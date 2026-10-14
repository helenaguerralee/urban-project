import os
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

    page.goto(file_url, wait_until="domcontentloaded")
    page.wait_for_timeout(1000)

    # 1. Sign up as 'test' user
    print("1. Signing up as 'test'...")
    page.click("#tabBtnSignup")
    page.wait_for_timeout(300)
    page.fill("#signupId", "test")
    page.fill("#signupName", "테스트 실무자")
    page.fill("#signupDept", "도시설계부")
    page.fill("#signupPassword", "1234")
    page.fill("#signupPasswordConfirm", "1234")
    page.click("#portalSignupForm button[type='submit']")
    page.wait_for_timeout(1000)

    # Check store project count in browser
    curr_user = page.evaluate("() => getCurrentUser()")
    ws_key = page.evaluate("() => getWorkspaceStorageKey()")
    raw_saved = page.evaluate("() => localStorage.getItem(getWorkspaceStorageKey())")
    proj_names = page.evaluate("() => store.projects.map(p => p.name)")
    print(f"Current User: {curr_user}")
    print(f"Workspace Key: {ws_key}")
    print(f"Projects in store: {proj_names}")
    test_proj_count = len(proj_names)
    print(f"Test user project count: {test_proj_count}")

    # Check that confidential admin project names do not exist in the DOM
    yongin_visible = page.locator("#projectCardsGrid h4:has-text('용인시 노후계획도시기본계획')").is_visible()
    bundang_visible = page.locator("#projectCardsGrid h4:has-text('분당 노후계획도시')").is_visible()
    print(f"Yongin Project Visible on test workspace: {yongin_visible}")
    print(f"Bundang Project Visible on test workspace: {bundang_visible}")
    assert not yongin_visible, "Admin's Yongin project must NOT be visible to test user!"
    assert not bundang_visible, "Admin's Bundang project must NOT be visible to test user!"

    # Check empty welcome card
    welcome_visible = page.locator("text=새로운 전용 워크스페이스에 오신 것을 환영합니다!").is_visible()
    print(f"Welcome Clean Slate Card Visible: {welcome_visible}")
    assert welcome_visible, "Welcome card should be visible when projects are empty!"

    # Save screenshot of test user's clean workspace
    test_clean_shot = os.path.join(DATA_DIR, "screenshot_test_clean_workspace.png")
    page.screenshot(path=test_clean_shot, full_page=False)
    print(f"Saved test clean workspace screenshot: {test_clean_shot}")

    # 2. Test adding a project as test user
    print("2. Adding a custom project as test user...")
    page.click("button:has-text('+ 첫 프로젝트 등록하기')")
    page.wait_for_timeout(500)

    page.fill("#newProjName", "테스트 전용 도시계획 신규사업")
    page.fill("#newProjCategory", "도시개발사업")
    page.click("#addProjectModal button:has-text('등록')")
    page.wait_for_timeout(1000)

    new_test_proj_count = page.evaluate("() => store.projects.length")
    print(f"Test user project count after adding 1 project: {new_test_proj_count}")
    assert new_test_proj_count == 1, "Expected 1 project after creation!"

    test_added_shot = os.path.join(DATA_DIR, "screenshot_test_added_project.png")
    page.screenshot(path=test_added_shot, full_page=False)
    print(f"Saved test added project screenshot: {test_added_shot}")

    # 3. Logout and login as admin to ensure admin's 7 projects are 100% intact!
    print("3. Logging out test user and logging in as admin...")
    page.click("button:has-text('🚪 로그아웃')")
    page.wait_for_timeout(1000)

    page.fill("#portalLoginId", "admin")
    page.fill("#portalLoginPassword", "Dltjgus411!")
    page.click("button[type='submit']")
    page.wait_for_timeout(1000)

    admin_proj_names = page.evaluate("() => store.projects.map(p => p.name)")
    admin_ws_key = page.evaluate("() => getWorkspaceStorageKey()")
    admin_curr_user = page.evaluate("() => getCurrentUser()")
    print(f"Admin User: {admin_curr_user}")
    print(f"Admin Workspace Key: {admin_ws_key}")
    print(f"Admin Projects: {admin_proj_names}")
    admin_proj_count = len(admin_proj_names)
    print(f"Admin user project count: {admin_proj_count}")

    admin_yongin_visible = page.locator("#projectCardsGrid h4:has-text('용인시 노후계획도시기본계획')").is_visible()
    print(f"Admin Yongin Project Visible on admin workspace: {admin_yongin_visible}")
    assert admin_yongin_visible, "Admin's Yongin project must be present on admin workspace!"

    admin_shot = os.path.join(DATA_DIR, "screenshot_admin_intact_workspace.png")
    page.screenshot(path=admin_shot, full_page=False)
    print(f"Saved admin intact workspace screenshot: {admin_shot}")

    browser.close()
    print("ALL CLEAN SLATE ISOLATION CHECKS PASSED PERFECTLY!")
