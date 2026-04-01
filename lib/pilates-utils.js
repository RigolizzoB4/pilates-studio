export const uid = () => Math.random().toString(36).slice(2, 9);

export const fmtCurrency = (v) => `R$ ${(v || 0).toFixed(2).replace(".", ",")}`;

export function daysUntilBirthday(bd) {
  if (!bd) return 999;
  const t = new Date();
  const b = new Date(bd);
  const next = new Date(t.getFullYear(), b.getMonth(), b.getDate());
  if (next < t) next.setFullYear(t.getFullYear() + 1);
  return Math.round((next - t) / 86400000);
}
