(() => {
  "use strict";

  // Change this when you publish major updates
  const WHATS_NEW_VERSION = "2026-06-13";
  const STORAGE_KEY = "apsc_whatsnew_seen_version";

  const fab = document.getElementById("whatsNewFab");
  const modalEl = document.getElementById("whatsNewModal");
  const listEl = document.getElementById("whatsNewList");

  if (!fab || !modalEl || !window.bootstrap) return;

  const modal = new bootstrap.Modal(modalEl, {
    backdrop: true,
    keyboard: true,
    focus: true,
  });

  let lastDialogRect = null;

  const hasNewUpdates = () => localStorage.getItem(STORAGE_KEY) !== WHATS_NEW_VERSION;

  const setFabState = () => {
    if (hasNewUpdates()) fab.classList.add("has-updates");
    else fab.classList.remove("has-updates");
  };

  // Helper: create animated chip
  const createMinimizer = (rect) => {
    const el = document.createElement("div");
    el.className = "whats-new-minimizer";
    el.innerHTML = `
      <span style="width:34px;height:34px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.18);">
        <i class="bi bi-bell-fill" style="font-size:16px;"></i>
      </span>
      <span style="font-weight:900;letter-spacing:-0.01em;">What’s New</span>
    `;

    el.style.left = rect.left + "px";
    el.style.top = rect.top + "px";
    el.style.width = rect.width + "px";
    el.style.height = rect.height + "px";
    return el;
  };

  // Smooth animate using Web Animations API
  const animateChip = (chip, keyframes, options, onDone) => {
    try {
      const anim = chip.animate(keyframes, options);
      anim.onfinish = () => onDone && onDone();
    } catch {
      // fallback if animate() unsupported
      onDone && onDone();
    }
  };

  const openWithExpandFromFab = () => {
    const fabRect = fab.getBoundingClientRect();

    // show modal but hide dialog briefly until expand finishes
    modal.show();
    const dialog = modalEl.querySelector(".modal-dialog");
    if (dialog) dialog.style.opacity = "0";

    const chip = createMinimizer(fabRect);
    chip.style.borderRadius = "999px";
    document.body.appendChild(chip);

    requestAnimationFrame(() => {
      const dialog2 = modalEl.querySelector(".modal-dialog");
      if (!dialog2) {
        chip.remove();
        if (dialog) dialog.style.opacity = "1";
        return;
      }

      const end = dialog2.getBoundingClientRect();

      const startCenterX = fabRect.left + fabRect.width / 2;
      const startCenterY = fabRect.top + fabRect.height / 2;
      const endCenterX = end.left + end.width / 2;
      const endCenterY = end.top + end.height / 2;

      const dx = endCenterX - startCenterX;
      const dy = endCenterY - startCenterY;

      const scaleX = end.width / fabRect.width;
      const scaleY = end.height / fabRect.height;
      const scale = Math.min(Math.max(Math.min(scaleX, scaleY), 1), 10);

      animateChip(
        chip,
        [
          { transform: "translate(0px, 0px) scale(1)", borderRadius: "999px", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, borderRadius: "22px", opacity: 1 }
        ],
        {
          duration: 360,
          easing: "cubic-bezier(0.2, 0.9, 0.2, 1)",
          fill: "forwards",
        },
        () => {
          if (dialog2) dialog2.style.opacity = "1";
          chip.remove();
        }
      );
    });
  };

  const animateToFab = () => {
    if (!lastDialogRect) return;

    const fabRect = fab.getBoundingClientRect();
    const start = lastDialogRect;

    const chip = createMinimizer(start);
    document.body.appendChild(chip);

    const startCenterX = start.left + start.width / 2;
    const startCenterY = start.top + start.height / 2;
    const endCenterX = fabRect.left + fabRect.width / 2;
    const endCenterY = fabRect.top + fabRect.height / 2;

    const dx = endCenterX - startCenterX;
    const dy = endCenterY - startCenterY;

    const scaleX = fabRect.width / start.width;
    const scaleY = fabRect.height / start.height;
    const scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.08), 1);

    animateChip(
      chip,
      [
        { transform: "translate(0px, 0px) scale(1)", borderRadius: "22px", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, borderRadius: "999px", opacity: 0.98 }
      ],
      {
        duration: 340,
        easing: "cubic-bezier(0.2, 0.9, 0.2, 1)",
        fill: "forwards",
      },
      () => {
        // tiny fade
        chip.style.opacity = "0";
        setTimeout(() => chip.remove(), 80);
      }
    );
  };

  // Track rect for minimize animation
  modalEl.addEventListener("hide.bs.modal", () => {
    const dialog = modalEl.querySelector(".modal-dialog");
    if (dialog) lastDialogRect = dialog.getBoundingClientRect();

    // mark as seen when user closes
    localStorage.setItem(STORAGE_KEY, WHATS_NEW_VERSION);
    setFabState();
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    animateToFab();
  });

  // FAB click opens modal with expand animation
  fab.addEventListener("click", (e) => {
    e.preventDefault();
    openWithExpandFromFab();
  });

  // Optional: if user clicks any update link, we still treat it as “seen”
  if (listEl) {
    listEl.addEventListener("click", (e) => {
      const a = e.target.closest("a.whats-new-link");
      if (!a) return;
      localStorage.setItem(STORAGE_KEY, WHATS_NEW_VERSION);
      setFabState();
    });
  }

  // Auto-show once per version
  window.addEventListener("load", () => {
    setFabState();

    if (hasNewUpdates()) {
      setTimeout(() => {
        openWithExpandFromFab();
      }, 850);
    }
  });
})();