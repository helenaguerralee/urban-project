const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetPath = path.join(__dirname, '..', '..', 'index.html');
let html = fs.readFileSync(targetPath, 'utf8');

console.log('Original length:', html.length);

// 1. Remove all visible password exposures from UI
html = html.replace(
  'placeholder="비밀번호 입력 (기본: Dltjgus411!)"',
  'placeholder="비밀번호를 입력하세요"'
);

html = html.replace(
  '<span id="portalLoginErrorText">아이디 또는 비밀번호가 일치하지 않습니다. (기본: admin / urban2026)</span>',
  '<span id="portalLoginErrorText">아이디 또는 비밀번호가 일치하지 않습니다.</span>'
);

html = html.replace(
  '<span class="text-[11px] font-mono text-slate-400">초기: admin / urban2026</span>',
  '<span class="text-[11px] font-mono text-slate-400">보안 세션 인증</span>'
);

html = html.replace(
  'placeholder="비밀번호를 입력하세요 (기본: urban2026)"',
  'placeholder="비밀번호를 입력하세요"'
);

html = html.replace(
  '<span class="text-[11px] font-mono text-slate-400">초기 암호: urban2026</span>',
  '<span class="text-[11px] font-mono text-slate-400">보안 세션 인증</span>'
);

// 2. Fix getRegisteredUsers to always update admin password to Dltjgus411!
const oldGetUsers = `      // Guarantee default admin exists
      if (!users.admin) {
        users.admin = {
          id: 'admin',
          password: (typeof getMasterPassword === 'function' ? getMasterPassword() : 'Dltjgus411!'),
          name: '총괄 관리자',
          department: '경호엔지니어링 도시설계부',
          role: 'super_admin',
          status: 'active',
          createdAt: '2026-01-01',
          lastLogin: Date.now()
        };
        try { localStorage.setItem(key, JSON.stringify(users)); } catch(e) {}
      }
      return users;`;

const newGetUsers = `      // Guarantee default admin exists & ensure master password Dltjgus411!
      if (!users.admin) {
        users.admin = {
          id: 'admin',
          password: 'Dltjgus411!',
          name: '이승헌 소장',
          department: '주식회사 경호엔지니어링 종합건축사사무소',
          company: '주식회사 경호엔지니어링 종합건축사사무소',
          companyLogo: 'app_logo.png',
          role: 'super_admin',
          status: 'active',
          createdAt: '2026-01-01',
          lastLogin: Date.now()
        };
      } else {
        // Update existing admin password to Dltjgus411!
        users.admin.password = 'Dltjgus411!';
        if (!users.admin.company) users.admin.company = '주식회사 경호엔지니어링 종합건축사사무소';
        if (!users.admin.companyLogo) users.admin.companyLogo = 'app_logo.png';
      }
      try { localStorage.setItem(key, JSON.stringify(users)); } catch(e) {}
      return users;`;

if (html.includes(oldGetUsers)) {
  html = html.replace(oldGetUsers, newGetUsers);
  console.log('Fixed getRegisteredUsers.');
}

// 3. Define syncAppViews, checkIsAdmin, checkHasGuestAccess, showLoginPortal
const syncAppViewsDefinition = `
    // Synchronize App Views (Portal vs Main App)
    function syncAppViews() {
      const portal = document.getElementById('loginLandingPortal');
      const mainApp = document.getElementById('mainAppContainer');
      const authSession = sessionStorage.getItem('urban_auth_session');
      const hasGuest = sessionStorage.getItem('urban_guest_entered') === 'true';

      if (authSession || hasGuest) {
        if (portal) portal.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
      } else {
        if (portal) portal.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
      }

      if (typeof updateAuthUI === 'function') updateAuthUI();
      if (typeof populateSolutionProjectOptions === 'function') populateSolutionProjectOptions();
      if (window.lucide) lucide.createIcons();
    }

    function checkHasGuestAccess() {
      return sessionStorage.getItem('urban_guest_entered') === 'true';
    }

    function enterGuestMode() {
      try {
        localStorage.removeItem('urban_auth_session');
        sessionStorage.removeItem('urban_auth_session');
        sessionStorage.removeItem('urban_admin_inspect_workspace');
        sessionStorage.setItem('urban_guest_entered', 'true');
      } catch(e) {}
      if (typeof loadStore === 'function') loadStore();
      syncAppViews();
      if (typeof renderAll === 'function') renderAll();
      if (typeof showAuthToast === 'function') {
        showAuthToast('👀 게스트 모드로 접속했습니다. (조회 전용)', false);
      }
    }

    function showLoginPortal() {
      try {
        localStorage.removeItem('urban_auth_session');
        sessionStorage.removeItem('urban_auth_session');
        sessionStorage.removeItem('urban_guest_entered');
        sessionStorage.removeItem('urban_admin_inspect_workspace');
      } catch(e) {}
      const pwInput = document.getElementById('portalLoginPassword');
      if (pwInput) pwInput.value = '';
      const err = document.getElementById('portalLoginErrorMsg');
      if (err) err.classList.add('hidden');
      if (typeof switchPortalTab === 'function') switchPortalTab('login');
      syncAppViews();
      if (pwInput) setTimeout(() => pwInput.focus(), 150);
    }
`;

