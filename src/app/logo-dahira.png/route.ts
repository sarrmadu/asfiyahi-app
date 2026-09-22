import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /logo-dahira.png : le logo actuel du dahira.
 * Celui choisi dans les Paramètres s'il existe, sinon le logo d'origine.
 * Public : il s'affiche aussi sur la page de connexion et dans les PDF.
 */
export async function GET(request: Request) {
  let url: string | null = null
  try {
    const admin = createAdminClient()
    const { data } = await admin.from('dahiras').select('logo_complet_url').limit(1).maybeSingle()
    url = data?.logo_complet_url ?? null
  } catch {
    url = null
  }

  const source = url ?? new URL('/logo.png', request.url).toString()
  const rep = await fetch(source, { cache: 'no-store' })
  if (!rep.ok) return new Response('Logo introuvable', { status: 404 })

  return new Response(await rep.arrayBuffer(), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=300',
    },
  })
}