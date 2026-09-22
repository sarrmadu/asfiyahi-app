import Link from 'next/link'
import { exigerRole, type RoleType } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { afficherTelephone } from '@/lib/format'

export const metadata = { title: 'Accès et rôles' }

const ROLES: { code: RoleType; nom: string }[] = [
  { code: 'president', nom: 'Président' },
  { code: 'tresorier', nom: 'Trésorier' },
  { code: 'secretaire', nom: 'Secrétaire' },
  { code: 'commissaire', nom: 'Commissaire aux comptes' },
]

type Ligne = {
  role: RoleType
  membre: { id: string; prenom: string; nom: string; numero_membre: string; telephone: string | null; user_id: string | null } | null
}

export default async function PageRoles() {
  await exigerRole(['president'])
  const supabase = await createClient()

  const [{ data: roles }, { count: nbActifs }, { count: nbAcces }] = await Promise.all([
    supabase
      .from('membre_roles')
      .select('role, membre:membres!membre_roles_membre_id_fkey(id, prenom, nom, numero_membre, telephone, user_id)')
      .neq('role', 'membre'),
    supabase.from('membres').select('id', { count: 'exact', head: true }).eq('statut', 'actif'),
    supabase
      .from('membres')
      .select('id', { count: 'exact', head: true })
      .eq('statut', 'actif')
      .not('user_id', 'is', null),
  ])

  const lignes = (roles ?? []) as unknown as Ligne[]

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href="/bureau"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Espace bureau
        </Link>
        <h1 className="text-2xl font-bold">Accès et rôles</h1>
        <p className="text-muted-foreground">
          {nbAcces ?? 0} membre{(nbAcces ?? 0) > 1 ? 's' : ''} sur {nbActifs ?? 0} peu
          {(nbAcces ?? 0) > 1 ? 'vent' : 't'} se connecter à l&apos;application.
        </p>
      </header>

      {ROLES.map((r) => {
        const titulaires = lignes.filter((l) => l.role === r.code && l.membre)
        return (
          <section key={r.code} className="mb-5">
            <h2 className="mb-2 font-semibold">{r.nom}</h2>
            {titulaires.length === 0 ? (
              <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">Personne</p>
            ) : (
              <ul className="divide-y rounded-xl border">
                {titulaires.map((l) => (
                  <li key={l.membre!.id}>
                    <Link
                      href={`/membres/${l.membre!.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {l.membre!.prenom} {l.membre!.nom}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {l.membre!.numero_membre}
                          {l.membre!.telephone ? ` · ${afficherTelephone(l.membre!.telephone)}` : ''}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 text-xs ${l.membre!.user_id ? 'text-primary' : 'text-amber-700'}`}
                      >
                        {l.membre!.user_id ? 'a un accès' : 'pas d’accès'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}

      <p className="mt-8 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        Pour donner un rôle : <strong>Membres</strong> → ouvrez la fiche de la personne → cadre
        « Rôle au bureau ». Pensez aussi à lui créer son accès si elle n&apos;en a pas.
      </p>
    </main>
  )
}