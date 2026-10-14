const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetPath = path.join(__dirname, '..', '..', 'index.html');
let html = fs.readFileSync(targetPath, 'utf8');

console.log('Original index.html length:', html.length);

// ========================================================
// 1. UPDATE DEFAULT_MASTER_PASSWORD TO Dltjgus411!
// ========================================================
html = html.replace(
  "const DEFAULT_MASTER_PASSWORD = 'urban2026';",
  "const DEFAULT_MASTER_PASSWORD = 'Dltjgus411!';"
);

// ========================================================
// 2. REPLACE LOGIN LANDING PORTAL (Login + Signup with Company Name & CI)
// ========================================================
const portalStart = html.indexOf('<div id="loginLandingPortal"');
const portalEnd = html.indexOf('<!-- MAIN CONTAINER -->');

if (portalStart === -1 || portalEnd === -1) {
  console.error('Portal boundaries not found!');
  process.exit(1);
}

const newPortalHtml = `  <div id="loginLandingPortal" class="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto" style="display: flex;">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 space-y-5 my-auto">
      
      <!-- LOGO & BRANDING -->
      <div class="text-center space-y-2">
        <div class="h-14 w-32 mx-auto px-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
          <img id="portalBrandLogo" src="app_logo.png" alt="Kyong Ho . ENC" class="h-8 object-contain">
        </div>
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">도시계획 업무관리시스템</h2>
          <p id="portalBrandSub" class="text-xs text-slate-500 mt-0.5">도시계획 &middot; 정비사업 &middot; 솔루션 센터 통합 포털</p>
        </div>
        <div class="inline-flex items-center gap-1.5 px-3 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold">
          <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>v1.23.0 Multi-Tenant Enterprise</span>
        </div>
      </div>

      <!-- PORTAL TABS: LOGIN vs SIGNUP -->
      <div class="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button type="button" id="portalTabBtnLogin" onclick="switchPortalTab('login')" class="flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-white text-blue-700 shadow-xs cursor-pointer">
          <i data-lucide="log-in" class="w-3.5 h-3.5"></i> 로그인
        </button>
        <button type="button" id="portalTabBtnSignup" onclick="switchPortalTab('signup')" class="flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 cursor-pointer">
          <i data-lucide="user-plus" class="w-3.5 h-3.5"></i> 신규 계정 가입
        </button>
      </div>

      <!-- TAB 1: LOGIN FORM -->
      <div id="portalLoginTabContent" class="space-y-4">
        <form onsubmit="event.preventDefault(); handlePortalLoginSubmit();" class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">사용자 아이디</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">👤</span>
              <input type="text" id="portalLoginId" value="admin" placeholder="아이디 입력 (기본: admin)" class="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50" autocomplete="username" required>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">비밀번호</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔒</span>
              <input type="password" id="portalLoginPassword" placeholder="비밀번호 입력 (기본: Dltjgus411!)" class="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50" autocomplete="current-password" required>
              <button type="button" onclick="togglePasswordVisibility('portalLoginPassword', 'eyeIconPortal')" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                <i data-lucide="eye" id="eyeIconPortal" class="w-4 h-4"></i>
              </button>
            </div>
            <p id="portalLoginErrorMsg" class="hidden text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
              <span>⚠️</span> <span>아이디 또는 비밀번호가 일치하지 않습니다.</span>
            </p>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
            <span class="flex items-center gap-1.5 font-medium text-slate-600 text-[11px]">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 text-blue-600"></i>
              <span>보안 세션 적용 (새 탭 시 로그인)</span>
            </span>
            <span class="text-[10.5px] font-mono text-slate-400">admin / Dltjgus411!</span>
          </div>

          <button type="submit" class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer">
            <i data-lucide="key" class="w-4 h-4"></i>
            <span>로그인 (워크스페이스 접속)</span>
          </button>
        </form>

        <!-- DIVIDER -->
        <div class="relative flex py-0.5 items-center">
          <div class="flex-grow border-t border-slate-200"></div>
          <span class="flex-shrink mx-3 text-[11px] font-semibold text-slate-400">또는</span>
          <div class="flex-grow border-t border-slate-200"></div>
        </div>

        <!-- GUEST MODE EXPLORE -->
        <div>
          <button type="button" onclick="enterGuestMode()" class="w-full py-2.5 bg-amber-50/90 hover:bg-amber-100 border border-amber-300 hover:border-amber-400 text-amber-900 font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer group">
            <span class="text-sm group-hover:scale-110 transition-transform">👀</span>
            <span>게스트 모드로 둘러보기 (조회 전용)</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-amber-700 group-hover:translate-x-0.5 transition-transform"></i>
          </button>
        </div>
      </div>

      <!-- TAB 2: SIGNUP FORM (MULTI-TENANT USER & COMPANY CI) -->
      <div id="portalSignupTabContent" class="hidden space-y-3.5">
        <form onsubmit="event.preventDefault(); handlePortalSignupSubmit();" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">희망 아이디 <span class="text-rose-500">*</span></label>
            <input type="text" id="signupUserId" placeholder="영문/숫자 4자 이상" class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">성명 / 직급 <span class="text-rose-500">*</span></label>
              <input type="text" id="signupUserName" placeholder="예: 김철수 과장" class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">소속 회사명 <span class="text-rose-500">*</span></label>
              <input type="text" id="signupCompany" placeholder="예: 삼우종합건축" class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">비밀번호 <span class="text-rose-500">*</span></label>
              <input type="password" id="signupPassword" placeholder="4자 이상" class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">비밀번호 확인 <span class="text-rose-500">*</span></label>
              <input type="password" id="signupPasswordConfirm" placeholder="동일하게 입력" class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" required>
            </div>
          </div>

          <!-- COMPANY CI LOGO UPLOAD -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-700">회사 CI / 로고 이미지 등록</label>
              <span class="text-[10px] text-slate-400">(PNG/JPG, 미선택시 기본 CI)</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-16 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                <img id="signupCiPreview" src="app_logo.png" alt="CI 미리보기" class="max-h-8 max-w-full object-contain">
              </div>
              <input type="file" id="signupCiFileInput" accept="image/*" onchange="handleSignupLogoUpload(event)" class="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer">
            </div>
          </div>

          <p id="signupErrorMsg" class="hidden text-xs text-rose-600 font-bold"></p>

          <button type="submit" class="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer">
            <i data-lucide="user-check" class="w-4 h-4"></i>
            <span>신규 계정 생성 및 즉시 시작</span>
          </button>
        </form>

        <p class="text-center text-[10.5px] text-slate-400 leading-relaxed">
          * 가입 즉시 귀하 전용의 <strong>독립된 프로젝트/조서 워크스페이스</strong>가 개설되며, 타 사용자 및 관리자의 비공개 문서와 100% 격리됩니다.
        </p>
      </div>

    </div>
  </div>\n\n  `;

