const https = require('https');
const fs = require('fs');

const dbUrl = 'https://urban-project-ed906-default-rtdb.firebaseio.com';

const checkPath = (p) => {
  https.get(dbUrl + p + '.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('--- PATH:', p, 'STATUS:', res.statusCode);
      try {
        const parsed = JSON.parse(data);
        if (parsed) {
          console.log('Keys:', Object.keys(parsed));
          if (parsed.projects) {
            const prjs = Array.isArray(parsed.projects) ? parsed.projects : Object.values(parsed.projects);
            console.log('Projects count:', prjs.length);
            console.log('Project names:', prjs.map(pr => pr ? pr.name : null));
          }
          if (parsed.dailyTasks) {
            const tasks = Array.isArray(parsed.dailyTasks) ? parsed.dailyTasks : Object.values(parsed.dailyTasks);
            console.log('Daily tasks count:', tasks.length);
            console.log('First 5 task titles:', tasks.slice(0, 5).map(t => t ? (t.title || t.theme) : null));
            console.log('Last 5 task titles:', tasks.slice(-5).map(t => t ? (t.title || t.theme) : null));
          }
        } else {
          console.log('Data is null');
        }
      } catch(e) {
        console.log('Raw data (snippet):', data.slice(0, 300));
      }
    });
  }).on('error', err => console.error('Error fetching ' + p, err.message));
};

checkPath('/urban_project_store');
checkPath('/urban_project_master_vault_v3');
checkPath('/urban_user_workspaces');
