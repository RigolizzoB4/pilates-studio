import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function loadStudioPatients(): Promise<unknown[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data } = await supabase.from("studio_data").select("value").eq("key", "pilates_patients").maybeSingle()
  return Array.isArray(data?.value) ? (data!.value as unknown[]) : []
}

export async function loadStudioAppointments(): Promise<unknown[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data } = await supabase.from("studio_data").select("value").eq("key", "pilates_appointments").maybeSingle()
  return Array.isArray(data?.value) ? (data!.value as unknown[]) : []
}
