// Receipt item descriptions come from store POS systems abbreviated and in
// ALL CAPS (e.g. "IOG.FRIMESA", "QJ PARM IPANEMA RA"). This expands the
// common abbreviations we've actually seen and title-cases the rest, purely
// for display — the raw description is still what's stored/searched/matched.
const ABBREVIATIONS: Record<string, string> = {
  iog: "Iogurte",
  qj: "Queijo",
  mant: "Manteiga",
  lact: "Lácteo",
  beb: "Bebida",
  lactea: "Láctea",
  ext: "Extrato",
  cobert: "Cobertura",
  acuc: "Açúcar",
  limp: "Limpador",
  fra: "Fralda",
  hug: "Huggies",
  tint: "Tintura",
  bco: "Branco",
  gd: "Grande",
  comp: "Comprimidos",
  xpe: "Xarope",
  ge: "Genérico",
};

function titleCaseWord(word: string): string {
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function friendlyName(description: string): string {
  const normalized = description
    .toLowerCase()
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized
    .split(" ")
    .map((word) => ABBREVIATIONS[word] ?? titleCaseWord(word))
    .join(" ");
}
