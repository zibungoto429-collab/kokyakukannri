const LS_KEY = "crm_people_v3";
const SESSION_KEY = "crm_session_v3";
const USERS_KEY = "crm_users_v3";

const $ = (id) => document.getElementById(id);

const loginView = $("loginView");
const appView = $("appView");

const loginUser = $("loginUser");
const loginPass = $("loginPass");
const loginBtn = $("loginBtn");
const fillDemoBtn = $("fillDemoBtn");

const tabHighschool = $("tabHighschool");
const tabMentor = $("tabMentor");
const currentTabBadge = $("currentTabBadge");

const newBtn = $("newBtn");
const saveBtn = $("saveBtn");
const deleteBtn = $("deleteBtn");
const searchBtn = $("searchBtn");
const prevBtn = $("prevBtn");
const nextBtn = $("nextBtn");

const newInlineBtn = $("newInlineBtn");
const saveInlineBtn = $("saveInlineBtn");
const deleteInlineBtn = $("deleteInlineBtn");

const searchInputTop = $("searchInputTop");
const searchInputSide = $("searchInputSide");
const numberSearchInput = $("numberSearchInput");
const numberJumpBtn = $("numberJumpBtn");
const clearSearchBtn = $("clearSearchBtn");
const pagerText = $("pagerText");
const resultList = $("resultList");
const statusText = $("statusText");
const helpBox = $("helpBox");

const idInput = $("idInput");
const registerDateInput = $("registerDateInput");
const nameInput = $("nameInput");
const gradeInput = $("gradeInput");
const emailInput = $("emailInput");
const phoneInput = $("phoneInput");
const instaInput = $("instaInput");
const schoolInput = $("schoolInput");

const state = {
  tab: "highschool",
  search: "",
  numberSearch: "",
  selectedId: null,
  mode: "view",
  data: loadData(),
  users: loadUsers(),
  session: loadSession()
};

function loadUsers() {
  const saved = localStorage.getItem(USERS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }

  const users = [
    { username: "admin", password: "admin123", displayName: "管理者" },
    { username: "staff", password: "staff123", displayName: "スタッフ" }
  ];

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
}

