import { NextRequest, NextResponse } from "next/server"
import { getCurrentMonthFinancialSummary } from "@/lib/finance-helpers"
import { loadStudioPatients } from "@/lib/studio-server"
import { daysUntilBirthday } from "./telegram-utils"
import {
  deletePendingCancel,
  getPendingCancel,
  setPendingCancel,
} from "@/lib/telegram-pending"

async function sendTelegramMessage(chatId: number, text: string, parseMode?: "HTML") {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return
  const body: Record<string, unknown> = { chat_id: chatId, text }
  if (parseMode) body.parse_mode = parseMode
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN não configurado" }, { status: 501 })
  }

  let body: {
    message?: {
      chat?: { id: number }
      text?: string
      from?: { id: number }
    }
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const msg = body.message
  if (!msg?.chat?.id) return NextResponse.json({ ok: true })

  const chatId = msg.chat.id
  const raw = (msg.text || "").trim()
  const lower = raw.toLowerCase()
  const key = String(chatId)

  if (lower === "sim" || lower === "não" || lower === "nao") {
    const pend = await getPendingCancel(key)
    if (pend && Date.now() < pend.expires) {
      await deletePendingCancel(key)
      if (lower === "sim") {
        await sendTelegramMessage(
          chatId,
          `✅ Cancelamento registrado para <b>${pend.patientName}</b> em ${pend.date} às ${pend.hour}h. (Atualize a agenda no app.)`
        )
      } else {
        await sendTelegramMessage(chatId, "Cancelamento descartado.")
      }
      return NextResponse.json({ ok: true })
    }
  }

  if (lower.startsWith("/relatorio") || lower.startsWith("/relatório")) {
    const patients = await loadStudioPatients()
    const { ym, revenue } = getCurrentMonthFinancialSummary(patients)
    const monthName = new Date(ym + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    await sendTelegramMessage(
      chatId,
      `📊 <b>Resumo financeiro — ${monthName}</b>\n\nReceita no mês: <b>R$ ${revenue.toFixed(2).replace(".", ",")}</b>`
    )
    return NextResponse.json({ ok: true })
  }

  if (lower.startsWith("/inadimplentes")) {
    const patients = await loadStudioPatients() as {
      name?: string
      status?: string
      financial?: { payments?: { date: string; amount: number }[]; payType?: string }
    }[]
    const thisMonth = new Date().toISOString().slice(0, 7)
    const lines: string[] = []
    for (const p of patients) {
      if (p.status !== "active") continue
      const paid = (p.financial?.payments || [])
        .filter((pay) => pay.date?.startsWith(thisMonth))
        .reduce((s, pay) => s + pay.amount, 0)
      if (paid <= 0) {
        lines.push(`• ${p.name || "?"} — sem pagamento neste mês`)
      }
    }
    await sendTelegramMessage(
      chatId,
      lines.length
        ? `⚠️ <b>Inadimplência / sem pagamento no mês</b>\n\n${lines.join("\n")}`
        : "✅ Nenhum caso crítico listado para este mês."
    )
    return NextResponse.json({ ok: true })
  }

  if (lower.startsWith("/aniversarios") || lower.startsWith("/aniversários")) {
    const patients = await loadStudioPatients() as {
      name?: string
      anamnesis?: { birthDate?: string }
    }[]
    const upcoming = patients
      .filter((p) => p.anamnesis?.birthDate)
      .map((p) => ({
        name: p.name,
        days: daysUntilBirthday(p.anamnesis!.birthDate!),
      }))
      .filter((x) => x.days <= 7 && x.days >= 0)
      .sort((a, b) => a.days - b.days)

    const list = upcoming
      .map((x) => `• ${x.name} — em ${x.days === 0 ? "hoje 🎂" : `${x.days} dia(s)`}`)
      .join("\n")
    await sendTelegramMessage(
      chatId,
      upcoming.length
        ? `🎂 <b>Aniversários (7 dias)</b>\n\n${list}`
        : "Nenhum aniversário nos próximos 7 dias."
    )
    return NextResponse.json({ ok: true })
  }

  if (lower.startsWith("/cancelar")) {
    const parts = raw.split(/\s+/).slice(1)
    if (parts.length >= 3) {
      const patientName = parts[0]
      const date = parts[1]
      const hour = parseInt(parts[2], 10)
      await setPendingCancel(key, {
        patientName,
        date,
        hour: Number.isNaN(hour) ? 0 : hour,
        expires: Date.now() + 5 * 60 * 1000,
      })
      await sendTelegramMessage(
        chatId,
        `Confirma cancelamento de <b>${patientName}</b> ${date} ${hour}h?\nResponda <b>Sim</b> ou <b>Não</b> em até 5 minutos.`
      )
      return NextResponse.json({ ok: true })
    }
    await sendTelegramMessage(chatId, "Uso: <code>/cancelar Nome 2026-04-01 14</code>")
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
