// utils/log.ts

export const logs = [];


function formatLog(level, message) {
  return `[${new Date().toISOString()}] [${level}] ${message}`;
}

export function log(message) {
  const entry = formatLog("INFO", message);
  logs.push(entry);
  if (logs.length > 50) logs.shift();
  console.log(entry);
}

export function warn(message) {
  const entry = formatLog("WARN", message);
  logs.push(entry);
  if (logs.length > 50) logs.shift();
  console.warn(entry);
}

export function error(message) {
  const entry = formatLog("ERROR", message);
  logs.push(entry);
  if (logs.length > 50) logs.shift();
  console.error(entry);
}
