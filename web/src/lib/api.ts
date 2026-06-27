import axios from "axios";

export const api = axios.create({ baseURL: "/api" });

export interface CaptchaSession {
  sessionId: string;
  captchaImageUrl: string;
}

export interface Item {
  id: string;
  description: string;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  totalPrice: number | null;
  category: string | null;
}

export interface Receipt {
  id: string;
  accessKey: string;
  storeName: string | null;
  storeCnpj: string | null;
  storeAddress: string | null;
  issueDate: string | null;
  total: number | null;
  paymentMethod: string | null;
  items: Item[];
}

export interface TopItem {
  description: string;
  totalSpent: number;
  totalQuantity: number;
  occurrences: number;
}

export interface DashboardSummary {
  receiptCount: number;
  grandTotal: number;
  avgPerReceipt: number;
  byMonth: { label: string; total: number }[];
  byStore: { label: string; total: number }[];
  byCategory: { label: string; total: number }[];
  topItems: TopItem[];
}

export async function createCaptchaSession(): Promise<CaptchaSession> {
  const { data } = await api.post<CaptchaSession>("/captcha/session");
  return data;
}

export async function submitReceipt(params: {
  sessionId: string;
  accessKey: string;
  captchaResponse: string;
}): Promise<Receipt> {
  const { data } = await api.post<Receipt>("/receipts", params);
  return data;
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/dashboard/summary");
  return data;
}

export async function fetchReceipts(): Promise<Receipt[]> {
  const { data } = await api.get<Receipt[]>("/receipts");
  return data;
}

export type Granularity = "month" | "week";

export interface CategoryConsumption {
  category: string;
  currentCount: number;
  previousCount: number;
  changePercent: number | null;
}

export interface ProductConsumption {
  description: string;
  unit: string | null;
  currentQuantity: number;
  previousQuantity: number;
  changePercent: number | null;
}

export interface ConsumptionSummary {
  granularity: Granularity;
  currentLabel: string;
  previousLabel: string;
  byCategory: CategoryConsumption[];
  byProduct: ProductConsumption[];
}

export async function fetchConsumption(granularity: Granularity): Promise<ConsumptionSummary> {
  const { data } = await api.get<ConsumptionSummary>("/dashboard/consumption", { params: { granularity } });
  return data;
}
