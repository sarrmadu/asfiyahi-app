import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

/**
 * Client Supabase pour les Composants Client (directive "use client").
 *
 * Utilise la clé publishable : elle est conçue pour être exposée au navigateur.
 * La sécurité repose entièrement sur les policies RLS définies en base, pas sur
 * le secret de cette clé.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
