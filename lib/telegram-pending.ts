import { createClient } from "@supabase/supabase-js"

const KEY = "telegram_pending_cancel"

export type PendingCancel = {
  patientName: string
  date: string
  hour: number
  expires: number
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

async function loadMap(): Promise<Record<string, PendingCancel>> {
  const sb = getClient()
  if (!sb) return {}
  const { data } = await sb.from("studio_data").select("value").eq("key", KEY).maybeSingle()
  const v = data?.value
  if (!v || typeof v !== "object" || Array.isArray(v)) return {}
  return v as Record<string, PendingCancel>
}

async function saveMap(map: Record<string, PendingCancel>): Promise<void> {
  const sb = getClient()
  if (!sb) return
  await sb.from("studio_data").upsert(
    { key: KEY, value: map, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  )
}

function pruneExpired(map: Record<string, PendingCancel>): boolean {
  const now = Date.now()
  let changed = false
  for (const k of Object.keys(map)) {
    if (now > map[k].expires) {
      delete map[k]
      changed = true
    }
  }
  return changed
}

async function loadPruned(): Promise<Record<string, PendingCancel>> {
  const map = { ...(await loadMap()) }
  if (pruneExpired(map)) await saveMap(map)
  return map
}

export async function getPendingCancel(chatId: string): Promise<PendingCancel | null> {
  const map = await loadPruned()
  const p = map[String(chatId)]
  if (!p || Date.now() > p.expires) return null
  return p
}

export async function setPendingCancel(chatId: string, pending: PendingCancel): Promise<void> {
  const map = await loadPruned()
  map[String(chatId)] = pending
  await saveMap(map)
}

export async function deletePendingCancel(chatId: string): Promise<void> {
  const map = await loadPruned()
  delete map[String(chatId)]
  await saveMap(map)
}
