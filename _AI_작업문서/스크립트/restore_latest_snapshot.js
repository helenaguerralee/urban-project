const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetPath = path.join(__dirname, '..', '..', 'index.html');
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');

let html = fs.readFileSync(targetPath, 'utf8');

const targetBlock = `      // MASTER RECOVERY GUARANTEE: If master workspace ever has test project or fewer than 3 projects, FORCE RESTORE!
      if (isMaster) {
        const hasTestProject = store.projects && store.projects.some(p => p.name && p.name.includes('테스트 전용'));
        if (!store.projects || store.projects.length < 3 || hasTestProject) {
          console.warn('Master workspace was missing core projects. Unconditionally restoring 5 master projects!');
          store.projects = getInitialDefaultProjects();
          store.dailyTasks = getInitialDefaultTasks();
          store.calendarEvents = getInitialDefaultEvents();
          store.lastLocalUpdate = Date.now();
        }
      }`;

const replacementBlock = `      // MASTER RECOVERY GUARANTEE: If master workspace has test project, fewer projects, or if a richer historical snapshot exists, RESTORE LATEST RICH SNAPSHOT!
      if (isMaster) {
        let needsRestore = false;
        const hasTestProject = store.projects && store.projects.some(p => p.name && p.name.includes('테스트 전용'));
        if (!store.projects || store.projects.length < 3 || hasTestProject) {
          needsRestore = true;
        }

        let richSnap = null;
        try {
          const rawSnap = localStorage.getItem('urban_snapshot_history_v1');
          if (rawSnap) {
            const snaps = JSON.parse(rawSnap);
            if (Array.isArray(snaps)) {
              // Find clean snapshots without '테스트 전용'
              const candidates = snaps.filter(s => s && s.data && Array.isArray(s.data.projects) && s.data.projects.length >= 3 && !s.data.projects.some(p => p.name && p.name.includes('테스트 전용')));
              // Prioritize snapshots with higher project count (e.g. 7 projects), or higher careerLogs (e.g. 112건), or higher task count
              candidates.sort((a, b) => {
                const pA = a.data.projects?.length || 0;
                const pB = b.data.projects?.length || 0;
                if (pB !== pA) return pB - pA;
                const cA = a.data.careerLogs?.length || 0;
                const cB = b.data.careerLogs?.length || 0;
                if (cB !== cA) return cB - cA;
                const tA = a.data.dailyTasks?.length || 0;
                const tB = b.data.dailyTasks?.length || 0;
                return tB - tA;
              });
              if (candidates.length > 0) {
                richSnap = candidates[0];
              }
            }
          }
        } catch(e) {}

        // Also check legacy keys if no rich snapshot in history
        if (!richSnap) {
          ['urban_clean_store_v10', 'urban_clean_store_v9'].forEach(k => {
            try {
              const raw = localStorage.getItem(k);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.projects) && parsed.projects.length >= 5 && !parsed.projects.some(p => p.name && p.name.includes('테스트 전용'))) {
                  if (!richSnap || (parsed.projects.length > (richSnap.data?.projects?.length || 0))) {
                    richSnap = { data: parsed };
                  }
                }
              }
            } catch(e) {}
          });
        }

        const currentProjCount = (store.projects || []).length;
        const currentCareerCount = (store.careerLogs || []).length;
        if (richSnap && richSnap.data) {
          const richProjCount = (richSnap.data.projects || []).length;
          const richCareerCount = (richSnap.data.careerLogs || []).length;
          // Auto-restore if corrupt/test project, or if rich snapshot has strictly more projects (e.g. 7 vs 5) or more career logs (112 vs 0)
          if (needsRestore || richProjCount > currentProjCount || (richProjCount >= currentProjCount && richCareerCount > currentCareerCount)) {
            console.log('Restoring from latest master rich snapshot in history with', richProjCount, 'projects and', richCareerCount, 'career logs!');
            store = sanitizeStore(richSnap.data);
            needsRestore = false;
          }
        }

        if (needsRestore) {
          console.warn('No rich snapshot found in history. Restoring 5 master projects!');
          store.projects = getInitialDefaultProjects();
          store.dailyTasks = getInitialDefaultTasks();
          store.calendarEvents = getInitialDefaultEvents();
        }
        store.lastLocalUpdate = Date.now();
      }`;

if (html.includes(targetBlock)) {
  html = html.replace(targetBlock, replacementBlock);
  console.log('1. Smart auto-restore from urban_snapshot_history_v1 injected!');
} else {
  console.error('Target block not found!');
  process.exit(1);
}

// Update version badge to v1.23.7
html = html.replace(/<span class="text-\[11px\] font-bold px-2 py-0\.5 bg-blue-100 text-blue-800 rounded-md">v1\.23\.\d+<\/span>/g, '<span class="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">v1.23.7</span>');

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

console.log('SMART AUTO RESTORE UPGRADE COMPLETE! 🎉');
