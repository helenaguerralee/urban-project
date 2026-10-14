const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. Load genuine dump
const dumpPath = path.join(__dirname, '..', '데이터_조서', 'urban_project_store_dump.json');
const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));

// 2. Build the exact 7 genuine projects
const genuineProjects = [
  {
    category: "노후계획도시정비",
    desc: "착수 : '24.07.10.\n착수보고회 : '24.08.13.\n기본계획(안) 작성 : '25.03~04.\n주민설명회(공람) : '25.10.~11.\n시의회 의견청취 : '26.02 ~ 완료\n도 심의신청 : '26.07\n도 공동(도시)위원회 : '26.07~'26.08.\n기본계획 승인 : '26.09.\n주민공람 : '26.10.(14일간)\n경기도도시계획위 : '26.11.\n도 보완사항 제출 : '26.12.\n도의회 의견청취 : '27.01.\n도의회 의견청취(재심의)제출 : '27.02.\n국토교통부 승인 : '27.04.\n기본계획 고시 및 보고 : '27.05.\n최종 인쇄 및 준공 : '27.06.\n (계약종료 : '27.06.)",
    endDate: "'27.06",
    id: "p_yongin_default",
    name: "용인시 노후계획도시기본계획",
    progress: 80,
    startDate: "'24.07.10",
    milestones: [
      { id: "m_0", title: "착수", date: "'24.07.10.", status: "done" },
      { id: "m_1", title: "착수보고회", date: "'24.08.13.", status: "done" },
      { id: "m_2", title: "주민설명회", date: "'25.03~04.", status: "done" },
      { id: "m_3", title: "기본계획 승인", date: "'26.09.", status: "done" },
      { id: "m_4", title: "주민공람", date: "'26.10.", status: "in_progress" },
      { id: "m_5", title: "경기도도시계획위", date: "'26.11.", status: "todo" }
    ]
  },
  {
    category: "노후계획도시정비",
    desc: "주민동의율 확보 및 통합재건축 선도지구 공모 신청 준비.\n선도지구 제안서 제출 및 평가 기준 분석.",
    endDate: "'25.12",
    id: "p_bundang_default",
    name: "분당 노후계획도시 47구역(까치마을1), S7구역(구미동2) 통합재건축 정비사업",
    progress: 60,
    startDate: "'24.05.01",
    milestones: [
      { id: "m_b0", title: "주민동의서 징구", date: "'24.06.", status: "done" },
      { id: "m_b1", title: "선도지구 공모신청서 제출", date: "'24.09.25.", status: "done" },
      { id: "m_b2", title: "선도지구 선정 발표", date: "'24.11.", status: "todo" }
    ]
  },
  {
    category: "재개발사업",
    desc: "인천광역시 계양구 계산역 북측 재개발사업 정비계획 수립 및 정비구역 지정 용역.\n관련부서 2차 협의 조치계획서 작성 및 도시계획위원회 심의 준비.",
    endDate: "'25.10",
    id: "p_incheon_default",
    name: "인천시 계산역북측구역 재개발사업",
    progress: 45,
    startDate: "'23.11.15",
    milestones: [
      { id: "m_i0", title: "정비구역 입안제안", date: "'24.02.", status: "done" },
      { id: "m_i1", title: "관련부서 1차 협의", date: "'24.06.", status: "done" },
      { id: "m_i2", title: "2차 협의 조치계획 작성", date: "'24.10.", status: "in_progress" },
      { id: "m_i3", title: "구 도시계획위원회 심의", date: "'24.12.", status: "todo" }
    ]
  },
  {
    category: "재개발사업",
    desc: "광명시 광명동 일원 재개발사업 정비계획 수립 및 사전기획 검토.\n토지등소유자 동의서 징구 및 구역계 적합성 분석.",
    endDate: "'26.03",
    id: "p_gwangmyeong",
    name: "광명시 광명동 재개발사업",
    progress: 25,
    startDate: "'24.04.10",
    milestones: [
      { id: "m_g0", title: "사전기획 및 기초조사", date: "'24.06.", status: "done" },
      { id: "m_g1", title: "입안제안 사전협의", date: "'24.09.24.", status: "done" },
      { id: "m_g2", title: "정비구역 지정 신청", date: "'25.01.", status: "todo" }
    ]
  },
  {
    category: "재개발사업",
    desc: "인천광역시 계양구 작전역 일원 재개발사업 정비계획 수립 및 타당성 검토.\n추진준비위원회 자문 및 정비기반시설 계획 수립.",
    endDate: "'25.08",
    id: "p_jakjeon",
    name: "인천 작전역인근 재개발사업",
    progress: 35,
    startDate: "'23.12.01",
    milestones: [
      { id: "m_j0", title: "기초현황조사", date: "'24.03.", status: "done" },
      { id: "m_j1", title: "작전 추준위 회의", date: "'24.09.11.", status: "done" },
      { id: "m_j2", title: "조치계획 접수", date: "'24.09.15.", status: "done" }
    ]
  },
  {
    category: "재건축사업",
    desc: "서울특별시 구로구 오류동 서울가든빌라 재건축 신속통합기획 자문 신청 및 사전도서 작성.\n제2종일반주거지역(7층) 종상향 검토, 온수 지구단위계획 지침 검토, 표고/경사 분석 및 토지·건축물 조서 편철.",
    endDate: "'26.12",
    id: "p_1789603115950",
    name: "서울시 구로구 서울가든빌라재건축",
    progress: 30,
    startDate: "'24.08.01",
    milestones: [
      { id: "m_sg0", title: "기초현황조사 및 노후도 분석", date: "'24.08.", status: "done" },
      { id: "m_sg1", title: "신통기획 자문 신청(안) 수립", date: "'24.10.01.", status: "done" },
      { id: "m_sg2", title: "사전도서 작성 및 서울시 협의", date: "'24.10.", status: "in_progress" }
    ]
  },
  {
    category: "재정비촉진사업",
    desc: "서울특별시 노원구 상계5구역 재정비촉진사업(공공재개발) 촉진계획 경미한 변경 및 토지조서 수정.\n기정(2026) vs 변경(2026 측량) 토지조서 정비 및 국·공유지 유·무상협의 지원.",
    endDate: "'26.06",
    id: "p_1791937637995",
    name: "서울시 상계5구역 재정비촉진사업",
    progress: 50,
    startDate: "'24.07.01",
    milestones: [
      { id: "m_sk0", title: "결정신청 최종보완 도서 작성", date: "'24.07.14.", status: "done" },
      { id: "m_sk1", title: "용적률(건축계획검토)", date: "'24.10.06.", status: "done" },
      { id: "m_sk2", title: "기정(2026) vs 변경(2026 측량) 토지조서 수정", date: "'24.10.14.", status: "done" }
    ]
  }
];

