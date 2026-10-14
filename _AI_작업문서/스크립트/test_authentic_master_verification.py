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

        # Log in as admin
        await page.evaluate("""
            () => {
                sessionStorage.setItem('urban_auth_session', 'admin');
                localStorage.setItem('urban_current_user_v1', JSON.stringify({ id: 'admin', name: '총괄 마스터', role: 'super_admin' }));
                localStorage.removeItem('urban_clean_store_v11');
                localStorage.removeItem('urban_clean_store_v10');
                localStorage.removeItem('urban_clean_store_v9');
                loadStore();
                renderAll();
            }
        """)

        await page.wait_for_timeout(2000)

        result = await page.evaluate("""
            () => {
                return {
                    projectsCount: (store.projects || []).length,
                    projectNames: (store.projects || []).map(p => p.name),
                    tasksCount: (store.dailyTasks || []).length,
                    lastTaskTitle: store.dailyTasks && store.dailyTasks.length > 0 ? store.dailyTasks[store.dailyTasks.length - 1].title : '',
                    lastTaskDate: store.dailyTasks && store.dailyTasks.length > 0 ? store.dailyTasks[store.dailyTasks.length - 1].date : ''
                };
            }
        """)

        print("Test Result:")
        print("Projects Count:", result["projectsCount"])
        print("Project Names:", result["projectNames"])
        print("Tasks Count:", result["tasksCount"])
        print("Last Task Date:", result["lastTaskDate"])
        print("Last Task Title:", result["lastTaskTitle"])

        assert result["projectsCount"] == 7, f"Expected 7 projects, got {result['projectsCount']}"
        assert "서울시 구로구 서울가든빌라재건축" in result["projectNames"], "Missing 서울가든빌라"
        assert "서울시 상계5구역 재정비촉진사업" in result["projectNames"], "Missing 상계5구역"
        assert result["tasksCount"] >= 30, f"Expected >= 30 tasks, got {result['tasksCount']}"
        assert "2026-10-14" in result["lastTaskDate"], f"Expected today's task date, got {result['lastTaskDate']}"

        print("ALL AUTHENTIC DATA TESTS PASSED [PASS]!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(run_test())
