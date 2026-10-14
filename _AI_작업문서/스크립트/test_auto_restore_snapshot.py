import asyncio
import json
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

        sample_snap_history = [
            {
                "time": 1791940990000,
                "iso": "2026. 10. 14. 오전 10:23:10",
                "taskCount": 45,
                "projectCount": 7,
                "label": "업무 추가 자동 백업",
                "data": {
                    "projects": [
                        {"id": "p1", "name": "용인시 노후계획도시기본계획", "stage": "기본계획"},
                        {"id": "p2", "name": "분당 노후계획도시 47구역, S7구역 통합재건축", "stage": "정비계획"},
                        {"id": "p3", "name": "인천시 계산역북측구역", "stage": "구역지정"},
                        {"id": "p4", "name": "광명시 광명동", "stage": "사전기획"},
                        {"id": "p5", "name": "인천 작전역인근", "stage": "타당성검토"},
                        {"id": "p6", "name": "성남시 원도심 수진1구역 재개발", "stage": "사업시행인가"},
                        {"id": "p7", "name": "수원시 영통지구 노후계획도시 재정비", "stage": "기본구상"}
                    ],
                    "dailyTasks": [{"id": f"t_{i}", "title": f"최근 업무 {i}", "status": "완료"} for i in range(45)],
                    "calendarEvents": [],
                    "careerLogs": [{"id": f"c_{i}", "title": f"경력 기록 {i}"} for i in range(112)]
                }
            }
        ]

        await page.goto(file_url)

        # Inject snapshot into localStorage and trigger loadStore with admin session
        await page.evaluate("""
            (snapHistory) => {
                sessionStorage.setItem('urban_auth_session', 'admin');
                localStorage.setItem('urban_snapshot_history_v1', JSON.stringify(snapHistory));
                localStorage.setItem('urban_current_user_v1', JSON.stringify({ id: 'admin', name: '총괄 마스터', role: 'super_admin' }));
                localStorage.setItem('urban_clean_store_v11', JSON.stringify({
                    projects: [{id: '1', name: 'p1'}, {id: '2', name: 'p2'}, {id: '3', name: 'p3'}, {id: '4', name: 'p4'}, {id: '5', name: 'p5'}],
                    dailyTasks: [],
                    calendarEvents: [],
                    careerLogs: []
                }));
                loadStore();
                renderAll();
            }
        """, sample_snap_history)

        await page.wait_for_timeout(1000)

        result = await page.evaluate("""
            () => {
                return {
                    projectsCount: (store.projects || []).length,
                    careerCount: (store.careerLogs || []).length,
                    tasksCount: (store.dailyTasks || []).length
                };
            }
        """)

        print("Test Verification Result:", result)

        assert result["projectsCount"] == 7, f"Expected 7 projects, got {result['projectsCount']}"
        assert result["careerCount"] == 112, f"Expected 112 career logs, got {result['careerCount']}"
        assert result["tasksCount"] == 45, f"Expected 45 daily tasks, got {result['tasksCount']}"
        print("ALL AUTO RESTORE ASSERTIONS PASSED! [PASS]")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run_test())
