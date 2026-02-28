import { Pool, type PoolConfig } from "pg";

let pool: Pool | null = null;

function buildConfigFromEnv(): PoolConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) return { connectionString: databaseUrl };

  const host = process.env.PGHOST;
  const port = process.env.PGPORT ? Number(process.env.PGPORT) : undefined;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const database = process.env.PGDATABASE;

  return { host, port, user, password, database };
}

export function getPool(): Pool {
  if (pool) return pool;
  pool = new Pool(buildConfigFromEnv());
  return pool;
}

export async function query<T = unknown>(text: string, values?: unknown[]) {
  return getPool().query<T>(text, values);
}

