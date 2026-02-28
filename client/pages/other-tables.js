(() => {
  const revenueChart = document.querySelector("[data-revenue-chart]");
  const expenseDonut = document.querySelector("[data-expense-donut]");
  const dataEl = document.querySelector("[data-bookkeeping-data]");

  if (!dataEl) return;

  let data;
  try {
    data = JSON.parse(dataEl.textContent || "{}");
  } catch {
    return;
  }

  const currency = typeof data.currency === "string" ? data.currency : "CAD";
  const money = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const moneyK = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  });

  function formatCompactAmount(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    const abs = Math.abs(n);
    if (abs >= 1000) return `${moneyK.format(n / 1000)}k`;
    return money.format(n);
  }

  function renderRevenueByWeek() {
    if (!revenueChart) return;
    const rows = Array.isArray(data.revenueByWeek) ? data.revenueByWeek : [];
    if (rows.length === 0) return;

    const totals = rows.map((r) => Number(r.total)).filter((n) => Number.isFinite(n) && n >= 0);
    const max = Math.max(0, ...totals);
    if (max <= 0) return;

    revenueChart.innerHTML = "";
    for (const row of rows) {
      const total = Number(row.total);
      if (!Number.isFinite(total) || total < 0) continue;

      const v = Math.round((total / max) * 100);
      const bar = document.createElement("div");
      bar.className = "pages-bar";
      bar.style.setProperty("--v", String(v));

      const label = document.createElement("span");
      label.textContent = formatCompactAmount(total);
      bar.appendChild(label);

      revenueChart.appendChild(bar);
    }
  }

  function renderExpenseSplit() {
    if (!expenseDonut) return;

    const rows = Array.isArray(data.expenseSplit) ? data.expenseSplit : [];
    if (rows.length === 0) return;

    const svg = expenseDonut.querySelector("svg");
    const legend = expenseDonut.querySelector(".pages-donut-legend");
    const segA = expenseDonut.querySelector(".pages-donut-seg--a");
    const segB = expenseDonut.querySelector(".pages-donut-seg--b");
    const segC = expenseDonut.querySelector(".pages-donut-seg--c");

    if (!svg || !legend || !segA || !segB || !segC) return;

    const segEls = [segA, segB, segC];
    const rAttr = segA.getAttribute("r") || "44";
    const r = Number(rAttr);
    if (!Number.isFinite(r) || r <= 0) return;
    const circumference = 2 * Math.PI * r;

    const top3 = rows.slice(0, 3).map((row) => ({
      category: typeof row.category === "string" ? row.category : "Unknown",
      pct: Number(row.pct)
    }));

    let offset = 0;
    for (let i = 0; i < segEls.length; i++) {
      const seg = segEls[i];
      const row = top3[i];
      const pct = row && Number.isFinite(row.pct) ? Math.max(0, row.pct) : 0;
      const dash = Math.round((pct / 100) * circumference);

      seg.style.strokeDasharray = `${dash} ${Math.round(circumference)}`;
      seg.style.strokeDashoffset = String(offset);
      offset -= dash;
    }

    legend.innerHTML = "";
    const labels = ["a", "b", "c"];
    for (let i = 0; i < top3.length && i < 3; i++) {
      const row = top3[i];
      const pct = Number.isFinite(row.pct) ? Math.max(0, row.pct) : 0;
      const wrap = document.createElement("div");
      const dot = document.createElement("span");
      dot.className = `demo-dot is-${labels[i]}`;
      wrap.appendChild(dot);
      wrap.appendChild(document.createTextNode(` ${row.category} (${Math.round(pct)}%)`));
      legend.appendChild(wrap);
    }
  }

  renderRevenueByWeek();
  renderExpenseSplit();
})();
