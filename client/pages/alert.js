(() => {
  const DEFAULT_DURATION = 4500;
  const MAX_TOASTS = 5;

  function ensureContainer() {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-relevant", "additions");
      document.body.appendChild(container);
    }
    return container;
  }

  function toRole(variant) {
    return variant === "danger" ? "alert" : "status";
  }

  function removeToast(toast) {
    toast.classList.remove("is-visible");
    const onDone = () => {
      toast.removeEventListener("transitionend", onDone);
      toast.remove();
    };
    toast.addEventListener("transitionend", onDone);
    window.setTimeout(() => toast.remove(), 350);
  }

  function showToast({
    title = "Notice",
    message = "",
    variant = "info",
    duration = DEFAULT_DURATION
  } = {}) {
    const container = ensureContainer();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.dataset.variant = variant;
    toast.setAttribute("role", toRole(variant));
    toast.setAttribute("aria-atomic", "true");

    const body = document.createElement("div");
    body.className = "toast__body";

    const titleEl = document.createElement("p");
    titleEl.className = "toast__title";
    titleEl.textContent = title;

    const msgEl = document.createElement("p");
    msgEl.className = "toast__message";
    msgEl.textContent = message;

    body.appendChild(titleEl);
    if (message) body.appendChild(msgEl);

    const closeBtn = document.createElement("button");
    closeBtn.className = "toast__close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Dismiss notification");
    closeBtn.innerHTML = "×";

    const progress = document.createElement("div");
    progress.className = "toast__progress";

    toast.appendChild(body);
    toast.appendChild(closeBtn);
    toast.appendChild(progress);

    if (typeof duration === "number" && duration > 0) {
      toast.style.setProperty("--toast-duration", `${duration}ms`);
    } else {
      toast.style.setProperty("--toast-duration", "0ms");
      progress.remove();
    }

    closeBtn.addEventListener("click", () => removeToast(toast));

    container.prepend(toast);

    while (container.children.length > MAX_TOASTS) {
      container.lastElementChild?.remove();
    }

    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });

    if (typeof duration === "number" && duration > 0) {
      window.setTimeout(() => {
        if (toast.isConnected) removeToast(toast);
      }, duration);
    }

    return toast;
  }

  window.Toast = { show: showToast };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-toast]");
    if (!btn) return;

    const variant = btn.getAttribute("data-variant") || "info";
    const title = btn.getAttribute("data-title") || "Notice";
    const message = btn.getAttribute("data-message") || "This is a toast notification.";
    const durationAttr = btn.getAttribute("data-duration");
    const duration = durationAttr ? Number(durationAttr) : DEFAULT_DURATION;

    showToast({ variant, title, message, duration });
  });
})();

