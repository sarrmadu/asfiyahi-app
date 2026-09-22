import Link from 'next/link'
import { aRole, exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { afficherTelephone, formaterMontant, nomAffiche } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const metadata = { title: 'Membres' }

function normaliser(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function premier<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

export default async function PageMembres({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tous?: string; ok?: string }>
}) {
  const moi = await exigerRole(['president', 'tresorier', 'secretaire', 'commissaire'])
  const peutGerer = aRole(moi, ['president', 'secretaire'])
  const { q = '', tous, ok } = await searchParams
  const afficherInactifs = tous === '1'

  const supabase = await createClient()
  const [{ data: membres }, { data: situations }] = await Promise.all([
    supabase
      .from('membres')
      .select('id, numero_membre, prenom, nom, surnom, telephone, statut, user_id, sections(nom)')
      .order('nom')
      .order('prenom'),
    supabase.from('v_situation_membres').select('membre_id, solde_du'),
  ])

  const dette = new Map((situations ?? []).map((s) => [s.membre_id, Number(s.solde_du ?? 0)]))

  const terme = normaliser(q.trim())
  const chiffres = q.replace(/\D/g, '')
  const liste = (membres ?? []).filter((m) => {
    if (!afficherInactifs && m.statut === 'inactif') return false
    if (!terme) return true
    const texte = normaliser(`${m.prenom} ${m.nom} ${m.surnom ?? ''} ${m.numero_membre}`)
    if (texte.includes(terme)) return true
    return chiffres.length >= 3 && (m.telephone ?? '').includes(chiffres)
  })

  const nbActifs = (membres ?? []).filter((m) => m.statut !== 'inactif').length

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href="/bureau"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Espace bureau
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold">Membres</h1>
          <p className="text-sm text-muted-foreground">{nbActifs} actifs</p>
        </div>
      </header>

      {ok && (
        <p className="mb-4 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          {ok}
        </p>
      )}

      {peutGerer && (
        <Link href="/membres/nouveau" className="mb-5 block">
          <Button className="h-14 w-full text-base font-semibold">+ Inscrire un membre</Button>
        </Link>
      )}

      <form className="mb-3 flex gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Nom, surnom, numéro, téléphone"
          className="h-12"
          autoComplete="off"
        />
        {afficherInactifs && <input type="hidden" name="tous" value="1" />}
        <Button type="submit" variant="outline" className="h-12 px-5">
          Chercher
        </Button>
      </form>

      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {liste.length} résultat{liste.length > 1 ? 's' : ''}
        </span>
        <Link
          href={`/membres?${new URLSearchParams({ ...(q ? { q } : {}), ...(afficherInactifs ? {} : { tous: '1' }) })}`}
          className="text-primary underline-offset-4 hover:underline"
        >
          {afficherInactifs ? 'Masquer les inactifs' : 'Afficher aussi les inactifs'}
        </Link>
      </div>

      {liste.length === 0 ? (
        <p className="rounded-lg bg-muted p-4 text-muted-foreground">
          {q ? 'Aucun membre ne correspond à cette recherche.' : 'Aucun membre inscrit.'}
        </p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {liste.map((m) => {
            const doit = dette.get(m.id) ?? 0
            const contenu = (
              <>
                <div className="min-w-0">
                  <p className="truncate font-medium">{nomAffiche(m)}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {m.numero_membre}
                    {premier(m.sections)?.nom ? ` · ${premier(m.sections)?.nom}` : ''}
                    {m.telephone ? ` · ${afficherTelephone(m.telephone)}` : ''}
                  </p>
                </div>
                <span className="shrink-0 text-sm">
                  {m.statut === 'inactif' ? (
                    <span className="text-muted-foreground">Inactif</span>
                  ) : m.statut === 'dispense' ? (
                    <span className="text-muted-foreground">Dispensé</span>
                  ) : doit > 0 ? (
                    <span className="montant text-amber-700">doit {formaterMontant(doit)}</span>
                  ) : (
                    <span className="text-primary">À jour</span>
                  )}
                </span>
              </>
            )
            return (
              <li key={m.id}>
                {peutGerer ? (
                  <Link
                    href={`/membres/${m.id}`}
                    className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 hover:bg-muted"
                  >
                    {contenu}
                  </Link>
                ) : (
                  <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3">
                    {contenu}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}