function loadSession() {
  const saved = localStorage.getItem(SESSION_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function loadData() {
  const saved = localStorage.getItem(LS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }

  const seed = {
    highschool: [
      {
        id: "HS-001",
        registerDate: "2026-06-01",
        name: "佐藤 花子",
        grade: "高校2年",
        email: "hanako@example.com",
        phone: "090-1111-2222",
        instagram: "hanako_hs",
        school: "新潟南高校"
      },
      {
        id: "HS-002",
        registerDate: "2026-06-03",
        name: "鈴木 一郎",
        grade: "高校3年",
        email: "ichiro@example.com",
        phone: "090-3333-4444",
        instagram: "ichiro_s",
        school: "新潟北高校"
      },
      {
        id: "HS-003",
        registerDate: "2026-06-05",
        name: "田中 美咲",
        grade: "高校1年",
        email: "misaki@example.com",
        phone: "090-5555-6666",
        instagram: "misaki_t",
        school: "新発田高校"
      }
    ],
    mentor: [
      {
        id: "MT-001",
        registerDate: "2026-06-02",
        name: "高橋 優斗",
        grade: "大学3年",
        email: "yuto@example.com",
        phone: "080-1234-5678",
        instagram: "yuto_mentor",
        school: "新潟大学"
      },
      {
        id: "MT-002",
        registerDate: "2026-06-04",
        name: "伊藤 里奈",
        grade: "大学2年",
        email: "rina@example.com",
        phone: "080-2345-6789",
        instagram: "rina_m",
        school: "長岡技術科学大学"
      },
      {
        id: "MT-003",
        registerDate: "2026-06-06",
        name: "小林 健",
        grade: "大学4年",
        email: "ken@example.com",
        phone: "080-3456-7890",
        instagram: "ken_k",
        school: "新潟県立大学"
      }
    ]
  };

  localStorage.setItem(LS_KEY, JSON.stringify(seed));
  return seed;
}

function saveData() {
  localStorage.setItem(LS_KEY, JSON.stringify(state.data));
}

function saveSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify(state.session));
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function makeId(prefix, arr) {
  let max = 0;
  for (const item of arr) {
    const m = String(item.id || "").match(/(\d+)$/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

function matchesQuery(item, q) {
  if (!q) return true;
  const hay = [
    item.id,
    item.registerDate,
    item.name,
    item.grade,
    item.email,
    item.phone,
    item.instagram,
    item.school
  ].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

function currentTextFilteredList() {
  return (state.data[state.tab] || []).filter(item => matchesQuery(item, state.search.trim()));
}

function applyNumberFilter(list) {
  const raw = state.numberSearch.trim();
  if (!raw) return list;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return [];
  if (n > list.length) return [];
  return [list[n - 1]];
}

function currentList() {
  return currentTextFilteredList();
}

function filteredList() {
  return applyNumberFilter(currentTextFilteredList());
}

function selectedItem() {
  const list = filteredList();
  if (!list.length) return null;
  return list.find(x => x.id === state.selectedId) || list[0];
}

function setTab(tab) {
  state.tab = tab;
  state.mode = "view";
  syncSelectedToList();
  render();
}

function syncSelectedToList() {
  const list = filteredList();
  if (!list.length) {
    state.selectedId = null;
    return;
  }
  if (!list.some(x => x.id === state.selectedId)) {
    state.selectedId = list[0].id;
  }
}

function fillForm(item) {
  if (!item) {
    idInput.value = "";
    registerDateInput.value = "";
    nameInput.value = "";
    gradeInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
    instaInput.value = "";
    schoolInput.value = "";
    return;
  }

  idInput.value = item.id || "";
  registerDateInput.value = item.registerDate || "";
  nameInput.value = item.name || "";
  gradeInput.value = item.grade || "";
  emailInput.value = item.email || "";
  phoneInput.value = item.phone || "";
  instaInput.value = item.instagram || "";
  schoolInput.value = item.school || "";
}

function readForm() {
  return {
    id: idInput.value.trim(),
    registerDate: registerDateInput.value.trim(),
    name: nameInput.value.trim(),
    grade: gradeInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    instagram: instaInput.value.trim(),
    school: schoolInput.value.trim()
  };
}

function startNewRecord() {
  state.mode = "new";
  state.selectedId = null;

  const prefix = state.tab === "highschool" ? "HS" : "MT";
  const preview = `${prefix}-${String((state.data[state.tab] || []).length + 1).padStart(3, "0")}`;

  fillForm({
    id: preview,
    registerDate: todayISO(),
    name: "",
    grade: "",
    email: "",
    phone: "",
    instagram: "",
    school: ""
  });

  statusText.textContent = "新規作成モード";
  renderSidebar();
  renderPager();
}

function saveRecord() {
  const form = readForm();
  if (!form.name) {
    alert("名前は必須です。");
    return;
  }

  const list = state.data[state.tab];

  if (state.mode === "new" || !state.selectedId) {
    const prefix = state.tab === "highschool" ? "HS" : "MT";
    const newItem = {
      id: makeId(prefix, list),
      registerDate: form.registerDate || todayISO(),
      name: form.name,
      grade: form.grade,
      email: form.email,
      phone: form.phone,
      instagram: form.instagram,
      school: form.school
    };

    list.push(newItem);
    state.selectedId = newItem.id;
    state.mode = "view";
  } else {
    const idx = list.findIndex(x => x.id === state.selectedId);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        registerDate: form.registerDate || list[idx].registerDate,
        name: form.name,
        grade: form.grade,
        email: form.email,
        phone: form.phone,
        instagram: form.instagram,
        school: form.school
      };
    }
  }

  saveData();
  syncSelectedToList();
  render();
}

function deleteRecord() {
  const item = selectedItem();
  if (!item) {
    alert("削除するデータがありません。");
    return;
  }

  if (!confirm(`${item.name} を削除しますか？`)) return;

  const list = state.data[state.tab];
  const idx = list.findIndex(x => x.id === item.id);
  if (idx >= 0) list.splice(idx, 1);

  saveData();
  state.selectedId = null;
  state.mode = "view";
  syncSelectedToList();
  render();
}

function goPrev() {
  const list = filteredList();
  if (!list.length) return;

  const idx = Math.max(0, list.findIndex(x => x.id === state.selectedId));
  const nextIdx = Math.max(0, idx - 1);
  state.selectedId = list[nextIdx].id;
  state.mode = "view";
  render();
}

function goNext() {
  const list = filteredList();
  if (!list.length) return;

  const idx = Math.max(0, list.findIndex(x => x.id === state.selectedId));
  const nextIdx = Math.min(list.length - 1, idx + 1);
  state.selectedId = list[nextIdx].id;
  state.mode = "view";
  render();
}

function selectItem(id) {
  state.selectedId = id;
  state.mode = "view";
  render();
}

function applySearch(q) {
  state.search = q;
  state.mode = "view";
  syncSelectedToList();
  render();
}

function applyNumberSearch(q) {
  state.numberSearch = q;
  state.mode = "view";
  syncSelectedToList();
  render();
}

function clearSearch() {
  state.search = "";
  state.numberSearch = "";
  searchInputTop.value = "";
  searchInputSide.value = "";
  numberSearchInput.value = "";
  syncSelectedToList();
  render();
}

function renderTabs() {
  tabHighschool.classList.toggle("active", state.tab === "highschool");
  tabMentor.classList.toggle("active", state.tab === "mentor");
  currentTabBadge.textContent = state.tab === "highschool" ? "高校生" : "大学生メンター";

  helpBox.innerHTML = `
    タブで高校生 / 大学生メンターを切り替えます。<br>
    名前などの検索に加えて、一覧の「番号」でも絞り込みできます。<br>
    右上の ${pagerText.textContent} は「現在番号 / 総数」です。
  `;
}

function renderPager() {
  const list = filteredList();

  if (!list.length) {
    pagerText.textContent = "00/00";
    statusText.textContent = state.search || state.numberSearch ? "検索結果がありません" : "データがありません";
    return;
  }

  const idx = Math.max(0, list.findIndex(x => x.id === state.selectedId));
  const current = idx >= 0 ? idx + 1 : 1;
  pagerText.textContent = `${pad2(current)}/${pad2(list.length)}`;

  if (state.numberSearch.trim()) {
    statusText.textContent = `番号検索中: ${pad2(Number(state.numberSearch.trim()))}`;
  } else {
    statusText.textContent = state.mode === "new" ? "新規作成モード" : `表示中: ${current} / ${list.length}`;
  }
}

function renderSidebar() {
  const baseList = currentTextFilteredList();
  const list = filteredList();

  if (!list.length) {
    resultList.innerHTML = `
      <div style="padding:12px;color:#777;line-height:1.7">
        該当するデータがありません。<br>
        検索語や番号を消すか、新規作成してください。
      </div>
    `;
    return;
  }

  resultList.innerHTML = list.map(item => {
    const displayNo = baseList.findIndex(x => x.id === item.id) + 1;
    return `
      <div class="result-item ${item.id === state.selectedId ? "active" : ""}" data-id="${item.id}">
        <div class="result-top">
          <div class="result-number">#${pad2(displayNo)}</div>
          <div class="result-name">${escapeHtml(item.name)}</div>
        </div>
        <div class="result-meta">
          ${escapeHtml(item.id)}<br>
          登録日: ${escapeHtml(item.registerDate || "")}<br>
          ${escapeHtml(item.grade || "")}<br>
          ${escapeHtml(item.school || "")}
        </div>
      </div>
    `;
  }).join("");

  resultList.querySelectorAll(".result-item").forEach(el => {
    el.addEventListener("click", () => selectItem(el.dataset.id));
  });
}

function renderForm() {
  if (state.mode === "new") return;
  const item = selectedItem();
  if (item) {
    fillForm(item);
  } else {
    fillForm(null);
  }
}

function renderInputs() {
  searchInputTop.value = state.search;
  searchInputSide.value = state.search;
  numberSearchInput.value = state.numberSearch;
}

function render() {
  renderInputs();
  renderTabs();
  renderSidebar();
  renderForm();
  renderPager();
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function login() {
  const u = loginUser.value.trim();
  const p = loginPass.value.trim();
  const user = state.users.find(x => x.username === u && x.password === p);

  if (!user) {
    alert("ユーザー名またはパスワードが違います。");
    return;
  }

  state.session = { username: user.username, displayName: user.displayName };
  saveSession();
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  render();
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  state.session = null;
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
}

function initAuth() {
  if (state.session) {
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");
  } else {
    appView.classList.add("hidden");
    loginView.classList.remove("hidden");
  }
}

/* Events */
loginBtn.addEventListener("click", login);
fillDemoBtn.addEventListener("click", () => {
  loginUser.value = "admin";
  loginPass.value = "admin123";
});
loginPass.addEventListener("keydown", (e) => {
  if (e.key === "Enter") login();
});

tabHighschool.addEventListener("click", () => setTab("highschool"));
tabMentor.addEventListener("click", () => setTab("mentor"));

newBtn.addEventListener("click", startNewRecord);
newInlineBtn.addEventListener("click", startNewRecord);

saveBtn.addEventListener("click", saveRecord);
saveInlineBtn.addEventListener("click", saveRecord);

deleteBtn.addEventListener("click", deleteRecord);
deleteInlineBtn.addEventListener("click", deleteRecord);

searchBtn.addEventListener("click", () => applySearch(searchInputTop.value));
clearSearchBtn.addEventListener("click", clearSearch);

searchInputTop.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applySearch(searchInputTop.value);
});
searchInputSide.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applySearch(searchInputSide.value);
});
searchInputSide.addEventListener("input", () => {
  searchInputTop.value = searchInputSide.value;
  applySearch(searchInputSide.value);
});
searchInputTop.addEventListener("input", () => {
  searchInputSide.value = searchInputTop.value;
});

numberSearchInput.addEventListener("input", () => {
  applyNumberSearch(numberSearchInput.value);
});
numberSearchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applyNumberSearch(numberSearchInput.value);
});
numberJumpBtn.addEventListener("click", () => applyNumberSearch(numberSearchInput.value));

prevBtn.addEventListener("click", goPrev);
nextBtn.addEventListener("click", goNext);

[nameInput, gradeInput, emailInput, phoneInput, instaInput, schoolInput, registerDateInput].forEach(el => {
  el.addEventListener("input", () => {
    if (state.mode === "view" && state.selectedId) {
      state.mode = "edit";
    }
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && e.ctrlKey) logout();
});

/* Initial */
initAuth();
render();

window.crmApp = {
  logout,
  state
};
