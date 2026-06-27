import * as cheerio from "cheerio";

export interface ParsedItem {
  description: string;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  totalPrice: number | null;
}

export interface ParsedReceipt {
  storeName: string | null;
  storeCnpj: string | null;
  storeAddress: string | null;
  issueDate: Date | null;
  total: number | null;
  paymentMethod: string | null;
  items: ParsedItem[];
}

export class FormResubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormResubmissionError";
  }
}

function toNumber(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/\./g, "").replace(",", ".");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

// The SEFAZ form re-renders itself (with an error message) when the
// CAPTCHA answer or access key is rejected, instead of returning a
// distinct HTTP status. Detect that case before attempting to parse
// receipt data out of what would otherwise look like an empty result.
function checkForFormResubmission($: cheerio.CheerioAPI) {
  if ($("#sefa-sped-form, form.sefa-sped-form").length > 0) {
    const message =
      $(".alert-danger, .messages--error, .messages.error").first().text().trim() ||
      "SEFAZ rejected the request (invalid CAPTCHA or access key).";
    throw new FormResubmissionError(message);
  }
}

// Strip a leading label like "Qtde.:" / "UN: " / "Vl. Unit.:" off a span's
// text, since SEFAZ embeds the label and value in the same node.
function afterLabel(text: string): string {
  return text.replace(/^[^:]*:\s*/, "").replace(/&nbsp;/g, "").trim();
}

export function parseReceiptHtml(html: string): ParsedReceipt {
  const $ = cheerio.load(html);
  checkForFormResubmission($);

  const storeName = $(".txtTopo").first().text().trim() || null;

  const text = $.root().text().replace(/\s+/g, " ");

  const cnpjMatch = text.match(/CNPJ:\s*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/);
  const storeCnpj = cnpjMatch?.[1] ?? null;

  let storeAddress: string | null = null;
  const addressDiv = $(".txtTopo").first().nextAll(".text").eq(1);
  if (addressDiv.length) {
    storeAddress = addressDiv
      .text()
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ");
  }

  const dateMatch = text.match(/Emiss[ãa]o:\s*(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2}:\d{2})/i);
  const issueDate = dateMatch ? new Date(`${dateMatch[1].split("/").reverse().join("-")}T${dateMatch[2]}`) : null;

  const totalText = $("#totalNota .linhaShade .totalNumb").first().text();
  const total = toNumber(totalText);

  const paymentMethod = $("#totalNota label.tx").first().text().trim() || null;

  const items: ParsedItem[] = [];
  $("#tabResult tr").each((_, row) => {
    const firstCell = $(row).find("td").first();
    if (!firstCell.length) return;

    const description = firstCell.find(".txtTit").first().text().trim();
    if (!description) return;

    const quantity = toNumber(afterLabel(firstCell.find(".Rqtd").text()));
    const unit = afterLabel(firstCell.find(".RUN").text()) || null;
    const unitPrice = toNumber(afterLabel(firstCell.find(".RvlUnit").text()));
    const totalPrice = toNumber($(row).find("td").eq(1).find(".valor").text());

    items.push({ description, quantity, unit, unitPrice, totalPrice });
  });

  return { storeName, storeCnpj, storeAddress, issueDate, total, paymentMethod, items };
}
