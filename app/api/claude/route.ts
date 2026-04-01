import { NextRequest, NextResponse } from "next/server"

type ClaudeBody = Record<string, unknown> & { usePilatesKey?: boolean }

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ClaudeBody
    const { usePilatesKey: usePk, ...forwardBody } = body
    const usePilatesKey = usePk === true

    const pilates = process.env.ANTHROPIC_API_KEY_PILATES
    const primary = process.env.ANTHROPIC_API_KEY
    const apiKey =
      usePilatesKey && pilates && pilates.length > 0 ? pilates : primary

    if (!apiKey || apiKey === "cole_sua_chave_anthropic") {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY (ou ANTHROPIC_API_KEY_PILATES) não configurada no .env.local" },
        { status: 500 },
      )
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(forwardBody),
    })

    const data = (await res.json()) as Record<string, unknown>

    if (!res.ok) {
      const errObj = data?.error as { message?: string; type?: string } | undefined
      const msg =
        errObj?.message ||
        (typeof data?.message === "string" ? data.message : null) ||
        `Anthropic HTTP ${res.status}`
      return NextResponse.json({ error: msg, details: data }, { status: res.status >= 400 && res.status < 600 ? res.status : 502 })
    }

    if (data?.type === "error") {
      const err = data.error as { message?: string } | undefined
      return NextResponse.json({ error: err?.message || "Erro na API Anthropic" }, { status: 502 })
    }

    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
