const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetPath = path.join(__dirname, '..', '..', 'index.html');
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');

let html = fs.readFileSync(targetPath, 'utf8');

const targetDesktopAuth = `      // Desktop header auth container
      const desktopContainer = document.getElementById('desktopAuthStatus');
      if (desktopContainer) {
        if (isAdmin) {
          desktopContainer.innerHTML = \`
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 rounded-xl flex items-center gap-1.5 text-xs shadow-2xs">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                👑 관리자 모드
              </span>
              <button onclick="openChangePasswordModal()" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition text-xs flex items-center gap-1" title="관리자 비밀번호 변경">
                ⚙️ 비번 변경
              </button>
              <button onclick="handleLogout()" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition text-xs flex items-center gap-1" title="로그아웃 (게스트 모드로 전환)">
                🚪 로그아웃
              </button>
            </div>
          \`;
        } else {
          desktopContainer.innerHTML = \`
            <div class="flex items-center gap-2 shrink-0">
              <span class="px-3 py-1.5 bg-amber-50 text-amber-800 font-bold border border-amber-300 rounded-xl flex items-center gap-1.5 text-xs shadow-2xs">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                👀 게스트 (조회 전용)
              </span>
              <button onclick="showLoginPortal()" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition text-xs flex items-center gap-1.5">
                🚪 로그인 화면으로
              </button>
            </div>
          \`;
        }
      }

      // Mobile header auth container
      const mobContainer = document.getElementById('mobileAuthContainer');
      if (mobContainer) {
        if (isAdmin) {
          mobContainer.innerHTML = \`
            <span class="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-[11px] font-bold">👑 관리자</span>
            <button onclick="handleLogout()" class="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold" title="로그아웃">🚪</button>
          \`;
        } else {
          mobContainer.innerHTML = \`
            <button onclick="showLoginPortal()" class="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1">🚪 로그인</button>
          \`;
        }
      }`;

const replacementAuth = `      // Desktop header auth container
      const desktopContainer = document.getElementById('desktopAuthStatus');
      if (desktopContainer) {
        if (currentUser) {
          const isMaster = (currentUser.id === 'admin' || currentUser.role === 'super_admin');
          desktopContainer.innerHTML = \`
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="px-3 py-1.5 \${isMaster ? 'bg-indigo-50 text-indigo-800 border-indigo-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300'} font-bold border rounded-xl flex items-center gap-1.5 text-xs shadow-2xs">
                <span class="w-2 h-2 rounded-full \${isMaster ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}"></span>
                \${isMaster ? '👑 총괄 마스터' : '✍️ 실무자'} (\${currentUser.name || currentUser.id})
              </span>
              <button onclick="openUserProfileModal()" class="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold rounded-xl border border-slate-300 transition text-xs flex items-center gap-1 shadow-2xs cursor-pointer" title="내 프로필 및 회사 CI 관리">
                👤 프로필/CI
              </button>
              \${isMaster ? \`
              <button onclick="openMemberAdminModal()" class="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 transition text-xs flex items-center gap-1 shadow-2xs cursor-pointer" title="가입 신청 승인 및 사용자 권한 관리">
                👥 구성원 관리
              </button>\` : ''}
              <button onclick="handleLogout()" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition text-xs flex items-center gap-1 shadow-2xs cursor-pointer" title="로그아웃 (게스트 모드로 전환)">
                🚪 로그아웃
              </button>
            </div>
          \`;
        } else {
          desktopContainer.innerHTML = \`
            <div class="flex items-center gap-2 shrink-0">
              <span class="px-3 py-1.5 bg-amber-50 text-amber-800 font-bold border border-amber-300 rounded-xl flex items-center gap-1.5 text-xs shadow-2xs">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                👀 게스트 (조회 전용)
              </span>
              <button onclick="showLoginPortal()" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition text-xs flex items-center gap-1.5 cursor-pointer">
                🚪 로그인 / 가입
              </button>
            </div>
          \`;
        }
      }

      // Mobile header auth container
      const mobContainer = document.getElementById('mobileAuthContainer');
      if (mobContainer) {
        if (currentUser) {
          const isMaster = (currentUser.id === 'admin' || currentUser.role === 'super_admin');
          mobContainer.innerHTML = \`
            <button onclick="openUserProfileModal()" class="px-2 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-[11px] font-bold" title="내 프로필">👤 \${currentUser.name || '내정보'}</button>
            \${isMaster ? '<button onclick="openMemberAdminModal()" class="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-bold" title="구성원 관리">👥</button>' : ''}
            <button onclick="handleLogout()" class="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold" title="로그아웃">🚪</button>
          \`;
        } else {
          mobContainer.innerHTML = \`
            <button onclick="showLoginPortal()" class="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1">🚪 로그인</button>
          \`;
        }
      }`;

if (!html.includes(targetDesktopAuth)) {
  console.error('Target desktop auth block not found!');
  process.exit(1);
}

html = html.replace(targetDesktopAuth, replacementAuth);

// Update version badge to v1.23.3
html = html.replace(/<span class="text-\[11px\] font-bold px-2 py-0\.5 bg-blue-100 text-blue-800 rounded-md">v1\.23\.\d+<\/span>/g, '<span class="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">v1.23.3</span>');

fs.writeFileSync(targetPath, html, 'utf8');
fs.writeFileSync(destPath, html, 'utf8');

console.log('updateAuthUI updated with [👤 프로필/CI] button for logged in users!');

// Verify script syntax
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const code = match[1];
  if (!code.trim()) continue;
  try {
    new vm.Script(code);
  } catch(e) {
    console.error('Script #' + count + ' syntax error:', e.message);
    process.exit(1);
  }
}
console.log('All scripts verified successfully! ✅');
