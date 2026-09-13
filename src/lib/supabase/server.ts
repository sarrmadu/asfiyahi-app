import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

/**
 * Client Supabase pour les Composants Serveur, Server Actions et Route Handlers.
 *
 * À créer à chaque requête : ne jamais stocker le retour dans une variable
 * globale, sinon la session d'un utilisateur pourrait fuiter vers un autre.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Appelé depuis un Composant Serveur : l'écriture de cookies y est
            // interdite. Sans gravité, le middleware rafraîchit déjà la session.
          }
        },
      },
    }
  )
}
