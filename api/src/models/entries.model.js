import { query } from "../config/db.js";

export async function createEntry({ categoryId, text, createdAt }) {
  const result = await query(
    `
      INSERT INTO life_entries (category_id, source_text, created_at, updated_at)
      VALUES ($1, $2, $3, $3)
      RETURNING id, category_id, source_text, created_at, updated_at;
    `,
    [categoryId, text, createdAt]
  );

  return result.rows[0];
}

export async function listEntries() {
  const result = await query(
    `
      SELECT
        e.id,
        e.source_text AS text,
        e.created_at AS "createdAt",
        c.bucket,
        c.name AS category
      FROM life_entries e
      JOIN life_categories c ON c.id = e.category_id
      ORDER BY e.created_at DESC, e.id DESC;
    `
  );

  return result.rows;
}
