const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetPath = path.join(__dirname, '..', '..', 'index.html');
let html = fs.readFileSync(targetPath, 'utf8');

console.log('Original length:', html.length);

// ========================================================
// 1. FIX DESKTOP HEADER BRAND: REMOVE PINK BADGE & DESCRIPTION, LOGO UNDER TITLE
// ========================================================
const oldHeaderStart = '<div class="flex items-center gap-3.5">';
const oldHeaderEnd = '<!-- Quick Summary Badges & Action Buttons -->';

const sIdx = html.indexOf(oldHeaderStart);
const eIdx = html.indexOf(oldHeaderEnd, sIdx);

if (sIdx !== -1 && eIdx !== -1) {
  const newHeaderBrandHtml = `<div class="flex flex-col justify-center items-start gap-1">
        <div class="flex items-center gap-2">
          <h1 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            도시계획 업무관리시스템
          </h1>
          <span class="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">v1.23.2</span>
        </div>
        <div class="flex items-center gap-2 pt-0.5">
          <img id="headerCompanyLogo" src="app_logo.png" alt="Company CI" class="h-6 sm:h-6.5 max-w-[130px] object-contain">
          <span id="headerCompanyName" class="text-xs font-semibold text-slate-500">주식회사 경호엔지니어링 종합건축사사무소</span>
        </div>
      </div>\n\n      `;
  html = html.slice(0, sIdx) + newHeaderBrandHtml + html.slice(eIdx);
  console.log('1. Desktop header brand updated (pink badge & description removed, logo placed under title).');
} else {
  console.error('Could not locate desktop header brand!');
}

// ========================================================
// 2. FIX BROKEN CARD BUTTONS (Missing <button tag)
// ========================================================
html = html.replaceAll(
  '\n                  onclick="openSolutionWorkbench(',
  '\n                  <button type="button" onclick="openSolutionWorkbench('
);
console.log('2. Broken solution card buttons fixed with valid <button> tag.');

// ========================================================
// 3. INJECT USER PROFILE MODAL (#userProfileModal) BEFORE </body>
// ========================================================
const userProfileModalHtml = `
  <!-- ======================================================== -->
  <!-- 👤 USER PROFILE & COMPANY CI MANAGEMENT MODAL (v1.23.2) -->
  <!-- ======================================================== -->
  <div id="userProfileModal" class="hidden fixed inset-0 z-[9990] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>내 프로필 및 회사 CI 관리</span>
              <span id="profileModalRoleBadge" class="text-xs px-2 py-0.5 bg-blue-500/30 text-blue-300 border border-blue-400/30 rounded-full font-bold">마스터</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">성명, 소속 회사명, 상단 헤더 CI 로고 및 비밀번호를 관리합니다.</p>
          </div>
        </div>
        <button onclick="closeUserProfileModal()" class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Form Body -->
      <div class="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
        <div>
          <label class="block font-bold text-slate-700 mb-1">아이디 (ID)</label>
          <input type="text" id="profileUserId" disabled class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-500 cursor-not-allowed">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">성명 / 직급 <span class="text-rose-500">*</span></label>
            <input type="text" id="profileUserName" placeholder="예: 이승헌 소장" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">소속 회사명 <span class="text-rose-500">*</span></label>
            <input type="text" id="profileCompany" placeholder="예: 주식회사 경호엔지니어링" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
        </div>

        <!-- CI LOGO UPLOAD & PREVIEW -->
        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
          <div class="flex items-center justify-between">
            <label class="block font-bold text-slate-800">회사 CI 로고 이미지</label>
            <span class="text-[10px] text-slate-400">헤더에 즉시 반영됩니다</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-20 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
              <img id="profileCiPreview" src="app_logo.png" alt="CI 미리보기" class="max-h-9 max-w-full object-contain">
            </div>
            <div class="flex-1 space-y-1">
              <input type="file" id="profileCiFileInput" accept="image/*" onchange="handleProfileLogoUpload(event)" class="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer">
              <p class="text-[10.5px] text-slate-400">PNG, JPG, SVG 이미지 지원 (투명 배경 권장)</p>
            </div>
          </div>
        </div>

        <!-- PASSWORD CHANGE SECTION -->
        <div class="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2.5">
          <div class="font-bold text-amber-900 flex items-center gap-1.5">
            <i data-lucide="key" class="w-3.5 h-3.5 text-amber-700"></i> 비밀번호 변경 (선택 사항)
          </div>
          <div class="space-y-2">
            <div>
              <input type="password" id="profileNewPassword" placeholder="새 비밀번호 입력 (미변경시 공란 유지)" class="w-full px-3.5 py-2 bg-white border border-amber-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500">
            </div>
            <div>
              <input type="password" id="profileNewPasswordConfirm" placeholder="새 비밀번호 확인" class="w-full px-3.5 py-2 bg-white border border-amber-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500">
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
        <button onclick="closeUserProfileModal()" class="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
          취소
        </button>
        <button onclick="saveUserProfileSettings()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer">
          <i data-lucide="check" class="w-4 h-4"></i>
          <span>변경사항 저장</span>
        </button>
      </div>
    </div>
  </div>\n`;

const bodyIdx = html.indexOf('</body>');
if (!html.includes('id="userProfileModal"')) {
  html = html.slice(0, bodyIdx) + userProfileModalHtml + html.slice(bodyIdx);
  console.log('3. userProfileModal injected before </body>.');
}

