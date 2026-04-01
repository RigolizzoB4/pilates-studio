/** Paciente ativo sem pagamento há mais de 30 dias (inadimplência). */
export function isOverdue30Days(patient: {
  status?: string
  financial?: { payments?: { date: string; amount: number }[]; payType?: string }
}): boolean {
  if (patient.status !== "active") return false
  const payments = patient.financial?.payments || []
  if (payments.length === 0) {
    return patient.financial?.payType === "monthly" || patient.financial?.payType === "per_session"
  }
  const sorted = [...payments].sort((a, b) => b.date.localeCompare(a.date))
  const last = sorted[0]
  if (!last?.date) return false
  const lastD = new Date(last.date + "T12:00:00")
  const days = (Date.now() - lastD.getTime()) / 86400000
  return days > 30
}

export function getMonthlyRevenueLast6Months(
  patients: { financial?: { payments?: { date: string; amount: number }[] } }[]
): { ym: string; label: string; revenue: number }[] {
  const out: { ym: string; label: string; revenue: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const revenue = patients.reduce((sum, p) => {
      const pays = p.financial?.payments || []
      return (
        sum +
        pays.filter((pay) => pay.date?.startsWith(ym)).reduce((a, pay) => a + (pay.amount || 0), 0)
      )
    }, 0)
    out.push({
      ym,
      label: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      revenue,
    })
  }
  return out
}

export function getCurrentMonthFinancialSummary(patients: unknown[]) {
  const ym = new Date().toISOString().slice(0, 7)
  let revenue = 0
  for (const p of patients as { financial?: { payments?: { date: string; amount: number }[] } }[]) {
    const pays = p.financial?.payments || []
    revenue += pays.filter((pay) => pay.date?.startsWith(ym)).reduce((a, pay) => a + (pay.amount || 0), 0)
  }
  return { ym, revenue }
}
