const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
      const number = new Intl.NumberFormat("en-US");
      const percent0 = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

      function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
      }

      function svgEl(name, attrs = {}) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", name);
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
        return el;
      }

      function clear(el) {
        while (el.firstChild) el.removeChild(el.firstChild);
      }

      function fmtDelta(current, previous, unit = "") {
        if (previous === 0) return "—";
        const d = (current - previous) / previous;
        const sign = d > 0 ? "+" : "";
        return `${sign}${(d * 100).toFixed(1)}% vs prior ${unit}`.trim();
      }

      function addBadge(text, tone) {
        const span = document.createElement("span");
        span.className = `dash-badge ${tone || ""}`.trim();
        span.textContent = text;
        return span;
      }

      function sparkColorForDelta(d) {
        if (d >= 0.08) return { dot: "good", pill: "good" };
        if (d <= -0.08) return { dot: "bad", pill: "bad" };
        return { dot: "", pill: "" };
      }

      function renderLineChart(target, { labels, values, stroke = "#60a5fa", fill = "rgba(96,165,250,0.16)" }) {
        clear(target);
        const width = 1000;
        const height = 360;
        const padding = { top: 28, right: 24, bottom: 42, left: 54 };
        const innerW = width - padding.left - padding.right;
        const innerH = height - padding.top - padding.bottom;
        const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img" });

        const minV = Math.min(...values);
        const maxV = Math.max(...values);
        const span = maxV - minV || 1;

        const x = (i) => padding.left + (innerW * i) / Math.max(1, values.length - 1);
        const y = (v) => padding.top + innerH - (innerH * (v - minV)) / span;

        const grid = svgEl("g", { opacity: "0.9" });
        const gridLines = 4;
        for (let i = 0; i <= gridLines; i++) {
          const yy = padding.top + (innerH * i) / gridLines;
          grid.appendChild(
            svgEl("line", {
              x1: padding.left,
              x2: padding.left + innerW,
              y1: yy,
              y2: yy,
              stroke: "rgba(255,255,255,0.08)",
              "stroke-width": "1",
            })
          );
          const tickV = maxV - (span * i) / gridLines;
          const tick = svgEl("text", {
            x: padding.left - 10,
            y: yy + 4,
            "text-anchor": "end",
            fill: "rgba(255,255,255,0.7)",
            "font-size": "14",
          });
          tick.textContent = currency.format(tickV);
          grid.appendChild(tick);
        }
        svg.appendChild(grid);

        const path = values
          .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`)
          .join(" ");

        const area = `${path} L ${(padding.left + innerW).toFixed(2)} ${(padding.top + innerH).toFixed(2)} L ${padding.left.toFixed(
          2
        )} ${(padding.top + innerH).toFixed(2)} Z`;

        svg.appendChild(svgEl("path", { d: area, fill }));
        svg.appendChild(svgEl("path", { d: path, fill: "none", stroke, "stroke-width": "3", "stroke-linecap": "round" }));

        const dots = svgEl("g", {});
        for (let i = 0; i < values.length; i++) {
          dots.appendChild(
            svgEl("circle", {
              cx: x(i),
              cy: y(values[i]),
              r: 4.2,
              fill: stroke,
              stroke: "rgba(0,0,0,0.25)",
              "stroke-width": "1.5",
            })
          );
        }
        svg.appendChild(dots);

        const xLabels = svgEl("g", {});
        const step = Math.max(1, Math.floor(labels.length / 6));
        for (let i = 0; i < labels.length; i += step) {
          const t = svgEl("text", {
            x: x(i),
            y: padding.top + innerH + 28,
            "text-anchor": "middle",
            fill: "rgba(255,255,255,0.7)",
            "font-size": "13",
          });
          t.textContent = labels[i];
          xLabels.appendChild(t);
        }
        svg.appendChild(xLabels);

        target.appendChild(svg);
      }

      function renderBarChart(target, { labels, values, bar = "rgba(124,58,237,0.65)", barEdge = "rgba(124,58,237,0.9)" }) {
        clear(target);
        const width = 1000;
        const height = 360;
        const padding = { top: 24, right: 22, bottom: 62, left: 54 };
        const innerW = width - padding.left - padding.right;
        const innerH = height - padding.top - padding.bottom;
        const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img" });

        const maxV = Math.max(...values, 1);

        const bw = innerW / values.length;
        const barW = bw * 0.62;
        const x = (i) => padding.left + i * bw + (bw - barW) / 2;
        const y = (v) => padding.top + innerH - (innerH * v) / maxV;

        for (let i = 0; i <= 4; i++) {
          const yy = padding.top + (innerH * i) / 4;
          svg.appendChild(
            svgEl("line", {
              x1: padding.left,
              x2: padding.left + innerW,
              y1: yy,
              y2: yy,
              stroke: "rgba(255,255,255,0.08)",
              "stroke-width": "1",
            })
          );
          const tickV = Math.round(maxV - (maxV * i) / 4);
          const tick = svgEl("text", {
            x: padding.left - 10,
            y: yy + 4,
            "text-anchor": "end",
            fill: "rgba(255,255,255,0.7)",
            "font-size": "14",
          });
          tick.textContent = number.format(tickV);
          svg.appendChild(tick);
        }

        for (let i = 0; i < values.length; i++) {
          const rect = svgEl("rect", {
            x: x(i),
            y: y(values[i]),
            width: barW,
            height: padding.top + innerH - y(values[i]),
            rx: 10,
            fill: bar,
            stroke: barEdge,
            "stroke-width": "1",
          });
          svg.appendChild(rect);

          const label = svgEl("text", {
            x: x(i) + barW / 2,
            y: padding.top + innerH + 34,
            "text-anchor": "middle",
            fill: "rgba(255,255,255,0.75)",
            "font-size": "13",
          });
          label.textContent = labels[i];
          svg.appendChild(label);

          const val = svgEl("text", {
            x: x(i) + barW / 2,
            y: y(values[i]) - 10,
            "text-anchor": "middle",
            fill: "rgba(255,255,255,0.85)",
            "font-size": "13",
          });
          val.textContent = number.format(values[i]);
          svg.appendChild(val);
        }

        target.appendChild(svg);
      }

      function polarToCartesian(cx, cy, r, angle) {
        const rad = ((angle - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
      }

      function arcPath(cx, cy, rOuter, rInner, startAngle, endAngle) {
        const startOuter = polarToCartesian(cx, cy, rOuter, endAngle);
        const endOuter = polarToCartesian(cx, cy, rOuter, startAngle);
        const startInner = polarToCartesian(cx, cy, rInner, startAngle);
        const endInner = polarToCartesian(cx, cy, rInner, endAngle);
        const largeArc = endAngle - startAngle <= 180 ? "0" : "1";

        return [
          `M ${startOuter.x} ${startOuter.y}`,
          `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
          `L ${startInner.x} ${startInner.y}`,
          `A ${rInner} ${rInner} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
          "Z",
        ].join(" ");
      }

      function renderDonutChart(target, { segments }) {
        clear(target);
        const width = 520;
        const height = 360;
        const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img" });
        const cx = 180;
        const cy = 175;
        const rOuter = 120;
        const rInner = 70;
        const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

        let a = 0;
        for (const seg of segments) {
          const slice = (seg.value / total) * 360;
          const start = a;
          const end = a + slice;
          a = end;

          const p = svgEl("path", {
            d: arcPath(cx, cy, rOuter, rInner, start, end),
            fill: seg.color,
            stroke: "rgba(0,0,0,0.25)",
            "stroke-width": "1",
          });
          svg.appendChild(p);
        }

        const centerValue = svgEl("text", {
          x: cx,
          y: cy - 4,
          "text-anchor": "middle",
          fill: "rgba(255,255,255,0.92)",
          "font-size": "28",
          "font-weight": "700",
        });
        centerValue.textContent = number.format(total);
        svg.appendChild(centerValue);

        const centerLabel = svgEl("text", {
          x: cx,
          y: cy + 22,
          "text-anchor": "middle",
          fill: "rgba(255,255,255,0.7)",
          "font-size": "14",
        });
        centerLabel.textContent = "members";
        svg.appendChild(centerLabel);

        const legend = svgEl("g", {});
        let ly = 70;
        for (const seg of segments) {
          const dot = svgEl("circle", { cx: 360, cy: ly, r: 6.5, fill: seg.color });
          const text = svgEl("text", {
            x: 375,
            y: ly + 5,
            fill: "rgba(255,255,255,0.82)",
            "font-size": "14",
          });
          text.textContent = `${seg.label} (${number.format(seg.value)})`;
          legend.appendChild(dot);
          legend.appendChild(text);
          ly += 26;
        }
        svg.appendChild(legend);

        target.appendChild(svg);
      }

      function seededRand(seed) {
        let t = seed >>> 0;
        return () => {
          t += 0x6d2b79f5;
          let x = t;
          x = Math.imul(x ^ (x >>> 15), x | 1);
          x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
          return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
        };
      }

      function dateKey(d) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }

      function shortLabel(d) {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }

      function makeDemoData({ days, seed, location }) {
        const rand = seededRand(seed);

        const stylists = [
          { id: 101, name: "Avery" },
          { id: 102, name: "Jordan" },
          { id: 103, name: "Sam" },
          { id: 104, name: "Riley" },
          { id: 105, name: "Casey" },
        ];

        const locationFactor = location === "downtown" ? 1.14 : location === "north" ? 0.98 : location === "west" ? 0.92 : 1;

        const today = new Date();
        today.setHours(12, 0, 0, 0);
        const start = new Date(today);
        start.setDate(start.getDate() - (days - 1));

        const daily = [];
        let base = 4200 * locationFactor;
        for (let i = 0; i < days; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);

          const weekendBoost = d.getDay() === 6 || d.getDay() === 0 ? 1.18 : 1;
          const noise = 0.82 + rand() * 0.46;
          base = base * (0.985 + rand() * 0.03);
          const revenue = Math.round(base * weekendBoost * noise);

          const bookings = Math.round(26 * locationFactor * weekendBoost * (0.8 + rand() * 0.55));
          const completed = Math.round(bookings * (0.78 + rand() * 0.18));
          const chairHours = bookings * (0.9 + rand() * 0.6);
          const capacityHours = 8 * stylists.length * 0.82;
          const utilization = clamp(chairHours / capacityHours, 0, 1);

          daily.push({
            day: dateKey(d),
            label: shortLabel(d),
            revenue,
            bookings,
            completed,
            utilization,
          });
        }

        const bookingsByStylist = stylists.map((s) => {
          const v = Math.round(120 * locationFactor * (0.6 + rand() * 0.9));
          return { stylist: s.name, bookings: v };
        });

        const products = [
          { sku: "SHAM-001", name: "Hydrate Shampoo", priceCents: 2400 },
          { sku: "COND-002", name: "Repair Conditioner", priceCents: 2600 },
          { sku: "SER-003", name: "Shine Serum", priceCents: 3200 },
          { sku: "DRY-004", name: "Dry Texture Spray", priceCents: 2800 },
          { sku: "MASK-005", name: "Deep Mask", priceCents: 3600 },
        ].map((p) => {
          const units = Math.round(38 * locationFactor * (0.5 + rand() * 1.2));
          const revenueCents = units * p.priceCents;
          return { ...p, units, revenueCents };
        });

        const subs = [
          { customer: "Taylor G.", status: "active", plan: "Gold", periodEndDays: 18, provider: "stripe", id: "sub_9FJ2A" },
          { customer: "Morgan K.", status: "trialing", plan: "Silver", periodEndDays: 6, provider: "stripe", id: "sub_7KQ1C" },
          { customer: "Chris P.", status: "past_due", plan: "Gold", periodEndDays: -2, provider: "stripe", id: "sub_3PL8X" },
          { customer: "Jamie R.", status: "canceled", plan: "Silver", periodEndDays: -21, provider: "stripe", id: "sub_1YH4M" },
          { customer: "Alex N.", status: "active", plan: "Platinum", periodEndDays: 27, provider: "stripe", id: "sub_0ZV2T" },
          { customer: "Rowan S.", status: "active", plan: "Silver", periodEndDays: 11, provider: "stripe", id: "sub_2DD6Q" },
          { customer: "Dakota B.", status: "active", plan: "Gold", periodEndDays: 2, provider: "stripe", id: "sub_4RP9J" },
          { customer: "Quinn L.", status: "inactive", plan: "—", periodEndDays: -120, provider: "—", id: "—" },
        ].map((s) => {
          const end = new Date();
          end.setDate(end.getDate() + s.periodEndDays);
          return { ...s, periodEnd: end };
        });

        const upcoming = [
          { inHours: 3, client: "Taylor G.", stylist: "Avery", service: "Color + blowout", status: "scheduled", notes: "Tone cool" },
          { inHours: 5, client: "Riley M.", stylist: "Jordan", service: "Mens cut", status: "scheduled", notes: "Clipper fade" },
          { inHours: 8, client: "Morgan K.", stylist: "Sam", service: "Balayage", status: "scheduled", notes: "High lift" },
          { inHours: 11, client: "Chris P.", stylist: "Riley", service: "Beard trim", status: "scheduled", notes: "Quick" },
          { inHours: 22, client: "Jamie R.", stylist: "Casey", service: "Highlights", status: "scheduled", notes: "Consult first" },
          { inHours: 28, client: "Alex N.", stylist: "Avery", service: "Kids cut", status: "scheduled", notes: "Sensitive scalp" },
          { inHours: 31, client: "Quinn L.", stylist: "Sam", service: "Blowout", status: "scheduled", notes: "Add curls" },
          { inHours: 36, client: "Dakota B.", stylist: "Jordan", service: "Color refresh", status: "scheduled", notes: "Root touch-up" },
        ].map((b) => {
          const d = new Date();
          d.setMinutes(0, 0, 0);
          d.setHours(d.getHours() + b.inHours);
          return { ...b, startsAt: d };
        });

        const subsBreakdown = [
          { label: "Active", value: subs.filter((s) => s.status === "active").length, color: "rgba(34,197,94,0.85)" },
          { label: "Trialing", value: subs.filter((s) => s.status === "trialing").length, color: "rgba(96,165,250,0.85)" },
          { label: "Past due", value: subs.filter((s) => s.status === "past_due").length, color: "rgba(245,158,11,0.9)" },
          { label: "Canceled", value: subs.filter((s) => s.status === "canceled").length, color: "rgba(239,68,68,0.85)" },
          { label: "Inactive", value: subs.filter((s) => s.status === "inactive").length, color: "rgba(255,255,255,0.35)" },
        ];

        return { daily, bookingsByStylist, products, subs, upcoming, subsBreakdown };
      }

      function renderTables({ upcoming, products, subs }) {
        const upcomingBody = document.getElementById("tblUpcoming");
        clear(upcomingBody);
        for (const row of upcoming) {
          const tr = document.createElement("tr");
          const starts = row.startsAt.toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });
          tr.innerHTML = `
            <td>${starts}</td>
            <td>${row.client}</td>
            <td>${row.stylist}</td>
            <td>${row.service}</td>
            <td></td>
            <td>${row.notes || "—"}</td>
          `;
          const badgeCell = tr.children[4];
          badgeCell.appendChild(addBadge(row.status, row.status === "scheduled" ? "good" : ""));
          upcomingBody.appendChild(tr);
        }

        const productsBody = document.getElementById("tblProducts");
        clear(productsBody);
        const sortedProducts = [...products].sort((a, b) => b.revenueCents - a.revenueCents);
        for (const p of sortedProducts) {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${p.name}</td>
            <td>${p.sku}</td>
            <td>${number.format(p.units)}</td>
            <td>${currency.format(p.revenueCents / 100)}</td>
          `;
          productsBody.appendChild(tr);
        }

        const subsBody = document.getElementById("tblSubs");
        clear(subsBody);
        for (const s of subs) {
          const tr = document.createElement("tr");
          const end = s.periodEnd.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
          tr.innerHTML = `
            <td>${s.customer}</td>
            <td></td>
            <td>${s.plan}</td>
            <td>${end}</td>
            <td>${s.provider}</td>
            <td><code>${s.id}</code></td>
          `;
          const tone =
            s.status === "active"
              ? "good"
              : s.status === "trialing"
              ? "warn"
              : s.status === "past_due"
              ? "bad"
              : s.status === "canceled"
              ? ""
              : "";
          tr.children[1].appendChild(addBadge(s.status, tone));
          subsBody.appendChild(tr);
        }
      }

      function renderDashboard({ daily, bookingsByStylist, products, subs, upcoming, subsBreakdown }, { days }) {
        const revenueTotal = daily.reduce((sum, d) => sum + d.revenue, 0);
        const bookingsTotal = daily.reduce((sum, d) => sum + d.bookings, 0);
        const utilAvg = daily.reduce((sum, d) => sum + d.utilization, 0) / Math.max(1, daily.length);
        const activeSubs = subs.filter((s) => s.status === "active").length;

        const mid = Math.floor(daily.length / 2);
        const revPrev = daily.slice(0, mid).reduce((sum, d) => sum + d.revenue, 0);
        const revCurr = daily.slice(mid).reduce((sum, d) => sum + d.revenue, 0);
        const revDelta = revPrev ? (revCurr - revPrev) / revPrev : 0;

        const bookPrev = daily.slice(0, mid).reduce((sum, d) => sum + d.bookings, 0);
        const bookCurr = daily.slice(mid).reduce((sum, d) => sum + d.bookings, 0);
        const bookDelta = bookPrev ? (bookCurr - bookPrev) / bookPrev : 0;

        document.getElementById("kpiRevenue").textContent = currency.format(revenueTotal);
        document.getElementById("kpiRevenueDelta").textContent = fmtDelta(revCurr, revPrev, "period");

        const pill = document.getElementById("kpiRevenuePill");
        const dot = pill.querySelector(".dash-dot");
        const tone = sparkColorForDelta(revDelta);
        dot.className = `dash-dot ${tone.dot}`.trim();
        pill.style.borderColor = tone.dot === "good" ? "rgba(34,197,94,0.35)" : tone.dot === "bad" ? "rgba(239,68,68,0.35)" : "";
        pill.style.background =
          tone.dot === "good"
            ? "rgba(34,197,94,0.12)"
            : tone.dot === "bad"
            ? "rgba(239,68,68,0.12)"
            : "rgba(0,0,0,0.18)";

        document.getElementById("kpiBookings").textContent = number.format(bookingsTotal);
        document.getElementById("kpiBookingsDelta").textContent = fmtDelta(bookCurr, bookPrev, "period");

        document.getElementById("kpiUtil").textContent = percent0.format(utilAvg);
        document.getElementById("kpiUtilDelta").textContent = `Avg across ${days} days`;

        document.getElementById("kpiActiveSubs").textContent = number.format(activeSubs);
        document.getElementById("kpiActiveSubsDelta").textContent = `${number.format(subs.length)} total customers`;

        document.getElementById("metaRevenue").textContent = `${days} days · ${number.format(bookingsTotal)} bookings`;
        document.getElementById("metaSubs").textContent = `${number.format(subs.length)} customers`;
        document.getElementById("metaBookings").textContent = `Top performer: ${[...bookingsByStylist].sort((a, b) => b.bookings - a.bookings)[0].stylist}`;

        renderLineChart(document.getElementById("chartRevenue"), {
          labels: daily.map((d) => d.label),
          values: daily.map((d) => d.revenue),
          stroke: "rgba(96,165,250,0.95)",
          fill: "rgba(96,165,250,0.16)",
        });

        renderDonutChart(document.getElementById("chartSubs"), { segments: subsBreakdown });

        renderBarChart(document.getElementById("chartBookings"), {
          labels: bookingsByStylist.map((s) => s.stylist),
          values: bookingsByStylist.map((s) => s.bookings),
        });

        renderTables({ upcoming, products, subs });
      }

      function readControls() {
        const days = Number(document.getElementById("range").value);
        const location = document.getElementById("location").value;
        return { days, location };
      }

      let seed = 1337;
      function run(seedOverride) {
        const { days, location } = readControls();
        seed = typeof seedOverride === "number" ? seedOverride : seed;
        const demo = makeDemoData({ days, seed, location });
        renderDashboard(demo, { days, location });
      }

      document.getElementById("controls").addEventListener("submit", (e) => {
        e.preventDefault();
        run(seed);
      });

      document.getElementById("randomize").addEventListener("click", () => {
        run(Math.floor(Math.random() * 1e9));
      });

      run(seed);