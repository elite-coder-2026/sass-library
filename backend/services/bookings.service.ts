import { query } from "../utility/db";

export type Booking = {
  id: number;
  userId: number;
  stylistId: number;
  startsAt: string;
  endsAt: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBookingInput = {
  userId: number;
  stylistId: number;
  startsAt: string;
  endsAt: string;
  status?: string;
  notes?: string | null;
};

export type UpdateBookingInput = {
  userId?: number;
  stylistId?: number;
  startsAt?: string;
  endsAt?: string;
  status?: string;
  notes?: string | null;
};

type BookingRow = {
  id: number;
  user_id: number;
  stylist_id: number;
  starts_at: unknown;
  ends_at: unknown;
  status: string;
  notes: string | null;
  created_at: unknown;
  updated_at: unknown;
};

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  return new Date(String(value)).toISOString();
}

function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    userId: row.user_id,
    stylistId: row.stylist_id,
    startsAt: toIso(row.starts_at),
    endsAt: toIso(row.ends_at),
    status: row.status,
    notes: row.notes,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const result = await query<BookingRow>(
    "insert into bookings (user_id, stylist_id, starts_at, ends_at, status, notes) values ($1, $2, $3, $4, $5, $6) returning id, user_id, stylist_id, starts_at, ends_at, status, notes, created_at, updated_at",
    [
      input.userId,
      input.stylistId,
      input.startsAt,
      input.endsAt,
      input.status ?? "scheduled",
      input.notes ?? null
    ]
  );

  return toBooking(result.rows[0]);
}

export async function getBookingById(id: number): Promise<Booking | null> {
  const result = await query<BookingRow>(
    "select id, user_id, stylist_id, starts_at, ends_at, status, notes, created_at, updated_at from bookings where id = $1",
    [id]
  );

  const row = result.rows[0];
  return row ? toBooking(row) : null;
}

export async function listBookings(options?: {
  limit?: number;
  offset?: number;
  userId?: number;
  stylistId?: number;
  status?: string;
}): Promise<Booking[]> {
  const limit = Math.max(1, Math.min(200, options?.limit ?? 50));
  const offset = Math.max(0, options?.offset ?? 0);

  const where: string[] = [];
  const values: unknown[] = [];

  if (options?.userId) {
    values.push(options.userId);
    where.push(`user_id = $${values.length}`);
  }

  if (options?.stylistId) {
    values.push(options.stylistId);
    where.push(`stylist_id = $${values.length}`);
  }

  if (options?.status) {
    values.push(options.status);
    where.push(`status = $${values.length}`);
  }

  values.push(limit);
  values.push(offset);

  const sql =
    "select id, user_id, stylist_id, starts_at, ends_at, status, notes, created_at, updated_at from bookings" +
    (where.length ? ` where ${where.join(" and ")}` : "") +
    ` order by starts_at desc limit $${values.length - 1} offset $${values.length}`;

  const result = await query<BookingRow>(sql, values);
  return result.rows.map(toBooking);
}

export async function updateBooking(id: number, patch: UpdateBookingInput): Promise<Booking | null> {
  const sets: string[] = [];
  const values: unknown[] = [];

  if (patch.userId !== undefined) {
    values.push(patch.userId);
    sets.push(`user_id = $${values.length}`);
  }

  if (patch.stylistId !== undefined) {
    values.push(patch.stylistId);
    sets.push(`stylist_id = $${values.length}`);
  }

  if (patch.startsAt !== undefined) {
    values.push(patch.startsAt);
    sets.push(`starts_at = $${values.length}`);
  }

  if (patch.endsAt !== undefined) {
    values.push(patch.endsAt);
    sets.push(`ends_at = $${values.length}`);
  }

  if (patch.status !== undefined) {
    values.push(patch.status);
    sets.push(`status = $${values.length}`);
  }

  if (patch.notes !== undefined) {
    values.push(patch.notes);
    sets.push(`notes = $${values.length}`);
  }

  if (sets.length === 0) return getBookingById(id);

  values.push(id);
  const result = await query<BookingRow>(
    `update bookings set ${sets.join(", ")}, updated_at = now() where id = $${values.length} returning id, user_id, stylist_id, starts_at, ends_at, status, notes, created_at, updated_at`,
    values
  );

  const row = result.rows[0];
  return row ? toBooking(row) : null;
}

export async function deleteBooking(id: number): Promise<boolean> {
  const result = await query<{ id: number }>("delete from bookings where id = $1 returning id", [id]);
  return result.rowCount === 1;
}

