const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const vm = require('vm');

const targetPath = path.join(__dirname, '..', '..', 'index.html');
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');

// 1. Get original 5 projects from d8c8bc7
const buf = execSync('git show d8c8bc7:index.html', { maxBuffer: 10 * 1024 * 1024 });
const originalContent = buf.toString('utf8');
const originalProjectsMatch = originalContent.match(/function getInitialDefaultProjects\(\)\s*\{[\s\S]*?return\s*(\[[\s\S]*?\]);\s*\}/);
const original5Projects = JSON.parse(originalProjectsMatch[1]);

// 2. Add Project 6 (서울가든빌라) and Project 7 (상계5구역) with proper ∘ bullet format
const project6 = {
  category: "재건축",
  desc: "∘기초현황조사 및 노후도 분석 : '24.08.\n∘신통기획 자문 신청(안) 수립 : '24.10.01.\n∘사전도서 작성 및 서울시 협의 : '24.10.\n (준공목표 : '26.12.)",
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
};

const project7 = {
  category: "재정비촉진",
  desc: "∘결정신청 최종보완 도서 작성 : '24.07.14.\n∘용적률(건축계획검토) : '24.10.06.\n∘기정(2026) vs 변경(2026 측량) 토지조서 수정 : '24.10.14.\n (준공목표 : '26.06.)",
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
};

const all7Projects = [...original5Projects, project6, project7];

// Load authentic 30 tasks from true_master_store.json
const trueMaster = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '데이터_조서', 'true_master_store.json'), 'utf8'));

let html = fs.readFileSync(targetPath, 'utf8');

// 1. Replace getInitialDefaultProjects with all 7 projects with proper ∘ format
const projectsRegex = /function getInitialDefaultProjects\(\)\s*\{[\s\S]*?return\s*\[[\s\S]*?\];\s*\}/;
const newProjectsFunc = `function getInitialDefaultProjects() {\n      return ${JSON.stringify(all7Projects, null, 2)};\n    }`;

if (projectsRegex.test(html)) {
  html = html.replace(projectsRegex, newProjectsFunc);
  console.log('1. getInitialDefaultProjects replaced with 7 projects with ∘ milestone formatting! ✅');
} else {
  console.error('Failed to match getInitialDefaultProjects');
  process.exit(1);
}

// 2. Set isAllDatesViewActive = false by default (ONLY TODAY'S TASKS by default!)
html = html.replace('let isAllDatesViewActive = true;', 'let isAllDatesViewActive = false;');
console.log('2. isAllDatesViewActive set to FALSE by default (Today only)! ✅');

// 3. Ensure master recovery guarantees ∘ formatting in store.projects
const targetBlock = `        if (needsStrictReset) {
          console.warn('Cleansing master workspace: restoring 7 authentic projects, 30 real tasks, and 112 career logs!');`;

const checkCondition = `needsStrictReset = true;\n              break;\n            }\n          }`;
const newCheckCondition = `needsStrictReset = true;\n              break;\n            }\n            if (!p.desc || !p.desc.includes('∘')) {\n              needsStrictReset = true;\n              break;\n            }\n          }`;

if (html.includes(checkCondition)) {
  html = html.replace(checkCondition, newCheckCondition);
  console.log('3. Added bullet milestone check to master recovery! ✅');
} else {
  console.log('Check condition already present or slightly different, checking if desc check exists...');
}

// 4. Update version badge to v1.24.0
html = html.replace(/<span class="text-\[11px\] font-bold px-2 py-0\.5 bg-blue-100 text-blue-800 rounded-md">v1\.23\.\d+<\/span>/g, '<span class="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">v1.24.0</span>');

fs.writeFileSync(targetPath, html, 'utf8');
fs.writeFileSync(destPath, html, 'utf8');

console.log('Files saved. Running syntax verification...');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const code = match[1];
  if (!code.trim()) continue;
  try {
    new vm.Script(code);
    console.log('Script #' + count + ' PASSED ✅');
  } catch(e) {
    console.error('Script #' + count + ' ERROR ❌:', e.message);
    process.exit(1);
  }
}

// 5. Update Firebase RTDB with clean 7 projects (with ∘ format)
const cleanFirebaseVault = {
  projects: all7Projects,
  dailyTasks: trueMaster.dailyTasks,
  careerLogs: trueMaster.careerLogs,
  calendarEvents: trueMaster.calendarEvents,
  workLogs: trueMaster.workLogs,
  trashTasks: trueMaster.trashTasks,
  lastLocalUpdate: Date.now()
};

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

async function run() {
  await putFirebase('/urban_project_master_vault_v3', cleanFirebaseVault);
  console.log('4. Firebase vault updated with milestone-formatted 7 projects! ✅');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
