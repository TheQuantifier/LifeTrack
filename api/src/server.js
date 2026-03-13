import http from "http";
import app from "./app.js";
import env from "./config/env.js";
import { closeDb, connectDb } from "./config/db.js";
import { runMigrations } from "./db/run_migrations.js";

const server = http.createServer(app);

async function start() {
  try {
    await connectDb();
    if (env.autoRunMigrations) {
      await runMigrations();
    }

    server.listen(env.port, () => {
      console.log(`LifeTracker API listening on ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start API:", error);
    process.exit(1);
  }
}

start();

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);
  server.close(async () => {
    await closeDb();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});
