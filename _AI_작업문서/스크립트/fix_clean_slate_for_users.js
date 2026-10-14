const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetPath = path.join(__dirname, '..', '..', 'index.html');
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');

let html = fs.readFileSync(targetPath, 'utf8');

// 1. Replace sanitizeStore and loadStore using RegExp
const sanitizeAndLoadRegex = /function sanitizeStore\(s\)[\s\S]*?function loadStore\(\)[\s\S]*?ensureBaselineSnapshot\(\);[\s\S]*?}/;

const replacementSanitizeAndLoad = `function sanitizeStore(s) {
      if (!s || typeof s !== 'object') s = {};
      const user = getCurrentUser();
      const isMaster = Boolean(user && (user.id === 'admin' || user.role === 'super_admin'));

      if (!Array.isArray(s.projects)) {
        s.projects = s.projects ? Object.values(s.projects) : (isMaster ? getInitialDefaultProjects() : []);
      }
      s.projects.forEach((p, pIdx) => {
        if (!p.id) p.id = 'p_' + pIdx;
        if (!p.name) p.name = '무제 사업';
        if (typeof p.progress !== 'number') p.progress = 0;
        if (!Array.isArray(p.milestones)) p.milestones = [];
        p.milestones.forEach((m, idx) => {
          if (!m.id) m.id = 'm_' + idx;
          if (m.status === undefined || m.status === null) m.status = 'todo';
          if (!m.title) m.title = '';
          if (!m.date) m.date = '';
        });
      });

      if (!Array.isArray(s.calendarEvents)) {
        s.calendarEvents = s.calendarEvents ? Object.values(s.calendarEvents) : (isMaster ? getInitialDefaultEvents() : []);
      }
      s.calendarEvents.forEach((e, eIdx) => {
        if (!e.id) e.id = 'e_' + eIdx;
        if (!e.title) e.title = '';
        if (!e.date) e.date = '';
      });

      if (!Array.isArray(s.dailyTasks)) {
        s.dailyTasks = s.dailyTasks ? Object.values(s.dailyTasks) : (isMaster ? getInitialDefaultTasks() : []);
      }
      if (isMaster && s.dailyTasks.length === 0 && (!s.projects || s.projects.length > 0)) {
        s.dailyTasks = getInitialDefaultTasks();
      }
      s.dailyTasks.forEach((t, tIdx) => {
        if (!t.id) t.id = 't_' + tIdx;
        if (!t.date) t.date = getTodayDateStr();
        if (!t.theme) t.theme = '';
        if (!Array.isArray(t.items) || t.items.length === 0) {
          if (t.title) {
            const lines = t.title.split(/(?=\\s+\\d+[\\.\\)]\\s+)|[\\r\\n]+/).map(x => x.trim()).filter(Boolean);
            if (lines.length > 1) {
              t.items = lines.map((line, i) => ({
                id: 'it_' + i,
                text: line,
                completed: !!t.completed
              }));
            } else {
              t.items = [{ id: 'it_0', text: t.title, completed: !!t.completed }];
            }
          } else {
            t.items = [{ id: 'it_0', text: '할 일 내용 없음', completed: false }];
          }
        }
        t.items.forEach((it, iIdx) => {
          if (!it.id) it.id = 'it_' + iIdx;
          if (!it.text) it.text = '';
          if (typeof it.completed !== 'boolean') it.completed = false;
        });
        t.title = t.items.map(it => it.text).join(' ');
        t.completed = t.items.length > 0 && t.items.every(it => it.completed);
      });
      if (!Array.isArray(s.careerLogs)) s.careerLogs = s.careerLogs ? Object.values(s.careerLogs) : [];
      if (!Array.isArray(s.workLogs)) s.workLogs = s.workLogs ? Object.values(s.workLogs) : [];
      if (!Array.isArray(s.trashTasks)) s.trashTasks = s.trashTasks ? Object.values(s.trashTasks) : [];
      if (typeof s.lastLocalUpdate !== 'number' || s.lastLocalUpdate > 2000000000000) s.lastLocalUpdate = Date.now();
      return JSON.parse(JSON.stringify(s));
    }

    function loadStore() {
      const user = getCurrentUser();
      const isMaster = Boolean(user && (user.id === 'admin' || user.role === 'super_admin'));
      const wsKey = getWorkspaceStorageKey();

      let saved = null;
      try {
        saved = localStorage.getItem(wsKey);
      } catch(e) {}

      // Fallback to legacy clean store ONLY for the master admin!
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
            lastLocalUpdate: 0
          };
        } else {
          // Normal registered user (e.g. test) starts 100% CLEAN!
          store = {
            projects: [],
            dailyTasks: [],
            calendarEvents: [],
            careerLogs: [],
            lastLocalUpdate: 0
          };
        }
      }

      // Safety check: Non-master user must NEVER inherit master's confidential projects!
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
      } catch(e) {}

      autoSyncCareerFromCompletedTasks();
      if (typeof ensureBaselineSnapshot === 'function') ensureBaselineSnapshot();
    }`;

if (sanitizeAndLoadRegex.test(html)) {
  html = html.replace(sanitizeAndLoadRegex, replacementSanitizeAndLoad);
  console.log('1. sanitizeStore and loadStore successfully updated!');
} else {
  console.error('1. sanitizeAndLoadRegex FAILED to match!');
  process.exit(1);
}

// 2. Replace empty state in renderMasterCards
const masterCardsEmptyRegex = /if \(!store\.projects \|\| store\.projects\.length === 0\) \{[\s\S]*?return;\s*\}/;

const newEmptyMasterCards = `if (!store.projects || store.projects.length === 0) {
        const user = getCurrentUser();
        const isMaster = Boolean(user && (user.id === 'admin' || user.role === 'super_admin'));
        grid.innerHTML = \`
          <div class="col-span-2 bg-white border-2 border-dashed border-blue-200 rounded-3xl p-10 sm:p-12 text-center space-y-4 shadow-xs">
            <div class="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-200 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-xs">🏙️</div>
            <div>
              <h4 class="font-bold text-slate-900 text-lg">새로운 전용 워크스페이스에 오신 것을 환영합니다!</h4>
              <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mt-1">
                현재 등록된 사업 프로젝트가 없습니다. 우측 상단의 <strong>[+ 신규 프로젝트 등록]</strong> 버튼을 눌러 담당하시는 도시계획/설계 프로젝트를 직접 등록하고 나만의 공정률과 로드맵을 시작해보세요!
              </p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button onclick="openAddProjectModal()" class="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                <span>+ 첫 프로젝트 등록하기</span>
              </button>
              \${isMaster ? \`
              <button onclick="restoreDefaultProjectsData()" class="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5 cursor-pointer">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> 🔄 마스터 기본 포트폴리오 복구
              </button>\` : ''}
            </div>
          </div>
        \`;
        if (window.lucide) lucide.createIcons();
        return;
      }`;

if (masterCardsEmptyRegex.test(html)) {
  html = html.replace(masterCardsEmptyRegex, newEmptyMasterCards);
  console.log('2. renderMasterCards empty state successfully updated!');
} else {
  console.error('2. masterCardsEmptyRegex FAILED to match!');
  process.exit(1);
}

// 3. Update version badge to v1.23.5
html = html.replace(/<span class="text-\[11px\] font-bold px-2 py-0\.5 bg-blue-100 text-blue-800 rounded-md">v1\.23\.\d+<\/span>/g, '<span class="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">v1.23.5</span>');

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

console.log('DATA ISOLATION AND CLEAN SLATE SYSTEM COMPLETE! 🎉');
