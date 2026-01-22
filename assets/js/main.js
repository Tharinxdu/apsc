// FILE: assets/js/main.js
(() => {
  "use strict";

  const select = (el, all = false) => {
    el = (el || "").trim();
    if (!el) return null;

    try {
      return all ? Array.from(document.querySelectorAll(el)) : document.querySelector(el);
    } catch {
      return null; // guards invalid selectors like "#"
    }
  };

  const on = (type, el, listener, all = false) => {
    const items = select(el, all);
    if (!items) return;
    if (all) items.forEach((i) => i.addEventListener(type, listener));
    else items.addEventListener(type, listener);
  };

  const onscroll = (el, listener) => {
    if (!el) return;
    el.addEventListener("scroll", listener, { passive: true });
  };

  const clampPath = (pathname) => {
    let p = pathname || "/";
    if (!p.startsWith("/")) p = `/${p}`;

    // Treat root as index.html
    if (p === "/") return "/index.html";

    // Normalize directory paths to /index.html
    if (p.endsWith("/")) return `${p}index.html`;

    return p;
  };

  const safeURL = (href) => {
    try {
      return new URL(href, window.location.href);
    } catch {
      return null;
    }
  };

  const isHomePage = () => {
    const p = window.location.pathname || "/";
    return p === "/" || p.endsWith("/index.html");
  };

  const getNavLinks = () => {
    const links = [
      ...document.querySelectorAll(".navmenu a[href], #navmenu a[href], .navbar a[href], #navbar a[href]"),
    ];

    return links.filter((a) => {
      const href = (a.getAttribute("href") || "").trim();
      if (!href) return false;
      if (href === "#" || href.toLowerCase().startsWith("javascript:")) return false;
      return true;
    });
  };

  const clearActive = () => {
    const links = getNavLinks();
    links.forEach((a) => a.classList.remove("active"));
  };

  const activateLink = (link) => {
    if (!link) return;

    clearActive();
    link.classList.add("active");

    // If inside dropdown, also mark the dropdown toggle as active
    const dropdown = link.closest(".dropdown");
    if (dropdown) {
      const toggle = dropdown.querySelector(":scope > a[href]");
      if (toggle) toggle.classList.add("active");
    }
  };

  const activateFirstTopLink = () => {
    const topLinks = [
      ...document.querySelectorAll(
        ".navmenu > ul > li > a[href], #navmenu > ul > li > a[href], .navbar > ul > li > a[href], #navbar > ul > li > a[href]"
      ),
    ];

    const first = topLinks.find((a) => {
      const href = (a.getAttribute("href") || "").trim();
      if (!href) return false;
      if (href === "#" || href.toLowerCase().startsWith("javascript:")) return false;
      return true;
    });

    if (first) activateLink(first);
  };

  const setActiveByURL = () => {
    const links = getNavLinks();
    if (!links.length) return;

    const currentPath = clampPath(window.location.pathname);
    let best = null;
    let bestScore = -1;

    for (const a of links) {
      const rawHref = (a.getAttribute("href") || "").trim();
      const url = safeURL(rawHref);
      if (!url) continue;

      // Ignore pure hash links when deciding page-based active state
      const isPureHash = rawHref.startsWith("#");
      const linkPath = clampPath(url.pathname);

      if (linkPath !== currentPath) continue;

      // Prefer links without hash (Home should win over index.html#something)
      const score = isPureHash ? 0 : url.hash ? 1 : 2;

      // Prefer exact page link (no hash)
      const exact = clampPath(url.pathname) === currentPath && !url.hash ? 3 : score;

      if (exact > bestScore) {
        best = a;
        bestScore = exact;
      }
    }

    if (best) activateLink(best);
  };

  const setActiveByScroll = () => {
    const links = getNavLinks();
    if (!links.length) return;

    // Only for in-page anchors that exist (either "#id" or "samepage#id")
    const anchorLinks = links
      .map((a) => {
        const href = (a.getAttribute("href") || "").trim();
        if (!href) return null;

        // Pure anchor
        if (href.startsWith("#")) {
          if (href === "#") return null;
          const section = select(href);
          if (!section) return null;
          return { a, section };
        }

        const url = safeURL(href);
        if (!url || !url.hash || url.hash === "#") return null;

        const currentPath = clampPath(window.location.pathname);
        const linkPath = clampPath(url.pathname);
        if (linkPath !== currentPath) return null;

        const section = select(url.hash);
        if (!section) return null;

        return { a, section };
      })
      .filter(Boolean);

    if (!anchorLinks.length) return;

    const y = window.scrollY || 0;
    const position = y + 140;

    // At the very top: keep "Home" highlighted in a predictable way
    if (isHomePage() && y < 10) {
      activateFirstTopLink();
      return;
    }

    let current = null;
    let currentTop = -Infinity;

    for (const item of anchorLinks) {
      const top = item.section.offsetTop;
      const bottom = top + item.section.offsetHeight;

      if (position >= top && position < bottom) {
        // choose the section with the greatest top (most specific)
        if (top >= currentTop) {
          current = item;
          currentTop = top;
        }
      }
    }

    if (current) activateLink(current.a);
  };

  // Preloader (if exists)
  const preloader = select("#preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.remove();
    });
  }

  // Sticky header scrolled class (if template uses it)
  const toggleScrolled = () => {
    const body = document.body;
    const header = select("#header");
    if (!header) return;

    const isScrolled = window.scrollY > 50;
    body.classList.toggle("scrolled", isScrolled);
    header.classList.toggle("scrolled", isScrolled);
  };
  window.addEventListener("load", toggleScrolled);
  window.addEventListener("scroll", toggleScrolled, { passive: true });

  // Scroll top button
  const scrollTop = select(".scroll-top");
  const toggleScrollTop = () => {
    if (!scrollTop) return;
    scrollTop.classList.toggle("active", window.scrollY > 200);
  };
  window.addEventListener("load", toggleScrollTop);
  window.addEventListener("scroll", toggleScrollTop, { passive: true });

  on("click", ".scroll-top", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Mobile nav toggle (BootstrapMade navmenu patterns)
  on("click", ".mobile-nav-toggle", function (e) {
    e.preventDefault();
    document.body.classList.toggle("mobile-nav-active");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");
  });

  const closeMobileNavIfOpen = () => {
    if (!document.body.classList.contains("mobile-nav-active")) return;

    document.body.classList.remove("mobile-nav-active");

    const toggle = select(".mobile-nav-toggle");
    if (toggle) {
      toggle.classList.add("bi-list");
      toggle.classList.remove("bi-x");
    }

    // close any opened dropdown ULs
    const opened = select(".navmenu .dropdown > ul.dropdown-active, #navmenu .dropdown > ul.dropdown-active", true);
    if (opened) opened.forEach((ul) => ul.classList.remove("dropdown-active"));
  };

  // Close mobile nav when clicking outside (overlay area)
  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("mobile-nav-active")) return;
    const insideNav = e.target.closest(".navmenu, #navmenu, .navbar, #navbar");
    const isToggle = e.target.closest(".mobile-nav-toggle");
    if (!insideNav && !isToggle) closeMobileNavIfOpen();
  });

  // ✅ Mobile dropdown toggle (FIXED: toggle .dropdown-active on the UL, not the LI)
  on("click", ".navmenu .dropdown > a, #navmenu .dropdown > a, .navbar .dropdown > a, #navbar .dropdown > a", function (e) {
    if (!document.body.classList.contains("mobile-nav-active")) return;

    const parent = this.parentElement;
    if (!parent) return;

    const menu = parent.querySelector(":scope > ul");
    if (!menu) return; // if it's not a real dropdown, do nothing

    e.preventDefault();

    // close sibling dropdowns (same level) for cleaner UX
    const siblings = parent.parentElement
      ? Array.from(parent.parentElement.children).filter((li) => li !== parent && li.classList && li.classList.contains("dropdown"))
      : [];

    siblings.forEach((sib) => {
      const sibMenu = sib.querySelector(":scope > ul");
      const sibToggle = sib.querySelector(":scope > a");
      if (sibMenu) sibMenu.classList.remove("dropdown-active");
      if (sibToggle) sibToggle.classList.remove("active");
    });

    menu.classList.toggle("dropdown-active");
    this.classList.toggle("active", menu.classList.contains("dropdown-active"));
  });

  // Smooth scroll for in-page anchors
  const scrollto = (hash) => {
    if (!hash || hash === "#") return;

    const target = select(hash);
    if (!target) return;

    const header = select("#header");
    const headerHeight = header ? header.offsetHeight : 0;
    const offset = header ? headerHeight + 12 : 80;

    const elementPos = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: elementPos - offset,
      behavior: "smooth",
    });
  };

  on("click", ".navmenu a[href], #navmenu a[href], .navbar a[href], #navbar a[href]", function (e) {
    const href = (this.getAttribute("href") || "").trim();
    if (!href || href === "#") return;

    // If mobile + dropdown toggle, let the dropdown handler handle it
    if (document.body.classList.contains("mobile-nav-active")) {
      const li = this.parentElement;
      const hasDirectSubmenu = !!(li && li.classList && li.classList.contains("dropdown") && li.querySelector(":scope > ul"));
      if (hasDirectSubmenu) return;
    }

    // Handle pure in-page links
    if (href.startsWith("#")) {
      const target = select(href);
      if (!target) return;

      e.preventDefault();
      closeMobileNavIfOpen();
      activateLink(this);
      scrollto(href);
      return;
    }

    // Handle "same page + hash"
    const url = safeURL(href);
    if (!url || !url.hash || url.hash === "#") return;

    const currentPath = clampPath(window.location.pathname);
    const linkPath = clampPath(url.pathname);

    if (linkPath === currentPath && select(url.hash)) {
      e.preventDefault();
      closeMobileNavIfOpen();
      activateLink(this);
      scrollto(url.hash);
    }
  });

  // Init active state early + on load (prevents wrong item being stuck active)
  document.addEventListener("DOMContentLoaded", () => {
    setActiveByURL();
    setActiveByScroll();
  });

  window.addEventListener("load", () => {
    setActiveByURL();
    setActiveByScroll();
  });

  window.addEventListener("popstate", () => {
    setActiveByURL();
    setActiveByScroll();
  });

  onscroll(window, () => {
    setActiveByScroll();
  });

  // Optional libs (guarded so it never crashes if a lib is missing)
  window.addEventListener("load", () => {
    // AOS
    if (window.AOS && typeof window.AOS.init === "function") {
      window.AOS.init({
        duration: 600,
        easing: "ease-out",
        once: true,
        mirror: false,
      });
    }

    // PureCounter
    if (window.PureCounter) {
      // eslint-disable-next-line no-new
      new window.PureCounter();
    }

    // GLightbox
    if (window.GLightbox) {
      window.GLightbox({ selector: ".glightbox" });
    }
  });
})();
