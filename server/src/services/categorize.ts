const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Laticínios: [
    "leite", "queijo", "qj ", "iogurte", "iog.", "iog ", "manteiga", "mant.", "mant ", "requeijao", "requeijão",
    "nata", "lact", "creme leite", "ovo",
  ],
  Hortifruti: [
    "banana", "maca", "maçã", "mamao", "mamão", "manga", "uva", "tomate", "alface", "couve",
    "pimentao", "pimentão", "cebola", "batata", "cenoura", "espinafre", "cogumelo", "champignon", "limao", "limão",
    "laranja", "abacate", "abobrinha", "beterraba", "hortela", "hortelã", "alho", "pepino", "rabanete",
    "salsa", "tamara", "tâmara",
  ],
  Bebidas: ["suco", "refrigerante", "cerveja", "vinho", "agua", "água", "cha ", "chá", "bebida", "cafe", "café"],
  Carnes: ["carne", "frango", "boi", "peixe", "linguica", "linguiça", "bacon", "presunto", "salsicha"],
  Padaria: ["pao", "pão", "bolo", "biscoito", "torrada", "bisnag", "waf "],
  Doces: ["chocolate", "choc", "lacta", "bombom", "bala", "cobert.", "cobertura", "lays", "batata chips"],
  Limpeza: ["detergente", "sabao", "sabão", "amaciante", "desinfetante", "alvejante", "limp.", "esponja", "des har"],
  Higiene: [
    "shampoo", "sabonete", "creme dental", "papel higienico", "papel higiênico", "absorvente",
    "fralda", "fra hug", "tintura", "tint.natucor",
  ],
  Farmácia: [
    "ibuprofeno", "rinosoro", "fisiol", "deslorat", "curativo", "esomeprazol", "omega 3", "dipirona",
    "paracetamol", "vitamina", "antialergico", " comp ", "xpe",
  ],
  Secos: [
    "arroz", "feijao", "feijão", "macarrao", "macarrão", "farinha", "acuc", "sal ", "oleo", "óleo",
    "castanha", "amendoa", "amêndoa", "cereal", "fermento", "granel", "extrato", "ext tom",
  ],
};

export function categorize(description: string): string {
  const normalized = ` ${description.toLowerCase()} `;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }
  return "Outros";
}
