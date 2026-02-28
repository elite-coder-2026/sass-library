export type RequestLike = {
  params?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
  body?: unknown;
};

export type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
};

export type NextLike = (err?: unknown) => void;

export function parseId(raw: string | undefined): number | null {
  if (!raw) return null;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function getOptionalNumber(value: unknown): number | null {
  if (value === undefined) return null;
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  if (!Number.isFinite(n)) return null;
  return n;
}

