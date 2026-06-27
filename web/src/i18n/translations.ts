export type Lang = "pt" | "en";

export const translations = {
  nav: {
    dashboard: { pt: "Painel", en: "Dashboard" },
    addReceipt: { pt: "Adicionar Nota", en: "Add Receipt" },
    history: { pt: "Histórico", en: "History" },
    comparison: { pt: "Comparação", en: "Comparison" },
  },
  dashboard: {
    title: { pt: "Painel de Gastos", en: "Spending Dashboard" },
    loading: { pt: "Carregando...", en: "Loading..." },
    receiptsImported: { pt: "Notas importadas", en: "Receipts imported" },
    totalSpent: { pt: "Total gasto", en: "Total spent" },
    byMonth: { pt: "Gastos por mês", en: "Spending by month" },
    byStore: { pt: "Gastos por loja", en: "Spending by store" },
    byCategory: { pt: "Gastos por categoria", en: "Spending by category" },
    topItems: { pt: "Itens mais comprados", en: "Most purchased items" },
    avgReceipt: { pt: "Média por nota", en: "Average per receipt" },
  },
  addReceipt: {
    title: { pt: "Adicionar Nota Fiscal (NFC-e)", en: "Add Receipt (NFC-e)" },
    accessKeyLabel: { pt: "Chave de Acesso (44 dígitos)", en: "Access Key (44 digits)" },
    loadingCaptcha: { pt: "Carregando CAPTCHA...", en: "Loading CAPTCHA..." },
    refreshCaptcha: { pt: "Atualizar CAPTCHA", en: "Refresh CAPTCHA" },
    captchaLabel: { pt: "Texto do CAPTCHA", en: "CAPTCHA text" },
    submit: { pt: "Consultar e importar", en: "Look up and import" },
    submitting: { pt: "Enviando...", en: "Submitting..." },
    duplicateNotice: { pt: "Essa nota já tinha sido importada anteriormente:", en: "This receipt was already imported:" },
    successNotice: { pt: "Nota importada com sucesso!", en: "Receipt imported successfully!" },
    store: { pt: "Loja", en: "Store" },
    date: { pt: "Data", en: "Date" },
    paymentMethod: { pt: "Forma de pagamento", en: "Payment method" },
    items: { pt: "Itens", en: "Items" },
    total: { pt: "Total", en: "Total" },
    captchaLoadError: { pt: "Falha ao carregar o CAPTCHA. Tente novamente.", en: "Failed to load CAPTCHA. Please try again." },
    submitError: { pt: "Erro ao enviar a nota.", en: "Error submitting the receipt." },
  },
  history: {
    title: { pt: "Histórico de Notas", en: "Receipt History" },
    searchPlaceholder: { pt: "Buscar por loja ou item...", en: "Search by store or item..." },
    noResults: { pt: "Nenhuma nota encontrada.", en: "No receipts found." },
    items: { pt: "itens", en: "items" },
  },
  comparison: {
    title: { pt: "Você está consumindo mais ou menos?", en: "Are you consuming more or less?" },
    month: { pt: "Mês a mês", en: "Month to month" },
    week: { pt: "Semana a semana", en: "Week to week" },
    byCategory: { pt: "Por categoria (nº de compras)", en: "By category (purchase count)" },
    byProduct: { pt: "Por produto (quantidade)", en: "By product (quantity)" },
    current: { pt: "Atual", en: "Current" },
    previous: { pt: "Anterior", en: "Previous" },
    change: { pt: "Variação", en: "Change" },
    newItem: { pt: "novo", en: "new" },
    noChange: { pt: "sem mudança", en: "no change" },
    noData: { pt: "Sem dados suficientes para comparar ainda.", en: "Not enough data to compare yet." },
  },
  categories: {
    Laticínios: { pt: "Laticínios", en: "Dairy" },
    Hortifruti: { pt: "Hortifruti", en: "Produce" },
    Bebidas: { pt: "Bebidas", en: "Beverages" },
    Carnes: { pt: "Carnes", en: "Meat" },
    Padaria: { pt: "Padaria", en: "Bakery" },
    Limpeza: { pt: "Limpeza", en: "Cleaning" },
    Higiene: { pt: "Higiene", en: "Personal Care" },
    Farmácia: { pt: "Farmácia", en: "Pharmacy" },
    Doces: { pt: "Doces", en: "Sweets & Snacks" },
    Secos: { pt: "Secos", en: "Pantry" },
    Outros: { pt: "Outros", en: "Other" },
  },
} as const;

export type TranslationKey = {
  [Section in keyof typeof translations]: keyof typeof translations[Section];
};

export function categoryLabel(category: string, lang: Lang): string {
  const entry = (translations.categories as Record<string, Record<Lang, string>>)[category];
  return entry ? entry[lang] : category;
}