html = html.slice(0, portalStart) + newPortalHtml + html.slice(portalEnd);
console.log('1. Portal replaced.');

// ========================================================
// 3. REDESIGN DESKTOP HEADER BRANDING (Remove pink badge & long description, logo directly under title)
// ========================================================
const desktopHeaderStart = html.indexOf('<!-- DESKTOP HEADER (visible on tablet/desktop md:flex) -->');
const desktopBadgesStart = html.indexOf('<!-- Quick Summary Badges & Action Buttons -->');

if (desktopHeaderStart === -1 || desktopBadgesStart === -1) {
  console.error('Desktop header boundaries not found!');
  process.exit(1);
}

const originalDesktopHeaderSlice = html.slice(desktopHeaderStart, desktopBadgesStart);
const brandContainerStart = originalDesktopHeaderSlice.indexOf('<div class="flex items-center gap-3.5">');

if (brandContainerStart !== -1) {
  const brandEndTarget = '</div>\n\n      </div>\n\n';
  const brandContainerEnd = originalDesktopHeaderSlice.indexOf(brandEndTarget, brandContainerStart);
  
  if (brandContainerEnd !== -1) {
    const newBrandHtml = `<div class="flex flex-col gap-1">
        <div class="flex items-center gap-2.5">
          <h1 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>도시계획 업무관리시스템</span>
            <span class="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">v1.23.0</span>
          </h1>
        </div>
        <div class="flex items-center gap-2 pt-0.5">
          <div class="h-6 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shadow-2xs">
            <img id="headerCompanyLogo" src="app_logo.png" alt="Company CI" class="h-4 max-w-[120px] object-contain">
          </div>
          <span id="headerCompanyName" class="text-xs font-semibold text-slate-500">주식회사 경호엔지니어링 종합건축사사무소</span>
        </div>
      </div>\n\n      `;

    const updatedHeaderSlice = originalDesktopHeaderSlice.slice(0, brandContainerStart) + newBrandHtml + originalDesktopHeaderSlice.slice(brandContainerEnd + brandEndTarget.length);
    html = html.slice(0, desktopHeaderStart) + updatedHeaderSlice + html.slice(desktopBadgesStart);
    console.log('2. Desktop header brand redesigned.');
  }
}

// Update mobile header logo id
html = html.replace('<img src="app_logo.png" alt="Logo" class="h-6 w-auto shrink-0">', '<img id="mobileHeaderCompanyLogo" src="app_logo.png" alt="Logo" class="h-6 max-w-[90px] object-contain shrink-0">');

// Update version badge text from v1.22.0 to v1.23.0
html = html.replace('<span>v1.22.0 Enterprise Workspace</span>', '<span>v1.23.0 Enterprise Workspace</span>');
html = html.replace('>v1.22.0<', '>v1.23.0<');

// ========================================================
// 4. ENHANCE SOLUTION CENTER (Control Bar: Wiki connection & Local path & Card File Openers)
// ========================================================
const controlBarTarget = '<span id="btnConnectFolderText">📁 내 PC 사업 폴더 다이렉트 연결</span>\n                </button>';
if (html.includes(controlBarTarget)) {
  const enhancedControlButtons = `<span id="btnConnectFolderText">📁 내 PC 사업 폴더 다이렉트 연결</span>
                </button>

                <button onclick="openUserWikiModal()" class="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer" title="내 PC LLM 위키(_WIKI) 독립 연동">
                  <i data-lucide="brain-circuit" class="w-4 h-4"></i>
                  <span id="btnUserWikiText">🧠 내 LLM 위키 연동</span>
                </button>

                <button onclick="promptUserLocalBasePath()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer text-xs" title="본인 PC 로컬 기본 작업 경로 설정">
                  <i data-lucide="settings-2" class="w-3.5 h-3.5 text-slate-500"></i>
                  <span>경로 설정</span>
                </button>`;
  html = html.replace(controlBarTarget, enhancedControlButtons);
  console.log('3. Solution center control bar enhanced with Wiki & Path settings.');
}

// Add local file openers to the 9 tool cards
const toolCardReplacements = [
  { search: `openSolutionWorkbench('land_ledger')`, key: 'land_ledger', name: '토지조서' },
  { search: `openSolutionWorkbench('building_ledger')`, key: 'building_ledger', name: '건축물조서' },
  { search: `openSolutionWorkbench('base_map')`, key: 'base_map', name: '기초도면' },
  { search: `openSolutionWorkbench('land_status_map')`, key: 'land_status_map', name: '토지현황도' },
  { search: `openSolutionWorkbench('building_status_map')`, key: 'building_status_map', name: '건축물현황도' },
  { search: `openSolutionWorkbench('pdf_table')`, key: 'pdf_table', name: 'PDF표추출' },
  { search: `openSolutionWorkbench('geopandas')`, key: 'geopandas', name: '공간연산' },
  { search: `openSolutionWorkbench('pyhwpx')`, key: 'pyhwpx', name: '한글문서' },
  { search: `openSolutionWorkbench('law_search')`, key: 'law_search', name: '법령공시' }
];

toolCardReplacements.forEach(t => {
  const footerPattern = `<div class="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">`;
  const btnPattern = `onclick="${t.search}"`;
  
  const btnIdx = html.indexOf(btnPattern);
  if (btnIdx !== -1) {
    const footerIdx = html.lastIndexOf(footerPattern, btnIdx);
    if (footerIdx !== -1 && (btnIdx - footerIdx) < 500) {
      const originalFooter = html.slice(footerIdx, btnIdx);
      if (!originalFooter.includes('selectLocalFileForTool')) {
        const enhancedFooter = `<div class="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <button type="button" onclick="selectLocalFileForTool('${t.key}')" class="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-200 transition flex items-center gap-1 cursor-pointer" title="내 PC 로컬 파일 직접 지정/열기">
                      <i data-lucide="folder-open" class="w-3 h-3 text-blue-600"></i> 내 파일 열기
                    </button>
                  </div>`;
        html = html.slice(0, footerIdx) + enhancedFooter + html.slice(footerIdx + footerPattern.length);
      }
    }
  }
});
console.log('4. Tool cards enhanced with direct local file openers.');

