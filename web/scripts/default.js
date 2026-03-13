const FALLBACK_FRAGMENTS = {
  header: `
    <header class="site-header">
      <div class="site-header__inner">
        <a class="brand" href="home.html">
          <span class="brand__mark">LT</span>
          <span>
            <strong>LifeTracker</strong>
            <small>Voice-first personal logging</small>
          </span>
        </a>
        <nav class="nav" aria-label="Primary">
          <a class="nav__link" data-page="home.html" href="home.html">Dashboard</a>
        </nav>
      </div>
    </header>
  `,
  footer: `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <p>LifeTracker web prototype</p>
        <p>Uses the configured API, SQL database, and optional LLM classification service.</p>
      </div>
    </footer>
  `,
};

function injectFragment(targetId, path) {
  const element = document.getElementById(targetId);
  if (!element) return;

  fetch(path)
    .then((response) => {
      if (!response.ok) throw new Error(`Unable to load ${path}`);
      return response.text();
    })
    .then((html) => {
      element.innerHTML = html;
      if (targetId === "header") setActiveNav();
    })
    .catch((error) => {
      console.error(error);
      element.innerHTML = FALLBACK_FRAGMENTS[targetId] || "";
      if (targetId === "header") setActiveNav();
    });
}

function setActiveNav() {
  const currentPage = (window.location.pathname.split("/").pop() || "home.html").toLowerCase();
  document.querySelectorAll("[data-page]").forEach((link) => {
    const active = link.getAttribute("data-page") === currentPage;
    link.classList.toggle("is-active", active);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  injectFragment("header", "components/header.html");
  injectFragment("footer", "components/footer.html");
});