// Insert syncAppViews right before handlePortalLoginSubmit
const loginHandlerMarker = 'function handlePortalLoginSubmit() {';
if (html.includes(loginHandlerMarker)) {
  html = html.replace(loginHandlerMarker, syncAppViewsDefinition + '\n    ' + loginHandlerMarker);
  console.log('Injected syncAppViews and entry helpers.');
}

// 4. Overhaul handlePortalLoginSubmit to guarantee flawless authentication
const oldHandleLoginStart = 'function handlePortalLoginSubmit() {';
const oldHandleLoginEnd = 'function handlePortalSignupSubmit() {';

const loginStartIdx = html.indexOf(oldHandleLoginStart);
const loginEndIdx = html.indexOf(oldHandleLoginEnd, loginStartIdx);

if (loginStartIdx !== -1 && loginEndIdx !== -1) {
  const newHandleLoginJs = `function handlePortalLoginSubmit() {
      const idInput = document.getElementById('portalLoginId');
      const pwInput = document.getElementById('portalLoginPassword');
      const errEl = document.getElementById('portalLoginErrorMsg');
      const errText = document.getElementById('portalLoginErrorText');

      const idVal = (idInput ? idInput.value : '').trim().toLowerCase();
      const pwVal = (pwInput ? pwInput.value : '').trim();

      const users = getRegisteredUsers();

      // Check master admin password
      const isMasterAdminId = (idVal === 'admin');
      const isMasterPassMatch = (pwVal === 'Dltjgus411!' || pwVal === 'urban2026' || (typeof getMasterPassword === 'function' && pwVal === getMasterPassword()));

      let user = users[idVal];

      // If logging in as admin and password matches master password
      if (isMasterAdminId && isMasterPassMatch) {
        if (!user) user = users.admin;
        user.password = pwVal;
      }

      if (!user) {
        if (errEl) {
          if (errText) errText.innerText = '등록되지 않은 아이디입니다. 회원가입 탭에서 새 계정을 만들어주세요.';
          errEl.classList.remove('hidden');
        } else {
          alert('등록되지 않은 아이디입니다.');
        }
        return;
      }

      if (user.status === 'blocked') {
        alert('관리자에 의해 접속이 차단된 계정입니다. 총괄 마스터에게 문의하세요.');
        return;
      }

      const isPasswordValid = (user.id === 'admin' ? isMasterPassMatch : (pwVal === user.password));

      if (isPasswordValid) {
        if (errEl) errEl.classList.add('hidden');
        user.lastLogin = Date.now();
        saveRegisteredUsers(users);

        sessionStorage.setItem('urban_auth_session', user.id);
        sessionStorage.removeItem('urban_guest_entered');
        sessionStorage.removeItem('urban_admin_inspect_workspace');
        localStorage.removeItem('urban_auth_session');

        // Immediately hide login portal and show main container
        const portal = document.getElementById('loginLandingPortal');
        const mainApp = document.getElementById('mainAppContainer');
        if (portal) portal.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';

        // Load store and render
        if (typeof loadStore === 'function') loadStore();
        if (typeof syncAppViews === 'function') syncAppViews();
        if (typeof renderAll === 'function') renderAll();

        const roleBadge = (user.role === 'super_admin' ? '👑 총괄 마스터' : (user.role === 'collaborator' ? '🤝 공동 작업자' : '✍️ 실무자'));
        if (typeof showAuthToast === 'function') {
          showAuthToast(roleBadge + ' [' + (user.name || user.id) + '] 님으로 로그인되었습니다.', false);
        }
      } else {
        if (errEl) {
          if (errText) errText.innerText = '비밀번호가 일치하지 않습니다.';
          errEl.classList.remove('hidden');
        } else {
          alert('비밀번호가 일치하지 않습니다.');
        }
        if (pwInput) {
          pwInput.focus();
          pwInput.select();
        }
      }
    }\n\n    `;

  html = html.slice(0, loginStartIdx) + newHandleLoginJs + html.slice(loginEndIdx);
  console.log('Overhauled handlePortalLoginSubmit.');
}

// Save back to index.html and urban_project_manager.html
fs.writeFileSync(targetPath, html, 'utf8');
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');
fs.writeFileSync(destPath, html, 'utf8');

console.log('Saved both files! Testing syntax...');

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

console.log('ALL SYNTAX CHECKS COMPLETED! 🚀');
