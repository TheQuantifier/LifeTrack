import env from "./env.js";
import { pool, query as postgresQuery } from "./postgres.js";

export async function query(text, params = []) {
  if (env.sqlProvider !== "postgres") {
    throw new Error(`Unsupported SQL_PROVIDER: ${env.sqlProvider}`);
  }
  return postgresQuery(text, params);
}

export async function connectDb() {
  await pool.query("SELECT 1");
}

export async function closeDb() {
  await pool.end();
}
