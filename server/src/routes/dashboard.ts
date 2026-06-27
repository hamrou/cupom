import { Router } from "express";
import { prisma } from "../prisma.js";
import { getCurrentAndPreviousPeriod, type Granularity } from "../services/periods.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (_req, res) => {
  const receipts = await prisma.receipt.findMany({ include: { items: true } });

  const byMonth = new Map<string, number>();
  const byStore = new Map<string, number>();
  const byCategory = new Map<string, number>();
  const byItem = new Map<string, { totalSpent: number; totalQuantity: number; occurrences: number }>();

  for (const receipt of receipts) {
    const monthKey = receipt.issueDate
      ? `${receipt.issueDate.getFullYear()}-${String(receipt.issueDate.getMonth() + 1).padStart(2, "0")}`
      : "unknown";
    byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + (receipt.total ?? 0));

    const storeKey = receipt.storeName ?? "Desconhecido";
    byStore.set(storeKey, (byStore.get(storeKey) ?? 0) + (receipt.total ?? 0));

    for (const item of receipt.items) {
      const categoryKey = item.category ?? "Outros";
      byCategory.set(categoryKey, (byCategory.get(categoryKey) ?? 0) + (item.totalPrice ?? 0));

      const itemEntry = byItem.get(item.description) ?? { totalSpent: 0, totalQuantity: 0, occurrences: 0 };
      itemEntry.totalSpent += item.totalPrice ?? 0;
      itemEntry.totalQuantity += item.quantity ?? 0;
      itemEntry.occurrences += 1;
      byItem.set(item.description, itemEntry);
    }
  }

  const toSortedArray = (map: Map<string, number>) =>
    Array.from(map.entries())
      .map(([label, total]) => ({ label, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => a.label.localeCompare(b.label));

  const topItems = Array.from(byItem.entries())
    .map(([description, stats]) => ({
      description,
      totalSpent: Math.round(stats.totalSpent * 100) / 100,
      totalQuantity: Math.round(stats.totalQuantity * 100) / 100,
      occurrences: stats.occurrences,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  const grandTotal = Math.round(receipts.reduce((sum, r) => sum + (r.total ?? 0), 0) * 100) / 100;

  res.json({
    receiptCount: receipts.length,
    grandTotal,
    avgPerReceipt: receipts.length > 0 ? Math.round((grandTotal / receipts.length) * 100) / 100 : 0,
    byMonth: toSortedArray(byMonth),
    byStore: toSortedArray(byStore).sort((a, b) => b.total - a.total),
    byCategory: toSortedArray(byCategory).sort((a, b) => b.total - a.total),
    topItems,
  });
});

function changePercent(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

dashboardRouter.get("/consumption", async (req, res) => {
  const granularity: Granularity = req.query.granularity === "week" ? "week" : "month";
  const { current, previous } = getCurrentAndPreviousPeriod(granularity);

  const receipts = await prisma.receipt.findMany({
    where: { issueDate: { gte: previous.start, lt: current.end } },
    include: { items: true },
  });

  const categoryCounts = { current: new Map<string, number>(), previous: new Map<string, number>() };
  const productQuantities = {
    current: new Map<string, { quantity: number; unit: string | null }>(),
    previous: new Map<string, { quantity: number; unit: string | null }>(),
  };

  for (const receipt of receipts) {
    if (!receipt.issueDate) continue;
    const bucket = receipt.issueDate >= current.start ? "current" : "previous";

    for (const item of receipt.items) {
      const categoryKey = item.category ?? "Outros";
      categoryCounts[bucket].set(categoryKey, (categoryCounts[bucket].get(categoryKey) ?? 0) + 1);

      const entry = productQuantities[bucket].get(item.description) ?? { quantity: 0, unit: item.unit };
      entry.quantity += item.quantity ?? 0;
      productQuantities[bucket].set(item.description, entry);
    }
  }

  const allCategories = new Set([...categoryCounts.current.keys(), ...categoryCounts.previous.keys()]);
  const byCategory = Array.from(allCategories)
    .map((category) => {
      const currentCount = categoryCounts.current.get(category) ?? 0;
      const previousCount = categoryCounts.previous.get(category) ?? 0;
      return {
        category,
        currentCount,
        previousCount,
        changePercent: changePercent(currentCount, previousCount),
      };
    })
    .sort((a, b) => b.currentCount - a.currentCount);

  const allProducts = new Set([...productQuantities.current.keys(), ...productQuantities.previous.keys()]);
  const byProduct = Array.from(allProducts)
    .map((description) => {
      const currentEntry = productQuantities.current.get(description);
      const previousEntry = productQuantities.previous.get(description);
      const currentQuantity = Math.round((currentEntry?.quantity ?? 0) * 100) / 100;
      const previousQuantity = Math.round((previousEntry?.quantity ?? 0) * 100) / 100;
      return {
        description,
        unit: currentEntry?.unit ?? previousEntry?.unit ?? null,
        currentQuantity,
        previousQuantity,
        changePercent: changePercent(currentQuantity, previousQuantity),
      };
    })
    .filter((entry) => entry.currentQuantity > 0 || entry.previousQuantity > 0)
    .sort((a, b) => b.currentQuantity - a.currentQuantity);

  res.json({
    granularity,
    currentLabel: current.label,
    previousLabel: previous.label,
    byCategory,
    byProduct,
  });
});
