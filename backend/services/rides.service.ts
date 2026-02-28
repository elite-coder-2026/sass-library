import { query } from "../utility/db";

export type Ride = {
  id: number;
  userId: number;
  bookingId: number | null;
  pickupLabel: string | null;
  pickupAddr: string | null;
  dropoffLabel: string | null;
  dropoffAddr: string | null;
  pickupAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateRideInput = {
  userId: number;
  bookingId?: number | null;
  pickupLabel?: string | null;
  pickupAddr?: string | null;
  dropoffLabel?: string | null;
  dropoffAddr?: string | null;
  pickupAt?: string | null;
  status?: string;
};

export type UpdateRideInput = {
  userId?: number;
  bookingId?: number | null;
  pickupLabel?: string | null;
  pickupAddr?: string | null;
  dropoffLabel?: string | null;
  dropoffAddr?: string | null;
  pickupAt?: string | null;
  status?: string;
};

type RideRow = {
  id: number;
  user_id: number;
  booking_id: number | null;
  pickup_label: string | null;
  pickup_addr: string | null;
  dropoff_label: string | null;
  dropoff_addr: string | null;
  pickup_at: unknown | null;
  status: string;
  created_at: unknown;
  updated_at: unknown;
};

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  return new Date(String(value)).toISOString();
}

function toIsoOrNull(value: unknown | null): string | null {
  if (value == null) return null;
  return toIso(value);
}

function toRide(row: RideRow): Ride {
  return {
    id: row.id,
    userId: row.user_id,
    bookingId: row.booking_id,
    pickupLabel: row.pickup_label,
    pickupAddr: row.pickup_addr,
    dropoffLabel: row.dropoff_label,
    dropoffAddr: row.dropoff_addr,
    pickupAt: toIsoOrNull(row.pickup_at),
    status: row.status,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

export async function createRide(input: CreateRideInput): Promise<Ride> {
  const result = await query<RideRow>(
    "insert into rides (user_id, booking_id, pickup_label, pickup_addr, dropoff_label, dropoff_addr, pickup_at, status) values ($1, $2, $3, $4, $5, $6, $7, $8) returning id, user_id, booking_id, pickup_label, pickup_addr, dropoff_label, dropoff_addr, pickup_at, status, created_at, updated_at",
    [
      input.userId,
      input.bookingId ?? null,
      input.pickupLabel ?? null,
      input.pickupAddr ?? null,
      input.dropoffLabel ?? null,
      input.dropoffAddr ?? null,
      input.pickupAt ?? null,
      input.status ?? "requested"
    ]
  );

  return toRide(result.rows[0]);
}

export async function getRideById(id: number): Promise<Ride | null> {
  const result = await query<RideRow>(
    "select id, user_id, booking_id, pickup_label, pickup_addr, dropoff_label, dropoff_addr, pickup_at, status, created_at, updated_at from rides where id = $1",
    [id]
  );

  const row = result.rows[0];
  return row ? toRide(row) : null;
}

export async function listRides(options?: {
  limit?: number;
  offset?: number;
  userId?: number;
  bookingId?: number;
  status?: string;
}): Promise<Ride[]> {
  const limit = Math.max(1, Math.min(200, options?.limit ?? 50));
  const offset = Math.max(0, options?.offset ?? 0);

  const where: string[] = [];
  const values: unknown[] = [];

  if (options?.userId) {
    values.push(options.userId);
    where.push(`user_id = $${values.length}`);
  }

  if (options?.bookingId) {
    values.push(options.bookingId);
    where.push(`booking_id = $${values.length}`);
  }

  if (options?.status) {
    values.push(options.status);
    where.push(`status = $${values.length}`);
  }

  values.push(limit);
  values.push(offset);

  const sql =
    "select id, user_id, booking_id, pickup_label, pickup_addr, dropoff_label, dropoff_addr, pickup_at, status, created_at, updated_at from rides" +
    (where.length ? ` where ${where.join(" and ")}` : "") +
    ` order by created_at desc limit $${values.length - 1} offset $${values.length}`;

  const result = await query<RideRow>(sql, values);
  return result.rows.map(toRide);
}

export async function updateRide(id: number, patch: UpdateRideInput): Promise<Ride | null> {
  const sets: string[] = [];
  const values: unknown[] = [];

  if (patch.userId !== undefined) {
    values.push(patch.userId);
    sets.push(`user_id = $${values.length}`);
  }

  if (patch.bookingId !== undefined) {
    values.push(patch.bookingId);
    sets.push(`booking_id = $${values.length}`);
  }

  if (patch.pickupLabel !== undefined) {
    values.push(patch.pickupLabel);
    sets.push(`pickup_label = $${values.length}`);
  }

  if (patch.pickupAddr !== undefined) {
    values.push(patch.pickupAddr);
    sets.push(`pickup_addr = $${values.length}`);
  }

  if (patch.dropoffLabel !== undefined) {
    values.push(patch.dropoffLabel);
    sets.push(`dropoff_label = $${values.length}`);
  }

  if (patch.dropoffAddr !== undefined) {
    values.push(patch.dropoffAddr);
    sets.push(`dropoff_addr = $${values.length}`);
  }

  if (patch.pickupAt !== undefined) {
    values.push(patch.pickupAt);
    sets.push(`pickup_at = $${values.length}`);
  }

  if (patch.status !== undefined) {
    values.push(patch.status);
    sets.push(`status = $${values.length}`);
  }

  if (sets.length === 0) return getRideById(id);

  values.push(id);
  const result = await query<RideRow>(
    `update rides set ${sets.join(", ")}, updated_at = now() where id = $${values.length} returning id, user_id, booking_id, pickup_label, pickup_addr, dropoff_label, dropoff_addr, pickup_at, status, created_at, updated_at`,
    values
  );

  const row = result.rows[0];
  return row ? toRide(row) : null;
}

export async function deleteRide(id: number): Promise<boolean> {
  const result = await query<{ id: number }>("delete from rides where id = $1 returning id", [id]);
  return result.rowCount === 1;
}

