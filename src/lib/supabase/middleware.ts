import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

/** Routes accessibles sans être connecté. */
const ROUTES_PUBLIQUES = ['/connexion', '/auth']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT : getUser() et non getSession(). getSession() lit le cookie sans
  // le vérifier auprès du serveur d'authentification — un cookie falsifié
  // passerait. getUser() valide le jeton à chaque appel.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const chemin = request.nextUrl.pathname
  const estPublique = ROUTES_PUBLIQUES.some((r) => chemin.startsWith(r))

  if (!user && !estPublique) {
    const url = request.nextUrl.clone()
    url.pathname = '/connexion'
    // Mémorise la destination pour y revenir après connexion
    url.searchParams.set('suite', chemin)
    return NextResponse.redirect(url)
  }

  if (user && chemin === '/connexion') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}
