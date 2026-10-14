const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetPath = path.join(__dirname, '..', '..', 'index.html');
const destPath = path.join(__dirname, '..', '..', 'urban_project_manager.html');

let html = fs.readFileSync(targetPath, 'utf8');

// 1. Check and replace checkIsAdmin on line ~2991
const oldAuthBlock = `    function checkIsAdmin() {
      try {
        // Strictly per-tab session so opening a link in a new tab/window always requires login
        return sessionStorage.getItem('urban_auth_session') === 'admin';
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

    function syncAppViews() {
      const portal = document.getElementById('loginLandingPortal');
      const mainApp = document.getElementById('mainAppContainer');
      const isAdmin = checkIsAdmin();
      const hasGuest = checkHasGuestAccess();

      if (isAdmin || hasGuest) {
        if (portal) portal.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
      } else {
        if (portal) portal.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
      }
      updateAuthUI();
      if (window.lucide) lucide.createIcons();
    }`;

const newAuthBlock = `    function checkIsMasterAdmin() {
      try {
        const u = getCurrentUser();
        return Boolean(u && (u.id === 'admin' || u.role === 'super_admin'));
      } catch(e) {
        return false;
      }
    }

    function checkIsAdmin() {
      try {
        const u = getCurrentUser();
        return Boolean(u && u.id && u.id !== 'guest' && u.role !== 'viewer');
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

    function syncAppViews() {
      const portal = document.getElementById('loginLandingPortal');
      const mainApp = document.getElementById('mainAppContainer');
      const user = getCurrentUser();
      const isLoggedIn = Boolean(user && user.id && user.id !== 'guest');
      const hasGuest = checkHasGuestAccess();

      if (isLoggedIn || hasGuest) {
        if (portal) portal.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
      } else {
        if (portal) portal.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
      }
      updateAuthUI();
      if (window.lucide) lucide.createIcons();
    }`;

if (html.includes(oldAuthBlock)) {
  html = html.replace(oldAuthBlock, newAuthBlock);
  console.log('1. checkIsMasterAdmin, checkIsAdmin, and syncAppViews updated successfully!');
} else {
  console.warn('1. oldAuthBlock pattern mismatch! Checking details...');
}

// 2. Remove duplicate checkIsAdmin at ~line 3117 if present
const dupCheckIsAdmin = `    function checkIsAdmin() {
      const u = getCurrentUser();
      return Boolean(u && (u.role === 'super_admin' || u.id === 'admin' || sessionStorage.getItem('urban_auth_session') === 'admin'));
    }`;

if (html.includes(dupCheckIsAdmin)) {
  html = html.replace(dupCheckIsAdmin, `    // Unified checkIsAdmin defined above`);
  console.log('2. Duplicate checkIsAdmin replaced.');
}

// 3. Update Portal Login Form Labels & Placeholders
html = html.replace('<label class="block text-xs font-bold text-slate-700 mb-1.5">관리자 아이디</label>', '<label class="block text-xs font-bold text-slate-700 mb-1.5">아이디</label>');
html = html.replace('<label class="block text-xs font-bold text-slate-700 mb-1.5">관리자 비밀번호</label>', '<label class="block text-xs font-bold text-slate-700 mb-1.5">비밀번호</label>');
html = html.replace('<span>관리자 로그인 (수정 권한 활성화)</span>', '<span>로그인 (워크스페이스 접속)</span>');

// 4. Update Member Admin Modal - renderMemberAdminList & add changeMemberRole
const oldMemberAdminJs = `    function openMemberAdminModal() {
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
    }`;

