/** Gera HTML imprimível da ficha completa (abre janela de impressão / PDF). */
export function openPatientFullExportHtml(patient: Record<string, unknown>, studioName = "Studio Pilates") {
  const esc = (s: unknown) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

  const an = (patient.anamnesis || {}) as Record<string, unknown>
  const sessions = (patient.sessionLogs || []) as { date?: string; type?: string; notes?: string }[]
  const evals = (patient.evaluations || []) as unknown[]
  const pays = ((patient.financial as { payments?: { date: string; amount: number; method?: string }[] }) || {})
    .payments || []

  const anRows = Object.entries(an)
    .filter(([, v]) => v !== "" && v != null)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;color:#6B7280">${esc(
          k
        )}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px">${esc(
          typeof v === "object" ? JSON.stringify(v) : v
        )}</td></tr>`
    )
    .join("")

  const sessionRows = sessions
    .map(
      (s) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${esc(s.date)}</td><td>${esc(
          s.type
        )}</td><td style="font-size:12px">${esc(s.notes)}</td></tr>`
    )
    .join("")

  const payRows = pays
    .map(
      (p) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${esc(p.date)}</td><td>${esc(
          p.method
        )}</td><td style="text-align:right;font-weight:600">R$ ${(p.amount || 0).toFixed(2).replace(".", ",")}</td></tr>`
    )
    .join("")

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/>
  <title>Ficha — ${esc(patient.name)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;background:#fff;color:#1A1A2E;padding:32px;max-width:800px;margin:0 auto;line-height:1.5}
    .head{display:flex;align-items:center;gap:16px;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #C8175B}
    .logo{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#C8175B,#00A0A8);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff}
    h1{font-size:22px} h2{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#00A0A8;margin:24px 0 12px;border-bottom:1px solid #E5E7EB;padding-bottom:6px}
    table{width:100%;border-collapse:collapse}
    .footer{margin-top:40px;text-align:center;font-size:11px;color:#9CA3AF;border-top:1px dashed #E5E7EB;padding-top:16px}
    @media print{body{padding:16px}}
  </style></head><body>
  <div class="head"><div class="logo">P</div><div><h1>${esc(patient.name)}</h1><p style="color:#6B7280;font-size:14px">${esc(
    patient.email
  )} · ${esc(patient.phone)}</p></div></div>

  <h2>Dados pessoais</h2>
  <table><tr><td style="padding:6px 10px;width:140px;color:#6B7280">Status</td><td>${esc(patient.status)}</td></tr>
  <tr><td style="padding:6px 10px;color:#6B7280">Como nos conheceu</td><td>${esc(patient.howFound)}</td></tr>
  <tr><td style="padding:6px 10px;color:#6B7280;vertical-align:top">Notas</td><td>${esc(patient.notes)}</td></tr></table>

  <h2>Anamnese</h2>
  <table>${anRows || "<tr><td colspan='2' style='color:#9CA3AF'>—</td></tr>"}</table>

  <h2>Histórico de sessões (registros)</h2>
  <table><thead><tr><th style="text-align:left;padding:8px">Data</th><th>Tipo</th><th style="text-align:left">Observações</th></tr></thead><tbody>${
    sessionRows || "<tr><td colspan='3' style='color:#9CA3AF'>—</td></tr>"
  }</tbody></table>

  <h2>Avaliações</h2>
  <p style="font-size:13px;color:#374151;white-space:pre-wrap">${esc(JSON.stringify(evals, null, 2))}</p>

  <h2>Histórico financeiro</h2>
  <table><thead><tr><th style="text-align:left;padding:8px">Data</th><th>Método</th><th style="text-align:right">Valor</th></tr></thead><tbody>${
    payRows || "<tr><td colspan='3' style='color:#9CA3AF'>—</td></tr>"
  }</tbody></table>

  <div class="footer">${esc(studioName)} · Documento confidencial · ${new Date().toLocaleDateString("pt-BR")}</div>
  <script>window.onload=()=>window.print()</script>
  </body></html>`

  const w = window.open("", "_blank", "width=840,height=960")
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}
