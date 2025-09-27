import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
// pino-http is CJS; in ESM we need default import resolution workaround
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pinoHttpCjs from "pino-http";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// Handle both ESM transpiled and CJS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pinoHttp: any =
  (pinoHttpCjs as any)?.default || pinoHttpCjs || require("pino-http");
import path from "path";
import { loadEnv } from "./config/env.js";
import { connectDb } from "./config/database.js";
import router from "./routes/index.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger, createRequestId } from "./utils/logger.js";

loadEnv();

async function initDb(retries = 5, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await connectDb();
      return;
    } catch (err: any) {
      console.error(
        `[db] Connection failed (${i + 1}/${retries}):`,
        err?.message || err
      );
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  console.error(
    "[db] All retries failed. Continuing without DB (API will error on data routes)"
  );
}
initDb();

const app = express();
app.use(helmet());
// Apply gzip/deflate (and brotli if supported via Node) compression early
app.use(
  compression({
    threshold: 1024, // only compress responses >1KB
    filter: (req: express.Request, res: express.Response) => {
      if (req.headers["x-no-compress"]) return false;
      return compression.filter(req, res);
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static serving of uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const origins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true, credentials: true }));
// @ts-ignore types mismatch: pino-http exports a function as commonjs default
app.use(
  pinoHttp({
    logger,
    genReqId: (req: any) => req.headers["x-request-id"] || createRequestId(),
    customSuccessMessage: function () {
      return "request completed";
    },
    customErrorMessage: function () {
      return "request errored";
    },
    customLogLevel: function (_req: any, res: any, err: any) {
      if (err) return "error";
      if (res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Root route mô tả nhanh API
app.get("/", (_req, res) => {
  res.json({
    name: "OldMarket API",
    status: "ok",
    time: new Date().toISOString(),
    health: "/health",
    apiBase: "/api",
    docs: "/openapi.yaml",
  });
});

// Phục vụ file openapi.yaml để tiện xem trực tiếp
app.get("/openapi.yaml", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "openapi.yaml"));
});

app.use("/api", router);
app.use(notFound);
app.use(errorHandler);

export default app;
