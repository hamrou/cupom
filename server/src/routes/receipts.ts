import { Router } from "express";
import { submitNfceForm } from "../services/sefazSession.js";
import { parseReceiptHtml, FormResubmissionError } from "../services/receiptParser.js";
import { categorize } from "../services/categorize.js";
import { prisma } from "../prisma.js";

export const receiptsRouter = Router();

receiptsRouter.post("/", async (req, res) => {
  const { sessionId, accessKey, captchaResponse } = req.body as {
    sessionId?: string;
    accessKey?: string;
    captchaResponse?: string;
  };

  if (!sessionId || !accessKey || !captchaResponse) {
    res.status(400).json({ error: "sessionId, accessKey and captchaResponse are required" });
    return;
  }

  const normalizedAccessKey = accessKey.replace(/\s+/g, "");

  const existing = await prisma.receipt.findUnique({
    where: { accessKey: normalizedAccessKey },
    include: { items: true },
  });
  if (existing) {
    res.status(409).json({ error: "Receipt already imported", receipt: existing });
    return;
  }

  let html: string;
  try {
    html = await submitNfceForm(sessionId, normalizedAccessKey, captchaResponse);
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
    return;
  }

  try {
    const parsed = parseReceiptHtml(html);

    const receipt = await prisma.receipt.create({
      data: {
        accessKey: normalizedAccessKey,
        storeName: parsed.storeName,
        storeCnpj: parsed.storeCnpj,
        storeAddress: parsed.storeAddress,
        issueDate: parsed.issueDate,
        total: parsed.total,
        paymentMethod: parsed.paymentMethod,
        rawHtml: html,
        items: {
          create: parsed.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            category: categorize(item.description),
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json(receipt);
  } catch (err) {
    if (err instanceof FormResubmissionError) {
      res.status(422).json({ error: err.message, retry: true });
      return;
    }
    res.status(500).json({ error: (err as Error).message });
  }
});

receiptsRouter.get("/", async (_req, res) => {
  const receipts = await prisma.receipt.findMany({
    orderBy: { issueDate: "desc" },
    include: { items: true },
  });
  res.json(receipts);
});

receiptsRouter.get("/:id", async (req, res) => {
  const receipt = await prisma.receipt.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!receipt) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(receipt);
});
