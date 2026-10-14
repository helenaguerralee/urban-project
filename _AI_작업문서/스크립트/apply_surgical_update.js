const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetPath = path.join(__dirname, '..', '..', 'index.html');
let html = fs.readFileSync(targetPath, 'utf8');

console.log('Baseline index.html length:', html.length);

// ----------------------------------------------------
// 1. PASSWORD: Update DEFAULT_MASTER_PASSWORD to Dltjgus411!
// ----------------------------------------------------
html = html.replace(
  "const DEFAULT_MASTER_PASSWORD = 'urban2026';",
  "const DEFAULT_MASTER_PASSWORD = 'Dltjgus411!';"
);

// In getRegisteredUsers, ensure admin default password is Dltjgus411!
html = html.replace(
  "password: (typeof getMasterPassword === 'function' ? getMasterPassword() : 'urban2026'),",
  "password: (typeof getMasterPassword === 'function' ? getMasterPassword() : 'Dltjgus411!'),"
);

// In portalLoginPassword placeholder
html = html.replace(
  `placeholder="비밀번호 입력 (기본: urban2026)"`,
  `placeholder="비밀번호 입력 (기본: Dltjgus411!)"`
);

// In handlePortalLoginSubmit, accept Dltjgus411!, urban2026, or masterPass
const oldLoginPassCheck = `const masterPass = (typeof getMasterPassword === 'function' ? getMasterPassword() : 'urban2026');
      const validPass = (idVal === 'admin') ? masterPass : user.password;

      if (pwVal === validPass) {`;

const newLoginPassCheck = `const masterPass = (typeof getMasterPassword === 'function' ? getMasterPassword() : 'Dltjgus411!');
      const isMasterValid = (idVal === 'admin') && (pwVal === 'Dltjgus411!' || pwVal === 'urban2026' || pwVal === masterPass || pwVal === user.password);
      const isUserValid = (idVal !== 'admin') && (pwVal === user.password);

      if (isMasterValid || isUserValid) {`;

if (html.includes(oldLoginPassCheck)) {
  html = html.replace(oldLoginPassCheck, newLoginPassCheck);
  console.log('1. Password validation updated to accept Dltjgus411! & urban2026.');
} else {
  console.warn('Could not find oldLoginPassCheck, trying partial replacement');
  html = html.replace(
    'if (pwVal === validPass) {',
    'if (pwVal === validPass || (idVal === \'admin\' && (pwVal === \'Dltjgus411!\' || pwVal === \'urban2026\'))) {'
  );
}

// ----------------------------------------------------
// 2. SIGNUP FORM: Add Company Name & Company CI Logo Upload
// ----------------------------------------------------
const oldSignupDeptHtml = `<div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">성명</label>
            <input type="text" id="signupName" placeholder="예: 김철수 주임" class="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">소속 / 부서</label>
            <input type="text" id="signupDept" placeholder="예: 도시설계부" class="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
          </div>
        </div>`;

const newSignupDeptHtml = `<div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">성명 / 직급 <span class="text-rose-500">*</span></label>
            <input type="text" id="signupName" placeholder="예: 김철수 과장" class="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">소속 회사명 <span class="text-rose-500">*</span></label>
            <input type="text" id="signupDept" placeholder="예: 삼우종합건축사사무소" class="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
          </div>
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
        </div>`;

if (html.includes(oldSignupDeptHtml)) {
  html = html.replace(oldSignupDeptHtml, newSignupDeptHtml);
  console.log('2. Signup form enhanced with Company Name and CI upload.');
}

// In handlePortalSignupSubmit, save company and companyLogo
const oldSignupUserObj = `users[idVal] = {
        id: idVal,
        name: nameVal,
        department: deptVal,
        role: 'editor',
        password: pwVal,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
        lastLogin: Date.now()
      };`;

const newSignupUserObj = `users[idVal] = {
        id: idVal,
        name: nameVal,
        department: deptVal,
        company: deptVal,
        companyLogo: tempSignupLogoDataUrl || 'app_logo.png',
        role: 'editor',
        password: pwVal,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
        lastLogin: Date.now()
      };`;

if (html.includes(oldSignupUserObj)) {
  html = html.replace(oldSignupUserObj, newSignupUserObj);
  console.log('3. handlePortalSignupSubmit updated to store company & companyLogo.');
}

