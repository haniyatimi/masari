(() => {
  "use strict";

  const usersKey = "masari_v2_users";
  const sessionKey = "masari_v2_session";
  const months = [
    "يناير","فبراير","مارس","أبريل","مايو","يونيو",
    "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
  ];

  const defaultHabits = [
    { name: "الاستيقاظ مبكرًا", description: "قبل الساعة 6:00" },
    { name: "صلاة الفجر", description: "في وقتها" },
    { name: "قراءة", description: "20 صفحة يوميًا" },
    { name: "تمرين رياضي", description: "45 دقيقة" },
    { name: "شرب الماء", description: "8 أكواب" },
    { name: "نوم مبكر", description: "قبل 11 مساءً" }
  ];

  const sessionEmail = localStorage.getItem(sessionKey);
  const users = getUsers();

  if (!sessionEmail || !users[sessionEmail]) {
    window.location.href = "index.html";
    return;
  }

  let user = users[sessionEmail];
  let selectedMode = "done";
  let editingHabitIndex = null;
  let selectedMonth = new Date().getMonth();
  let selectedYear = new Date().getFullYear();
  let state = loadState();

  const els = {
    userName: document.getElementById("userName"),
    userEmail: document.getElementById("userEmail"),
    userInitial: document.getElementById("userInitial"),
    logoutBtn: document.getElementById("logoutBtn"),
    monthSelect: document.getElementById("monthSelect"),
    yearSelect: document.getElementById("yearSelect"),
    addHabitBtn: document.getElementById("addHabitBtn"),
    habitList: document.getElementById("habitList"),
    trackerSvg: document.getElementById("trackerSvg"),
    habitAnalytics: document.getElementById("habitAnalytics"),
    summaryRate: document.getElementById("summaryRate"),
    summaryDone: document.getElementById("summaryDone"),
    summaryHabits: document.getElementById("summaryHabits"),
    summaryStreak: document.getElementById("summaryStreak"),
    habitModal: document.getElementById("habitModal"),
    habitModalTitle: document.getElementById("habitModalTitle"),
    closeHabitModal: document.getElementById("closeHabitModal"),
    habitName: document.getElementById("habitName"),
    habitDescription: document.getElementById("habitDescription"),
    saveHabitBtn: document.getElementById("saveHabitBtn"),
    deleteHabitBtn: document.getElementById("deleteHabitBtn"),
    profileBtn: document.getElementById("profileBtn"),
    profileModal: document.getElementById("profileModal"),
    closeProfileModal: document.getElementById("closeProfileModal"),
    profileName: document.getElementById("profileName"),
    profilePhone: document.getElementById("profilePhone"),
    profileAddress: document.getElementById("profileAddress"),
    saveProfileBtn: document.getElementById("saveProfileBtn"),
    toast: document.getElementById("toast")
  };

  initialise();

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(usersKey) || "{}");
    } catch {
      return {};
    }
  }

  function saveUsers(nextUsers) {
    localStorage.setItem(usersKey, JSON.stringify(nextUsers));
  }

  function dataKey() {
    return `masari_v2_data:${sessionEmail}:${selectedYear}-${selectedMonth}`;
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(dataKey()) || "null");
      if (saved && Array.isArray(saved.habits) && saved.checks) {
        return saved;
      }
    } catch {
      // Use defaults.
    }

    return {
      habits: structuredCloneSafe(defaultHabits),
      checks: {}
    };
  }

  function saveState() {
    localStorage.setItem(dataKey(), JSON.stringify(state));
  }

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    window.setTimeout(() => els.toast.classList.remove("show"), 1700);
  }

  function initialise() {
    renderUser();
    buildSelectors();
    bindEvents();
    renderAll();
  }

  function renderUser() {
    els.userName.textContent = user.name || "مستخدم";
    els.userEmail.textContent = user.email;
    els.userInitial.textContent = (user.name || "M").trim().charAt(0).toUpperCase();
  }

  function buildSelectors() {
    els.monthSelect.innerHTML = "";
    months.forEach((month, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = month;
      els.monthSelect.appendChild(option);
    });

    els.yearSelect.innerHTML = "";
    for (let year = 2025; year <= 2035; year += 1) {
      const option = document.createElement("option");
      option.value = String(year);
      option.textContent = String(year);
      els.yearSelect.appendChild(option);
    }

    els.monthSelect.value = String(selectedMonth);
    els.yearSelect.value = String(selectedYear);
  }

  function bindEvents() {
    els.logoutBtn.addEventListener("click", () => {
      localStorage.removeItem(sessionKey);
      window.location.href = "index.html";
    });

    els.monthSelect.addEventListener("change", () => {
      selectedMonth = Number(els.monthSelect.value);
      state = loadState();
      renderAll();
    });

    els.yearSelect.addEventListener("change", () => {
      selectedYear = Number(els.yearSelect.value);
      state = loadState();
      renderAll();
    });

    document.querySelectorAll(".status-btn").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".status-btn").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        selectedMode = button.dataset.mode;
      });
    });

    document.querySelectorAll(".nav-item[data-target]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(button.dataset.target)?.scrollIntoView({ behavior: "smooth" });
      });
    });

    els.addHabitBtn.addEventListener("click", () => openHabitModal(null));
    els.closeHabitModal.addEventListener("click", closeHabitModal);
    els.saveHabitBtn.addEventListener("click", saveHabit);
    els.deleteHabitBtn.addEventListener("click", deleteHabit);

    els.profileBtn.addEventListener("click", openProfileModal);
    els.closeProfileModal.addEventListener("click", closeProfileModal);
    els.saveProfileBtn.addEventListener("click", saveProfile);
  }

  function renderAll() {
    renderHabitList();
    renderTracker();
    renderAnalytics();
    renderSummary();
  }

  function renderHabitList() {
    els.habitList.innerHTML = "";

    state.habits.forEach((habit, index) => {
      const item = document.createElement("button");
      item.className = "habit-item";
      item.type = "button";
      item.innerHTML = `
        <span class="habit-index">${index + 1}</span>
        <span class="habit-copy">
          <strong>${escapeHtml(habit.name)}</strong>
          <span>${escapeHtml(habit.description || "بدون وصف")}</span>
        </span>
      `;
      item.addEventListener("click", () => openHabitModal(index));
      els.habitList.appendChild(item);
    });
  }

  function renderTracker() {
    const svg = els.trackerSvg;
    svg.innerHTML = "";

    const cx = 860;
    const cy = 455;
    const startAngle = -150;
    const endAngle = 150;
    const totalAngle = endAngle - startAngle;
    const innerRadius = 145;
    const outerRadius = 440;
    const habitCount = Math.max(state.habits.length, 1);
    const laneWidth = (outerRadius - innerRadius) / habitCount;
    const dayCount = 31;
    const gap = 0.62;

    state.habits.forEach((habit, habitIndex) => {
      const r1 = innerRadius + habitIndex * laneWidth + 5;
      const r2 = innerRadius + (habitIndex + 1) * laneWidth - 5;

      for (let day = 1; day <= dayCount; day += 1) {
        const a0 = startAngle + ((day - 1) * totalAngle) / dayCount + gap / 2;
        const a1 = startAngle + (day * totalAngle) / dayCount - gap / 2;
        const status = state.checks[`${habitIndex}-${day}`];

        const segment = createSvg("path", {
          d: arcPath(cx, cy, r1, r2, a0, a1),
          fill: status === "done" ? "#C6FF33" : status === "missed" ? "#7D39EB" : "#292929",
          stroke: "#3a3a3a",
          "stroke-width": "0.8",
          class: "track-segment"
        });

        segment.addEventListener("click", () => {
          state.checks[`${habitIndex}-${day}`] = selectedMode;
          saveState();
          renderAll();
        });

        svg.appendChild(segment);
      }

      const laneMid = (r1 + r2) / 2;
      const point = polar(cx, cy, laneMid, 180);

      const badge = createSvg("circle", {
        cx: point.x - 22,
        cy: point.y,
        r: 14,
        fill: "#211336",
        stroke: "#7D39EB",
        "stroke-width": "1.2"
      });
      svg.appendChild(badge);

      const number = createSvg("text", {
        x: point.x - 22,
        y: point.y + 4,
        "text-anchor": "middle",
        class: "lane-number"
      });
      number.textContent = String(habitIndex + 1);
      svg.appendChild(number);
    });

    for (let day = 1; day <= dayCount; day += 1) {
      const angle = startAngle + ((day - 0.5) * totalAngle) / dayCount;
      const point = polar(cx, cy, 470, angle);
      const label = createSvg("text", {
        x: point.x,
        y: point.y,
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        class: "day-label"
      });
      label.textContent = String(day);
      svg.appendChild(label);
    }

    svg.appendChild(createSvg("circle", {
      cx,
      cy,
      r: 112,
      class: "center-disc"
    }));

    const total = state.habits.length * dayCount;
    const done = countStatus("done");
    const rate = total ? Math.round((done / total) * 100) : 0;
    const circumference = 2 * Math.PI * 126;

    svg.appendChild(createSvg("circle", {
      cx,
      cy,
      r: 126,
      class: "center-progress",
      "stroke-dasharray": String(circumference),
      "stroke-dashoffset": String(circumference * (1 - rate / 100)),
      transform: `rotate(-90 ${cx} ${cy})`
    }));

    const month = createSvg("text", {
      x: cx,
      y: cy - 23,
      "text-anchor": "middle",
      class: "center-month"
    });
    month.textContent = months[selectedMonth];
    svg.appendChild(month);

    const rateText = createSvg("text", {
      x: cx,
      y: cy + 20,
      "text-anchor": "middle",
      class: "center-rate"
    });
    rateText.textContent = `${rate}%`;
    svg.appendChild(rateText);

    const sub = createSvg("text", {
      x: cx,
      y: cy + 51,
      "text-anchor": "middle",
      class: "center-sub"
    });
    sub.textContent = `${selectedYear} — معدل الالتزام`;
    svg.appendChild(sub);
  }

  function renderAnalytics() {
    els.habitAnalytics.innerHTML = "";

    state.habits.forEach((habit, habitIndex) => {
      let done = 0;
      for (let day = 1; day <= 31; day += 1) {
        if (state.checks[`${habitIndex}-${day}`] === "done") {
          done += 1;
        }
      }

      const rate = Math.round((done / 31) * 100);
      const row = document.createElement("div");
      row.className = "analytics-row";
      row.innerHTML = `
        <span class="analytics-name">${escapeHtml(habit.name)}</span>
        <span class="analytics-track"><span class="analytics-fill" style="width:${rate}%"></span></span>
        <span class="analytics-value">${rate}%</span>
      `;
      els.habitAnalytics.appendChild(row);
    });
  }

  function renderSummary() {
    const total = state.habits.length * 31;
    const done = countStatus("done");
    const rate = total ? Math.round((done / total) * 100) : 0;

    els.summaryRate.textContent = `${rate}%`;
    els.summaryDone.textContent = String(done);
    els.summaryHabits.textContent = String(state.habits.length);
    els.summaryStreak.textContent = String(calculateBestStreak());
  }

  function countStatus(status) {
    return Object.values(state.checks).filter((value) => value === status).length;
  }

  function calculateBestStreak() {
    let best = 0;

    state.habits.forEach((habit, habitIndex) => {
      let current = 0;
      for (let day = 1; day <= 31; day += 1) {
        if (state.checks[`${habitIndex}-${day}`] === "done") {
          current += 1;
          best = Math.max(best, current);
        } else {
          current = 0;
        }
      }
    });

    return best;
  }

  function openHabitModal(index) {
    editingHabitIndex = index;
    const isEditing = index !== null;
    const habit = isEditing ? state.habits[index] : { name: "", description: "" };

    els.habitModalTitle.textContent = isEditing ? "تعديل العادة" : "إضافة عادة";
    els.habitName.value = habit.name;
    els.habitDescription.value = habit.description || "";
    els.deleteHabitBtn.classList.toggle("hidden", !isEditing);
    els.habitModal.classList.remove("hidden");
    els.habitName.focus();
  }

  function closeHabitModal() {
    els.habitModal.classList.add("hidden");
    editingHabitIndex = null;
  }

  function saveHabit() {
    const name = els.habitName.value.trim();
    const description = els.habitDescription.value.trim();

    if (!name) {
      showToast("اكتب اسم العادة.");
      return;
    }

    const habit = { name, description };

    if (editingHabitIndex === null) {
      state.habits.push(habit);
    } else {
      state.habits[editingHabitIndex] = habit;
    }

    saveState();
    closeHabitModal();
    renderAll();
    showToast("تم حفظ العادة.");
  }

  function deleteHabit() {
    if (editingHabitIndex === null) return;

    const confirmed = window.confirm("هل تريد حذف هذه العادة؟");
    if (!confirmed) return;

    state.habits.splice(editingHabitIndex, 1);

    const nextChecks = {};
    Object.entries(state.checks).forEach(([key, value]) => {
      const [habitIndex, day] = key.split("-").map(Number);

      if (habitIndex < editingHabitIndex) {
        nextChecks[key] = value;
      } else if (habitIndex > editingHabitIndex) {
        nextChecks[`${habitIndex - 1}-${day}`] = value;
      }
    });

    state.checks = nextChecks;
    saveState();
    closeHabitModal();
    renderAll();
    showToast("تم حذف العادة.");
  }

  function openProfileModal() {
    els.profileName.value = user.name || "";
    els.profilePhone.value = user.phone || "";
    els.profileAddress.value = user.address || "";
    els.profileModal.classList.remove("hidden");
  }

  function closeProfileModal() {
    els.profileModal.classList.add("hidden");
  }

  function saveProfile() {
    user = {
      ...user,
      name: els.profileName.value.trim() || user.name,
      phone: els.profilePhone.value.trim(),
      address: els.profileAddress.value.trim()
    };

    const nextUsers = getUsers();
    nextUsers[sessionEmail] = user;
    saveUsers(nextUsers);
    renderUser();
    closeProfileModal();
    showToast("تم حفظ الحساب.");
  }

  function polar(cx, cy, radius, degree) {
    const angle = (degree * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  }

  function arcPath(cx, cy, r1, r2, a0, a1) {
    const p1 = polar(cx, cy, r2, a0);
    const p2 = polar(cx, cy, r2, a1);
    const p3 = polar(cx, cy, r1, a1);
    const p4 = polar(cx, cy, r1, a0);
    const largeArc = a1 - a0 > 180 ? 1 : 0;

    return [
      `M ${p1.x} ${p1.y}`,
      `A ${r2} ${r2} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
      `L ${p3.x} ${p3.y}`,
      `A ${r1} ${r1} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
      "Z"
    ].join(" ");
  }

  function createSvg(tag, attributes) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
    return element;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }
})();