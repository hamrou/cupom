import { useEffect, useState } from "react";
import { fetchConsumption, type ConsumptionSummary, type Granularity } from "../lib/api";
import { useLanguage } from "../i18n/LanguageContext";
import { categoryLabel } from "../i18n/translations";
import { getCategoryIcon } from "../lib/categoryStyle";
import { friendlyName } from "../lib/friendlyName";

function ChangeBadge({ changePercent, t }: { changePercent: number | null; t: ReturnType<typeof useLanguage>["t"] }) {
  if (changePercent === null) {
    return <span className="change-badge change-new">{t("comparison", "newItem")}</span>;
  }
  if (changePercent === 0) {
    return <span className="change-badge change-flat">— {t("comparison", "noChange")}</span>;
  }
  const isUp = changePercent > 0;
  return (
    <span className={`change-badge ${isUp ? "change-up" : "change-down"}`}>
      {isUp ? "▲" : "▼"} {Math.abs(changePercent).toFixed(0)}%
    </span>
  );
}

export function Comparison() {
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [summary, setSummary] = useState<ConsumptionSummary | null>(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    fetchConsumption(granularity).then(setSummary);
  }, [granularity]);

  return (
    <div className="page">
      <h1>⚖️ {t("comparison", "title")}</h1>

      <div className="granularity-toggle">
        <button className={granularity === "month" ? "active" : ""} onClick={() => setGranularity("month")}>
          {t("comparison", "month")}
        </button>
        <button className={granularity === "week" ? "active" : ""} onClick={() => setGranularity("week")}>
          {t("comparison", "week")}
        </button>
      </div>

      {!summary && <p>{t("dashboard", "loading")}</p>}

      {summary && (
        <>
          <p className="period-labels">
            {t("comparison", "previous")}: <strong>{summary.previousLabel}</strong> &nbsp;→&nbsp;{" "}
            {t("comparison", "current")}: <strong>{summary.currentLabel}</strong>
          </p>

          <section>
            <h2>🏷️ {t("comparison", "byCategory")}</h2>
            {summary.byCategory.length === 0 ? (
              <p>{t("comparison", "noData")}</p>
            ) : (
              <table className="comparison-table">
                <tbody>
                  {summary.byCategory.map((row) => (
                    <tr key={row.category}>
                      <td>
                        {getCategoryIcon(row.category)} {categoryLabel(row.category, lang)}
                      </td>
                      <td className="numeric">
                        {row.previousCount} → {row.currentCount}
                      </td>
                      <td className="numeric">
                        <ChangeBadge changePercent={row.changePercent} t={t} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section>
            <h2>🛒 {t("comparison", "byProduct")}</h2>
            {summary.byProduct.length === 0 ? (
              <p>{t("comparison", "noData")}</p>
            ) : (
              <table className="comparison-table">
                <tbody>
                  {summary.byProduct.map((row) => (
                    <tr key={row.description}>
                      <td>{friendlyName(row.description)}</td>
                      <td className="numeric">
                        {row.previousQuantity} → {row.currentQuantity} {row.unit}
                      </td>
                      <td className="numeric">
                        <ChangeBadge changePercent={row.changePercent} t={t} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
