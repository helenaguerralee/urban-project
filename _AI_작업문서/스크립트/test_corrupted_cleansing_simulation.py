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

        # 1. Simulate the exact user's corrupted state in browser localStorage
        await page.evaluate("""
            () => {
                sessionStorage.setItem('urban_auth_session', 'admin');
                localStorage.setItem('urban_current_user_v1', JSON.stringify({ id: 'admin', name: '총괄 마스터', role: 'super_admin' }));
                
                // Inject the corrupted store with '광명시 광명동' and '성남시...'
                const corruptedStore = {
                    projects: [
                        { id: 'p1', name: '용인시 노후계획도시기본계획' },
                        { id: 'p2', name: '분당 노후계획도시 47구역, S7구역 통합재건축' },
                        { id: 'p3', name: '인천시 계산역북측구역' },
                        { id: 'p4', name: '광명시 광명동' },
                        { id: 'p5', name: '인천 작전역인근' },
                        { id: 'p6', name: '성남시 원도심 수진1구역 재개발' },
                        { id: 'p7', name: '수원시 영통지구 노후계획도시 재정비' }
                    ],
                    dailyTasks: [],
                    calendarEvents: [],
                    careerLogs: []
                };
                localStorage.setItem('urban_clean_store_v11', JSON.stringify(corruptedStore));
                localStorage.setItem('urban_clean_store_v10', JSON.stringify(corruptedStore));
                localStorage.setItem('urban_store_workspace_admin', JSON.stringify(corruptedStore));
                
                // Trigger loadStore and render
                loadStore();
                renderAll();
            }
        """)

        await page.wait_for_timeout(2000)

        result = await page.evaluate("""
            () => {
                const prjNames = (store.projects || []).map(p => p.name);
                const taskTitles = (store.dailyTasks || []).map(t => t.title);
                const renderedTasks = document.querySelectorAll('#dailyTasksList > div');
                return {
                    projectsCount: (store.projects || []).length,
                    projectNames: prjNames,
                    hasGwangmyeongCorrect: prjNames.includes('광명시 광명동 재개발사업'),
                    hasGwangmyeongWrong: prjNames.includes('광명시 광명동'),
                    hasSeongnam: prjNames.some(n => n.includes('성남시')),
                    hasSuwon: prjNames.some(n => n.includes('수원시')),
                    tasksCount: (store.dailyTasks || []).length,
                    renderedTasksCount: renderedTasks.length,
                    careerCount: (store.careerLogs || []).length
                };
            }
        """)

        print("Cleansing Test Result:", result)

        assert result["projectsCount"] == 7, f"Expected 7 projects, got {result['projectsCount']}"
        assert result["hasGwangmyeongCorrect"], "Missing 광명시 광명동 재개발사업"
        assert not result["hasGwangmyeongWrong"], "Should not have 광명시 광명동"
        assert not result["hasSeongnam"], "Should not have 성남시"
        assert not result["hasSuwon"], "Should not have 수원시"
        assert result["tasksCount"] == 30, f"Expected 30 tasks, got {result['tasksCount']}"
        assert result["renderedTasksCount"] >= 30, f"Expected >= 30 rendered tasks, got {result['renderedTasksCount']}"
        assert result["careerCount"] == 112, f"Expected 112 career logs, got {result['careerCount']}"

        print("CLEANSING SIMULATION VERIFICATION PASSED [PASS]!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(run_test())
