export function daysUntilBirthday(bd: string): number {
  const t = new Date()
  const b = new Date(bd)
  const next = new Date(t.getFullYear(), b.getMonth(), b.getDate())
  if (next < t) next.setFullYear(t.getFullYear() + 1)
  return Math.round((next.getTime() - t.getTime()) / 86400000)
}
