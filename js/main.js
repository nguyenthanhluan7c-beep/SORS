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
//hàm loaduser nếu đã dăng nhập
document.addEventListener("DOMContentLoaded", async () => {
  const username = localStorage.getItem("username");
  console.log(username);
  const loader = document.getElementById("user_info");
  if (!username) {
    loader.innerHTML = `<img src="https://res.cloudinary.com/dngjmqa1q/image/upload/v1778679148/acoijmsaftfjmvstcubt.png" alt="Ảnh đại diện" class="user_avatar">
    <button class="login_btn" id="login_btn">Đăng nhập</button>`;
    const login_btn = document.getElementById("login_btn");
    login_btn.addEventListener("click", () => {
      window.location.href = "./login.html";
    });
  } else {
    const response = await fetch(
      `./api/users/get-user.php?username=${encodeURIComponent(username)}`,
    );
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message);
    }
    const user_info = result.data;
    console.log(user_info)
    loader.innerHTML = `<img src="${user_info.avatar}" alt="Ảnh đại diện" class="user_avatar" />
        <p>Xin chào, ${user_info.username}</p>
        <button
          type="button"
          class="user_menu_btn"
          id="userMenuBtn"
          aria-label="Mở menu người dùng"
          aria-expanded="false"
        >
          <i class="bi bi-chevron-down"></i>
        </button>
        <ul class="user-nav" id="userMenu">
          <li>
            <a href="./Trang cá nhân/profile.html">
              <i class="bi bi-person"></i>
              Thông tin cá nhân
            </a>
          </li>
          <li>
            <a href="./Trang bài đăng/user-posts.html">
              <i class="bi bi-file-earmark-text"></i>
              Bài đăng
            </a>
          </li>
          <li>
            <a href="./Trang cài đặt/settings.html">
              <i class="bi bi-gear"></i>
              Cài đặt
            </a>
          </li>
          <li class="menu-divider"></li>
          <li>
            <a href="./index.html" class="logout-link" id="logout_btn">
              <i class="bi bi-box-arrow-right"></i>
              Đăng xuất
            </a>
          </li>`;
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
    //logout logic 
    const logout_btn = document.getElementById("logout_btn");
    logout_btn.addEventListener("click", () => {
      localStorage.removeItem("username");
    })
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const joinClubBtn = document.getElementById("joinClubBtn");

  const username = localStorage.getItem("username");

  if (!joinClubBtn) return;

  const icon = joinClubBtn.querySelector("i");
  const text = joinClubBtn.querySelector("span");

  if (username) {
    joinClubBtn.href = "./Trang cá nhân/profile.php";

    icon.className = "bi bi-person-circle";

    text.textContent = "Trang cá nhân";
  }
});