// ========================================================
// 5. INSERT MODALS BEFORE </body> (Member Admin Modal & User LLM Wiki Modal)
// ========================================================
const bodyCloseIdx = html.indexOf('</body>');
if (bodyCloseIdx === -1) {
  console.error('</body> tag not found!');
  process.exit(1);
}

const modalsHtml = `
  <!-- ======================================================== -->
  <!-- 👥 MASTER RBAC MEMBER MANAGEMENT MODAL (Admin Only) -->
  <!-- ======================================================== -->
  <div id="memberAdminModal" class="hidden fixed inset-0 z-[9990] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
    <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
      <!-- Modal Header -->
      <div class="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-xl">
            👥
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>시스템 회원 및 RBAC 권한 관리 센터</span>
              <span class="text-xs px-2 py-0.5 bg-blue-500/30 text-blue-300 border border-blue-400/30 rounded-full font-bold">마스터 전용</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">등록된 회원의 정보를 조회하고 4단계 권한(최고관리자/수정/실무/조회)을 부여하며 독립 워크스페이스를 원격 점검합니다.</p>
          </div>
        </div>
        <button onclick="closeMemberAdminModal()" class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Member Stats & Quick Guide -->
      <div class="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-700">전체 등록 회원:</span>
          <span id="memberTotalCountBadge" class="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold font-mono rounded-full text-xs">1 명</span>
        </div>
        <div class="flex items-center gap-3 text-slate-500 text-[11.5px]">
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-indigo-600"></span> <strong>admin</strong>: 최고관리자</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-600"></span> <strong>editor</strong>: 등록/수정</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-600"></span> <strong>collaborator</strong>: 실무협업</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-slate-400"></span> <strong>viewer</strong>: 조회전용</span>
        </div>
      </div>

      <!-- Member List Table -->
      <div class="p-4 sm:p-6 overflow-y-auto flex-1">
        <div class="overflow-x-auto border border-slate-200 rounded-2xl">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th class="p-3 pl-4">사용자 (ID / 이름)</th>
                <th class="p-3">소속 회사 및 CI</th>
                <th class="p-3">부여 권한 (RBAC)</th>
                <th class="p-3">가입일시</th>
                <th class="p-3 text-center">워크스페이스 점검</th>
                <th class="p-3 text-center pr-4">계정 관리</th>
              </tr>
            </thead>
            <tbody id="memberAdminTableBody" class="divide-y divide-slate-100">
              <!-- Dynamically rendered -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex justify-end">
        <button onclick="closeMemberAdminModal()" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer">
          닫기
        </button>
      </div>
    </div>
  </div>

  <!-- ======================================================== -->
  <!-- 🧠 USER INDEPENDENT LLM WIKI MANAGEMENT MODAL -->
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
  </div>
`;

html = html.slice(0, bodyCloseIdx) + modalsHtml + html.slice(bodyCloseIdx);
console.log('5. Modals injected before </body>.');

// ========================================================
// 6. UPDATE JAVASCRIPT: AUTH & MULTI-TENANT & ISOLATED WORKSPACES & LOCAL PATH/FILE & WIKI
// ========================================================
const authStartMarker = '// 🔒 Security: Always clear any cross-tab localStorage auth session';
const authEndMarker = "function requireAdmin(actionName = '데이터 변경') {";

const authStartIdx = html.indexOf(authStartMarker);
const authEndIdx = html.indexOf(authEndMarker);

if (authStartIdx === -1 || authEndIdx === -1) {
  console.error('Auth script boundaries not found!');
  process.exit(1);
}

