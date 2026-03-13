import pg from "pg";
import env from "./env.js";

const { Pool } = pg;

if (!env.sqlConnectionUrl) {
  throw new Error("SQL_CONNECTION_URL is required.");
}

export const pool = new Pool({
  connectionString: env.sqlConnectionUrl,
  ssl: env.sqlSsl ? { rejectUnauthorized: !env.sqlSslAllowInvalidCerts } : false,
});

export async function query(text, params = []) {
  return pool.query(text, params);
}