// ----------------------------------------------------
// 3. DESKTOP HEADER: Logo directly under title + Company Name text
// ----------------------------------------------------
const oldHeaderBrand = `<div class="flex flex-col justify-center items-start gap-1">
        <h1 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          도시계획 업무관리시스템
        </h1>
        <div class="pt-0.5">
          <img src="app_logo.png" alt="Kyong Ho . ENC" class="h-6 sm:h-6.5 object-contain">
        </div>
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
  console.log('4. Desktop header updated with logo under title and company name.');
}

// Update mobile logo id
html = html.replace(
  '<img src="app_logo.png" alt="Logo" class="h-6 w-auto shrink-0">',
  '<img id="mobileHeaderCompanyLogo" src="app_logo.png" alt="Logo" class="h-6 max-w-[90px] object-contain shrink-0">'
);

// ----------------------------------------------------
// 4. SOLUTION CENTER: Control bar Wiki & Path buttons, Tool Card File Openers
// ----------------------------------------------------
const oldControlBarFolderBtn = `<button id="btnConnectFolder" onclick="connectLocalProjectDirectory()" class="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer">
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

if (html.includes(oldControlBarFolderBtn)) {
  html = html.replace(oldControlBarFolderBtn, newControlBarButtons);
  console.log('5. Solution center control bar enhanced with Wiki and Path buttons.');
}

// Add local file openers to the 9 tool cards
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
      const originalFooter = html.slice(footerStart, idx);
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
console.log('6. Tool cards enhanced with direct local file openers.');

// ----------------------------------------------------
// 5. INJECT #userWikiModal BEFORE </body>
// ----------------------------------------------------
const bodyIdx = html.indexOf('</body>');
const userWikiModalHtml = `
  <!-- ======================================================== -->
  <!-- 🧠 USER INDEPENDENT LLM WIKI MANAGEMENT MODAL (v1.23.0) -->
  <!-- ======================================================== -->
  <div id="userWikiModal" class="hidden fixed inset-0 z-[9990] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
    <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
      <!-- Modal Header -->
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
            <p class="text-xs text-purple-200/80 mt-0.5">내 컴퓨터의 _WIKI 폴더를 직접 연결하여 프로젝트 분석, 개념 정의, 작업 로그를 영구 보존합니다.</p>
          </div>
        </div>
        <button onclick="closeUserWikiModal()" class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
        <!-- Direct Folder Connection Status Card -->
        <div class="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-4 sm:p-5 rounded-2xl border border-purple-200/80 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-purple-950 flex items-center gap-2">
              <i data-lucide="hard-drive" class="w-4 h-4 text-purple-700"></i> 내 PC _WIKI 폴더 다이렉트 연결 (Chrome/Edge API)
            </span>
            <span id="userWikiConnectionBadge" class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600">미연결</span>
          </div>
          <p class="text-slate-600 leading-relaxed">
            버튼을 클릭하여 내 PC의 <strong>_WIKI</strong> 폴더(예: <code class="font-mono bg-white px-1.5 py-0.5 rounded text-purple-900 border">.../작업파일/_WIKI/</code>)를 선택하시면, 웹 화면에서 작성한 작업 기록이 브라우저 다운로드 창 없이 로컬 <code>log.md</code>에 즉시 자동 누적됩니다.
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

        <!-- Wiki Base Path Manual Input -->
        <div class="space-y-2">
          <label class="block font-bold text-slate-900 text-xs">내 컴퓨터 LLM 위키 저장 기본 경로</label>
          <div class="flex gap-2">
            <input type="text" id="inputUserWikiBasePath" placeholder="예: C:\\Users\\User\\Desktop\\작업파일\\_WIKI\\" class="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none">
            <button onclick="saveUserWikiPathFromInput()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition cursor-pointer">
              경로 저장
            </button>
          </div>
          <p class="text-[11px] text-slate-500">
            * AI 프롬프트 생성 시 위 경로가 대상 경로로 자동 치환되어 제공됩니다.
          </p>
        </div>

        <!-- Karpathy LLM Wiki Standard Structure Guide -->
        <div class="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
          <div class="font-bold text-slate-800 flex items-center gap-1.5">
            <i data-lucide="folder-tree" class="w-4 h-4 text-indigo-600"></i> 표준 카르파시 LLM 위키 폴더 구조
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] pt-1">
            <div class="p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span class="font-bold text-indigo-900">📁 _WIKI/사업별위키/</span>
              <p class="text-slate-500 mt-0.5">프로젝트별 인허가, 심의의견, 사업개요 누적</p>
            </div>
            <div class="p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span class="font-bold text-purple-900">📁 _WIKI/개념위키/</span>
              <p class="text-slate-500 mt-0.5">도시계획 용어, 법령 기준, 안분 공식 집대성</p>
            </div>
            <div class="p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span class="font-bold text-amber-900">📁 _WIKI/질의분석위키/</span>
              <p class="text-slate-500 mt-0.5">국토부 유권해석, 판례, 심의 리스크 대응</p>
            </div>
            <div class="p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span class="font-bold text-emerald-900">📄 _WIKI/log.md</span>
              <p class="text-slate-500 mt-0.5">일자별/시간별 작업 히스토리 자동 기록 로그</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex justify-end">
        <button onclick="closeUserWikiModal()" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer">
          닫기
        </button>
      </div>
    </div>
  </div>\n`;

