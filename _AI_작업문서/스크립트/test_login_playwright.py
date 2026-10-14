import sys
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        logs = []
        errors = []

        page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: errors.append(f"[PAGE_ERROR] {err}"))

        live_url = "https://urban-project-ed906.web.app"
        print("Testing live URL:", live_url)
        await page.goto(live_url, wait_until="networkidle")

        portal_visible = await page.is_visible("#loginLandingPortal")
        main_visible = await page.is_visible("#mainAppContainer")
        print(f"Initial: portal_visible={portal_visible}, main_visible={main_visible}")

        print("Filling login form with admin / Dltjgus411! ...")
        await page.fill("#portalLoginId", "admin")
        await page.fill("#portalLoginPassword", "Dltjgus411!")

        print("Clicking submit button...")
        submit_btn = await page.query_selector("#portalLoginForm button[type='submit']")
        if submit_btn:
            await submit_btn.click()
        else:
            await page.click("button[type='submit']")

        await page.wait_for_timeout(2500)

        portal_after = await page.is_visible("#loginLandingPortal")
        main_after = await page.is_visible("#mainAppContainer")
        error_msg_visible = await page.is_visible("#portalLoginErrorMsg")

        print(f"After submit: portal_visible={portal_after}, main_visible={main_after}")
        print(f"Error msg visible: {error_msg_visible}")

        print("--- CONSOLE LOGS ---")
        for l in logs:
            if "cdn.tailwindcss.com" not in l:
                print(l)

        print("--- PAGE ERRORS ---")
        for e in errors:
            print(e)

        if not portal_after and main_after and len(errors) == 0:
            print("[SUCCESS] LIVE LOGIN VERIFICATION TEST PASSED 100%!")
        else:
            print("[FAILURE] LIVE LOGIN VERIFICATION TEST FAILED!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
