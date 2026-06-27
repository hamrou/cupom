import express from "express";
import cors from "cors";
import { captchaRouter } from "./routes/captcha.js";
import { receiptsRouter } from "./routes/receipts.js";
import { dashboardRouter } from "./routes/dashboard.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/captcha", captchaRouter);
app.use("/api/receipts", receiptsRouter);
app.use("/api/dashboard", dashboardRouter);

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