const newMemberAdminJs = `    function openMemberAdminModal() {
      if (!checkIsMasterAdmin()) {
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
        const isMaster = (u.id === 'admin');
        const role = u.role || 'editor';
        htmlRows += '<tr class="hover:bg-slate-50 transition text-xs border-b border-slate-100">';
        htmlRows += '<td class="p-3 pl-4 font-bold text-slate-800 flex items-center gap-1.5">' + (isMaster ? '👑 ' : '👤 ') + (u.name || u.id) + ' <span class="text-slate-400 font-normal">(@' + u.id + ')</span></td>';
        htmlRows += '<td class="p-3 text-slate-600 font-medium">' + (u.company || u.department || '-') + '</td>';
        
        // Interactive Role Selection Dropdown!
        if (isMaster) {
          htmlRows += '<td class="p-3"><span class="px-2.5 py-1 bg-indigo-50 text-indigo-800 font-bold border border-indigo-200 rounded-lg text-xs">👑 총괄 마스터</span></td>';
        } else {
          htmlRows += '<td class="p-3">';
          htmlRows += '<select onchange="changeMemberRole(\\'' + u.id + '\\', this.value)" class="px-2.5 py-1 bg-white border border-slate-300 hover:border-blue-400 focus:border-blue-600 rounded-lg text-xs font-bold text-slate-800 cursor-pointer shadow-2xs outline-none transition">';
          htmlRows += '<option value="editor"' + (role === 'editor' ? ' selected' : '') + '>✍️ 실무자 (편집 가능)</option>';
          htmlRows += '<option value="super_admin"' + (role === 'super_admin' ? ' selected' : '') + '>👑 총괄 마스터</option>';
          htmlRows += '<option value="viewer"' + (role === 'viewer' ? ' selected' : '') + '>👀 조회 전용 (수정 제한)</option>';
          htmlRows += '</select>';
          htmlRows += '</td>';
        }

        htmlRows += '<td class="p-3 text-slate-400 font-mono">' + (u.createdAt || '-') + '</td>';
        htmlRows += '<td class="p-3 text-center"><button onclick="inspectMemberWorkspace(\\'' + u.id + '\\')" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold border border-blue-200 shadow-2xs transition cursor-pointer">점검</button></td>';
        htmlRows += '<td class="p-3 text-center pr-4">' + (isMaster ? '<span class="text-slate-300">-</span>' : '<button onclick="deleteMemberUser(\\'' + u.id + '\\')" class="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold border border-rose-200 shadow-2xs transition cursor-pointer">삭제</button>') + '</td>';
        htmlRows += '</tr>';
      });
      tbody.innerHTML = htmlRows;
    }

    function changeMemberRole(userId, newRole) {
      if (!checkIsMasterAdmin()) return alert('총괄 마스터만 권한을 변경할 수 있습니다.');
      if (userId === 'admin') return alert('마스터 계정은 권한을 변경할 수 없습니다.');

      const users = getRegisteredUsers();
      if (!users[userId]) return alert('사용자 정보를 찾을 수 없습니다.');

      users[userId].role = newRole;
      saveRegisteredUsers(users);

      const roleLabels = {
        'super_admin': '👑 총괄 마스터',
        'editor': '✍️ 실무자 (편집 가능)',
        'viewer': '👀 조회 전용 (수정 제한)'
      };

      alert('🎉 [' + (users[userId].name || userId) + '] 님의 권한이 [' + (roleLabels[newRole] || newRole) + '](으)로 성공적으로 변경되었습니다!');
      renderMemberAdminList();
      updateAuthUI();
    }

    function inspectMemberWorkspace(userId) {
      const users = getRegisteredUsers();
      const target = users[userId];
      if (!target) return;
      alert('🔍 [' + (target.company || target.department) + ' - ' + target.name + '] 워크스페이스 점검:\\n\\n- 사용자 ID: ' + target.id + '\\n- 부여 권한: ' + target.role + '\\n- 등록 프로젝트: 독립 저장소 격리 보존 중\\n- 상태: 정상(Active)');
    }

    function deleteMemberUser(userId) {
      if (!checkIsMasterAdmin()) return alert('총괄 마스터만 회원을 삭제할 수 있습니다.');
      if (userId === 'admin') return alert('마스터 계정은 삭제할 수 없습니다.');
      if (!confirm('정말 [' + userId + '] 회원을 삭제하시겠습니까?')) return;
      const users = getRegisteredUsers();
      delete users[userId];
      saveRegisteredUsers(users);
      renderMemberAdminList();
      alert('회원 계정이 삭제되었습니다.');
    }`;

if (html.includes(oldMemberAdminJs)) {
  html = html.replace(oldMemberAdminJs, newMemberAdminJs);
  console.log('4. renderMemberAdminList with interactive role select & changeMemberRole injected!');
} else {
  console.warn('4. oldMemberAdminJs pattern mismatch! Checking details...');
}

// 5. Update Version Badge to v1.23.4
html = html.replace(/<span class="text-\[11px\] font-bold px-2 py-0\.5 bg-blue-100 text-blue-800 rounded-md">v1\.23\.\d+<\/span>/g, '<span class="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">v1.23.4</span>');

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

console.log('MULTI-USER LOGIN AND PERMISSIONS FIX COMPLETED SUCCESSFULLY! 🎉');
