import { query } from "../utility/db";

export type User = {
  id: number;
  email: string;
  username: string | null;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserInput = {
  email: string;
  username?: string | null;
  displayName?: string | null;
};

export type UpdateUserInput = {
  email?: string | null;
  username?: string | null;
  displayName?: string | null;
};

type UserRow = {
  id: number;
  email: string;
  username: string | null;
  display_name: string | null;
  created_at: Date;
  updated_at: Date;
};

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.display_name,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const result = await query<UserRow>(
    "insert into users (email, username, display_name) values ($1, $2, $3) returning id, email, username, display_name, created_at, updated_at",
    [input.email, input.username ?? null, input.displayName ?? null]
  );

  return toUser(result.rows[0]);
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await query<UserRow>(
    "select id, email, username, display_name, created_at, updated_at from users where id = $1",
    [id]
  );

  const row = result.rows[0];
  return row ? toUser(row) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<UserRow>(
    "select id, email, username, display_name, created_at, updated_at from users where email = $1",
    [email]
  );

  const row = result.rows[0];
  return row ? toUser(row) : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await query<UserRow>(
    "select id, email, username, display_name, created_at, updated_at from users where username = $1",
    [username]
  );

  const row = result.rows[0];
  return row ? toUser(row) : null;
}

export async function listUsers(options?: { limit?: number; offset?: number }): Promise<User[]> {
  const limit = Math.max(1, Math.min(200, options?.limit ?? 50));
  const offset = Math.max(0, options?.offset ?? 0);

  const result = await query<UserRow>(
    "select id, email, username, display_name, created_at, updated_at from users order by created_at desc limit $1 offset $2",
    [limit, offset]
  );

  return result.rows.map(toUser);
}

export async function searchUsers(options: { q: string; limit?: number }): Promise<User[]> {
  const limit = Math.max(1, Math.min(200, options.limit ?? 50));
  const q = `%${options.q}%`;

  const result = await query<UserRow>(
    "select id, email, username, display_name, created_at, updated_at from users where email ilike $1 or username ilike $1 or display_name ilike $1 order by created_at desc limit $2",
    [q, limit]
  );

  return result.rows.map(toUser);
}

export async function updateUser(id: number, patch: UpdateUserInput): Promise<User | null> {
  const sets: string[] = [];
  const values: unknown[] = [];

  if (patch.email !== undefined) {
    values.push(patch.email);
    sets.push(`email = $${values.length}`);
  }

  if (patch.username !== undefined) {
    values.push(patch.username);
    sets.push(`username = $${values.length}`);
  }

  if (patch.displayName !== undefined) {
    values.push(patch.displayName);
    sets.push(`display_name = $${values.length}`);
  }

  if (sets.length === 0) return getUserById(id);

  values.push(id);
  const result = await query<UserRow>(
    `update users set ${sets.join(", ")}, updated_at = now() where id = $${values.length} returning id, email, username, display_name, created_at, updated_at`,
    values
  );

  const row = result.rows[0];
  return row ? toUser(row) : null;
}

export async function deleteUser(id: number): Promise<boolean> {
  const result = await query<{ id: number }>("delete from users where id = $1 returning id", [id]);
  return result.rowCount === 1;
}
