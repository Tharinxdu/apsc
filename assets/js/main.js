// FILE: assets/js/main.js
(() => {
  "use strict";

  /**
   * Safe helpers
   */
  const select = (el, all = false) => {
    el = (el || "").trim();
    if (!el) return null;

    try {
      return all ? Array.from(document.querySelectorAll(el)) : document.querySelector(el);
    } catch {
      return null; // guards invalid selectors like "#"
    }
  };

  const on = (type, el, listener, all = false, options) => {
    const items = select(el, all);
    if (!items) return;
    if (all) items.forEach((i) => i.addEventListener(type, listener, options));
    else items.addEventListener(type, listener, options);
  };

  const clampPath = (pathname) => {
    let p = pathname || "/";
    if (!p.startsWith("/")) p = `/${p}`;
    if (p === "/") return "/index.html";
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

  /**
   * Template-equivalent: Apply .scrolled class to body when header is sticky
   * (matches original template logic, but guarded)
   */
  function toggleScrolled() {
    const body = document.body;
    const header = select("#header");
    if (!header) return;

    const headerIsSticky =
      header.classList.contains("scroll-up-sticky") ||
      header.classList.contains("sticky-top") ||
      header.classList.contains("fixed-top");

    if (!headerIsSticky) return;

    body.classList.toggle("scrolled", window.scrollY > 100);
  }

  document.addEventListener("scroll", toggleScrolled, { passive: true });
  window.addEventListener("load", toggleScrolled);

  /**
   * Preloader
   */
  const preloader = select("#preloader");
  if (preloader) {
    window.addEventListener("load", () => preloader.remove());
  }

  /**
   * Scroll top button
   * (original uses 100; keep it consistent)
   */
  const scrollTop = select(".scroll-top");
  function toggleScrollTop() {
    if (!scrollTop) return;
    scrollTop.classList.toggle("active", window.scrollY > 100);
  }

  window.addEventListener("load", toggleScrollTop);
  document.addEventListener("scroll", toggleScrollTop, { passive: true });

  on("click", ".scroll-top", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /**
   * Mobile nav toggle (original behavior, but guarded)
   */
  const mobileNavToggleBtn = select(".mobile-nav-toggle");

  function mobileNavToogle() {
    document.body.classList.toggle("mobile-nav-active");

    if (mobileNavToggleBtn) {
      mobileNavToggleBtn.classList.toggle("bi-list");
      mobileNavToggleBtn.classList.toggle("bi-x");
    }
  }

  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      mobileNavToogle();
    });
  }

  /**
   * Hide mobile nav on same-page/hash links (original: #navmenu a)
   */
  on(
    "click",
    "#navmenu a, .navmenu a, #navbar a, .navbar a",
    () => {
      if (document.body.classList.contains("mobile-nav-active")) {
        mobileNavToogle();
      }
    },
    true
  );

  /**
   * Toggle mobile nav dropdowns
   * - Original template uses ".navmenu .toggle-dropdown"
   * - Also supports dropdown pattern where anchor itself is the toggle (common in templates)
   */
  on(
    "click",
    ".navmenu .toggle-dropdown, #navmenu .toggle-dropdown, .navbar .toggle-dropdown, #navbar .toggle-dropdown",
    function (e) {
      e.preventDefault();

      // Original logic:
      // this.parentNode.classList.toggle('active');
      // this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      const parent = this?.parentNode;
      const next = parent?.nextElementSibling;

      if (parent && parent.classList) parent.classList.toggle("active");
      if (next && next.classList) next.classList.toggle("dropdown-active");

      e.stopImmediatePropagation();
    },
    true
  );

  // Additional safe dropdown toggling for common structure: .dropdown > a + ul
  on(
    "click",
    ".navmenu .dropdown > a, #navmenu .dropdown > a, .navbar .dropdown > a, #navbar .dropdown > a",
    function (e) {
      if (!document.body.classList.contains("mobile-nav-active")) return;

      const parent = this?.parentElement;
      const menu = parent ? parent.querySelector(":scope > ul") : null;
      if (!menu) return;

      e.preventDefault();
      menu.classList.toggle("dropdown-active");
      this.classList.toggle("active", menu.classList.contains("dropdown-active"));
    },
    true
  );

  /**
   * Smooth scroll helper (used for hash scroll correction and in-page clicks)
   */
  const scrollto = (hash) => {
    if (!hash || hash === "#") return;
    const target = select(hash);
    if (!target) return;

    const scrollMarginTop = parseInt(getComputedStyle(target).scrollMarginTop || "0", 10);
    const top = target.offsetTop - (Number.isFinite(scrollMarginTop) ? scrollMarginTop : 0);

    window.scrollTo({ top, behavior: "smooth" });
  };

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   * (original behavior; guarded)
   */
  window.addEventListener("load", () => {
    if (!window.location.hash) return;
    const section = select(window.location.hash);
    if (!section) return;

    setTimeout(() => scrollto(window.location.hash), 100);
  });

  /**
   * FAQ toggle
   */
  on(
    "click",
    ".faq-item h3, .faq-item .faq-toggle",
    function () {
      const parent = this?.parentNode;
      if (parent && parent.classList) parent.classList.toggle("faq-active");
    },
    true
  );

  /**
   * Initiate AOS (guarded)
   */
  function aosInit() {
    if (!window.AOS || typeof window.AOS.init !== "function") return;
    window.AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }
  window.addEventListener("load", aosInit);

  /**
   * Initiate GLightbox (guarded)
   */
  window.addEventListener("load", () => {
    if (!window.GLightbox) return;
    window.GLightbox({ selector: ".glightbox" });
  });

  /**
   * Init swiper sliders (guarded + matches original pattern)
   * - Reads JSON from .swiper-config inside each .init-swiper
   * - Supports swiper-tab + optional initSwiperWithCustomPagination if present
   */
  function initSwiper() {
    if (!window.Swiper) return;

    const swiperRoots = select(".init-swiper", true) || [];
    swiperRoots.forEach((swiperElement) => {
      const configEl = swiperElement.querySelector(".swiper-config");
      if (!configEl) return;

      let config = null;
      try {
        config = JSON.parse((configEl.innerHTML || "").trim());
      } catch {
        return;
      }

      if (swiperElement.classList.contains("swiper-tab")) {
        if (typeof window.initSwiperWithCustomPagination === "function") {
          window.initSwiperWithCustomPagination(swiperElement, config);
        } else {
          // fallback
          // eslint-disable-next-line no-new
          new window.Swiper(swiperElement, config);
        }
      } else {
        // eslint-disable-next-line no-new
        new window.Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Navmenu active state (URL + ScrollSpy)
   * - Keeps your safer logic, but aligned with template behavior
   */
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
    getNavLinks().forEach((a) => a.classList.remove("active"));
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

      const isPureHash = rawHref.startsWith("#");
      const linkPath = clampPath(url.pathname);
      if (linkPath !== currentPath) continue;

      const score = isPureHash ? 0 : url.hash ? 1 : 2;
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

    const anchorLinks = links
      .map((a) => {
        const href = (a.getAttribute("href") || "").trim();
        if (!href) return null;

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
    const position = y + 200; // closer to original

    if (isHomePage() && y < 10) {
      activateFirstTopLink();
      return;
    }

    let current = null;
    let currentTop = -Infinity;

    for (const item of anchorLinks) {
      const top = item.section.offsetTop;
      const bottom = top + item.section.offsetHeight;

      if (position >= top && position <= bottom) {
        if (top >= currentTop) {
          current = item;
          currentTop = top;
        }
      }
    }

    if (current) activateLink(current.a);
  };

  /**
   * In-page link click handling (keeps your safe behavior)
   */
  on(
    "click",
    ".navmenu a[href], #navmenu a[href], .navbar a[href], #navbar a[href]",
    function (e) {
      const href = (this.getAttribute("href") || "").trim();
      if (!href || href === "#") return;

      // Pure in-page links
      if (href.startsWith("#")) {
        const target = select(href);
        if (!target) return;

        e.preventDefault();
        activateLink(this);
        scrollto(href);
        return;
      }

      // Same page + hash
      const url = safeURL(href);
      if (!url || !url.hash || url.hash === "#") return;

      const currentPath = clampPath(window.location.pathname);
      const linkPath = clampPath(url.pathname);

      if (linkPath === currentPath && select(url.hash)) {
        e.preventDefault();
        activateLink(this);
        scrollto(url.hash);
      }
    },
    true
  );

  /**
   * Init active state early + on navigation
   */
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

  window.addEventListener(
    "scroll",
    () => {
      setActiveByScroll();
    },
    { passive: true }
  );

  /**
   * Optional libs: PureCounter (guarded)
   */
  window.addEventListener("load", () => {
    if (window.PureCounter) {
      // eslint-disable-next-line no-new
      new window.PureCounter();
    }
  });
})();
