interface CategoryStyle {
  icon: string;
  color: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Laticínios: { icon: "🥛", color: "#4e79a7" },
  Hortifruti: { icon: "🥦", color: "#59a14f" },
  Bebidas: { icon: "🥤", color: "#76b7b2" },
  Carnes: { icon: "🥩", color: "#e15759" },
  Padaria: { icon: "🍞", color: "#f28e2b" },
  Doces: { icon: "🍫", color: "#b07aa1" },
  Limpeza: { icon: "🧼", color: "#9c9ede" },
  Higiene: { icon: "🧴", color: "#ff9da7" },
  Farmácia: { icon: "💊", color: "#d4a017" },
  Secos: { icon: "🌾", color: "#9c755f" },
  Outros: { icon: "🛒", color: "#bab0ac" },
};

const FALLBACK: CategoryStyle = { icon: "🛒", color: "#bab0ac" };

export function getCategoryStyle(category: string | null | undefined): CategoryStyle {
  if (!category) return FALLBACK;
  return CATEGORY_STYLES[category] ?? FALLBACK;
}

export function getCategoryIcon(category: string | null | undefined): string {
  return getCategoryStyle(category).icon;
}

export function getCategoryColor(category: string | null | undefined): string {
  return getCategoryStyle(category).color;
}
