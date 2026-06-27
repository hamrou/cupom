import { useEffect, useMemo, useState } from "react";
import { fetchReceipts, type Receipt } from "../lib/api";
import { useLanguage } from "../i18n/LanguageContext";
import { categoryLabel } from "../i18n/translations";
import { getCategoryIcon } from "../lib/categoryStyle";
import { friendlyName } from "../lib/friendlyName";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function ReceiptHistory() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { t, lang } = useLanguage();

  useEffect(() => {
    fetchReceipts().then(setReceipts);
  }, []);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return receipts;
    return receipts.filter((receipt) => {
      const storeMatch = receipt.storeName ? normalize(receipt.storeName).includes(needle) : false;
      const itemMatch = receipt.items.some((item) => normalize(item.description).includes(needle));
      return storeMatch || itemMatch;
    });
  }, [receipts, query]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="page">
      <h1>📜 {t("history", "title")}</h1>

      <input
        type="text"
        className="history-search"
        placeholder={t("history", "searchPlaceholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 && <p>{t("history", "noResults")}</p>}

      <ul className="receipt-list">
        {filtered.map((receipt) => {
          const isOpen = expanded.has(receipt.id);
          return (
            <li key={receipt.id} className="receipt-list-item">
              <button className="receipt-list-header" onClick={() => toggle(receipt.id)}>
                <span className="receipt-list-icon">🏪</span>
                <span className="receipt-list-store">{receipt.storeName ?? "—"}</span>
                <span className="receipt-list-date">
                  {receipt.issueDate ? new Date(receipt.issueDate).toLocaleDateString("pt-BR") : "—"}
                </span>
                <span className="receipt-list-count">
                  {receipt.items.length} {t("history", "items")}
                </span>
                <span className="receipt-list-total">R$ {receipt.total?.toFixed(2) ?? "?"}</span>
              </button>

              {isOpen && (
                <ul className="receipt-summary-items">
                  {receipt.items.map((item) => (
                    <li key={item.id}>
                      <span>
                        {getCategoryIcon(item.category)} {friendlyName(item.description)}{" "}
                        {item.category && <span className="item-category">({categoryLabel(item.category, lang)})</span>}
                      </span>
                      <span>
                        {item.quantity} {item.unit} × R$ {item.unitPrice?.toFixed(2)} ={" "}
                        <strong>R$ {item.totalPrice?.toFixed(2)}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
