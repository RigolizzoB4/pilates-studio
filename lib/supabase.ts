import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Generic key-value storage (replaces window.storage / localStorage) ───

export const saveDB = async (key: string, val: unknown): Promise<void> => {
  const { error } = await supabase
    .from('studio_data')
    .upsert({ key, value: val, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) {
    console.error(`[supabase] saveDB(${key}):`, error.message)
    throw new Error(error.message)
  }
}

export const loadDB = async <T>(key: string, def: T): Promise<T> => {
  try {
    const { data, error } = await supabase
      .from('studio_data')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    if (error || !data) return def
    return data.value as T
  } catch {
    return def
  }
}

// ─── Real-time subscription helper ───
export const subscribeDB = (
  key: string,
  callback: (val: unknown) => void
) => {
  const channel = supabase
    .channel(`studio_data:${key}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'studio_data', filter: `key=eq.${key}` },
      (payload) => {
        const newVal = (payload.new as { value: unknown })?.value
        if (newVal !== undefined) callback(newVal)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
