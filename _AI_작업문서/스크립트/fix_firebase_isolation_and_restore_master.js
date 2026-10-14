const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetPath = path.join(__dirname, '..', '..', 'index.html');
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');

let html = fs.readFileSync(targetPath, 'utf8');

// 1. Fix Firebase ref to be isolated per user workspace
const oldFbInit = `        const db = firebase.database();

        fbDbRef = db.ref('urban_project_store');



        fbDbRef.on('value', (snapshot) => {
          const remoteData = snapshot.val();
          if (remoteData && remoteData.projects) {
            const cleanRemote = sanitizeStore(remoteData);
            const remoteTs = cleanRemote.lastLocalUpdate || 0;
            const localTs = store.lastLocalUpdate || 0;

            // [BI-DIRECTIONAL SAFE MERGE] Never overwrite or lose local tasks!
            const mergedTasksMap = new Map();
            // Put remote tasks first
            (cleanRemote.dailyTasks || []).forEach(t => {
              if (t && t.id) mergedTasksMap.set(t.id, t);
            });
            // If local has tasks that remote doesn't have, PRESERVE THEM!
            let localHadNewTasks = false;
            (store.dailyTasks || []).forEach(lt => {
              if (lt && lt.id && !mergedTasksMap.has(lt.id)) {
                mergedTasksMap.set(lt.id, lt);
                localHadNewTasks = true;
              }
            });

            // Merge trash tasks safely
            const mergedTrashMap = new Map();
            (cleanRemote.trashTasks || []).forEach(t => { if (t && t.id) mergedTrashMap.set(t.id, t); });
            (store.trashTasks || []).forEach(t => { if (t && t.id) mergedTrashMap.set(t.id, t); });

            cleanRemote.dailyTasks = Array.from(mergedTasksMap.values());
            cleanRemote.trashTasks = Array.from(mergedTrashMap.values());

            // Merge workLogs safely
            const mergedWorkMap = new Map();
            (cleanRemote.workLogs || []).forEach(w => { if (w && w.date) mergedWorkMap.set(w.date, w); });
            (store.workLogs || []).forEach(w => { if (w && w.date && !mergedWorkMap.has(w.date)) mergedWorkMap.set(w.date, w); });
            cleanRemote.workLogs = Array.from(mergedWorkMap.values());

            if (remoteTs > localTs || !localTs || !store.projects || store.projects.length === 0 || localHadNewTasks) {
              store = cleanRemote;
              store.lastLocalUpdate = Math.max(remoteTs, localTs, Date.now());
              localStorage.setItem(getWorkspaceStorageKey(), JSON.stringify(store));
              recordAutoSnapshot(store);
              autoSyncCareerFromCompletedTasks();
              renderAll();
              updateSyncStatusUI(true, "실시간 연동 중");

              // If local had tasks missing from cloud, push back combined data so cloud is also updated
              if (localHadNewTasks && isCloudSyncActive && fbDbRef) {
                fbDbRef.set(store).catch(e => console.error("Cloud push combined tasks failed:", e));
              }
            }
          } else if (store.projects && store.projects.length > 0) {
            fbDbRef.set(sanitizeStore(store)).catch(e => console.error("Cloud auto-seed failed:", e));
          }
        }, (err) => {`;

