const fs = require('fs');
const path = require('path');
const vm = require('vm');

const trueMasterPath = path.join(__dirname, '..', '데이터_조서', 'true_master_store.json');
const trueMaster = JSON.parse(fs.readFileSync(trueMasterPath, 'utf8'));

const targetPath = path.join(__dirname, '..', '..', 'index.html');
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');

let html = fs.readFileSync(targetPath, 'utf8');

// 1. Replace getInitialDefaultProjects
const projectsRegex = /function getInitialDefaultProjects\(\)\s*\{[\s\S]*?return\s*\[[\s\S]*?\];\s*\}/;
const newProjectsFunc = `function getInitialDefaultProjects() {\n      return ${JSON.stringify(trueMaster.projects, null, 2)};\n    }`;

if (projectsRegex.test(html)) {
  html = html.replace(projectsRegex, newProjectsFunc);
  console.log('1. getInitialDefaultProjects replaced with 7 genuine projects! ✅');
} else {
  console.error('Failed to match getInitialDefaultProjects');
  process.exit(1);
}

// 2. Replace getInitialDefaultTasks
const tasksRegex = /function getInitialDefaultTasks\(\)\s*\{[\s\S]*?return\s*\[[\s\S]*?\];\s*\}/;
const newTasksFunc = `function getInitialDefaultTasks() {\n      return ${JSON.stringify(trueMaster.dailyTasks, null, 2)};\n    }`;

if (tasksRegex.test(html)) {
  html = html.replace(tasksRegex, newTasksFunc);
  console.log('2. getInitialDefaultTasks replaced with 30 genuine tasks! ✅');
} else {
  console.error('Failed to match getInitialDefaultTasks');
  process.exit(1);
}

// 3. Clean up loadStore to guarantee authentic restoration and purge fake data
const loadStoreMasterRegex = /\/\/ MASTER RECOVERY GUARANTEE:[\s\S]*?store\.lastLocalUpdate = Date\.now\(\);\s*\}/;

const newLoadStoreMaster = `// MASTER RECOVERY GUARANTEE: Ensure authentic 7 projects and genuine tasks
      if (isMaster) {
        // Purge any fake test projects from store
        if (store.projects && Array.isArray(store.projects)) {
          store.projects = store.projects.filter(p => p && p.name && !p.name.includes('성남시 원도심') && !p.name.includes('수원시 영통') && !p.name.includes('테스트 전용'));
        }
        if (store.dailyTasks && Array.isArray(store.dailyTasks)) {
          store.dailyTasks = store.dailyTasks.filter(t => t && t.title && !t.title.includes('최근 업무 4'));
        }

        const currentProjCount = (store.projects || []).length;
        const currentTaskCount = (store.dailyTasks || []).length;

        // If projects are fewer than 7 or tasks fewer than 30, restore the authentic baseline!
        if (currentProjCount < 7 || currentTaskCount < 30) {
          console.log('Restoring authentic 7 projects and 30 tasks for master workspace!');
          const defProjects = getInitialDefaultProjects();
          const defTasks = getInitialDefaultTasks();
          
          // Merge preserving existing project edits if any
          const pMap = new Map();
          defProjects.forEach(p => pMap.set(p.id, p));
          (store.projects || []).forEach(p => { if (p && p.id) pMap.set(p.id, p); });
          store.projects = Array.from(pMap.values());

          const tMap = new Map();
          defTasks.forEach(t => tMap.set(t.id, t));
          (store.dailyTasks || []).forEach(t => { if (t && t.id) tMap.set(t.id, t); });
          store.dailyTasks = Array.from(tMap.values());

          if (!store.calendarEvents || store.calendarEvents.length === 0) {
            store.calendarEvents = getInitialDefaultEvents();
          }
        }

        store.lastLocalUpdate = Date.now();
      }`;

if (loadStoreMasterRegex.test(html)) {
  html = html.replace(loadStoreMasterRegex, newLoadStoreMaster);
  console.log('3. loadStore master recovery replaced with genuine authentic logic! ✅');
} else {
  console.error('Failed to match loadStoreMasterRegex');
  process.exit(1);
}

// 4. Update version badge to v1.23.8
html = html.replace(/<span class="text-\[11px\] font-bold px-2 py-0\.5 bg-blue-100 text-blue-800 rounded-md">v1\.23\.\d+<\/span>/g, '<span class="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">v1.23.8</span>');

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

console.log('AUTHENTIC RESTORATION INJECTION COMPLETE! 🎉');
