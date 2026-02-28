(() => {
  const cartList = document.querySelector("[data-cart-list]");
  if (!cartList) return;

  const countEl = document.querySelector("[data-cart-count]");
  const emptyEl = document.querySelector("[data-cart-empty]");
  const subtotalEl = document.querySelector("[data-subtotal]");
  const taxEl = document.querySelector("[data-tax]");
  const totalEl = document.querySelector("[data-total]");
  const clearBtn = document.querySelector("[data-clear]");

  const TAX_RATE = 0.13;
  const fmt = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function clampInt(n, min, max) {
    const x = Number.parseInt(String(n), 10);
    if (Number.isNaN(x)) return min;
    return Math.min(max, Math.max(min, x));
  }

  function getItems() {
    return Array.from(cartList.querySelectorAll("[data-cart-item]"));
  }

  function syncItemDom(item) {
    const qty = clampInt(item.dataset.qty, 0, 999);
    const unit = Number.parseFloat(item.dataset.unitPrice || "0");
    const line = Math.max(0, unit * qty);

    const qtyEl = item.querySelector("[data-qty-value]");
    const lineEl = item.querySelector("[data-line-price]");
    if (qtyEl) qtyEl.textContent = String(qty);
    if (lineEl) lineEl.textContent = fmt.format(line);

    const minusBtn = item.querySelector("[data-qty-minus]");
    if (minusBtn) minusBtn.disabled = qty <= 0;
  }

  function recalcTotals() {
    const items = getItems();

    let count = 0;
    let subtotal = 0;
    for (const item of items) {
      const qty = clampInt(item.dataset.qty, 0, 999);
      const unit = Number.parseFloat(item.dataset.unitPrice || "0");
      count += qty;
      subtotal += unit * qty;
      syncItemDom(item);
    }

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    if (countEl) countEl.textContent = String(count);
    if (subtotalEl) subtotalEl.textContent = fmt.format(subtotal);
    if (taxEl) taxEl.textContent = fmt.format(tax);
    if (totalEl) totalEl.textContent = fmt.format(total);

    const isEmpty = items.length === 0 || count === 0;
    if (emptyEl) emptyEl.hidden = !isEmpty;
    cartList.hidden = isEmpty;
  }

  function removeItem(item) {
    item.remove();
    recalcTotals();
  }

  cartList.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const item = target.closest("[data-cart-item]");
    if (!item) return;

    if (target.matches("[data-remove]")) {
      removeItem(item);
      return;
    }

    if (target.matches("[data-qty-plus]")) {
      const qty = clampInt(item.dataset.qty, 0, 999) + 1;
      item.dataset.qty = String(qty);
      recalcTotals();
      return;
    }

    if (target.matches("[data-qty-minus]")) {
      const next = clampInt(item.dataset.qty, 0, 999) - 1;
      if (next <= 0) {
        removeItem(item);
      } else {
        item.dataset.qty = String(next);
        recalcTotals();
      }
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      for (const item of getItems()) item.remove();
      recalcTotals();
    });
  }

  recalcTotals();
})();

