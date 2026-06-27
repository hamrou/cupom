import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_PATH = path.join(__dirname, "../../log.txt");
const MAX_BYTES = 500_000;

function stamp() {
  return new Date().toISOString();
}

function write(level: string, msg: string) {
  const line = `[${stamp()}] [${level}] ${msg}\n`;
  process.stdout.write(line);
  try {
    // Rotate if too large
    try {
      if (fs.statSync(LOG_PATH).size > MAX_BYTES) fs.writeFileSync(LOG_PATH, "");
    } catch {}
    fs.appendFileSync(LOG_PATH, line);
  } catch {}
}

export const logger = {
  info: (msg: string) => write("INFO", msg),
  warn: (msg: string) => write("WARN", msg),
  error: (msg: string) => write("ERROR", msg),
};

// Intercept console so existing console.log/error calls also land in the file
const _log = console.log.bind(console);
const _error = console.error.bind(console);
console.log = (...args: unknown[]) => { write("INFO", args.map(String).join(" ")); };
console.error = (...args: unknown[]) => { write("ERROR", args.map(String).join(" ")); };

process.on("uncaughtException", (err) => {
  write("FATAL", `uncaughtException: ${err.stack ?? err.message}`);
});
process.on("unhandledRejection", (reason) => {
  write("FATAL", `unhandledRejection: ${String(reason)}`);
});