// ========================================================
// 4. JAVASCRIPT: ADD PROFILE MANAGEMENT LOGIC & UPDATE AUTH UI
// ========================================================
const profileFunctionsJs = `
    let tempProfileLogoDataUrl = null;

    function openUserProfileModal() {
      const user = getCurrentUser();
      if (!user) return alert('로그인이 필요합니다.');

      const idEl = document.getElementById('profileUserId');
      const nameEl = document.getElementById('profileUserName');
      const compEl = document.getElementById('profileCompany');
      const prevEl = document.getElementById('profileCiPreview');
      const pwEl = document.getElementById('profileNewPassword');
      const pwConfEl = document.getElementById('profileNewPasswordConfirm');
      const badge = document.getElementById('profileModalRoleBadge');

      if (idEl) idEl.value = user.id;
      if (nameEl) nameEl.value = user.name || '';
      if (compEl) compEl.value = user.company || user.department || '주식회사 경호엔지니어링 종합건축사사무소';
      if (prevEl) prevEl.src = user.companyLogo || 'app_logo.png';
      if (pwEl) pwEl.value = '';
      if (pwConfEl) pwConfEl.value = '';

      if (badge) {
        badge.innerText = (user.id === 'admin' || user.role === 'super_admin') ? '👑 총괄 마스터' : (user.role || '실무자');
      }

      tempProfileLogoDataUrl = user.companyLogo || 'app_logo.png';

      const modal = document.getElementById('userProfileModal');
      if (modal) modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    function closeUserProfileModal() {
      const modal = document.getElementById('userProfileModal');
      if (modal) modal.classList.add('hidden');
    }

    function handleProfileLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        tempProfileLogoDataUrl = e.target.result;
        const preview = document.getElementById('profileCiPreview');
        if (preview) preview.src = tempProfileLogoDataUrl;
      };
      reader.readAsDataURL(file);
    }

    function saveUserProfileSettings() {
      const user = getCurrentUser();
      if (!user) return;

      const nameEl = document.getElementById('profileUserName');
      const compEl = document.getElementById('profileCompany');
      const pwEl = document.getElementById('profileNewPassword');
      const pwConfEl = document.getElementById('profileNewPasswordConfirm');

      const newName = (nameEl ? nameEl.value : '').trim();
      const newComp = (compEl ? compEl.value : '').trim();
      const newPw = (pwEl ? pwEl.value : '').trim();
      const newPwConf = (pwConfEl ? pwConfEl.value : '').trim();

      if (!newName) return alert('성명을 입력해주세요.');
      if (!newComp) return alert('소속 회사명을 입력해주세요.');

      if (newPw) {
        if (newPw.length < 4) return alert('새 비밀번호는 4자 이상이어야 합니다.');
        if (newPw !== newPwConf) return alert('새 비밀번호 확인이 일치하지 않습니다.');
      }

      const users = getRegisteredUsers();
      const target = users[user.id] || (user.id === 'admin' ? users.admin : null);
      if (!target) return alert('사용자 정보를 찾을 수 없습니다.');

      target.name = newName;
      target.company = newComp;
      target.department = newComp;
      if (tempProfileLogoDataUrl) {
        target.companyLogo = tempProfileLogoDataUrl;
      }
      if (newPw) {
        target.password = newPw;
        if (user.id === 'admin') {
          try { localStorage.setItem('urban_admin_passcode', newPw); } catch(e) {}
        }
      }

      saveRegisteredUsers(users);
      closeUserProfileModal();
      updateAuthUI();

      alert('🎉 내 프로필 및 회사 CI 정보가 성공적으로 저장되었습니다!');
    }
`;

// Insert profileFunctionsJs right before function openMemberAdminModal
const memberModalMarker = 'function openMemberAdminModal() {';
if (html.includes(memberModalMarker) && !html.includes('function openUserProfileModal')) {
  html = html.replace(memberModalMarker, profileFunctionsJs + '\n    ' + memberModalMarker);
  console.log('4. Profile management functions injected.');
}

// Update updateAuthUI to include [👤 프로필/CI] button in desktop and mobile header
const oldAuthUiSnippet = `<span class="w-2 h-2 rounded-full \${isMaster ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}"></span>
                \${isMaster ? '👑 총괄 마스터' : '✍️ 실무자'} (\${currentUser.name})
              </span>`;

const newAuthUiSnippet = `<span class="px-3 py-1.5 \${isMaster ? 'bg-indigo-50 text-indigo-800 border-indigo-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300'} font-bold border rounded-xl flex items-center gap-1.5 text-xs shadow-2xs">
                <span class="w-2 h-2 rounded-full \${isMaster ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}"></span>
                \${isMaster ? '👑 총괄 마스터' : '✍️ 실무자'} (\${currentUser.name})
              </span>
              <button onclick="openUserProfileModal()" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition text-xs flex items-center gap-1 shadow-2xs cursor-pointer" title="내 프로필 및 회사 CI 관리">
                👤 프로필/CI
              </button>`;

if (html.includes(oldAuthUiSnippet)) {
  html = html.replace(oldAuthUiSnippet, newAuthUiSnippet);
  console.log('5. Profile button added to header auth status.');
}

// Save back to index.html and urban_project_manager.html
fs.writeFileSync(targetPath, html, 'utf8');
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');
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

console.log('HEADER, CARDS, AND PROFILE COMPLETED SUCCESSFULLY! 🎉');
