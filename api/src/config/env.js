import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "..", "..", ".env"),
});

const boolFromEnv = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const numberFromEnv = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const csvFromEnv = (value, fallback = "") =>
  String(value || fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: numberFromEnv(process.env.PORT, 4000),
  autoRunMigrations: boolFromEnv(process.env.AUTO_RUN_MIGRATIONS, true),
  corsOrigins: csvFromEnv(process.env.CORS_ORIGIN, "http://localhost:5500,http://127.0.0.1:5500"),

  sqlProvider: (process.env.SQL_PROVIDER || "postgres").toLowerCase(),
  sqlConnectionUrl: process.env.SQL_CONNECTION_URL || "",
  sqlSsl: boolFromEnv(process.env.SQL_SSL, true),
  sqlSslAllowInvalidCerts: boolFromEnv(process.env.SQL_SSL_ALLOW_INVALID_CERTS, false),

  llmProvider: (process.env.LLM_PROVIDER || "openai-compatible").toLowerCase(),
  llmApiKey: process.env.LLM_API_KEY || "",
  llmModel: process.env.LLM_MODEL || "",
  llmBaseUrl: process.env.LLM_BASE_URL || "",
  llmClassificationPath: process.env.LLM_CLASSIFICATION_PATH || "/chat/completions",
  llmTemperature: numberFromEnv(process.env.LLM_TEMPERATURE, 0.2),

  defaultBuckets: csvFromEnv(process.env.DEFAULT_BUCKETS, "health,work,finance,relationships,growth,notes"),
};

export default env;
