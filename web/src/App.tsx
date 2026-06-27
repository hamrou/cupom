import { NavLink, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { AddReceipt } from "./pages/AddReceipt";
import { ReceiptHistory } from "./pages/ReceiptHistory";
import { Comparison } from "./pages/Comparison";
import { useLanguage } from "./i18n/LanguageContext";

function App() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="app">
      <nav className="nav">
        <span className="brand">🛒 Mercado</span>
        <NavLink to="/" end>
          📊 {t("nav", "dashboard")}
        </NavLink>
        <NavLink to="/receipts">📜 {t("nav", "history")}</NavLink>
        <NavLink to="/comparison">⚖️ {t("nav", "comparison")}</NavLink>
        <NavLink to="/add">➕ {t("nav", "addReceipt")}</NavLink>
        <div className="lang-switcher">
          <button className={lang === "pt" ? "active" : ""} onClick={() => setLang("pt")}>
            PT
          </button>
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
            EN
          </button>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/receipts" element={<ReceiptHistory />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/add" element={<AddReceipt />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