const fbInitRegex = /const db = firebase\.database\(\);\s*fbDbRef = db\.ref\('urban_project_store'\);[\s\S]*?}, \(err\) => \{/;

const newFbInit = `const db = firebase.database();
        const user = getCurrentUser();
        const isMaster = Boolean(user && (user.id === 'admin' || user.role === 'super_admin'));
        const fbPath = (!user || user.id === 'guest' || isMaster) ? 'urban_project_master_vault_v3' : ('urban_user_workspaces/' + user.id);
        
        fbDbRef = db.ref(fbPath);

        fbDbRef.on('value', (snapshot) => {
          const remoteData = snapshot.val();
          if (remoteData && remoteData.projects) {
            let cleanRemote = sanitizeStore(remoteData);

            // Master data protection: if cloud remote somehow has fewer than 3 projects or test projects, REJECT and RESTORE!
            if (isMaster && (cleanRemote.projects.length < 3 || cleanRemote.projects.some(p => p.name && p.name.includes('테스트 전용')))) {
              console.warn('Master cloud data had corrupted test project. Restoring master portfolio...');
              cleanRemote.projects = getInitialDefaultProjects();
              cleanRemote.dailyTasks = getInitialDefaultTasks();
              cleanRemote.calendarEvents = getInitialDefaultEvents();
              fbDbRef.set(cleanRemote).catch(() => {});
            }

            const remoteTs = cleanRemote.lastLocalUpdate || 0;
            const localTs = store.lastLocalUpdate || 0;

            const mergedTasksMap = new Map();
            (cleanRemote.dailyTasks || []).forEach(t => { if (t && t.id) mergedTasksMap.set(t.id, t); });
            let localHadNewTasks = false;
            (store.dailyTasks || []).forEach(lt => {
              if (lt && lt.id && !mergedTasksMap.has(lt.id)) {
                mergedTasksMap.set(lt.id, lt);
                localHadNewTasks = true;
              }
            });

            const mergedTrashMap = new Map();
            (cleanRemote.trashTasks || []).forEach(t => { if (t && t.id) mergedTrashMap.set(t.id, t); });
            (store.trashTasks || []).forEach(t => { if (t && t.id) mergedTrashMap.set(t.id, t); });
            cleanRemote.dailyTasks = Array.from(mergedTasksMap.values());
            cleanRemote.trashTasks = Array.from(mergedTrashMap.values());

            const mergedWorkMap = new Map();
            (cleanRemote.workLogs || []).forEach(w => { if (w && w.date) mergedWorkMap.set(w.date, w); });
            (store.workLogs || []).forEach(w => { if (w && w.date && !mergedWorkMap.has(w.date)) mergedWorkMap.set(w.date, w); });
            cleanRemote.workLogs = Array.from(mergedWorkMap.values());

            if (remoteTs > localTs || !localTs || !store.projects || store.projects.length === 0 || localHadNewTasks) {
              store = cleanRemote;
              store.lastLocalUpdate = Math.max(remoteTs, localTs, Date.now());
              localStorage.setItem(getWorkspaceStorageKey(), JSON.stringify(store));
              recordAutoSnapshot(store);
              autoSyncCareerFromCompletedTasks();
              renderAll();
              updateSyncStatusUI(true, "실시간 연동 중");

              if (localHadNewTasks && isCloudSyncActive && fbDbRef) {
                fbDbRef.set(store).catch(e => console.error("Cloud push combined tasks failed:", e));
              }
            }
          } else if (store.projects && store.projects.length > 0) {
            fbDbRef.set(sanitizeStore(store)).catch(e => console.error("Cloud auto-seed failed:", e));
          }
        }, (err) => {`;

if (fbInitRegex.test(html)) {
  html = html.replace(fbInitRegex, newFbInit);
  console.log('1. Firebase cloud ref isolated to urban_project_master_vault_v3 and corrupted cloud data rejected!');
} else {
  console.error('1. fbInitRegex FAILED to match!');
  process.exit(1);
}

// 2. In loadStore, guarantee master projects are restored if they were contaminated with '테스트 전용'
const loadStoreTargetRegex = /function loadStore\(\) \{[\s\S]*?autoSyncCareerFromCompletedTasks\(\);[\s\S]*?ensureBaselineSnapshot\(\);[\s\S]*?\}/;

const newLoadStore = `function loadStore() {
      const user = getCurrentUser();
      const isMaster = Boolean(user && (user.id === 'admin' || user.role === 'super_admin'));
      const wsKey = getWorkspaceStorageKey();

      let saved = null;
      try {
        saved = localStorage.getItem(wsKey);
      } catch(e) {}

      if (!saved && isMaster) {
        saved = localStorage.getItem('urban_clean_store_v11') || localStorage.getItem('urban_clean_store_v10') || localStorage.getItem('urban_clean_store_v9');
      }

      store = null;
      if (saved) {
        try { store = JSON.parse(saved); } catch(e) {}
      }

      if (!store) {
        if (isMaster) {
          store = {
            projects: getInitialDefaultProjects(),
            dailyTasks: getInitialDefaultTasks(),
            calendarEvents: getInitialDefaultEvents(),
            careerLogs: [],
            lastLocalUpdate: Date.now()
          };
        } else {
          store = {
            projects: [],
            dailyTasks: [],
            calendarEvents: [],
            careerLogs: [],
            lastLocalUpdate: Date.now()
          };
        }
      }

      // MASTER RECOVERY GUARANTEE: If master workspace ever has test project or fewer than 3 projects, FORCE RESTORE!
      if (isMaster) {
        const hasTestProject = store.projects && store.projects.some(p => p.name && p.name.includes('테스트 전용'));
        if (!store.projects || store.projects.length < 3 || hasTestProject) {
          console.warn('Master workspace was missing core projects. Unconditionally restoring 5 master projects!');
          store.projects = getInitialDefaultProjects();
          store.dailyTasks = getInitialDefaultTasks();
          store.calendarEvents = getInitialDefaultEvents();
          store.lastLocalUpdate = Date.now();
        }
      }

      // NON-MASTER PURGE: Non-master user must NEVER inherit master projects!
      if (!isMaster && store && Array.isArray(store.projects) && store.projects.some(p => p.name && (p.name.includes('용인시 노후계획도시') || p.name.includes('분당 노후계획도시')))) {
        store.projects = [];
        store.dailyTasks = [];
        store.calendarEvents = [];
        store.careerLogs = [];
      }

      if (!Array.isArray(store.projects)) store.projects = [];
      if (!Array.isArray(store.dailyTasks)) store.dailyTasks = [];
      if (!Array.isArray(store.calendarEvents)) store.calendarEvents = [];
      if (!Array.isArray(store.careerLogs)) store.careerLogs = [];
      store = sanitizeStore(store);

      try {
        localStorage.setItem(wsKey, JSON.stringify(store));
        if (isMaster) {
          localStorage.setItem('urban_clean_store_v11', JSON.stringify(store));
          localStorage.setItem('urban_clean_store_v10', JSON.stringify(store));
        }
      } catch(e) {}

      autoSyncCareerFromCompletedTasks();
      if (typeof ensureBaselineSnapshot === 'function') ensureBaselineSnapshot();
    }`;

if (loadStoreTargetRegex.test(html)) {
  html = html.replace(loadStoreTargetRegex, newLoadStore);
  console.log('2. loadStore updated with MASTER RECOVERY GUARANTEE!');
} else {
  console.error('2. loadStoreTargetRegex FAILED to match!');
  process.exit(1);
}

// 3. Update restoreDefaultProjectsData to unconditionally restore all 5 projects
const restoreProjectsRegex = /function restoreDefaultProjectsData\(\) \{[\s\S]*?alert\([^)]+\);[\s\S]*?\}/;

