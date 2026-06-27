import "./logger.js"; // must be first — patches console + process handlers
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { captchaRouter } from "./routes/captcha.js";
import { receiptsRouter } from "./routes/receipts.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { logger } from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_PATH = path.join(__dirname, "../../log.txt");

const app = express();
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use("/api/captcha", captchaRouter);
app.use("/api/receipts", receiptsRouter);
app.use("/api/dashboard", dashboardRouter);

// Frontend error sink
app.post("/api/log", (req, res) => {
  const { level = "CLIENT", message, stack, context } = req.body ?? {};
  logger.error(`[${level}] ${message}${stack ? "\n" + stack : ""}${context ? "\nctx: " + JSON.stringify(context) : ""}`);
  res.sendStatus(204);
});

// Serve log file (must be under /api/ so the reverse proxy forwards it)
app.get("/api/log.txt", (_req, res) => {
  try {
    const content = fs.existsSync(LOG_PATH) ? fs.readFileSync(LOG_PATH, "utf-8") : "(empty)";
    res.type("text/plain").send(content);
  } catch {
    res.type("text/plain").send("(could not read log)");
  }
});

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  logger.info(`Server listening on http://localhost:${port}`);
});
