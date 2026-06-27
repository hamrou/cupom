import { useEffect, useState } from "react";
import { createCaptchaSession, submitReceipt, type CaptchaSession, type Receipt } from "../lib/api";
import { isAxiosError } from "axios";
import { useLanguage } from "../i18n/LanguageContext";
import { categoryLabel } from "../i18n/translations";
import { getCategoryIcon } from "../lib/categoryStyle";
import { friendlyName } from "../lib/friendlyName";
import { QrScanner } from "../components/QrScanner";

type SubmitResult =
  | { kind: "success"; receipt: Receipt; duplicate: boolean }
  | { kind: "error"; message: string };

export function AddReceipt() {
  const [session, setSession] = useState<CaptchaSession | null>(null);
  const [accessKey, setAccessKey] = useState("");
  const [captchaResponse, setCaptchaResponse] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const { t, lang } = useLanguage();

  async function loadCaptcha() {
    setCaptchaLoading(true);
    try {
      const newSession = await createCaptchaSession();
      setSession(newSession);
      setCaptchaResponse("");
    } catch {
      setResult({ kind: "error", message: t("addReceipt", "captchaLoadError") });
    } finally {
      setCaptchaLoading(false);
    }
  }

  useEffect(() => {
    loadCaptcha();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    setSubmitting(true);
    setResult(null);
    try {
      const receipt = await submitReceipt({
        sessionId: session.sessionId,
        accessKey: accessKey.replace(/\s+/g, ""),
        captchaResponse: captchaResponse.trim(),
      });
      setResult({ kind: "success", receipt, duplicate: false });
      setAccessKey("");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409 && err.response.data?.receipt) {
        setResult({ kind: "success", receipt: err.response.data.receipt, duplicate: true });
      } else if (isAxiosError(err)) {
        setResult({ kind: "error", message: err.response?.data?.error ?? t("addReceipt", "submitError") });
      } else {
        setResult({ kind: "error", message: t("addReceipt", "submitError") });
      }
    } finally {
      setSubmitting(false);
      await loadCaptcha();
    }
  }

  return (
    <div className="page">
      <h1>🧾 {t("addReceipt", "title")}</h1>

      {scanning && (
        <QrScanner
          onScan={(key) => {
            setAccessKey(key);
            setScanning(false);
          }}
          onClose={() => setScanning(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="add-receipt-form">
        <label>
          {t("addReceipt", "accessKeyLabel")}
          <div className="access-key-row">
            <input
              type="text"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              maxLength={56}
              required
              placeholder="4126067618940060029276512200054548010066..."
            />
            <button type="button" className="scan-btn" onClick={() => setScanning(true)} title="Scan QR code">
              📷
            </button>
          </div>
        </label>

        <div className="captcha-block">
          {session ? (
            <img src={session.captchaImageUrl} alt="CAPTCHA" />
          ) : (
            <div className="captcha-placeholder">{t("addReceipt", "loadingCaptcha")}</div>
          )}
          <button type="button" onClick={loadCaptcha} disabled={captchaLoading}>
            {t("addReceipt", "refreshCaptcha")}
          </button>
        </div>

        <label>
          {t("addReceipt", "captchaLabel")}
          <input
            type="text"
            value={captchaResponse}
            onChange={(e) => setCaptchaResponse(e.target.value)}
            required
            autoComplete="off"
          />
        </label>

        <button type="submit" disabled={!session || submitting}>
          {submitting ? t("addReceipt", "submitting") : t("addReceipt", "submit")}
        </button>
      </form>

      {result?.kind === "error" && <p className="message error">{result.message}</p>}

      {result?.kind === "success" && (
        <div className="message success receipt-summary">
          <p className="receipt-summary-title">
            {result.duplicate ? t("addReceipt", "duplicateNotice") : t("addReceipt", "successNotice")}
          </p>
          <dl>
            <dt>🏪 {t("addReceipt", "store")}</dt>
            <dd>{result.receipt.storeName ?? "—"}</dd>
            <dt>📅 {t("addReceipt", "date")}</dt>
            <dd>{result.receipt.issueDate ? new Date(result.receipt.issueDate).toLocaleString("pt-BR") : "—"}</dd>
            <dt>💳 {t("addReceipt", "paymentMethod")}</dt>
            <dd>{result.receipt.paymentMethod ?? "—"}</dd>
            <dt>📦 {t("addReceipt", "items")}</dt>
            <dd>{result.receipt.items.length}</dd>
            <dt>💰 {t("addReceipt", "total")}</dt>
            <dd>R$ {result.receipt.total?.toFixed(2) ?? "?"}</dd>
          </dl>
          <ul className="receipt-summary-items">
            {result.receipt.items.map((item) => (
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
        </div>
      )}
    </div>
  );
}
