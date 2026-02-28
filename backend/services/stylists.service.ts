import { query } from "../utility/db";

export type Stylist = {
  id: number;
  email: string;
  name: string;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateStylistInput = {
  email: string;
  name: string;
  bio?: string | null;
};

export type UpdateStylistInput = {
  email?: string | null;
  name?: string | null;
  bio?: string | null;
};

type StylistRow = {
  id: number;
  email: string;
  name: string;
  bio: string | null;
  created_at: unknown;
  updated_at: unknown;
};

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  return new Date(String(value)).toISOString();
}

function toStylist(row: StylistRow): Stylist {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    bio: row.bio,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

export async function createStylist(input: CreateStylistInput): Promise<Stylist> {
  const result = await query<StylistRow>(
    "insert into stylists (email, name, bio) values ($1, $2, $3) returning id, email, name, bio, created_at, updated_at",
    [input.email, input.name, input.bio ?? null]
  );

  return toStylist(result.rows[0]);
}

export async function getStylistById(id: number): Promise<Stylist | null> {
  const result = await query<StylistRow>(
    "select id, email, name, bio, created_at, updated_at from stylists where id = $1",
    [id]
  );

  const row = result.rows[0];
  return row ? toStylist(row) : null;
}

export async function getStylistByEmail(email: string): Promise<Stylist | null> {
  const result = await query<StylistRow>(
    "select id, email, name, bio, created_at, updated_at from stylists where email = $1",
    [email]
  );

  const row = result.rows[0];
  return row ? toStylist(row) : null;
}

export async function listStylists(options?: { limit?: number; offset?: number }): Promise<Stylist[]> {
  const limit = Math.max(1, Math.min(200, options?.limit ?? 50));
  const offset = Math.max(0, options?.offset ?? 0);

  const result = await query<StylistRow>(
    "select id, email, name, bio, created_at, updated_at from stylists order by created_at desc limit $1 offset $2",
    [limit, offset]
  );

  return result.rows.map(toStylist);
}

export async function searchStylists(options: { q: string; limit?: number }): Promise<Stylist[]> {
  const limit = Math.max(1, Math.min(200, options.limit ?? 50));
  const q = `%${options.q}%`;

  const result = await query<StylistRow>(
    "select id, email, name, bio, created_at, updated_at from stylists where email ilike $1 or name ilike $1 or bio ilike $1 order by created_at desc limit $2",
    [q, limit]
  );

  return result.rows.map(toStylist);
}

export async function updateStylist(id: number, patch: UpdateStylistInput): Promise<Stylist | null> {
  const sets: string[] = [];
  const values: unknown[] = [];

  if (patch.email !== undefined) {
    values.push(patch.email);
    sets.push(`email = $${values.length}`);
  }

  if (patch.name !== undefined) {
    values.push(patch.name);
    sets.push(`name = $${values.length}`);
  }

  if (patch.bio !== undefined) {
    values.push(patch.bio);
    sets.push(`bio = $${values.length}`);
  }

  if (sets.length === 0) return getStylistById(id);

  values.push(id);
  const result = await query<StylistRow>(
    `update stylists set ${sets.join(", ")}, updated_at = now() where id = $${values.length} returning id, email, name, bio, created_at, updated_at`,
    values
  );

  const row = result.rows[0];
  return row ? toStylist(row) : null;
}

export async function deleteStylist(id: number): Promise<boolean> {
  const result = await query<{ id: number }>("delete from stylists where id = $1 returning id", [id]);
  return result.rowCount === 1;
}

