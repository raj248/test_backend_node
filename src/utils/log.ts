// src/utils/log.ts
import winston from "winston";
import util from "util";
type LogLevel = "LOG" | "INFO" | "WARN" | "ERROR";

const logs: string[] = [];

function formatLog(level: LogLevel, message: string): string {
  return `[${new Date().toISOString()}] [${level}] ${message}`;
}

function pushLog(entry: string): void {
  logs.push(entry);
  if (logs.length > 50) logs.shift();
}

// Winston Logger Configuration
const winstonLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let parsedMessage = message;
      if (typeof message === "string") {
        try {
          parsedMessage = JSON.parse(message);
        } catch {
          // Keep as string if not JSON
        }
      }

      const messageString =
        typeof parsedMessage === "object"
          ? (process.env.NODE_ENV === "development"
            ? util.inspect(parsedMessage, { depth: null, colors: true })
            : JSON.stringify(parsedMessage))
          : parsedMessage;


      const metaString =
        Object.keys(meta).length > 0
          ? (process.env.NODE_ENV === "development"
            ? util.inspect(meta, { depth: null, colors: true })
            : JSON.stringify(meta))
          : "";


      return `[${timestamp}] [${level.toUpperCase()}] ${messageString}${metaString ? `\n${metaString}` : ""}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

// Logging functions
function log(message: any): void {
  const entry = formatLog("LOG", message);
  pushLog(entry);
  winstonLogger.info(message);
}

function info(message: any): void {
  const entry = formatLog("INFO", message);
  pushLog(entry);
  winstonLogger.info(message);
}

function warn(message: any): void {
  const entry = formatLog("WARN", message);
  pushLog(entry);
  winstonLogger.warn(message);
}

function error(message: any): void {
  const entry = formatLog("ERROR", message);
  pushLog(entry);
  winstonLogger.error(message);
}

export const logger = {
  logs,
  log,
  info,
  warn,
  error,
} as const;
