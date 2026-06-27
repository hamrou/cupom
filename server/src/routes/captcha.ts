import { Router } from "express";
import { createCaptchaSession, fetchCaptchaImage } from "../services/sefazSession.js";

export const captchaRouter = Router();

captchaRouter.post("/session", async (_req, res) => {
  try {
    const session = await createCaptchaSession();
    res.json(session);
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

captchaRouter.get("/image/:sessionId", async (req, res) => {
  try {
    const { contentType, data } = await fetchCaptchaImage(req.params.sessionId);
    res.set("Content-Type", contentType);
    res.send(data);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});
