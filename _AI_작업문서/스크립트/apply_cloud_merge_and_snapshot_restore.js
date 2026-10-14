const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetPath = path.join(__dirname, '..', '..', 'index.html');
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');

let html = fs.readFileSync(targetPath, 'utf8');

const targetBlock = `            // Merge projects so master never loses custom projects
            const mergedProjectsMap = new Map();
            (cleanRemote.projects || []).forEach(p => { if (p && p.id) mergedProjectsMap.set(p.id, p); });
            let localHadNewProjects = false;
            (store.projects || []).forEach(p => {
              if (p && p.id && !mergedProjectsMap.has(p.id)) {
                mergedProjectsMap.set(p.id, p);
                localHadNewProjects = true;
              }
            });
            cleanRemote.projects = Array.from(mergedProjectsMap.values());

            // Merge career logs
            const mergedCareerMap = new Map();
            (cleanRemote.careerLogs || []).forEach(c => { if (c && c.id) mergedCareerMap.set(c.id, c); });
            let localHadNewCareer = false;
            (store.careerLogs || []).forEach(c => {
              if (c && c.id && !mergedCareerMap.has(c.id)) {
                mergedCareerMap.set(c.id, c);
                localHadNewCareer = true;
              }
            });
            cleanRemote.careerLogs = Array.from(mergedCareerMap.values());`;

const replacementBlock = `            // Merge projects so master never loses custom projects (dedup by name or id)
            const mergedProjectsMap = new Map();
            (cleanRemote.projects || []).forEach(p => { 
              const key = (p && (p.name || p.id)) ? (p.name || p.id).trim() : null;
              if (key) mergedProjectsMap.set(key, p); 
            });
            let localHadNewProjects = false;
            (store.projects || []).forEach(p => {
              const key = (p && (p.name || p.id)) ? (p.name || p.id).trim() : null;
              if (key && !mergedProjectsMap.has(key)) {
                mergedProjectsMap.set(key, p);
                localHadNewProjects = true;
              }
            });
            cleanRemote.projects = Array.from(mergedProjectsMap.values());

            // Merge career logs (dedup by id or title_date)
            const mergedCareerMap = new Map();
            (cleanRemote.careerLogs || []).forEach(c => { 
              const key = (c && (c.id || (c.title + '_' + (c.date || '')))) ? (c.id || (c.title + '_' + (c.date || ''))).trim() : null;
              if (key) mergedCareerMap.set(key, c); 
            });
            let localHadNewCareer = false;
            (store.careerLogs || []).forEach(c => {
              const key = (c && (c.id || (c.title + '_' + (c.date || '')))) ? (c.id || (c.title + '_' + (c.date || ''))).trim() : null;
              if (key && !mergedCareerMap.has(key)) {
                mergedCareerMap.set(key, c);
                localHadNewCareer = true;
              }
            });
            cleanRemote.careerLogs = Array.from(mergedCareerMap.values());`;

if (html.includes(targetBlock)) {
  html = html.replace(targetBlock, replacementBlock);
  console.log('1. Smart deduplicated cloud merge injected! ✅');
} else {
  console.error('Target block not found!');
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

console.log('ALL INJECTIONS AND SYNTAX CHECKS PASSED! 🎉');