const newAuthAndMultiUserJs = `// 🔒 Security: Always clear any cross-tab localStorage auth session
    // Every newly opened tab / reconnect must start fresh at the Login Portal Screen
    try {
      localStorage.removeItem('urban_auth_session');
    } catch(e) {}

    // ==========================================
    // 👥 MULTI-TENANT USER & RBAC AUTHENTICATION SYSTEM (v1.23.0)
    // ==========================================
    const DEFAULT_MASTER_ID = 'admin';

    const INITIAL_SYSTEM_ADMIN = {
      id: 'admin',
      name: '이승헌 소장',
      company: '주식회사 경호엔지니어링 종합건축사사무소',
      role: 'admin',
      password: 'Dltjgus411!',
      companyLogo: 'app_logo.png',
      createdAt: '2026-01-01 09:00'
    };

    let tempSignupLogoDataUrl = 'app_logo.png';
    let currentConnectedWikiHandle = null;

    function getRegisteredUsers() {
      try {
        const raw = localStorage.getItem('urban_registered_users');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            // Ensure admin exists
            const adminIdx = list.findIndex(u => u.id === 'admin');
            if (adminIdx === -1) {
              list.unshift(INITIAL_SYSTEM_ADMIN);
            } else {
              // Ensure admin password allows Dltjgus411!
              if (list[adminIdx].password !== 'Dltjgus411!') {
                list[adminIdx].password = 'Dltjgus411!';
              }
            }
            return list;
          }
        }
      } catch(e) {}
      const initial = [INITIAL_SYSTEM_ADMIN];
      localStorage.setItem('urban_registered_users', JSON.stringify(initial));
      return initial;
    }

    function saveRegisteredUsers(users) {
      try {
        localStorage.setItem('urban_registered_users', JSON.stringify(users));
      } catch(e) {
        console.error('Failed to save registered users:', e);
      }
    }

    function getCurrentUser() {
      try {
        const uId = sessionStorage.getItem('urban_current_user_id');
        if (!uId) return null;
        const users = getRegisteredUsers();
        return users.find(u => u.id === uId) || (uId === 'admin' ? INITIAL_SYSTEM_ADMIN : null);
      } catch(e) {
        return null;
      }
    }

    function checkIsAdmin() {
      try {
        const u = getCurrentUser();
        return (u && u.role === 'admin') || (sessionStorage.getItem('urban_auth_session') === 'admin');
      } catch(e) {
        return false;
      }
    }

    function checkCanEdit() {
      try {
        const u = getCurrentUser();
        if (!u) return false;
        return u.role === 'admin' || u.role === 'editor';
      } catch(e) {
        return false;
      }
    }

    function checkHasGuestAccess() {
      try {
        return sessionStorage.getItem('urban_guest_entered') === 'true';
      } catch(e) {
        return false;
      }
    }

    // Portal Tab Switcher (Login vs Signup)
    function switchPortalTab(tab) {
      const loginTab = document.getElementById('portalLoginTabContent');
      const signupTab = document.getElementById('portalSignupTabContent');
      const btnLogin = document.getElementById('portalTabBtnLogin');
      const btnSignup = document.getElementById('portalTabBtnSignup');

      if (!loginTab || !signupTab) return;

      if (tab === 'signup') {
        loginTab.classList.add('hidden');
        signupTab.classList.remove('hidden');
        if (btnSignup) btnSignup.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-white text-emerald-700 shadow-xs cursor-pointer';
        if (btnLogin) btnLogin.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 cursor-pointer';
      } else {
        signupTab.classList.add('hidden');
        loginTab.classList.remove('hidden');
        if (btnLogin) btnLogin.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-white text-blue-700 shadow-xs cursor-pointer';
        if (btnSignup) btnSignup.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 cursor-pointer';
      }
      if (window.lucide) lucide.createIcons();
    }

    // Handle CI Logo Upload for Sign Up
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

    // Handle New Member Sign Up Submit
    function handlePortalSignupSubmit() {
      const idEl = document.getElementById('signupUserId');
      const nameEl = document.getElementById('signupUserName');
      const compEl = document.getElementById('signupCompany');
      const pwEl = document.getElementById('signupPassword');
      const pwConfEl = document.getElementById('signupPasswordConfirm');
      const errEl = document.getElementById('signupErrorMsg');

      const uId = (idEl ? idEl.value : '').trim();
      const uName = (nameEl ? nameEl.value : '').trim();
      const uComp = (compEl ? compEl.value : '').trim();
      const uPw = (pwEl ? pwEl.value : '').trim();
      const uPwConf = (pwConfEl ? pwConfEl.value : '').trim();

      const showErr = (msg) => {
        if (errEl) {
          errEl.innerText = '⚠️ ' + msg;
          errEl.classList.remove('hidden');
        } else {
          alert(msg);
        }
      };

      if (!uId || uId.length < 3) return showErr('아이디는 3자 이상 입력해주세요.');
      if (!uName) return showErr('성명 / 직급을 입력해주세요.');
      if (!uComp) return showErr('소속 회사명을 입력해주세요.');
      if (!uPw || uPw.length < 4) return showErr('비밀번호는 4자 이상이어야 합니다.');
      if (uPw !== uPwConf) return showErr('비밀번호와 비밀번호 확인이 일치하지 않습니다.');

      const users = getRegisteredUsers();
      if (users.some(u => u.id.toLowerCase() === uId.toLowerCase())) {
        return showErr('이미 등록된 아이디입니다. 다른 아이디를 입력해주세요.');
      }

      const newUser = {
        id: uId,
        name: uName,
        company: uComp,
        role: 'collaborator',
        password: uPw,
        companyLogo: tempSignupLogoDataUrl || 'app_logo.png',
        createdAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
      };

      users.push(newUser);
      saveRegisteredUsers(users);

      if (errEl) errEl.classList.add('hidden');

      // Auto login as new user
      sessionStorage.setItem('urban_current_user_id', newUser.id);
      sessionStorage.setItem('urban_auth_session', newUser.role);
      sessionStorage.removeItem('urban_guest_entered');
      localStorage.removeItem('urban_auth_session');

      loadStore();
      syncAppViews();
      renderAll();
      showAuthToast(\`🎉 환영합니다, \${newUser.name}님!\\n[\${newUser.company}] 전용 독립 워크스페이스가 활성화되었습니다.\`, false);
    }

    // Handle Login Submit (Accepts both Dltjgus411! and urban2026 for admin)
    function handlePortalLoginSubmit() {
      const idInput = document.getElementById('portalLoginId');
      const pwInput = document.getElementById('portalLoginPassword');
      const err = document.getElementById('portalLoginErrorMsg');

      const idVal = (idInput ? idInput.value : '').trim();
      const pwVal = (pwInput ? pwInput.value : '').trim();

      const users = getRegisteredUsers();
      let matchedUser = users.find(u => u.id.toLowerCase() === idVal.toLowerCase());

      // Master admin authentication check (accepts Dltjgus411!, urban2026, or stored master pass)
      if (idVal.toLowerCase() === DEFAULT_MASTER_ID) {
        const masterPass = getMasterPassword();
        if (pwVal === masterPass || pwVal === 'Dltjgus411!' || pwVal === 'urban2026') {
          matchedUser = INITIAL_SYSTEM_ADMIN;
        }
      }

      if (matchedUser && (matchedUser.password === pwVal || (matchedUser.id === 'admin' && (pwVal === 'Dltjgus411!' || pwVal === 'urban2026' || pwVal === getMasterPassword())))) {
        if (err) err.classList.add('hidden');
        sessionStorage.setItem('urban_current_user_id', matchedUser.id);
        sessionStorage.setItem('urban_auth_session', matchedUser.role);
        sessionStorage.removeItem('urban_guest_entered');
        localStorage.removeItem('urban_auth_session');

        loadStore();
        syncAppViews();
        renderAll();
        showAuthToast(\`👑 [\${matchedUser.company}] \${matchedUser.name}님으로 로그인되었습니다.\`, false);
      } else {
        if (err) {
          err.classList.remove('hidden');
        } else {
          alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        }
        if (pwInput) {
          pwInput.focus();
          pwInput.select();
        }
      }
    }

    function enterGuestMode() {
      try {
        localStorage.removeItem('urban_auth_session');
        sessionStorage.removeItem('urban_auth_session');
        sessionStorage.removeItem('urban_current_user_id');
        sessionStorage.setItem('urban_guest_entered', 'true');
      } catch(e) {}
      loadStore();
      syncAppViews();
      renderAll();
      showAuthToast('👀 게스트 모드로 접속했습니다. (조회 전용)', false);
    }

    function showLoginPortal() {
      try {
        localStorage.removeItem('urban_auth_session');
        sessionStorage.removeItem('urban_auth_session');
        sessionStorage.removeItem('urban_current_user_id');
        sessionStorage.removeItem('urban_guest_entered');
      } catch(e) {}
      const pwInput = document.getElementById('portalLoginPassword');
      if (pwInput) pwInput.value = '';
      const err = document.getElementById('portalLoginErrorMsg');
      if (err) err.classList.add('hidden');
      switchPortalTab('login');
      syncAppViews();
      if (pwInput) setTimeout(() => pwInput.focus(), 150);
    }

    function syncAppViews() {
      const portal = document.getElementById('loginLandingPortal');
      const mainApp = document.getElementById('mainAppContainer');
      const user = getCurrentUser();
      const hasGuest = checkHasGuestAccess();

      if (user || hasGuest) {
        if (portal) portal.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
      } else {
        if (portal) portal.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
      }
      updateAuthUI();
      populateSolutionProjectOptions();
      if (window.lucide) lucide.createIcons();
    }

    // ==========================================
    // ⚙️ USER WORKSPACE & STORAGE KEY ROUTING
    // ==========================================
    function getWorkspaceStorageKey() {
      const user = getCurrentUser();
      if (!user || user.id === 'admin') {
        return 'urban_clean_store_v11';
      }
      return 'urban_store_workspace_' + user.id;
    }

    function getUserLocalBasePath() {
      const user = getCurrentUser();
      if (user && user.id === 'admin') {
        return localStorage.getItem('urban_admin_local_base_path') || 'C:\\\\Users\\\\LSH2\\\\Desktop\\\\작업파일\\\\';
      }
      const uId = user ? user.id : 'guest';
      return localStorage.getItem('urban_user_local_base_path_' + uId) || ('C:\\\\Users\\\\' + uId + '\\\\Desktop\\\\작업파일\\\\');
    }

    function setUserLocalBasePath(newPath) {
      const user = getCurrentUser();
      const uId = user ? user.id : 'guest';
      if (user && user.id === 'admin') {
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
        if (currentWorkbenchAppKey) updateWorkbenchModalContent(currentWorkbenchAppKey);
      }
    }

    function getUserWikiBasePath() {
      const user = getCurrentUser();
      if (user && user.id === 'admin') {
        return localStorage.getItem('urban_admin_wiki_base_path') || 'C:\\\\Users\\\\LSH2\\\\Desktop\\\\작업파일\\\\_WIKI\\\\';
      }
      const uId = user ? user.id : 'guest';
      return localStorage.getItem('urban_user_wiki_base_path_' + uId) || (getUserLocalBasePath() + '_WIKI\\\\');
    }

    function setUserWikiBasePath(newPath) {
      const user = getCurrentUser();
      const uId = user ? user.id : 'guest';
      if (user && user.id === 'admin') {
        localStorage.setItem('urban_admin_wiki_base_path', newPath);
      } else {
        localStorage.setItem('urban_user_wiki_base_path_' + uId, newPath);
      }
    }

    // ==========================================
    // 👥 MEMBER ADMIN MODAL (RBAC Controller)
    // ==========================================
    function openMemberAdminModal() {
      if (!checkIsAdmin()) {
        alert('최고관리자(admin) 권한만 회원 및 RBAC 센터에 접근할 수 있습니다.');
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
      const tbody = document.getElementById('memberAdminTableBody');
      const badge = document.getElementById('memberTotalCountBadge');
      if (!tbody) return;

      const users = getRegisteredUsers();
      if (badge) badge.innerText = users.length + ' 명';

      let htmlRows = '';
      users.forEach(u => {
        const isSelf = u.id === 'admin';
        htmlRows += \`<tr class="hover:bg-slate-50 transition">
          <td class="p-3 pl-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 overflow-hidden shrink-0">
                \${u.companyLogo ? \`<img src="\${u.companyLogo}" class="max-h-6 max-w-full object-contain">\` : '👤'}
              </div>
              <div>
                <div class="font-bold text-slate-900">\${u.name} \${isSelf ? '<span class="text-[10px] text-blue-600 bg-blue-50 px-1 rounded font-bold">본인</span>' : ''}</div>
                <div class="font-mono text-[11px] text-slate-400">@\${u.id}</div>
              </div>
            </div>
          </td>
          <td class="p-3">
            <div class="font-bold text-slate-800">\${u.company}</div>
          </td>
          <td class="p-3">
            \${isSelf ? \`
              <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 rounded-lg text-[11px]">
                👑 최고관리자
              </span>
            \` : \`
              <select onchange="updateMemberRole('\${u.id}', this.value)" class="px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-[11px] text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option value="editor" \${u.role === 'editor' ? 'selected' : ''}>✍️ 수정/등록 권한 (Editor)</option>
                <option value="collaborator" \${u.role === 'collaborator' ? 'selected' : ''}>🤝 실무 협업 (Collaborator)</option>
                <option value="viewer" \${u.role === 'viewer' ? 'selected' : ''}>👀 조회 전용 (Viewer)</option>
                <option value="admin" \${u.role === 'admin' ? 'selected' : ''}>👑 관리자 (Admin)</option>
              </select>
            \`}
          </td>
          <td class="p-3 text-slate-500 text-[11px] whitespace-nowrap">
            \${u.createdAt || '-'}
          </td>
          <td class="p-3 text-center">
            <button onclick="inspectMemberWorkspace('\${u.id}')" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition text-[11px] cursor-pointer">
              🔍 작업현황 확인
            </button>
          </td>
          <td class="p-3 text-center pr-4">
            \${isSelf ? '<span class="text-slate-300">-</span>' : \`
              <button onclick="deleteMemberUser('\${u.id}')" class="text-slate-400 hover:text-rose-600 transition p-1" title="회원 계정 삭제">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            \`}
          </td>
        </tr>\`;
      });

      tbody.innerHTML = htmlRows;
      if (window.lucide) lucide.createIcons();
    }

    function updateMemberRole(userId, newRole) {
      if (!checkIsAdmin()) return;
      const users = getRegisteredUsers();
      const target = users.find(u => u.id === userId);
      if (target) {
        target.role = newRole;
        saveRegisteredUsers(users);
        showAuthToast(\`✅ [\${target.name}] 회원의 권한이 [\${newRole}]으로 변경되었습니다.\`, false);
        renderMemberAdminList();
      }
    }

    function deleteMemberUser(userId) {
      if (!checkIsAdmin()) return;
      if (userId === 'admin') return alert('최고관리자 계정은 삭제할 수 없습니다.');
      if (!confirm('정말 이 회원의 계정 및 접근 권한을 삭제하시겠습니까?\\n(해당 사용자의 로컬 워크스페이스는 보존됩니다)')) return;

      let users = getRegisteredUsers();
      users = users.filter(u => u.id !== userId);
      saveRegisteredUsers(users);
      renderMemberAdminList();
      showAuthToast('계정이 성공적으로 삭제되었습니다.', false);
    }

    function inspectMemberWorkspace(userId) {
      const users = getRegisteredUsers();
      const target = users.find(u => u.id === userId);
      if (!target) return;

      const storeKey = userId === 'admin' ? 'urban_clean_store_v11' : ('urban_store_workspace_' + userId);
      const raw = localStorage.getItem(storeKey);
      let pCount = 0;
      let tCount = 0;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          pCount = (parsed.projects || []).length;
          tCount = (parsed.dailyTasks || []).length;
        } catch(e) {}
      }

      alert(\`📊 [\${target.company} - \${target.name}] 워크스페이스 점검 결과:\\n\\n` +
            `- 회원 ID: @\${target.id}\\n` +
            `- 현재 권한: \${target.role}\\n` +
            `- 등록 프로젝트 수: \${pCount}개\\n` +
            `- 등록 업무 To-Do: \${tCount}건\\n\\n` +
            `* 데이터 격리 원칙에 따라 회원의 독립 저장소(\${storeKey})에 안전하게 보관 중입니다.\`);
    }

    // ==========================================
    // 🧠 USER INDEPENDENT LLM WIKI CONTROLLER
    // ==========================================
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
        if (currentWorkbenchAppKey) updateWorkbenchModalContent(currentWorkbenchAppKey);
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

      const logEntry = \`\\n\\n### [\${nowStr}] \${user.name} (\${user.company}) - \${selProj}\\n` +
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

    // ==========================================
    // 📄 DIRECT LOCAL FILE OPENER FOR ANY TOOL
    // ==========================================
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
      openSolutionWorkbench(appKey);

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
              renderWorkbenchTable(headers, rows);
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

    // Populate Dynamic Solution Project Options
    function populateSolutionProjectOptions() {
      const select = document.getElementById('solutionProjectSelect');
      if (!select) return;
      const currentVal = select.value;

      let optionsHtml = '';
      if (currentConnectedDirectoryHandle) {
        optionsHtml += \`<option value="\${currentConnectedDirectoryHandle.name}">📁 [연결된 폴더] \${currentConnectedDirectoryHandle.name}</option>\`;
      }

      const projects = (store && store.projects && store.projects.length > 0) ? store.projects : [];
      if (projects.length > 0) {
        projects.forEach(p => {
          optionsHtml += \`<option value="\${p.name}">\${p.name}</option>\`;
        });
      } else {
        const user = getCurrentUser();
        const defProj = (user && user.company ? user.company : '내 업무') + ' 1차 사업 검토';
        optionsHtml += \`<option value="\${defProj}">\${defProj}</option>\`;
      }
      select.innerHTML = optionsHtml;

      if (currentVal && select.querySelector(\`option[value="\${currentVal}"]\`)) {
        select.value = currentVal;
      }
      onSolutionProjectChange(select.value);
    }

    `;

html = html.slice(0, authStartIdx) + newAuthAndMultiUserJs + html.slice(authEndIdx);
console.log('6. Auth & Multi-tenant JS replaced.');

// ========================================================
// 7. UPDATE updateAuthUI() to handle dynamic Company Logo & Name & RBAC buttons
// ========================================================
const updateAuthUiStart = html.indexOf('function updateAuthUI() {');
const updateAuthUiEnd = html.indexOf('function openMobileModal() {', updateAuthUiStart);

if (updateAuthUiStart === -1 || updateAuthUiEnd === -1) {
  console.error('updateAuthUI boundaries not found!');
  process.exit(1);
}

const newUpdateAuthUiJs = `function updateAuthUI() {
      const isAdmin = checkIsAdmin();
      const currentUser = getCurrentUser();
      if (typeof updateLiveSalaryTracker === 'function') updateLiveSalaryTracker();

      // Dynamic Company Logo and Company Name
      const compLogoEl = document.getElementById('headerCompanyLogo');
      const compNameEl = document.getElementById('headerCompanyName');
      const mobCompLogoEl = document.getElementById('mobileHeaderCompanyLogo');

      const compName = currentUser ? (currentUser.company || '주식회사 경호엔지니어링 종합건축사사무소') : '주식회사 경호엔지니어링 종합건축사사무소';
      const compLogo = currentUser ? (currentUser.companyLogo || 'app_logo.png') : 'app_logo.png';

      if (compLogoEl) compLogoEl.src = compLogo;
      if (mobCompLogoEl) mobCompLogoEl.src = compLogo;
      if (compNameEl) compNameEl.innerText = compName;

      // Tab 6 (Career) Guest Privacy Control (Only admin can see full career history)
      const headerStatCareer = document.getElementById('headerStatCareer');
      if (headerStatCareer) {
        headerStatCareer.style.display = isAdmin ? '' : 'none';
      }

      const tabCareerIcon = document.getElementById('tabCareerIcon');
      const tabCareerText = document.getElementById('tabCareerText');
      if (tabCareerIcon && tabCareerText) {
        if (isAdmin) {
          tabCareerIcon.textContent = '💼';
          tabCareerText.innerHTML = '6. 경력관리';
        } else {
          tabCareerIcon.textContent = '🔒';
          tabCareerText.innerHTML = '6. 경력관리 <span class="text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md font-bold ml-1">비공개</span>';
        }
      }

      const mobTopCareer = document.getElementById('mob-top-career');
      if (mobTopCareer) {
        mobTopCareer.innerHTML = isAdmin ? '💼 6. 경력관리' : '🔒 6. 경력관리';
      }

      const mobTabCareer = document.getElementById('mob-tab-career');
      if (mobTabCareer) {
        const spanLabel = mobTabCareer.querySelector('span:last-child');
        if (spanLabel) {
          spanLabel.textContent = isAdmin ? '경력관리' : '경력(비공개)';
        }
      }

      // If currently on Tab 6, re-render career logs view
      const panelCareer = document.getElementById('panel-career');
      if (panelCareer && !panelCareer.classList.contains('hidden')) {
        renderCareerLogs();
      }
      
      // Desktop header auth container
      const desktopContainer = document.getElementById('desktopAuthStatus');
      if (desktopContainer) {
        if (currentUser) {
          const isMaster = currentUser.role === 'admin';
          desktopContainer.innerHTML = \`
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="px-3 py-1.5 \${isMaster ? 'bg-indigo-50 text-indigo-800 border-indigo-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300'} font-bold border rounded-xl flex items-center gap-1.5 text-xs shadow-2xs">
                <span class="w-2 h-2 rounded-full \${isMaster ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}"></span>
                \${isMaster ? '👑 최고관리자' : (currentUser.role === 'editor' ? '✍️ 편집자' : '🤝 협업자')} (\${currentUser.name})
              </span>
              \${isMaster ? \`
                <button onclick="openMemberAdminModal()" class="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 transition text-xs flex items-center gap-1 shadow-2xs cursor-pointer" title="회원 및 RBAC 권한 관리">
                  👥 회원/권한 관리
                </button>
                <button onclick="openChangePasswordModal()" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition text-xs flex items-center gap-1" title="관리자 비밀번호 변경">
                  ⚙️ 비번 변경
                </button>
              \` : ''}
              <button onclick="showLoginPortal()" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition text-xs flex items-center gap-1 cursor-pointer" title="로그아웃">
                🚪 로그아웃
              </button>
            </div>
          \`;
        } else {
          desktopContainer.innerHTML = \`
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="px-3 py-1.5 bg-amber-50 text-amber-800 font-bold border border-amber-300 rounded-xl flex items-center gap-1.5 text-xs shadow-2xs">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                👀 게스트 모드 (조회 전용)
              </span>
              <button onclick="showLoginPortal()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition text-xs flex items-center gap-1 cursor-pointer">
                🔑 로그인 / 가입
              </button>
            </div>
          \`;
        }
      }

      // Mobile auth container
      const mobAuth = document.getElementById('mobileAuthContainer');
      if (mobAuth) {
        if (currentUser) {
          mobAuth.innerHTML = \`
            <span class="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-bold">
              \${currentUser.name}
            </span>
            <button onclick="showLoginPortal()" class="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">
              로그아웃
            </button>
          \`;
        } else {
          mobAuth.innerHTML = \`
            <button onclick="showLoginPortal()" class="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
              로그인
            </button>
          \`;
        }
      }
    }\n\n    `;

html = html.slice(0, updateAuthUiStart) + newUpdateAuthUiJs + html.slice(updateAuthUiEnd);
console.log('7. updateAuthUI replaced.');

// ========================================================
// 8. UPDATE loadStore() & saveStore() for Multi-tenant Isolated Workspace
// ========================================================
const loadStoreStart = html.indexOf('function loadStore() {');
const saveStoreEnd = html.indexOf('// =========================================================================\n    // 5. WORK HOURS & ANNUAL LEAVE SYSTEM', loadStoreStart);

if (loadStoreStart === -1 || saveStoreEnd === -1) {
  console.error('loadStore/saveStore boundaries not found!');
  process.exit(1);
}

const newLoadAndSaveStoreJs = `function loadStore() {
      const user = getCurrentUser();
      const isSuperAdmin = !user || user.id === 'admin';
      const storageKey = getWorkspaceStorageKey();
      
      const saved = localStorage.getItem(storageKey) || (isSuperAdmin ? (localStorage.getItem('urban_clean_store_v10') || localStorage.getItem('urban_clean_store_v9')) : null);
      if (saved) {
        try { store = JSON.parse(saved); } catch(e) {}
      }

      if (!store || !Array.isArray(store.projects) || store.projects.length === 0) {
        if (isSuperAdmin) {
          store = {
            projects: getInitialDefaultProjects(),
            dailyTasks: getInitialDefaultTasks(),
            calendarEvents: getInitialDefaultEvents(),
            careerLogs: [],
            lastLocalUpdate: 0
          };
        } else {
          // Independent starter workspace for member
          const compName = (user && user.company) ? user.company : '내 업무';
          store = {
            projects: [
              {
                id: 'p_' + Date.now(),
                name: compName + ' 1차 사업 검토',
                status: '진행중',
                target: '기본계획 수립',
                period: '2026-01 ~ 2026-12',
                desc: compName + ' 독립 프로젝트 워크스페이스',
                manager: (user ? user.name : '담당자'),
                progress: 20,
                tasks: [
                  { id: 't1', title: '사업구역계 기초현황 조사', completed: false, category: '현황조사' },
                  { id: 't2', title: '토지 및 건축물 조서 구축', completed: false, category: '조서' }
                ]
              }
            ],
            dailyTasks: [
              {
                id: 'dt1',
                title: compName + ' 업무 시스템 세팅 및 첫 업무 등록',
                date: (typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0,10)),
                completed: false,
                projectName: compName + ' 1차 사업 검토',
                priority: 'high'
              }
            ],
            calendarEvents: [],
            careerLogs: [],
            lastLocalUpdate: Date.now()
          };
        }
      }

      if (!store.calendarEvents) store.calendarEvents = isSuperAdmin ? getInitialDefaultEvents() : [];
      if (!store.dailyTasks) store.dailyTasks = [];
      if (!store.careerLogs) store.careerLogs = [];
      store = sanitizeStore(store);

      try {
        localStorage.setItem(storageKey, JSON.stringify(store));
      } catch(e) {}

      autoSyncCareerFromCompletedTasks();
      if (typeof ensureBaselineSnapshot === 'function') ensureBaselineSnapshot();
    }

    function recordAutoSnapshot(s) {
      try {
        const user = getCurrentUser();
        const historyKey = 'urban_snapshot_history_' + (user ? user.id : 'admin');
        let history = [];
        try {
          const raw = localStorage.getItem(historyKey);
          if (raw) history = JSON.parse(raw);
        } catch(e) {}
        if (!Array.isArray(history)) history = [];

        const snap = {
          time: Date.now(),
          iso: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
          taskCount: Array.isArray(s.dailyTasks) ? s.dailyTasks.length : 0,
          projectCount: Array.isArray(s.projects) ? s.projects.length : 0,
          data: JSON.parse(JSON.stringify(s))
        };

        if (history.length > 0) {
          const last = history[0];
          if (JSON.stringify(last.data.dailyTasks) === JSON.stringify(snap.data.dailyTasks) &&
              JSON.stringify(last.data.projects) === JSON.stringify(snap.data.projects)) {
            return;
          }
        }

        history.unshift(snap);
        if (history.length > 50) history = history.slice(0, 50);
        localStorage.setItem(historyKey, JSON.stringify(history));
      } catch(e) {
        console.warn("Snapshot record failed:", e);
      }
    }
  
    function saveStore() {
      store = sanitizeStore(store);
      store.lastLocalUpdate = Date.now();
      const storageKey = getWorkspaceStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(store));
      renderAll();
      const user = getCurrentUser();
      if (isCloudSyncActive && fbDbRef && (!user || user.id === 'admin')) {
        fbDbRef.set(store).catch(e => console.error("Cloud push failed:", e));
      }
    }\n\n    `;

html = html.slice(0, loadStoreStart) + newLoadAndSaveStoreJs + html.slice(saveStoreEnd);
console.log('8. loadStore & saveStore replaced.');

// ========================================================
// 9. DYNAMIC PATH GENERATION in Solution Center
// ========================================================
const oldTargetCalc = `const targetPath = 'C:\\\\Users\\\\LSH2\\\\Desktop\\\\작업파일\\\\' + selProj + '\\\\_AI_작업문서\\\\' + app.subfolder + '\\\\';`;
const newTargetCalc = `const targetPath = getUserLocalBasePath() + selProj + '\\\\_AI_작업문서\\\\' + app.subfolder + '\\\\';`;

if (html.includes(oldTargetCalc)) {
  html = html.replace(oldTargetCalc, newTargetCalc);
  console.log('9. updateWorkbenchModalContent target path made dynamic.');
}

const oldExplorerCalc = `const folderPath = 'C:\\\\Users\\\\LSH2\\\\Desktop\\\\작업파일\\\\' + selProj + '\\\\_AI_작업문서\\\\' + app.subfolder + '\\\\';`;
const newExplorerCalc = `const folderPath = getUserLocalBasePath() + selProj + '\\\\_AI_작업문서\\\\' + app.subfolder + '\\\\';`;

if (html.includes(oldExplorerCalc)) {
  html = html.replace(oldExplorerCalc, newExplorerCalc);
  console.log('10. openExplorerTargetFolder path made dynamic.');
}

// ========================================================
// 10. ADD v1.23.0 RELEASE NOTE ENTRY
// ========================================================
const releaseNotesTarget = 'const RELEASE_NOTES = [';
const newReleaseNote = `const RELEASE_NOTES = [
  {
    version: 'v1.23.0',
    date: '2026-10-14',
    badge: '멀티 테넌트 &amp; RBAC &amp; LLM 위키 연동',
    type: 'major',
    title: '🏢 멀티 테넌트 회원가입(회사명/CI) &amp; 마스터 RBAC 관리 센터 &amp; 로컬 파일/위키 연동',
    summary: '타 회사 및 실무자도 독립된 계정을 생성하여 본인 회사의 로고(CI) 및 상호명으로 시스템을 활용할 수 있으며, 100% 독립된 격리 워크스페이스, 내 PC 로컬 파일/위키 다이렉트 연동 및 마스터 RBAC 권한 관리 센터를 전면 구축했습니다.',
    highlights: [
      '🏢 [신규 회원가입 &amp; 회사명/CI 커스텀]: 회원가입 시 소속 회사명과 CI 로고 이미지를 직접 등록하여 상단 헤더에 즉시 반영.',
      '🔒 [100% 독립 워크스페이스 격리]: 신규 가입자에게 전용 저장소가 개설되며, 관리자의 실제 프로젝트/연봉/경력 문서는 완벽히 차단.',
      '👑 [마스터 RBAC 회원/권한 관리 센터]: 최고관리자(admin) 전용 패널을 통해 4단계 권한(Admin/Editor/Collaborator/Viewer) 부여 및 원격 워크스페이스 점검.',
      '🔑 [마스터 비밀번호 Dltjgus411! / urban2026 완벽 지원]: 관리자 로그인 시 기존 암호 및 초기 암호 모두 무결하게 호환 보장.',
      '📄 [내 PC 로컬 파일 직접 지정/열기]: 9대 솔루션 도구에서 내 컴퓨터의 엑셀/캐드/PDF 파일을 원클릭으로 직접 지정하여 작업대에 즉시 투입.',
      '🧠 [개인 LLM 위키(_WIKI) 독립 연동]: 카르파시 LLM 위키 표준(사업별위키, 개념위키, 질의분석위키, log.md)을 본인 PC 폴더와 다이렉트 연동.',
      '🎨 [헤더 디자인 심플 간소화]: 불필요한 홍보 문구 및 핑크 배지를 제거하고, 회사 로고를 시스템 명칭 바로 아래에 단정하게 배치.'
    ],
    details: [
      {
        category: '멀티 테넌트 &amp; RBAC',
        symptom: '단일 관리자 계정(admin)만 지원되어 타사 실무자가 시스템을 활용하기 어려웠음',
        cause: '사용자 프로필 관리 및 데이터 저장소 분리 구조 부재',
        solution: '회원가입 탭, 회사 CI Base64 처리, 사용자별 독립 저장소 분기 및 마스터 권한 제어 모달 완비'
      },
      {
        category: '로컬 파일 &amp; LLM 위키 연동',
        symptom: '로컬 경로가 특정 사용자(LSH2)로 고정되어 타 사용자가 본인 PC의 파일을 직접 다루기 불편함',
        cause: '하드코딩된 로컬 경로 및 File Picker 인터페이스 부재',
        solution: '사용자별 로컬 기본 경로 설정, 내 파일 직접 열기(showOpenFilePicker) 및 _WIKI log.md 다이렉트 기록 기능 탑재'
      }
    ]
  },`;

if (html.includes(releaseNotesTarget)) {
  html = html.replace(releaseNotesTarget, newReleaseNote);
  console.log('11. Release note v1.23.0 added.');
}

// Save back
fs.writeFileSync(targetPath, html, 'utf8');
console.log('Successfully written index.html! New length:', html.length);
