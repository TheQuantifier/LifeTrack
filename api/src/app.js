import express from "express";
import cors from "cors";
import morgan from "morgan";
import env from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

if (env.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS: origin not allowed"));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);
app.use(errorHandler);

export default app;
