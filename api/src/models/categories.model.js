import { query } from "../config/db.js";

export async function upsertCategory(bucket, name) {
  const result = await query(
    `
      INSERT INTO life_categories (bucket, name, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (bucket, name)
      DO UPDATE SET updated_at = NOW()
      RETURNING id, bucket, name, created_at, updated_at;
    `,
    [bucket, name]
  );

  return result.rows[0];
}

export async function listCategories() {
  const result = await query(
    `
      SELECT
        c.id,
        c.bucket,
        c.name,
        COUNT(e.id)::INT AS entry_count,
        MAX(e.created_at) AS last_entry_at
      FROM life_categories c
      LEFT JOIN life_entries e ON e.category_id = c.id
      GROUP BY c.id, c.bucket, c.name
      ORDER BY c.bucket ASC, c.name ASC;
    `
  );

  return result.rows;
}
