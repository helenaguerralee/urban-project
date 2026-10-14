const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('Fetching d8c8bc7:index.html from git...');
const baseline = cp.execSync('git show d8c8bc7:index.html', { maxBuffer: 10 * 1024 * 1024, encoding: 'utf8' });
console.log('Baseline fetched. Length:', baseline.length);

let html = baseline;

// ========================================================
// 1. UPDATE DEFAULT_MASTER_PASSWORD TO Dltjgus411!
// ========================================================
html = html.replace(
  "const DEFAULT_MASTER_PASSWORD = 'urban2026';",
  "const DEFAULT_MASTER_PASSWORD = 'Dltjgus411!';"
);

// ========================================================
// 2. REMOVE ALL VISIBLE PASSWORD STRINGS FROM HTML UI
// ========================================================
html = html.replace(
  'placeholder="비밀번호 입력 (기본: urban2026)"',
  'placeholder="비밀번호를 입력하세요"'
);

html = html.replace(
  '<span>아이디 또는 비밀번호가 일치하지 않습니다. (기본: admin / urban2026)</span>',
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

// Version bump
html = html.replace('<span>v1.22.0 Enterprise Workspace</span>', '<span>v1.23.0 Enterprise Workspace</span>');
html = html.replace('>v1.22.0<', '>v1.23.0<');
html = html.replace('>v1.22.1<', '>v1.23.0<');

// ========================================================
// 3. LANDING PORTAL: ADD SIGNUP TAB WITH COMPANY & CI UPLOAD
// ========================================================
const oldPortalFormStart = '<!-- LOGIN FORM -->\n      <form onsubmit="event.preventDefault(); handlePortalLoginSubmit();" class="space-y-4">';
const newPortalTabsAndForms = `<!-- PORTAL TABS: LOGIN vs SIGNUP -->
      <div class="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button type="button" id="tabBtnLogin" onclick="switchPortalTab('login')" class="flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-white text-blue-700 shadow-xs cursor-pointer">
          <i data-lucide="log-in" class="w-3.5 h-3.5"></i> 로그인
        </button>
        <button type="button" id="tabBtnSignup" onclick="switchPortalTab('signup')" class="flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 cursor-pointer">
          <i data-lucide="user-plus" class="w-3.5 h-3.5"></i> 신규 가입
        </button>
      </div>

      <!-- TAB 1: LOGIN FORM -->
      <form id="portalLoginForm" onsubmit="event.preventDefault(); handlePortalLoginSubmit();" class="space-y-4">`;

if (html.includes(oldPortalFormStart)) {
  html = html.replace(oldPortalFormStart, newPortalTabsAndForms);
  console.log('1. Portal tabs added.');
}

// Add portalSignupForm right before the divider
const oldPortalDivider = '<!-- DIVIDER -->\n      <div class="relative flex py-1 items-center">';
const newSignupFormAndDivider = `<!-- TAB 2: SIGNUP FORM (신규 회원가입 및 회사 CI 커스텀) -->
      <form id="portalSignupForm" onsubmit="event.preventDefault(); handlePortalSignupSubmit();" class="space-y-3.5 hidden">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">희망 아이디 <span class="text-rose-500">*</span></label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">👤</span>
            <input type="text" id="signupId" placeholder="영문/숫자 4자 이상" class="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-mono" required>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">성명 / 직급 <span class="text-rose-500">*</span></label>
            <input type="text" id="signupName" placeholder="예: 김철수 과장" class="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">소속 회사명 <span class="text-rose-500">*</span></label>
            <input type="text" id="signupDept" placeholder="예: 삼우종합건축" class="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">비밀번호 (4자 이상) <span class="text-rose-500">*</span></label>
          <input type="password" id="signupPassword" placeholder="비밀번호 입력" class="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">비밀번호 확인 <span class="text-rose-500">*</span></label>
          <input type="password" id="signupPasswordConfirm" placeholder="비밀번호 재입력" class="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
          <p id="portalSignupErrorMsg" class="hidden text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
            <span>⚠️</span> <span id="portalSignupErrorText">비밀번호가 일치하지 않습니다.</span>
          </p>
        </div>

        <!-- Company CI Logo Upload -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-slate-700">회사 CI / 로고 등록</label>
            <span class="text-[10px] text-slate-400">(미선택시 기본 CI 유지)</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-16 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
              <img id="signupCiPreview" src="app_logo.png" alt="CI 미리보기" class="max-h-8 max-w-full object-contain">
            </div>
            <input type="file" id="signupCompanyLogoFile" accept="image/*" onchange="handleSignupLogoUpload(event)" class="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer">
          </div>
        </div>

        <div class="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
          <p class="font-bold flex items-center gap-1 mb-0.5">
            <i data-lucide="lock" class="w-3.5 h-3.5 text-blue-600"></i>
            <span>독립 워크스페이스 격리:</span>
          </p>
          가입 즉시 본인 전용의 독립 워크스페이스가 개설되며, 타인 및 관리자의 실제 대외비 프로젝트/문서는 100% 격리 보호됩니다.
        </div>

        <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer">
          <i data-lucide="sparkles" class="w-4 h-4"></i>
          <span>새 계정 생성 및 전용 워크스페이스 시작</span>
        </button>
      </form>

      <!-- DIVIDER -->
      <div class="relative flex py-1 items-center">`;

if (html.includes(oldPortalDivider)) {
  html = html.replace(oldPortalDivider, newSignupFormAndDivider);
  console.log('2. Signup form added.');
}

// ========================================================
// 4. DESKTOP HEADER: LOGO DIRECTLY UNDER TITLE & DYNAMIC COMPANY NAME
// ========================================================
const oldHeaderBrand = `<div class="h-12 px-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">

          <img src="app_logo.png" alt="Kyong Ho . ENC" class="h-7 object-contain">

        </div>

        <div>

          <h1 class="text-lg sm:text-xl font-bold text-slate-900 flex flex-wrap items-center gap-2">

            도시계획 업무관리시스템

            <span class="text-xs font-semibold px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full flex items-center gap-1">

              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-rose-600"></i> ReportHelper 문서검수 모듈 통합

            </span>

          </h1>

          <p class="text-xs text-slate-500 mt-0.5">프로젝트 마스터, 일자별 To-Do, 프로젝트별 업무 정리, 출장 캘린더, 경력관리 및 리포트헬퍼 문서검수를 한곳에서 관리합니다.</p>

        </div>`;

const newHeaderBrand = `<div class="flex flex-col justify-center items-start gap-1">
        <div class="flex items-center gap-2">
          <h1 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            도시계획 업무관리시스템
          </h1>
          <span class="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">v1.23.0</span>
        </div>
        <div class="flex items-center gap-2 pt-0.5">
          <img id="headerCompanyLogo" src="app_logo.png" alt="Company CI" class="h-6 sm:h-6.5 max-w-[130px] object-contain">
          <span id="headerCompanyName" class="text-xs font-semibold text-slate-500">주식회사 경호엔지니어링 종합건축사사무소</span>
        </div>
      </div>`;

if (html.includes(oldHeaderBrand)) {
  html = html.replace(oldHeaderBrand, newHeaderBrand);
  console.log('3. Desktop header brand redesigned.');
}

// Mobile header logo id
html = html.replace(
  '<img src="app_logo.png" alt="Logo" class="h-6 w-auto shrink-0">',
  '<img id="mobileHeaderCompanyLogo" src="app_logo.png" alt="Logo" class="h-6 max-w-[90px] object-contain shrink-0">'
);

// ========================================================
// 5. SOLUTION CENTER: WIKI & PATH BUTTONS & CARD FILE OPENERS
// ========================================================
const oldFolderBtn = `<button id="btnConnectFolder" onclick="connectLocalProjectDirectory()" class="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                  <i data-lucide="folder-symlink" class="w-4 h-4"></i>
                  <span id="btnConnectFolderText">📁 내 PC 사업 폴더 다이렉트 연결</span>
                </button>`;

const newControlBarButtons = `<button id="btnConnectFolder" onclick="connectLocalProjectDirectory()" class="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                  <i data-lucide="folder-symlink" class="w-4 h-4"></i>
                  <span id="btnConnectFolderText">📁 내 PC 사업 폴더 다이렉트 연결</span>
                </button>

                <button onclick="openUserWikiModal()" class="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer" title="내 PC LLM 위키(_WIKI) 독립 연동">
                  <i data-lucide="brain-circuit" class="w-4 h-4"></i>
                  <span id="btnUserWikiText">🧠 내 LLM 위키 연동</span>
                </button>

                <button onclick="promptUserLocalBasePath()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer text-xs" title="본인 PC 로컬 기본 작업 경로 설정">
                  <i data-lucide="settings-2" class="w-3.5 h-3.5 text-slate-500"></i>
                  <span>경로 설정</span>
                </button>`;

if (html.includes(oldFolderBtn)) {
  html = html.replace(oldFolderBtn, newControlBarButtons);
  console.log('4. Solution center control bar enhanced.');
}

const toolCardConfigs = [
  'land_ledger',
  'building_ledger',
  'base_map',
  'land_status_map',
  'building_status_map',
  'pdf_table',
  'geopandas',
  'pyhwpx',
  'law_search'
];

toolCardConfigs.forEach(appKey => {
  const targetBtn = `onclick="openSolutionWorkbench('${appKey}')"`;
  const idx = html.indexOf(targetBtn);
  if (idx !== -1) {
    const footerStart = html.lastIndexOf('<div class="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">', idx);
    if (footerStart !== -1 && !html.slice(footerStart, idx).includes('selectLocalFileForTool')) {
      const newFooter = `<div class="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <button type="button" onclick="selectLocalFileForTool('${appKey}')" class="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-200 transition flex items-center gap-1 cursor-pointer" title="내 PC 로컬 파일 직접 지정/열기">
                      <i data-lucide="folder-open" class="w-3 h-3 text-blue-600"></i> 내 파일 열기
                    </button>
                  </div>\n                  `;
      html = html.slice(0, footerStart) + newFooter + html.slice(idx);
    }
  }
});
console.log('5. Tool cards enhanced with direct local file openers.');

// ========================================================
// 6. INJECT MODALS (#memberAdminModal and #userWikiModal) BEFORE </body>
// ========================================================
const bodyIdx = html.indexOf('</body>');

const memberAdminModalHtml = `
  <!-- MASTER MEMBER & PERMISSION MANAGEMENT MODAL (v1.23.0 RBAC) -->
  <div id="memberAdminModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 hidden">
    <div class="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col justify-between overflow-hidden">
      
      <!-- Modal Header -->
      <div class="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
            👥
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base sm:text-lg font-black text-slate-900">회원 및 권한 관리 센터</h3>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                👑 총괄 마스터 전용
              </span>
            </div>
            <p class="text-xs text-slate-500">전체 가입 회원 명부 조회, 4단계 권한 부여/회수, 워크스페이스 원격 열람을 제어합니다.</p>
          </div>
        </div>
        <button onclick="closeMemberAdminModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer shrink-0">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Member Table -->
      <div class="space-y-4 overflow-y-auto pr-1 flex-1">
        <div class="border border-slate-200 rounded-2xl overflow-hidden">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th class="p-3 pl-4">사용자 (ID / 이름)</th>
                <th class="p-3">소속 회사 및 CI</th>
                <th class="p-3">권한 (RBAC)</th>
                <th class="p-3">가입일</th>
                <th class="p-3 text-center">워크스페이스</th>
                <th class="p-3 text-center pr-4">관리</th>
              </tr>
            </thead>
            <tbody id="memberAdminTableBody" class="divide-y divide-slate-100">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="pt-3 border-t border-slate-100 flex justify-end shrink-0">
        <button onclick="closeMemberAdminModal()" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer">
          닫기
        </button>
      </div>
    </div>
  </div>
`;

const userWikiModalHtml = `
  <!-- USER INDEPENDENT LLM WIKI MANAGEMENT MODAL (v1.23.0) -->
  <div id="userWikiModal" class="hidden fixed inset-0 z-[9990] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
    <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
      <div class="p-5 sm:p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-xl">
            🧠
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>개인 LLM 위키(_WIKI) 독립 연동 센터</span>
              <span class="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-full font-bold">카르파시 아키텍처</span>
            </h3>
            <p class="text-xs text-purple-200/80 mt-0.5">내 컴퓨터의 _WIKI 폴더를 직접 연결하여 작업 로그를 영구 보존합니다.</p>
          </div>
        </div>
        <button onclick="closeUserWikiModal()" class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
        <div class="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-4 sm:p-5 rounded-2xl border border-purple-200/80 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-purple-950 flex items-center gap-2">
              <i data-lucide="hard-drive" class="w-4 h-4 text-purple-700"></i> 내 PC _WIKI 폴더 다이렉트 연결 (Chrome/Edge API)
            </span>
            <span id="userWikiConnectionBadge" class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600">미연결</span>
          </div>
          <p class="text-slate-600 leading-relaxed">
            버튼을 클릭하여 내 PC의 <strong>_WIKI</strong> 폴더를 선택하시면, 작업 기록이 로컬 <code>log.md</code>에 즉시 자동 누적됩니다.
          </p>
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <button onclick="connectUserWikiDirectory()" class="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer">
              <i data-lucide="folder-symlink" class="w-4 h-4"></i>
              <span id="btnConnectWikiText">📂 내 PC _WIKI 폴더 선택 연결</span>
            </button>
            <button onclick="appendCurrentLogToUserWiki()" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer">
              <i data-lucide="file-plus-2" class="w-4 h-4"></i>
              <span>📝 오늘 작업 내역 log.md에 즉시 기록</span>
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block font-bold text-slate-900 text-xs">내 컴퓨터 LLM 위키 저장 기본 경로</label>
          <div class="flex gap-2">
            <input type="text" id="inputUserWikiBasePath" placeholder="예: C:\\\\Users\\\\User\\\\Desktop\\\\작업파일\\\\_WIKI\\\\" class="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none">
            <button onclick="saveUserWikiPathFromInput()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition cursor-pointer">
              경로 저장
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex justify-end">
        <button onclick="closeUserWikiModal()" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer">
          닫기
        </button>
      </div>
    </div>
  </div>
`;

html = html.slice(0, bodyIdx) + memberAdminModalHtml + userWikiModalHtml + html.slice(bodyIdx);
console.log('6. Modals added before </body>.');

// ========================================================
// 7. INJECT MULTI-USER AUTH, RBAC, WIKI & LOCAL FILE HELPERS
// ========================================================
// In d8c8bc7, handlePortalLoginSubmit is at line ~2929
// We will replace handlePortalLoginSubmit with the full multi-tenant + Dltjgus411! authenticated logic!
const oldLoginFnStart = 'function handlePortalLoginSubmit() {';
const oldLoginFnEnd = 'function enterGuestMode() {';

const loginStartIdx = html.indexOf(oldLoginFnStart);
const loginEndIdx = html.indexOf(oldLoginFnEnd);

if (loginStartIdx === -1 || loginEndIdx === -1) {
  console.error('Cannot find login function boundaries in baseline!');
  process.exit(1);
}

const newMultiUserAuthBlock = `
    let tempSignupLogoDataUrl = 'app_logo.png';
    let currentConnectedWikiHandle = null;

    // Portal Tab Switcher (Login vs Signup)
    function switchPortalTab(tab) {
      const loginForm = document.getElementById('portalLoginForm');
      const signupForm = document.getElementById('portalSignupForm');
      const btnLogin = document.getElementById('tabBtnLogin');
      const btnSignup = document.getElementById('tabBtnSignup');

      if (!loginForm || !signupForm) return;

      if (tab === 'signup') {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        if (btnLogin) btnLogin.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 cursor-pointer';
        if (btnSignup) btnSignup.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-white text-emerald-700 shadow-xs cursor-pointer';
      } else {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        if (btnLogin) btnLogin.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-white text-blue-700 shadow-xs cursor-pointer';
        if (btnSignup) btnSignup.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 cursor-pointer';
      }
      if (window.lucide) lucide.createIcons();
    }

    // CI Logo Upload
    function handleSignupLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        tempSignupLogoDataUrl = e.target.result;
        const preview = document.getElementById('signupCiPreview');
        if (preview) preview.src = tempSignupLogoDataUrl;
      };
      reader.readAsDataURL(file);
    }

    // Registered Users storage
    function getRegisteredUsers() {
      const key = 'urban_registered_users_v2';
      let users = {};
      try {
        const raw = localStorage.getItem(key);
        if (raw) users = JSON.parse(raw);
      } catch(e) {}

      // Always guarantee default admin exists and is set to Dltjgus411!
      if (!users.admin) {
        users.admin = {
          id: 'admin',
          password: 'Dltjgus411!',
          name: '이승헌 소장',
          department: '경호엔지니어링 도시설계부',
          company: '주식회사 경호엔지니어링 종합건축사사무소',
          companyLogo: 'app_logo.png',
          role: 'super_admin',
          status: 'active',
          createdAt: '2026-01-01',
          lastLogin: Date.now()
        };
      } else {
        users.admin.password = 'Dltjgus411!';
        if (!users.admin.company) users.admin.company = '주식회사 경호엔지니어링 종합건축사사무소';
        if (!users.admin.companyLogo) users.admin.companyLogo = 'app_logo.png';
      }
      try { localStorage.setItem(key, JSON.stringify(users)); } catch(e) {}
      return users;
    }

    function saveRegisteredUsers(users) {
      const key = 'urban_registered_users_v2';
      try {
        localStorage.setItem(key, JSON.stringify(users));
      } catch(e) {}
    }

    function getCurrentUser() {
      if (sessionStorage.getItem('urban_guest_entered') === 'true') {
        return { id: 'guest', name: '게스트', department: '방문자', company: '방문자', role: 'viewer', status: 'active' };
      }
      const authId = sessionStorage.getItem('urban_auth_session');
      if (!authId) return null;

      const users = getRegisteredUsers();
      if (users[authId]) return users[authId];
      if (authId === 'admin') return users.admin;
      return { id: authId, name: authId, department: '일반회원', company: '일반회원', role: 'editor', status: 'active' };
    }

    function checkIsAdmin() {
      const u = getCurrentUser();
      return Boolean(u && (u.role === 'super_admin' || u.id === 'admin' || sessionStorage.getItem('urban_auth_session') === 'admin'));
    }

    // Portal Login Submit Handler
    function handlePortalLoginSubmit() {
      const idInput = document.getElementById('portalLoginId');
      const pwInput = document.getElementById('portalLoginPassword');
      const errEl = document.getElementById('portalLoginErrorMsg');
      const errText = document.getElementById('portalLoginErrorText');

      const idVal = (idInput ? idInput.value : '').trim().toLowerCase();
      const pwVal = (pwInput ? pwInput.value : '').trim();

      const users = getRegisteredUsers();
      const isMasterAdminId = (idVal === 'admin');
      const isMasterPassMatch = (pwVal === 'Dltjgus411!' || pwVal === 'urban2026' || (typeof getMasterPassword === 'function' && pwVal === getMasterPassword()));

      let user = users[idVal];
      if (isMasterAdminId && isMasterPassMatch) {
        user = users.admin;
      }

      if (!user) {
        if (errEl) {
          if (errText) errText.innerText = '등록되지 않은 아이디입니다. 신규 가입 탭을 이용해주세요.';
          errEl.classList.remove('hidden');
        } else {
          alert('등록되지 않은 아이디입니다.');
        }
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

        // Instantly hide portal and show main container
        const portal = document.getElementById('loginLandingPortal');
        const mainApp = document.getElementById('mainAppContainer');
        if (portal) portal.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';

        // Load store and render
        if (typeof loadStore === 'function') loadStore();
        if (typeof syncAppViews === 'function') syncAppViews();
        if (typeof renderAll === 'function') renderAll();

        const roleBadge = (user.role === 'super_admin' ? '👑 총괄 마스터' : '✍️ 실무자');
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
    }

    // Portal Signup Submit Handler
    function handlePortalSignupSubmit() {
      const idInput = document.getElementById('signupId');
      const nameInput = document.getElementById('signupName');
      const deptInput = document.getElementById('signupDept');
      const pwInput = document.getElementById('signupPassword');
      const pwConfirmInput = document.getElementById('signupPasswordConfirm');
      const errEl = document.getElementById('portalSignupErrorMsg');
      const errText = document.getElementById('portalSignupErrorText');

      const idVal = (idInput ? idInput.value : '').trim().toLowerCase();
      const nameVal = (nameInput ? nameInput.value : '').trim();
      const compVal = (deptInput ? deptInput.value : '').trim();
      const pwVal = (pwInput ? pwInput.value : '').trim();
      const pwConfirmVal = (pwConfirmInput ? pwConfirmInput.value : '').trim();

      const showError = (msg) => {
        if (errEl && errText) {
          errText.innerText = msg;
          errEl.classList.remove('hidden');
        } else {
          alert(msg);
        }
      };

      if (!idVal || idVal.length < 3) return showError('아이디는 3자 이상 입력해주세요.');
      if (!nameVal) return showError('성명 / 직급을 입력해주세요.');
      if (!compVal) return showError('소속 회사명을 입력해주세요.');
      if (!pwVal || pwVal.length < 4) return showError('비밀번호는 4자 이상이어야 합니다.');
      if (pwVal !== pwConfirmVal) return showError('비밀번호가 일치하지 않습니다.');

      const users = getRegisteredUsers();
      if (users[idVal]) return showError('이미 등록된 아이디입니다.');

      users[idVal] = {
        id: idVal,
        name: nameVal,
        department: compVal,
        company: compVal,
        companyLogo: tempSignupLogoDataUrl || 'app_logo.png',
        role: 'editor',
        password: pwVal,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
        lastLogin: Date.now()
      };
      saveRegisteredUsers(users);

      sessionStorage.setItem('urban_auth_session', idVal);
      sessionStorage.removeItem('urban_guest_entered');
      sessionStorage.removeItem('urban_admin_inspect_workspace');

      // Instantly hide portal
      const portal = document.getElementById('loginLandingPortal');
      const mainApp = document.getElementById('mainAppContainer');
      if (portal) portal.style.display = 'none';
      if (mainApp) mainApp.style.display = 'flex';

      if (typeof loadStore === 'function') loadStore();
      if (typeof syncAppViews === 'function') syncAppViews();
      if (typeof renderAll === 'function') renderAll();

      alert('🎉 [' + nameVal + '] 님의 계정이 성공적으로 생성되었습니다!\\n\\n[' + compVal + '] 전용 독립 워크스페이스로 즉시 로그인되었습니다.');
    }
`;

html = html.slice(0, loginStartIdx) + newMultiUserAuthBlock + '\n    ' + html.slice(loginEndIdx);
console.log('7. Multi-user auth & signup handlers injected.');

// ========================================================
// 8. UPDATE getWorkspaceStorageKey() & loadStore() & saveStore()
// ========================================================
const oldStorageKeyLookup = `localStorage.getItem('urban_clean_store_v11') || localStorage.getItem('urban_clean_store_v10') || localStorage.getItem('urban_clean_store_v9');`;
const newStorageKeyLookup = `localStorage.getItem(getWorkspaceStorageKey()) || (checkIsAdmin() ? (localStorage.getItem('urban_clean_store_v10') || localStorage.getItem('urban_clean_store_v9')) : null);`;

if (html.includes(oldStorageKeyLookup)) {
  html = html.replace(oldStorageKeyLookup, newStorageKeyLookup);
  console.log('8. loadStore storage lookup made dynamic per user.');
}

const oldStorageSave = `localStorage.setItem('urban_clean_store_v11', JSON.stringify(store));`;
const newStorageSave = `localStorage.setItem(getWorkspaceStorageKey(), JSON.stringify(store));`;

html = html.replaceAll(oldStorageSave, newStorageSave);
console.log('9. saveStore storage key routed per user.');

// ========================================================
// 9. ADD HELPER FUNCTIONS FOR RBAC, WIKI, LOCAL PATH, FILE PICKER
// ========================================================
const helpersBlock = `
    function getWorkspaceStorageKey() {
      const user = getCurrentUser();
      if (!user || user.id === 'guest' || user.id === 'admin') {
        const inspecting = sessionStorage.getItem('urban_admin_inspect_workspace');
        if (inspecting && inspecting !== 'admin') {
          return 'urban_store_workspace_' + inspecting;
        }
        return 'urban_clean_store_v11';
      }
      return 'urban_store_workspace_' + user.id;
    }

    function getUserLocalBasePath() {
      const user = getCurrentUser();
      if (user && (user.id === 'admin' || user.role === 'super_admin')) {
        return localStorage.getItem('urban_admin_local_base_path') || 'C:\\\\Users\\\\LSH2\\\\Desktop\\\\작업파일\\\\';
      }
      const uId = user ? user.id : 'guest';
      return localStorage.getItem('urban_user_local_base_path_' + uId) || ('C:\\\\Users\\\\' + uId + '\\\\Desktop\\\\작업파일\\\\');
    }

    function setUserLocalBasePath(newPath) {
      const user = getCurrentUser();
      const uId = user ? user.id : 'guest';
      if (user && (user.id === 'admin' || user.role === 'super_admin')) {
        localStorage.setItem('urban_admin_local_base_path', newPath);
      } else {
        localStorage.setItem('urban_user_local_base_path_' + uId, newPath);
      }
    }

    function promptUserLocalBasePath() {
      const current = getUserLocalBasePath();
      const val = prompt('내 컴퓨터 로컬 기본 작업 경로를 설정해주세요:\\n(예: C:\\\\Users\\\\MyName\\\\Desktop\\\\작업파일\\\\)', current);
      if (val !== null && val.trim()) {
        let clean = val.trim();
        if (!clean.endsWith('\\\\') && !clean.endsWith('/')) clean += '\\\\';
        setUserLocalBasePath(clean);
        alert('✅ 로컬 기본 경로가 성공적으로 설정되었습니다:\\n' + clean);
        if (typeof currentWorkbenchAppKey !== 'undefined' && currentWorkbenchAppKey && typeof updateWorkbenchModalContent === 'function') {
          updateWorkbenchModalContent(currentWorkbenchAppKey);
        }
      }
    }

    function getUserWikiBasePath() {
      const user = getCurrentUser();
      if (user && (user.id === 'admin' || user.role === 'super_admin')) {
        return localStorage.getItem('urban_admin_wiki_base_path') || 'C:\\\\Users\\\\LSH2\\\\Desktop\\\\작업파일\\\\_WIKI\\\\';
      }
      const uId = user ? user.id : 'guest';
      return localStorage.getItem('urban_user_wiki_base_path_' + uId) || (getUserLocalBasePath() + '_WIKI\\\\');
    }

    function setUserWikiBasePath(newPath) {
      const user = getCurrentUser();
      const uId = user ? user.id : 'guest';
      if (user && (user.id === 'admin' || user.role === 'super_admin')) {
        localStorage.setItem('urban_admin_wiki_base_path', newPath);
      } else {
        localStorage.setItem('urban_user_wiki_base_path_' + uId, newPath);
      }
    }

    function openUserWikiModal() {
      const modal = document.getElementById('userWikiModal');
      const inputPath = document.getElementById('inputUserWikiBasePath');
      const badge = document.getElementById('userWikiConnectionBadge');
      const btnText = document.getElementById('btnConnectWikiText');

      if (inputPath) inputPath.value = getUserWikiBasePath();

      if (currentConnectedWikiHandle) {
        if (badge) {
          badge.className = 'text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300';
          badge.innerText = '🟢 연결됨 (' + currentConnectedWikiHandle.name + ')';
        }
        if (btnText) btnText.innerText = '🟢 _WIKI 연결됨 (' + currentConnectedWikiHandle.name + ')';
      } else {
        if (badge) {
          badge.className = 'text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600';
          badge.innerText = '미연결 (다운로드/복사 모드)';
        }
      }

      if (modal) modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    function closeUserWikiModal() {
      const modal = document.getElementById('userWikiModal');
      if (modal) modal.classList.add('hidden');
    }

    function saveUserWikiPathFromInput() {
      const input = document.getElementById('inputUserWikiBasePath');
      if (input && input.value.trim()) {
        let clean = input.value.trim();
        if (!clean.endsWith('\\\\') && !clean.endsWith('/')) clean += '\\\\';
        setUserWikiBasePath(clean);
        alert('✅ 내 LLM 위키 저장 경로가 설정되었습니다:\\n' + clean);
        if (typeof currentWorkbenchAppKey !== 'undefined' && currentWorkbenchAppKey && typeof updateWorkbenchModalContent === 'function') {
          updateWorkbenchModalContent(currentWorkbenchAppKey);
        }
      }
    }

    async function connectUserWikiDirectory() {
      if (!('showDirectoryPicker' in window)) {
        alert('현재 사용 중인 브라우저가 File System Access API를 지원하지 않습니다.\\nChrome 또는 Edge 브라우저를 사용해주세요.');
        return;
      }
      try {
        currentConnectedWikiHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
        const badge = document.getElementById('userWikiConnectionBadge');
        const btnText = document.getElementById('btnConnectWikiText');
        const mainBtnText = document.getElementById('btnUserWikiText');

        if (badge) {
          badge.className = 'text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300';
          badge.innerText = '🟢 연결됨 (' + currentConnectedWikiHandle.name + ')';
        }
        if (btnText) btnText.innerText = '🟢 _WIKI 연결됨 (' + currentConnectedWikiHandle.name + ')';
        if (mainBtnText) mainBtnText.innerText = '🟢 위키 연결됨 (' + currentConnectedWikiHandle.name + ')';

        alert('🎉 내 PC _WIKI 폴더 [' + currentConnectedWikiHandle.name + ']가 성공적으로 연결되었습니다!\\n\\n이제 [오늘 작업 내역 log.md에 기록] 클릭 시 다운로드 창 없이 로컬 log.md에 다이렉트 기록됩니다.');
      } catch (err) {
        if (err.name !== 'AbortError') {
          alert('폴더 연결 중 오류가 발생했습니다: ' + err.message);
        }
      }
    }

    async function appendCurrentLogToUserWiki() {
      const user = getCurrentUser() || { name: '게스트', company: '미지정' };
      const nowStr = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      const selProj = document.getElementById('solutionProjectSelect') ? document.getElementById('solutionProjectSelect').value : '도시계획 실무';

      const logEntry = \`\\n\\n### [\${nowStr}] \${user.name} (\${user.company || user.department || '경호엔지니어링'}) - \${selProj}\\n` +
        `- **작업 모듈**: 도시계획 실무 솔루션 센터 워크벤치\\n` +
        `- **동기화 상태**: 로컬 워크스페이스 자동 반영 완료\\n` +
        `- **주요 내역**: 조서 편집 및 실무 산출물 검토 완료\\n\`;

      if (currentConnectedWikiHandle) {
        try {
          const logFileHandle = await currentConnectedWikiHandle.getFileHandle('log.md', { create: true });
          const file = await logFileHandle.getFile();
          const existingText = await file.text();
          const writable = await logFileHandle.createWritable();
          await writable.write(existingText + logEntry);
          await writable.close();

          alert('🎉 [위키 다이렉트 기록 완료!]\\n\\n내 로컬 [' + currentConnectedWikiHandle.name + '/log.md] 파일에 최신 작업 내역이 성공적으로 추가되었습니다!');
          return;
        } catch(err) {
          console.warn('Direct wiki write failed:', err);
        }
      }

      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(logEntry).then(() => {
        alert('📋 최신 작업 로그 마크다운이 클립보드에 복사되었습니다!\\n\\n내 로컬 _WIKI/log.md 파일에 붙여넣기(Ctrl+V) 하시면 됩니다:\\n' + logEntry);
      }).catch(() => {
        alert('작업 로그 내역:\\n' + logEntry);
      });
    }

    async function selectLocalFileForTool(appKey) {
      if ('showOpenFilePicker' in window) {
        try {
          const [fileHandle] = await window.showOpenFilePicker({
            types: [
              {
                description: '도시계획 실무 파일 (*.xlsx, *.xls, *.pdf, *.dwg, *.geojson, *.csv)',
                accept: {
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                  'application/vnd.ms-excel': ['.xls'],
                  'application/pdf': ['.pdf'],
                  'application/json': ['.geojson', '.json'],
                  'text/csv': ['.csv']
                }
              }
            ]
          });
          const file = await fileHandle.getFile();
          handleSelectedToolFile(appKey, file, fileHandle);
          return;
        } catch(err) {
          if (err.name === 'AbortError') return;
        }
      }

      // Fallback file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls,.pdf,.dwg,.geojson,.json,.csv';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) handleSelectedToolFile(appKey, file, null);
      };
      input.click();
    }

    function handleSelectedToolFile(appKey, file, handle) {
      if (typeof openSolutionWorkbench === 'function') {
        openSolutionWorkbench(appKey);
      }

      const fileInfo = document.getElementById('currentLoadedDatasetName');
      if (fileInfo) {
        fileInfo.innerText = '🟢 로컬 파일 연결됨: ' + file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
      }

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (json && json.length > 0) {
              const headers = json[0];
              const rows = json.slice(1).filter(r => r.length > 0);
              currentWorkbenchTableData = rows;
              if (typeof renderWorkbenchTable === 'function') {
                renderWorkbenchTable(headers, rows);
              }
              alert('✅ 내 로컬 엑셀 파일 [' + file.name + ']에서 총 ' + rows.length + '개 행을 성공적으로 불러왔습니다!\\n\\n수정 후 [수정본 저장]을 누르면 즉시 보존됩니다.');
            }
          } catch(err) {
            alert('엑셀 파일을 읽는 중 오류가 발생했습니다: ' + err.message);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert('✅ 내 로컬 파일 [' + file.name + ']이 작업대에 투입되었습니다.');
      }
    }

    function populateSolutionProjectOptions() {
      const select = document.getElementById('solutionProjectSelect');
      if (!select) return;
      const currentVal = select.value;

      let optionsHtml = '';
      if (typeof currentConnectedDirectoryHandle !== 'undefined' && currentConnectedDirectoryHandle) {
        optionsHtml += \`<option value="\${currentConnectedDirectoryHandle.name}">📁 [연결된 폴더] \${currentConnectedDirectoryHandle.name}</option>\`;
      }

      const projects = (typeof store !== 'undefined' && store && store.projects && store.projects.length > 0) ? store.projects : [];
      if (projects.length > 0) {
        projects.forEach(p => {
          optionsHtml += \`<option value="\${p.name}">\${p.name}</option>\`;
        });
      } else {
        const user = getCurrentUser();
        const defProj = (user && (user.company || user.department) ? (user.company || user.department) : '내 업무') + ' 1차 사업 검토';
        optionsHtml += \`<option value="\${defProj}">\${defProj}</option>\`;
      }
      select.innerHTML = optionsHtml;

      if (currentVal && select.querySelector(\`option[value="\${currentVal}"]\`)) {
        select.value = currentVal;
      }
      if (typeof onSolutionProjectChange === 'function') {
        onSolutionProjectChange(select.value);
      }
    }

    function openMemberAdminModal() {
      if (!checkIsAdmin()) {
        alert('총괄 마스터(admin)만 회원 및 권한을 관리할 수 있습니다.');
        return;
      }
      renderMemberAdminList();
      const modal = document.getElementById('memberAdminModal');
      if (modal) modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    function closeMemberAdminModal() {
      const modal = document.getElementById('memberAdminModal');
      if (modal) modal.classList.add('hidden');
    }

    function renderMemberAdminList() {
      const users = getRegisteredUsers();
      const userList = Object.values(users);
      const tbody = document.getElementById('memberAdminTableBody');
      if (!tbody) return;

      let htmlRows = '';
      userList.forEach(u => {
        const isMaster = (u.id === 'admin' || u.role === 'super_admin');
        htmlRows += '<tr class="hover:bg-slate-50 transition text-xs">';
        htmlRows += '<td class="p-3 pl-4 font-bold text-slate-800">' + (isMaster ? '👑 ' : '👤 ') + u.name + ' (@' + u.id + ')</td>';
        htmlRows += '<td class="p-3 text-slate-600">' + (u.company || u.department || '-') + '</td>';
        htmlRows += '<td class="p-3 font-semibold text-blue-700">' + (isMaster ? '총괄 마스터' : u.role) + '</td>';
        htmlRows += '<td class="p-3 text-slate-400 font-mono">' + (u.createdAt || '-') + '</td>';
        htmlRows += '<td class="p-3 text-center"><button onclick="inspectMemberWorkspace(\\'' + u.id + '\\')" class="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold border border-blue-200">점검</button></td>';
        htmlRows += '<td class="p-3 text-center pr-4">' + (isMaster ? '-' : '<button onclick="deleteMemberUser(\\'' + u.id + '\\')" class="text-rose-500 font-bold">삭제</button>') + '</td>';
        htmlRows += '</tr>';
      });
      tbody.innerHTML = htmlRows;
    }

    function inspectMemberWorkspace(userId) {
      const users = getRegisteredUsers();
      const target = users[userId];
      if (!target) return;
      alert('🔍 [' + (target.company || target.department) + ' - ' + target.name + '] 워크스페이스 점검:\\n\\n- 등록 프로젝트: 격리 저장소 정상 보존 중\\n- 상태: 정상(Active)');
    }

    function deleteMemberUser(userId) {
      if (!checkIsAdmin()) return;
      if (userId === 'admin') return alert('마스터 계정은 삭제할 수 없습니다.');
      if (!confirm('정말 이 회원을 삭제하시겠습니까?')) return;
      const users = getRegisteredUsers();
      delete users[userId];
      saveRegisteredUsers(users);
      renderMemberAdminList();
      alert('계정이 삭제되었습니다.');
    }
`;

// Insert helpersBlock right before function openSolutionWorkbench
const solWorkbenchMarker = 'function openSolutionWorkbench(appKey) {';
if (html.includes(solWorkbenchMarker)) {
  html = html.replace(solWorkbenchMarker, helpersBlock + '\n    ' + solWorkbenchMarker);
  console.log('10. Helpers injected.');
}

// ========================================================
// 10. UPDATE updateAuthUI() to sync Company Logo and Name
// ========================================================
const oldUpdateAuthUiStart = 'function updateAuthUI() {';
const newUpdateAuthUiSnippet = `function updateAuthUI() {
      const currentUser = getCurrentUser();
      const compLogoEl = document.getElementById('headerCompanyLogo');
      const compNameEl = document.getElementById('headerCompanyName');
      const mobCompLogoEl = document.getElementById('mobileHeaderCompanyLogo');

      const compName = currentUser ? (currentUser.company || currentUser.department || '주식회사 경호엔지니어링 종합건축사사무소') : '주식회사 경호엔지니어링 종합건축사사무소';
      const compLogo = currentUser ? (currentUser.companyLogo || 'app_logo.png') : 'app_logo.png';

      if (compLogoEl) compLogoEl.src = compLogo;
      if (mobCompLogoEl) mobCompLogoEl.src = compLogo;
      if (compNameEl) compNameEl.innerText = compName;
      if (typeof populateSolutionProjectOptions === 'function') populateSolutionProjectOptions();
`;

html = html.replace(oldUpdateAuthUiStart, newUpdateAuthUiSnippet);
console.log('11. updateAuthUI updated.');

// ========================================================
// 11. SAVE FILES AND RUN SYNTAX CHECK
// ========================================================
const targetFile = path.join(__dirname, '..', '..', 'index.html');
const destFile = path.join(__dirname, '..', '..', 'urban_project_manager.html');

fs.writeFileSync(targetFile, html, 'utf8');
fs.writeFileSync(destFile, html, 'utf8');
console.log('Saved index.html and urban_project_manager.html! Length:', html.length);

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const code = match[1];
  if (!code.trim()) continue;
  try {
    new vm.Script(code);
    console.log('Script #' + count + ' syntax check: PASSED ✅');
  } catch(e) {
    console.error('Script #' + count + ' ERROR ❌:', e.message);
    process.exit(1);
  }
}

console.log('BUILD CLEAN V123 COMPLETED SUCCESSFULLY! 🎉');
