// src/utils/log.ts

type LogLevel = "INFO" | "WARN" | "ERROR";

const logs: string[] = [];

function formatLog(level: LogLevel, message: string): string {
  return `[${new Date().toISOString()}] [${level}] ${message}`;
}

function log(message: string): void {
  const entry = formatLog("INFO", message);
  pushLog(entry);
  console.log(entry);
}

function warn(message: string): void {
  const entry = formatLog("WARN", message);
  pushLog(entry);
  console.warn(entry);
}

function error(message: string): void {
  const entry = formatLog("ERROR", message);
  pushLog(entry);
  console.error(entry);
}

function pushLog(entry: string): void {
  logs.push(entry);
  if (logs.length > 50) logs.shift();
}

export const logger = {
  logs,
  log,
  warn,
  error,
} as const;
