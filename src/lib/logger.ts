import "server-only";
import fs from "node:fs";
import path from "node:path";
import winston from "winston";
import { env } from "@/lib/env";

const IS_PROD = env.NODE_ENV === "production";
const IS_TEST = env.NODE_ENV === "test";
const IS_SERVERLESS = !!process.env.VERCEL;

const LOG_LEVEL = env.LOG_LEVEL ?? (IS_PROD ? "info" : "debug");
const LOG_DIR = env.LOG_DIR ?? path.join(process.cwd(), "logs");

// ─── Levels ──────────────────────────────────────────────────────────────────

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
});

// ─── Formats ─────────────────────────────────────────────────────────────────

const SENSITIVE_KEYS = new Set(["password", "token", "authorization", "secret", "apikey"]);

// Mutates in-place to preserve Winston's internal Symbol properties (e.g. Symbol(level)).
// Handles nested objects and arrays of objects.
const redactInPlace = (obj: Record<string, unknown>): void => {
  for (const key of Object.keys(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      obj[key] = "[REDACTED]";
    } else if (Array.isArray(obj[key])) {
      for (const item of obj[key] as unknown[]) {
        if (item && typeof item === "object") {
          redactInPlace(item as Record<string, unknown>);
        }
      }
    } else if (obj[key] && typeof obj[key] === "object") {
      redactInPlace(obj[key] as Record<string, unknown>);
    }
  }
};

const redact = winston.format((info) => {
  redactInPlace(info as unknown as Record<string, unknown>);
  return info;
});

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const hasMeta = Object.keys(meta).length > 0;
    const metaStr = hasMeta ? `\n${JSON.stringify(meta, null, 2)}` : "";
    return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ""}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

// ─── Transports ──────────────────────────────────────────────────────────────

let logsDirCreated = false;

const ensureLogsDir = () => {
  if (logsDirCreated) return;
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  logsDirCreated = true;
};

// Builds transport list at runtime based on NODE_ENV.
// Development: console only. Production: console + rotating files.
// This keeps dev logs readable in terminal while persisting logs in prod.
const buildTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [
    new winston.transports.Console({ format: consoleFormat }),
  ];

  if (IS_PROD && !IS_SERVERLESS) {
    ensureLogsDir();

    transports.push(
      new winston.transports.File({
        filename: path.join(LOG_DIR, "error.log"),
        level: "error",
        format: fileFormat,
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(LOG_DIR, "combined.log"),
        format: fileFormat,
        maxsize: 20 * 1024 * 1024,
        maxFiles: 10,
      })
    );
  }

  return transports;
};

const buildExceptionHandlers = (): winston.transport[] => {
  if (!IS_PROD || IS_SERVERLESS) return [];
  ensureLogsDir();
  return [
    new winston.transports.File({
      filename: path.join(LOG_DIR, "exceptions.log"),
      format: fileFormat,
    }),
  ];
};

const buildRejectionHandlers = (): winston.transport[] => {
  if (!IS_PROD || IS_SERVERLESS) return [];
  ensureLogsDir();
  return [
    new winston.transports.File({
      filename: path.join(LOG_DIR, "rejections.log"),
      format: fileFormat,
    }),
  ];
};

// ─── Logger ──────────────────────────────────────────────────────────────────

const logger = winston.createLogger({
  level: LOG_LEVEL,
  levels,
  silent: IS_TEST,
  // redact() runs before any transport so sensitive keys are scrubbed from
  // both console and file output, including stdout captured in production.
  format: winston.format.combine(redact(), winston.format.errors({ stack: true })),
  transports: buildTransports(),
  exceptionHandlers: buildExceptionHandlers(),
  rejectionHandlers: buildRejectionHandlers(),
});

// ─── Child logger factory ─────────────────────────────────────────────────────
// Usage: const log = childLogger("auth"); log.info("user signed in");

export const childLogger = (service: string) => logger.child({ service });

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const logError = (message: string, error?: unknown, meta?: Record<string, unknown>) => {
  const err = error instanceof Error ? error : new Error(String(error));
  // Pass stack as a top-level key so printf renders it and JSON transport includes it.
  // JSON.stringify(Error) returns "{}" — never pass Error objects directly in meta.
  logger.error(message, { stack: err.stack, ...meta });
};

export const logHttp = (method: string, url: string, status?: number, duration?: number) => {
  logger.http(`${method} ${url}`, { status, duration });
};

export default logger;
