const fs = require('fs');
const path = require('path');
const https = require('https');
const vm = require('vm');

const trueMasterPath = path.join(__dirname, '..', '데이터_조서', 'true_master_store.json');
const trueMaster = JSON.parse(fs.readFileSync(trueMasterPath, 'utf8'));

// 1. Overwrite Firebase RTDB with clean trueMaster
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

const targetPath = path.join(__dirname, '..', '..', 'index.html');
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');

let html = fs.readFileSync(targetPath, 'utf8');

// Update Firebase listener block
const oldSyncRegex = /fbDbRef\.on\('value',\s*\(snapshot\)\s*=>\s*\{[\s\S]*?if\s*\(remoteTs\s*>\s*localTs\s*\|\|\s*!localTs\s*\|\|\s*!store\.projects\s*\|\|\s*store\.projects\.length\s*===\s*0\s*\|\|\s*localHasMore\)\s*\{[\s\S]*?\}\s*\}\s*,\s*\(err\)\s*=>/;

const newSyncBlock = `fbDbRef.on('value', (snapshot) => {
          const remoteData = snapshot.val();
          if (remoteData && remoteData.projects) {
            let cleanRemote = sanitizeStore(remoteData);

            if (isMaster) {
              // Purge fake artifacts
              cleanRemote.projects = (cleanRemote.projects || []).filter(p => p && p.name && !p.name.includes('성남시') && !p.name.includes('수원시') && !p.name.includes('테스트 전용'));
              cleanRemote.dailyTasks = (cleanRemote.dailyTasks || []).filter(t => t && t.title && !t.title.includes('최근 업무'));
              cleanRemote.careerLogs = (cleanRemote.careerLogs || []).filter(c => c && !(c.title && c.title.includes('경력 기록')));

              // Guarantee 7 authentic projects
              if (cleanRemote.projects.length < 7) {
                const defs = getInitialDefaultProjects();
                const pMap = new Map();
                defs.forEach(p => pMap.set(p.id, p));
                cleanRemote.projects.forEach(p => pMap.set(p.id, p));
                cleanRemote.projects = Array.from(pMap.values());
              }
            }

            const remoteTs = cleanRemote.lastLocalUpdate || 0;
            const localTs = store.lastLocalUpdate || 0;

            // Merge by ID only
            const mergedProjectsMap = new Map();
            (cleanRemote.projects || []).forEach(p => { if (p && p.id) mergedProjectsMap.set(p.id, p); });
            let localHadNewProjects = false;
            (store.projects || []).forEach(p => {
              if (p && p.id && !mergedProjectsMap.has(p.id) && !p.name.includes('성남시') && !p.name.includes('수원시') && !p.name.includes('테스트 전용')) {
                mergedProjectsMap.set(p.id, p);
                localHadNewProjects = true;
              }
            });
            cleanRemote.projects = Array.from(mergedProjectsMap.values());

            const mergedTasksMap = new Map();
            (cleanRemote.dailyTasks || []).forEach(t => { if (t && t.id) mergedTasksMap.set(t.id, t); });
            let localHadNewTasks = false;
            (store.dailyTasks || []).forEach(lt => {
              if (lt && lt.id && !mergedTasksMap.has(lt.id) && !lt.title.includes('최근 업무')) {
                mergedTasksMap.set(lt.id, lt);
                localHadNewTasks = true;
              }
            });
            cleanRemote.dailyTasks = Array.from(mergedTasksMap.values());

            const mergedCareerMap = new Map();
            (cleanRemote.careerLogs || []).forEach(c => { if (c && c.id) mergedCareerMap.set(c.id, c); });
            (store.careerLogs || []).forEach(c => {
              if (c && c.id && !mergedCareerMap.has(c.id)) {
                mergedCareerMap.set(c.id, c);
              }
            });
            cleanRemote.careerLogs = Array.from(mergedCareerMap.values());

            const localHasMore = localHadNewTasks || localHadNewProjects;

            if (remoteTs > localTs || !localTs || !store.projects || store.projects.length === 0 || localHasMore) {
              store = cleanRemote;
              store.lastLocalUpdate = Math.max(remoteTs, localTs, Date.now());
              localStorage.setItem(getWorkspaceStorageKey(), JSON.stringify(store));
              recordAutoSnapshot(store);
              autoSyncCareerFromCompletedTasks();
              renderAll();
              updateSyncStatusUI(true, "실시간 연동 중");

              if (localHasMore && isCloudSyncActive && fbDbRef) {
                fbDbRef.set(store).catch(e => console.error("Cloud push failed:", e));
              }
            }
          } else if (store.projects && store.projects.length > 0) {
            fbDbRef.set(sanitizeStore(store)).catch(e => console.error("Cloud auto-seed failed:", e));
          }
        }, (err) =>`;

if (oldSyncRegex.test(html)) {
  html = html.replace(oldSyncRegex, newSyncBlock);
  console.log('1. Firebase sync listener cleanly updated! ✅');
} else {
  console.error('Failed to match oldSyncRegex');
  process.exit(1);
}

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

async function run() {
  await putFirebase('/urban_project_master_vault_v3', trueMaster);
  console.log('2. Firebase vault overwritten with true master store! ✅');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
