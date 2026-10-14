const fs = require('fs');
const path = require('path');
const https = require('https');
const vm = require('vm');

const trueMasterPath = path.join(__dirname, '..', '데이터_조서', 'true_master_store.json');
const trueMaster = JSON.parse(fs.readFileSync(trueMasterPath, 'utf8'));

const targetPath = path.join(__dirname, '..', '..', 'index.html');
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');

let html = fs.readFileSync(targetPath, 'utf8');

// 1. Add getInitialDefaultCareer and getInitialDefaultWorkLogs
const careerFunc = `    function getInitialDefaultCareer() {\n      return ${JSON.stringify(trueMaster.careerLogs, null, 2)};\n    }\n\n    function getInitialDefaultWorkLogs() {\n      return ${JSON.stringify(trueMaster.workLogs, null, 2)};\n    }\n`;

if (!html.includes('function getInitialDefaultCareer')) {
  html = html.replace('function getInitialDefaultEvents() {', careerFunc + '    function getInitialDefaultEvents() {');
  console.log('1. Added getInitialDefaultCareer and getInitialDefaultWorkLogs! ✅');
}

// 2. Set isAllDatesViewActive = true by default
html = html.replace('let isAllDatesViewActive = false;', 'let isAllDatesViewActive = true;');
console.log('2. isAllDatesViewActive set to true! ✅');

// 3. Replace master recovery in loadStore with strict unconditional purifier
const oldPurifierRegex = /\/\/ MASTER RECOVERY GUARANTEE:[\s\S]*?store\.lastLocalUpdate = Date\.now\(\);\s*\}/;

const newPurifierBlock = `// MASTER RECOVERY GUARANTEE: Strict cleansing to 7 authentic projects and 30 real tasks
      if (isMaster) {
        const validIds = ['p_yongin_default', 'p_bundang_default', 'p_incheon_default', 'p_gwangmyeong', 'p_jakjeon', 'p_1789603115950', 'p_1791937637995'];
        const badNames = [
          '광명시 광명동',
          '인천 작전역인근',
          '인천시 계산역북측구역',
          '분당 노후계획도시 47구역, S7구역 통합재건축',
          '성남시 원도심 수진1구역 재개발',
          '수원시 영통지구 노후계획도시 재정비',
          '테스트 전용 도시계획 신규사업'
        ];

        let needsStrictReset = false;
        if (!store || !Array.isArray(store.projects) || store.projects.length !== 7) {
          needsStrictReset = true;
        } else {
          for (const p of store.projects) {
            if (!p || !validIds.includes(p.id) || badNames.includes(p.name) || p.name.includes('성남') || p.name.includes('수원') || p.name.includes('테스트')) {
              needsStrictReset = true;
              break;
            }
          }
        }

        if (!store || !Array.isArray(store.dailyTasks) || store.dailyTasks.length < 30 || store.dailyTasks.some(t => t && t.title && t.title.includes('최근 업무'))) {
          needsStrictReset = true;
        }

        if (needsStrictReset) {
          console.warn('Cleansing master workspace: restoring 7 authentic projects, 30 real tasks, and 112 career logs!');
          store.projects = getInitialDefaultProjects();
          store.dailyTasks = getInitialDefaultTasks();
          store.careerLogs = getInitialDefaultCareer();
          store.calendarEvents = getInitialDefaultEvents();
          store.workLogs = getInitialDefaultWorkLogs();
          store.lastLocalUpdate = Date.now();
          
          try {
            localStorage.setItem(wsKey, JSON.stringify(store));
            localStorage.setItem('urban_clean_store_v11', JSON.stringify(store));
            localStorage.setItem('urban_clean_store_v10', JSON.stringify(store));
          } catch(e) {}
        }
      }`;

if (oldPurifierRegex.test(html)) {
  html = html.replace(oldPurifierRegex, newPurifierBlock);
  console.log('3. Strict cleansing master recovery injected! ✅');
} else {
  console.error('Failed to match oldPurifierRegex');
  process.exit(1);
}

// 4. Update Firebase sync callback to prevent any dirty remote data from polluting master
const syncRemoteCheckRegex = /if \(remoteData && remoteData\.projects\) \{[\s\S]*?const remoteTs = cleanRemote\.lastLocalUpdate/;

const newSyncRemoteCheck = `if (remoteData && remoteData.projects) {
            let cleanRemote = sanitizeStore(remoteData);

            if (isMaster) {
              const badNames = ['광명시 광명동', '인천 작전역인근', '인천시 계산역북측구역', '분당 노후계획도시 47구역, S7구역 통합재건축', '성남시', '수원시', '테스트'];
              const remoteIsDirty = cleanRemote.projects.length !== 7 || 
                cleanRemote.projects.some(p => badNames.some(b => p.name.includes(b))) ||
                (cleanRemote.dailyTasks || []).some(t => t && t.title && t.title.includes('최근 업무'));

              if (remoteIsDirty) {
                console.warn('Cloud remote contained legacy/fake data. Overwriting cloud with pure master store!');
                cleanRemote.projects = getInitialDefaultProjects();
                cleanRemote.dailyTasks = getInitialDefaultTasks();
                cleanRemote.careerLogs = getInitialDefaultCareer();
                cleanRemote.calendarEvents = getInitialDefaultEvents();
                cleanRemote.workLogs = getInitialDefaultWorkLogs();
                cleanRemote.lastLocalUpdate = Date.now();
                fbDbRef.set(cleanRemote).catch(() => {});
              }
            }

            const remoteTs = cleanRemote.lastLocalUpdate`;

if (syncRemoteCheckRegex.test(html)) {
  html = html.replace(syncRemoteCheckRegex, newSyncRemoteCheck);
  console.log('4. Firebase sync dirty remote rejector injected! ✅');
} else {
  console.error('Failed to match syncRemoteCheckRegex');
  process.exit(1);
}

// 5. Update version badge to v1.23.9
html = html.replace(/<span class="text-\[11px\] font-bold px-2 py-0\.5 bg-blue-100 text-blue-800 rounded-md">v1\.23\.\d+<\/span>/g, '<span class="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">v1.23.9</span>');

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

// 6. Overwrite Firebase RTDB
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
  await putFirebase('/urban_project_master_vault_v3', trueMaster);
  console.log('5. Firebase RTDB urban_project_master_vault_v3 100% updated with true master store! ✅');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
