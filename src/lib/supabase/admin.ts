import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/**
 * Client Supabase « administrateur », avec la clé secrète.
 *
 * Il contourne toutes les règles de sécurité de la base : on ne l'utilise
 * QUE côté serveur, et seulement après avoir vérifié le rôle de la personne
 * connectée. L'import 'server-only' fait échouer la compilation si ce
 * fichier est importé par erreur dans une page affichée au navigateur.
 */
export function createAdminClient() {
  const cle = process.env.SUPABASE_SECRET_KEY
  if (!cle) {
    throw new Error('SUPABASE_SECRET_KEY manquante (fichier .env.local et réglages Vercel).')
  }
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, cle, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}