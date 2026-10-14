import asyncio
import os
import sys
from playwright.async_api import async_playwright

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        file_path = os.path.abspath("index.html")
        file_url = f"file:///{file_path.replace(os.sep, '/')}"

        await page.goto(file_url)

        # Login as admin
        await page.evaluate("""
            () => {
                sessionStorage.setItem('urban_auth_session', 'admin');
                localStorage.setItem('urban_current_user_v1', JSON.stringify({ id: 'admin', name: '총괄 마스터', role: 'super_admin' }));
                localStorage.removeItem('urban_clean_store_v11');
                localStorage.removeItem('urban_clean_store_v10');
                localStorage.removeItem('urban_store_workspace_admin');
                loadStore();
                renderAll();
            }
        """)

        await page.wait_for_timeout(2000)

        # 1. Check Tab 2 default view (Today only)
        tab2_info = await page.evaluate("""
            () => {
                switchTab('daily');
                const title = document.getElementById('dailyLogTitle').innerText;
                const renderedCount = document.querySelectorAll('#dailyTasksList > div').length;
                const isAllActive = isAllDatesViewActive;
                return { renderedCount, isAllActive, hasDate: title.includes('2026-10-14') };
            }
        """)
        print("Tab 2 Info renderedCount:", tab2_info["renderedCount"], "isAllActive:", tab2_info["isAllActive"])
        assert not tab2_info["isAllActive"], "Default should NOT be all dates"
        assert tab2_info["hasDate"], "Title should be for today (2026-10-14)"
        assert tab2_info["renderedCount"] == 1, f"Expected 1 task today, got {tab2_info['renderedCount']}"

        # 2. Check Tab 1 Project Card Milestone rendering
        tab1_info = await page.evaluate("""
            () => {
                switchTab('projects');
                const milestonePills = document.querySelectorAll('[onclick*="toggleMilestoneStatus"]');
                const yonginP = store.projects.find(p => p.id === 'p_yongin_default');
                const parsedMilestones = getOrParseMilestones(yonginP);
                return {
                    pillCount: milestonePills.length,
                    yonginMilestones: parsedMilestones.length,
                    hasBulletInDesc: yonginP.desc.includes('∘')
                };
            }
        """)
        print("Tab 1 Info pillCount:", tab1_info["pillCount"], "yonginMilestones:", tab1_info["yonginMilestones"])
        assert tab1_info["hasBulletInDesc"], "Yongin desc must have ∘ bullet formatting"
        assert tab1_info["yonginMilestones"] == 16, f"Expected 16 milestones for Yongin, got {tab1_info['yonginMilestones']}"
        assert tab1_info["pillCount"] > 0, "Milestone pills must be rendered on the cards"

        # 3. Check Tab 4 Calendar Events (September 출장 records)
        tab4_info = await page.evaluate("""
            () => {
                const trips = (store.calendarEvents || []).filter(e => e.type === '출장');
                return {
                    tripCount: trips.length
                };
            }
        """)
        print("Tab 4 Calendar tripCount:", tab4_info["tripCount"])
        assert tab4_info["tripCount"] == 4, f"Expected 4 출장 events, got {tab4_info['tripCount']}"

        print("ALL UI & MILESTONE VERIFICATIONS PASSED [PASS]!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(run_test())
