const fs = require('fs');

const path = 'C:/Users/LSH2/.gemini/antigravity/brain/18d6c49d-0237-4163-8724-39bf7f1ba19c/.system_generated/logs/transcript.jsonl';
if (fs.existsSync(path)) {
  const content = fs.readFileSync(path, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('2026-10') && l.includes('출장')) {
      console.log('Line ' + (idx + 1) + ': ' + l.slice(0, 300));
    }
  });
}
