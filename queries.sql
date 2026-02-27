-- queries.sql
-- Utility SQL to pull *all rows* from a real database when you don't yet know the schema.
-- Pick the section that matches your database (Postgres / MySQL / SQLite).

-- ============================================================
-- PostgreSQL
-- ============================================================

-- ============================================================
-- Bookkeeping dashboard (demo/other-tables.html)
-- ============================================================
-- This section pulls the numbers used by the "Bookkeeping" demo:
-- - Revenue by week (last 8 weeks) bar chart
-- - Expense split (month-to-date) donut chart (top 3 categories)
--
-- Assumed tables/columns (rename to match your schema):
-- - orders(created_at timestamptz, total numeric)                -- revenue
-- - expenses(incurred_at timestamptz, category text, amount numeric) -- expenses
--
-- Output matches the shape expected by demo/other-tables.html’s charts:
-- - revenueByWeek: [{ week_start, total, v, label }]
-- - expenseSplit:  [{ category, total, pct, dash, offset }]
--
-- Notes:
-- - `v` is a 0–100 value used by the CSS bar height: `height: calc(var(--v) * 1%)`
-- - Donut uses r=44 (circumference ≈ 276). `dash` is segment length, `offset` is cumulative negative offset.

WITH
  constants AS (
    SELECT
      276::numeric AS donut_circumference,
      date_trunc('week', current_date)::date AS this_week_start,
      date_trunc('month', current_date)::date AS month_start,
      (date_trunc('month', current_date) + interval '1 month')::date AS next_month_start
  ),
  revenue_by_week AS (
    SELECT
      date_trunc('week', o.created_at)::date AS week_start,
      COALESCE(SUM(o.total), 0)::numeric AS total
    FROM orders o
    CROSS JOIN constants c
    WHERE o.created_at >= (c.this_week_start - interval '7 weeks')
      AND o.created_at < (c.this_week_start + interval '1 week')
    GROUP BY 1
    ORDER BY 1
  ),
  revenue_norm AS (
    SELECT
      r.week_start,
      r.total,
      NULLIF(MAX(r.total) OVER (), 0) AS max_total
    FROM revenue_by_week r
  ),
  expense_mtd AS (
    SELECT
      e.category,
      COALESCE(SUM(e.amount), 0)::numeric AS total
    FROM expenses e
    CROSS JOIN constants c
    WHERE e.incurred_at >= c.month_start
      AND e.incurred_at < c.next_month_start
    GROUP BY 1
  ),
  expense_top3 AS (
    SELECT
      category,
      total,
      SUM(total) OVER () AS grand_total,
      ROW_NUMBER() OVER (ORDER BY total DESC, category ASC) AS rn
    FROM expense_mtd
  ),
  expense_segments AS (
    SELECT
      t.category,
      t.total,
      CASE WHEN t.grand_total = 0 THEN 0 ELSE (t.total / t.grand_total) END AS pct_raw,
      c.donut_circumference
    FROM expense_top3 t
    CROSS JOIN constants c
    WHERE t.rn <= 3
    ORDER BY t.total DESC, t.category ASC
  ),
  expense_geom AS (
    SELECT
      s.category,
      s.total,
      ROUND(s.pct_raw * 100)::int AS pct,
      ROUND(s.pct_raw * s.donut_circumference)::int AS dash,
      (-1 * COALESCE(SUM(ROUND(s.pct_raw * s.donut_circumference)::int) OVER (
        ORDER BY s.total DESC, s.category ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
      ), 0))::int AS offset
    FROM expense_segments s
  )
SELECT json_build_object(
  'revenueByWeek', (
    SELECT json_agg(
      json_build_object(
        'week_start', week_start,
        'total', total,
        'v', CASE WHEN max_total IS NULL THEN 0 ELSE ROUND(100 * total / max_total)::int END,
        'label', to_char(week_start, 'Mon DD')
      )
      ORDER BY week_start
    )
    FROM revenue_norm
  ),
  'expenseSplit', (
    SELECT json_agg(
      json_build_object(
        'category', category,
        'total', total,
        'pct', pct,
        'dash', dash,
        'offset', offset
      )
      ORDER BY total DESC, category ASC
    )
    FROM expense_geom
  )
) AS dashboard_json;