const newRestoreProjects = `function restoreDefaultProjectsData() {
      store.projects = getInitialDefaultProjects();
      store.dailyTasks = getInitialDefaultTasks();
      store.calendarEvents = getInitialDefaultEvents();
      store.lastLocalUpdate = Date.now();
      saveStore();
      alert('🎉 총괄 마스터 전용 5대 핵심 프로젝트(용인시, 분당, 인천시, 광명시, 작전역)와 모든 세부 마일스톤 일정이 100% 완벽하게 원상복구되었습니다!');
    }`;

if (restoreProjectsRegex.test(html)) {
  html = html.replace(restoreProjectsRegex, newRestoreProjects);
  console.log('3. restoreDefaultProjectsData updated!');
} else {
  console.warn('3. restoreProjectsRegex did not match directly, checking...');
}

// 4. In desktop auth header, add a quick [🔄 마스터 데이터 복구] button if isMaster
const authHeaderMarker = `\${isMaster ? \`
              <button onclick="openMemberAdminModal()" class="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 transition text-xs flex items-center gap-1 shadow-2xs cursor-pointer" title="가입 신청 승인 및 사용자 권한 관리">
                👥 구성원 관리
              </button>\` : ''}`;

const authHeaderReplacement = `\${isMaster ? \`
              <button onclick="restoreDefaultProjectsData()" class="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-300 transition text-xs flex items-center gap-1 shadow-2xs cursor-pointer" title="5대 마스터 프로젝트 즉시 원상복구">
                🔄 마스터 데이터 복구
              </button>
              <button onclick="openMemberAdminModal()" class="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 transition text-xs flex items-center gap-1 shadow-2xs cursor-pointer" title="가입 신청 승인 및 사용자 권한 관리">
                👥 구성원 관리
              </button>\` : ''}`;

if (html.includes(authHeaderMarker)) {
  html = html.replace(authHeaderMarker, authHeaderReplacement);
  console.log('4. [🔄 마스터 데이터 복구] button added directly to master header!');
}

// 5. Update version badge to v1.23.6
html = html.replace(/<span class="text-\[11px\] font-bold px-2 py-0\.5 bg-blue-100 text-blue-800 rounded-md">v1\.23\.\d+<\/span>/g, '<span class="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">v1.23.6</span>');

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

console.log('MASTER RECOVERY & CLOUD ISOLATION COMPLETE! 🎉');
