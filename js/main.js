const userInfo = document.querySelector(".user_info");
const userMenuBtn = document.getElementById("userMenuBtn");
const userMenu = document.getElementById("userMenu");

userMenuBtn.addEventListener("click", function (event) {
  event.stopPropagation();

  const isOpen = userMenu.classList.toggle("show");

  userInfo.classList.toggle("menu-open", isOpen);
  userMenuBtn.setAttribute("aria-expanded", isOpen);
});

// Bấm trong menu thì không tự đóng
userMenu.addEventListener("click", function (event) {
  event.stopPropagation();
});

// Bấm ra ngoài thì đóng menu
document.addEventListener("click", function () {
  userMenu.classList.remove("show");
  userInfo.classList.remove("menu-open");
  userMenuBtn.setAttribute("aria-expanded", "false");
});

// Nhấn Escape để đóng
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    userMenu.classList.remove("show");
    userInfo.classList.remove("menu-open");
    userMenuBtn.setAttribute("aria-expanded", "false");
  }
});
//nút chuyển màu
const themeToggle = document.getElementById("themeToggle");
const rootElement = document.documentElement;

function setTheme(theme) {
  rootElement.setAttribute("data-theme", theme);

  const isDark = theme === "dark";

  themeToggle.setAttribute("aria-pressed", String(isDark));

  localStorage.setItem("sors-theme", theme);
}

const savedTheme = localStorage.getItem("sors-theme");

if (savedTheme === "dark" || savedTheme === "light") {
  setTheme(savedTheme);
} else {
  setTheme("light");
}

themeToggle.addEventListener("click", function () {
  const currentTheme = rootElement.getAttribute("data-theme");

  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  setTheme(nextTheme);
});

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mainNav = document.getElementById("mainNav");
const mobileMenuIcon = mobileMenuBtn?.querySelector("i");

function setMobileMenu(open) {
  if (!mobileMenuBtn || !mainNav) return;

  mainNav.classList.toggle("show", open);
  mobileMenuBtn.setAttribute("aria-expanded", String(open));

  if (mobileMenuIcon) {
    mobileMenuIcon.classList.toggle("bi-list", !open);
    mobileMenuIcon.classList.toggle("bi-x-lg", open);
  }
}

mobileMenuBtn?.addEventListener("click", function (event) {
  event.stopPropagation();

  const isOpen = mainNav.classList.contains("show");
  setMobileMenu(!isOpen);
});

mainNav?.addEventListener("click", function (event) {
  event.stopPropagation();

  if (event.target.closest("a")) {
    setMobileMenu(false);
  }
});

document.addEventListener("click", function (event) {
  if (
    !mainNav?.contains(event.target) &&
    !mobileMenuBtn?.contains(event.target)
  ) {
    setMobileMenu(false);
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    setMobileMenu(false);
  }
});

window.addEventListener("resize", function () {
  if (window.innerWidth > 900) {
    setMobileMenu(false);
  }
});
