import pino from "pino";
import { randomUUID } from "crypto";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  base: undefined, // omit pid/hostname for cleaner logs
});

export function createRequestId() {
  return randomUUID();
}
