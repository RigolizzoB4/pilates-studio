export const uid = () => Math.random().toString(36).slice(2, 9);

export const fmtCurrency = (v) => `R$ ${(v || 0).toFixed(2).replace(".", ",")}`;

export const toISO = (d) => d.toISOString().split("T")[0];

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export const fmtMonth = (d) =>
  new Date(d).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

export const today = () => toISO(new Date());

export function daysUntilBirthday(bd) {
  if (!bd) return 999;
  const t = new Date();
  const b = new Date(bd);
  const next = new Date(t.getFullYear(), b.getMonth(), b.getDate());
  if (next < t) next.setFullYear(t.getFullYear() + 1);
  return Math.round((next - t) / 86400000);
}
