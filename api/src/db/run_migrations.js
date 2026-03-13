import { query } from "../config/db.js";

const statements = [
  `
    CREATE TABLE IF NOT EXISTS life_categories (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      bucket TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (bucket, name)
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS life_entries (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      category_id BIGINT NOT NULL REFERENCES life_categories(id) ON DELETE CASCADE,
      source_text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_life_entries_created_at
    ON life_entries (created_at DESC);
  `,
];

export async function runMigrations() {
  for (const statement of statements) {
    await query(statement);
  }
}

if (process.argv[1]?.endsWith("run_migrations.js")) {
  runMigrations()
    .then(() => {
      console.log("Migrations complete.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
