document.addEventListener("DOMContentLoaded", function () {
  const authTabs = document.querySelectorAll(".auth-tab");
  const authForms = document.querySelectorAll(".auth-form");
  const authTabsContainer = document.querySelector(".auth-tabs");

  const switchButtons = document.querySelectorAll("[data-switch-form]");

  const passwordToggleButtons = document.querySelectorAll(".password-toggle");

  function switchForm(formName) {
    authTabs.forEach(function (tab) {
      const isActive = tab.dataset.form === formName;

      tab.classList.toggle("active", isActive);
    });

    authForms.forEach(function (form) {
      const isActive = form.id === `${formName}Form`;

      form.classList.toggle("active", isActive);
    });

    authTabsContainer.classList.toggle(
      "register-active",
      formName === "register",
    );

    const pageTitle =
      formName === "login" ? "SORS - Đăng nhập" : "SORS - Đăng ký";

    document.title = pageTitle;
  }

  authTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      switchForm(tab.dataset.form);
    });
  });

  switchButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      switchForm(button.dataset.switchForm);
    });
  });

  passwordToggleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const inputId = button.dataset.passwordTarget;
      const input = document.getElementById(inputId);
      const icon = button.querySelector("i");

      if (!input || !icon) return;

      const showPassword = input.type === "password";

      input.type = showPassword ? "text" : "password";

      icon.classList.toggle("bi-eye", !showPassword);
      icon.classList.toggle("bi-eye-slash", showPassword);

      button.setAttribute(
        "aria-label",
        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu",
      );
    });
  });

  initializeLoginForm();
  initializeRegisterForm();
});

/* ==================================================
   HIỂN THỊ THÔNG BÁO
================================================== */

function showAuthMessage(element, message, type) {
  if (!element) return;

  element.textContent = message;
  element.className = `auth-message show ${type}`;
}

function clearAuthMessage(element) {
  if (!element) return;

  element.textContent = "";
  element.className = "auth-message";
}

/* ==================================================
   ĐĂNG NHẬP
================================================== */

function initializeLoginForm() {
  const loginForm = document.getElementById("loginForm");

  const loginMessage = document.getElementById("loginMessage");

  const loginSubmitBtn = document.getElementById("loginSubmitBtn");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearAuthMessage(loginMessage);

    const username = document.getElementById("loginUsername").value.trim();

    const password = document.getElementById("loginPassword").value;

    const rememberMe = document.getElementById("rememberMe").checked;

    if (!username || !password) {
      showAuthMessage(loginMessage, "Vui lòng nhập đầy đủ thông tin.", "error");

      return;
    }

    setButtonLoading(loginSubmitBtn, true, "Đang đăng nhập...");

    try {
      const response = await fetch("./api/auth/login.php", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          password,
          rememberMe,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Đăng nhập thất bại.");
      }

      /*
       * Tạm thời phục vụ giao diện.
       * Khi làm web thật nên dùng PHP Session.
       */
      localStorage.setItem("username", result.data.username);

      showAuthMessage(
        loginMessage,
        "Đăng nhập thành công. Đang chuyển trang...",
        "success",
      );

      setTimeout(function () {
        window.location.href = "./index.php";
      }, 700);
    } catch (error) {
      showAuthMessage(loginMessage, error.message, "error");
    } finally {
      setButtonLoading(loginSubmitBtn, false, "Đăng nhập");
    }
  });
}

/* ==================================================
   ĐĂNG KÝ
================================================== */

function initializeRegisterForm() {
  const registerForm = document.getElementById("registerForm");

  const registerMessage = document.getElementById("registerMessage");

  const registerSubmitBtn = document.getElementById("registerSubmitBtn");

  if (!registerForm) return;

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearAuthMessage(registerMessage);

    const fullname = document.getElementById("registerFullname").value.trim();

    const username = document.getElementById("registerUsername").value.trim();

    const email = document.getElementById("registerEmail").value.trim();

    const password = document.getElementById("registerPassword").value;

    const confirmPassword = document.getElementById(
      "registerConfirmPassword",
    ).value;

    const acceptTerms = document.getElementById("acceptTerms").checked;

    if (!fullname || !username || !email || !password || !confirmPassword) {
      showAuthMessage(
        registerMessage,
        "Vui lòng nhập đầy đủ thông tin.",
        "error",
      );

      return;
    }

    if (password.length < 8) {
      showAuthMessage(
        registerMessage,
        "Mật khẩu phải có ít nhất 8 ký tự.",
        "error",
      );

      return;
    }

    if (password !== confirmPassword) {
      showAuthMessage(
        registerMessage,
        "Mật khẩu nhập lại không khớp.",
        "error",
      );

      return;
    }

    if (!acceptTerms) {
      showAuthMessage(
        registerMessage,
        "Bạn cần đồng ý với điều khoản sử dụng.",
        "error",
      );

      return;
    }

    setButtonLoading(registerSubmitBtn, true, "Đang tạo tài khoản...");

    try {
      const response = await fetch("./api/auth/register.php", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          fullname,
          username,
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Đăng ký thất bại.");
      }

      showAuthMessage(
        registerMessage,
        "Đăng ký thành công. Bạn có thể đăng nhập.",
        "success",
      );

      registerForm.reset();

      setTimeout(function () {
        const loginTab = document.querySelector('[data-form="login"]');

        loginTab?.click();

        document.getElementById("loginUsername").value = username;
      }, 900);
    } catch (error) {
      showAuthMessage(registerMessage, error.message, "error");
    } finally {
      setButtonLoading(registerSubmitBtn, false, "Đăng ký tài khoản");
    }
  });
}

/* ==================================================
   LOADING BUTTON
================================================== */

function setButtonLoading(button, loading, text) {
  if (!button) return;

  button.disabled = loading;

  button.innerHTML = loading
    ? `
      <span
        class="spinner-border spinner-border-sm"
        aria-hidden="true"
      ></span>

      <span>${text}</span>
    `
    : `
      <span>${text}</span>
      <i class="bi bi-arrow-right"></i>
    `;
}
