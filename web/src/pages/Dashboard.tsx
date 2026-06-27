import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchDashboardSummary, type DashboardSummary } from "../lib/api";
import { useLanguage } from "../i18n/LanguageContext";
import { categoryLabel } from "../i18n/translations";
import { getCategoryColor, getCategoryIcon } from "../lib/categoryStyle";
import { friendlyName } from "../lib/friendlyName";

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    fetchDashboardSummary().then(setSummary);
  }, []);

  if (!summary) return <div className="page">{t("dashboard", "loading")}</div>;

  const byCategoryTranslated = summary.byCategory.map((entry) => ({
    raw: entry.label,
    label: `${getCategoryIcon(entry.label)} ${categoryLabel(entry.label, lang)}`,
    total: entry.total,
  }));

  return (
    <div className="page">
      <h1>{t("dashboard", "title")}</h1>

      <div className="summary-cards">
        <div className="card">
          <span className="card-icon">🧾</span>
          <span className="card-label">{t("dashboard", "receiptsImported")}</span>
          <span className="card-value">{summary.receiptCount}</span>
        </div>
        <div className="card">
          <span className="card-icon">💰</span>
          <span className="card-label">{t("dashboard", "totalSpent")}</span>
          <span className="card-value">R$ {summary.grandTotal.toFixed(2)}</span>
        </div>
        <div className="card">
          <span className="card-icon">📈</span>
          <span className="card-label">{t("dashboard", "avgReceipt")}</span>
          <span className="card-value">R$ {summary.avgPerReceipt.toFixed(2)}</span>
        </div>
      </div>

      <section>
        <h2>📅 {t("dashboard", "byMonth")}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary.byMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
            <Bar dataKey="total" fill="#4e79a7" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2>🏬 {t("dashboard", "byStore")}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary.byStore} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="label" width={160} />
            <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
            <Bar dataKey="total" fill="#59a14f" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2>🏷️ {t("dashboard", "byCategory")}</h2>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={byCategoryTranslated} dataKey="total" nameKey="label" outerRadius={120} label>
              {byCategoryTranslated.map((entry) => (
                <Cell key={entry.raw} fill={getCategoryColor(entry.raw)} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2>⭐ {t("dashboard", "topItems")}</h2>
        <table className="top-items-table">
          <tbody>
            {summary.topItems.map((item) => (
              <tr key={item.description}>
                <td>{friendlyName(item.description)}</td>
                <td className="numeric">{item.occurrences}x</td>
                <td className="numeric">R$ {item.totalSpent.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