// Clean true master store
const trueMasterStore = {
  projects: genuineProjects,
  dailyTasks: dump.dailyTasks,
  careerLogs: dump.careerLogs || [],
  calendarEvents: dump.calendarEvents || [],
  workLogs: dump.workLogs || [],
  trashTasks: dump.trashTasks || [],
  lastLocalUpdate: Date.now()
};

console.log('True master store created:');
console.log('- Projects:', trueMasterStore.projects.length, trueMasterStore.projects.map(p => p.name));
console.log('- Daily tasks:', trueMasterStore.dailyTasks.length);
console.log('- Career logs:', trueMasterStore.careerLogs.length);
console.log('- Calendar events:', trueMasterStore.calendarEvents.length);
console.log('- Work logs:', trueMasterStore.workLogs.length);

// Save to JSON for local backup
fs.writeFileSync(path.join(__dirname, '..', '데이터_조서', 'true_master_store.json'), JSON.stringify(trueMasterStore, null, 2), 'utf8');

// Push to Firebase RTDB urban_project_master_vault_v3 and urban_project_store
const putFirebase = (dbPath, data) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://urban-project-ed906-default-rtdb.firebaseio.com${dbPath}.json`);
    const payload = JSON.stringify(data);
    const req = https.request(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`Firebase PUT to ${dbPath} result: STATUS ${res.statusCode}`);
        resolve();
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

async function main() {
  await putFirebase('/urban_project_master_vault_v3', trueMasterStore);
  console.log('SUCCESS: Pushed true master store to Firebase!');
}

main().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
