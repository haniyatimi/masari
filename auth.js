(() => {
  "use strict";

  const usersKey = "masari_v2_users";
  const sessionKey = "masari_v2_session";

  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const authTitle = document.getElementById("authTitle");
  const authSubtitle = document.getElementById("authSubtitle");
  const nameField = document.getElementById("nameField");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("submitBtn");
  const form = document.getElementById("authForm");
  const toast = document.getElementById("toast");

  let mode = "login";

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(usersKey) || "{}");
    } catch {
      return {};
    }
  }

  function saveUsers(users) {
    localStorage.setItem(usersKey, JSON.stringify(users));
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function setMode(nextMode) {
    mode = nextMode;
    const isRegister = mode === "register";

    loginTab.classList.toggle("active", !isRegister);
    registerTab.classList.toggle("active", isRegister);
    nameField.classList.toggle("hidden", !isRegister);

    authTitle.textContent = isRegister ? "أنشئ حسابك" : "مرحبًا بعودتك";
    authSubtitle.textContent = isRegister
      ? "أنشئ حسابًا شخصيًا وابدأ متابعة عاداتك."
      : "أدخل بياناتك للوصول إلى لوحة المتابعة.";
    submitBtn.textContent = isRegister ? "إنشاء الحساب" : "دخول";
    passwordInput.autocomplete = isRegister ? "new-password" : "current-password";
  }

  loginTab.addEventListener("click", () => setMode("login"));
  registerTab.addEventListener("click", () => setMode("register"));

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
      showToast("أكمل البريد وكلمة المرور.");
      return;
    }

    if (password.length < 4) {
      showToast("كلمة المرور يجب أن تكون 4 أحرف على الأقل.");
      return;
    }

    const users = getUsers();

    if (mode === "register") {
      if (!name) {
        showToast("اكتب اسمك.");
        return;
      }

      if (users[email]) {
        showToast("الحساب موجود بالفعل.");
        return;
      }

      users[email] = {
        name,
        email,
        password,
        phone: "",
        address: ""
      };
      saveUsers(users);
    } else {
      if (!users[email] || users[email].password !== password) {
        showToast("بيانات الدخول غير صحيحة.");
        return;
      }
    }

    localStorage.setItem(sessionKey, email);
    window.location.href = "dashboard.html";
  });

  const activeSession = localStorage.getItem(sessionKey);
  if (activeSession && getUsers()[activeSession]) {
    window.location.href = "dashboard.html";
  }
})();