if (!html.includes('id="userWikiModal"')) {
  html = html.slice(0, bodyIdx) + userWikiModalHtml + html.slice(bodyIdx);
  console.log('7. userWikiModal injected before </body>.');
}

// ----------------------------------------------------
// 6. JAVASCRIPT: Helpers for Wiki, Local Path, File Opener & Dynamic Paths
// ----------------------------------------------------
const helperFunctionsJs = `
    let tempSignupLogoDataUrl = 'app_logo.png';
    let currentConnectedWikiHandle = null;

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
`;

// Insert helperFunctionsJs right before "function openSolutionWorkbench(appKey) {"
const workbenchFnMarker = 'function openSolutionWorkbench(appKey) {';
if (html.includes(workbenchFnMarker) && !html.includes('function selectLocalFileForTool')) {
  html = html.replace(workbenchFnMarker, helperFunctionsJs + '\n    ' + workbenchFnMarker);
  console.log('8. Helper functions for Wiki, Local Path, and File Picker injected.');
}

// Update updateAuthUI to set headerCompanyLogo and headerCompanyName
const updateAuthUiTarget = 'function updateAuthUI() {';
const newAuthUiHeaderSnippet = `function updateAuthUI() {
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

if (html.includes(updateAuthUiTarget) && !html.includes('compLogoEl.src = compLogo')) {
  html = html.replace(updateAuthUiTarget, newAuthUiHeaderSnippet);
  console.log('9. updateAuthUI updated to sync Company Logo and Name.');
}

// Dynamic Path calculation in updateWorkbenchModalContent and openExplorerTargetFolder
const oldTargetCalc = `const targetPath = 'C:\\\\Users\\\\LSH2\\\\Desktop\\\\작업파일\\\\' + selProj + '\\\\_AI_작업문서\\\\' + app.subfolder + '\\\\';`;
const newTargetCalc = `const targetPath = (typeof getUserLocalBasePath === 'function' ? getUserLocalBasePath() : 'C:\\\\Users\\\\LSH2\\\\Desktop\\\\작업파일\\\\') + selProj + '\\\\_AI_작업문서\\\\' + app.subfolder + '\\\\';`;

if (html.includes(oldTargetCalc)) {
  html = html.replace(oldTargetCalc, newTargetCalc);
  console.log('10. updateWorkbenchModalContent target path made dynamic.');
}

const oldExplorerCalc = `const folderPath = 'C:\\\\Users\\\\LSH2\\\\Desktop\\\\작업파일\\\\' + selProj + '\\\\_AI_작업문서\\\\' + app.subfolder + '\\\\';`;
const newExplorerCalc = `const folderPath = (typeof getUserLocalBasePath === 'function' ? getUserLocalBasePath() : 'C:\\\\Users\\\\LSH2\\\\Desktop\\\\작업파일\\\\') + selProj + '\\\\_AI_작업문서\\\\' + app.subfolder + '\\\\';`;

if (html.includes(oldExplorerCalc)) {
  html = html.replace(oldExplorerCalc, newExplorerCalc);
  console.log('11. openExplorerTargetFolder path made dynamic.');
}

// ----------------------------------------------------
// 7. SYNC IDENTICAL FILE & VALIDATE
// ----------------------------------------------------
fs.writeFileSync(targetPath, html, 'utf8');
console.log('Successfully saved index.html! New length:', html.length);

// Copy to urban_project_manager.html
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');
fs.writeFileSync(destPath, html, 'utf8');
console.log('Successfully synced to urban_project_manager.html!');

// Validate inline scripts
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
    console.error('Script #' + count + ' syntax ERROR ❌:', e.message);
    process.exit(1);
  }
}

console.log('ALL SYNTAX CHECKS COMPLETED SUCCESSFULLY! 🎉');
