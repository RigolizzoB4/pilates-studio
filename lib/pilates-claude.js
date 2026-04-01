/** Chama Claude via `/api/claude` (chave fica no servidor). Usa `ANTHROPIC_API_KEY_PILATES` quando definida. */
export async function claudeAPI(messages, system = "") {
  try {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system,
        messages,
        usePilatesKey: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err =
        typeof data?.error === "string"
          ? data.error
          : data?.error?.message || data?.details?.error?.message;
      return err || `Erro ${res.status} ao falar com a API.`;
    }
    if (data?.type === "error" && data?.error?.message) {
      return data.error.message;
    }
    const text = data.content?.[0]?.text;
    if (text) return text;
    return typeof data?.error === "string" ? data.error : "Resposta inválida da API.";
  } catch {
    return "Erro de conexão.";
  }
}
