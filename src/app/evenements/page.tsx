import Link from 'next/link'
import { aRole, exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formaterMontant } from '@/lib/format'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Événements' }

const dateLongue = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Dakar',
})

export default async function PageEvenements() {
  const moi = await exigerRole(['president', 'tresorier', 'secretaire', 'commissaire'])
  const peutCreer = aRole(moi, ['president', 'secretaire'])

  const supabase = await createClient()
  const { data: evenements } = await supabase
    .from('v_bilan_evenements')
    .select('evenement_id, titre, debut_le, budget, collecte, depense, reste, cloture, est_gamou')
    .order('debut_le', { ascending: false })

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href="/bureau"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Espace bureau
        </Link>
        <h1 className="text-2xl font-bold">Événements</h1>
      </header>

      {peutCreer && (
        <Link href="/evenements/nouveau" className="mb-5 block">
          <Button className="h-14 w-full text-base font-semibold">+ Nouvel événement</Button>
        </Link>
      )}

      {(evenements ?? []).length === 0 ? (
        <p className="rounded-lg bg-muted p-4 text-muted-foreground">
          Aucun événement pour l&apos;instant. Créez le prochain Gamou pour commencer à suivre
          ses collectes et ses dépenses.
        </p>
      ) : (
        <ul className="space-y-3">
          {(evenements ?? []).map((e) => {
            const collecte = Number(e.collecte ?? 0)
            const budget = Number(e.budget ?? 0)
            const pourcent = budget > 0 ? Math.min(100, Math.round((collecte / budget) * 100)) : null
            return (
              <li key={e.evenement_id}>
                <Link
                  href={`/evenements/${e.evenement_id}`}
                  className="block rounded-xl border p-4 hover:bg-muted"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-lg font-semibold">{e.titre}</p>
                    {e.cloture && <span className="text-sm text-muted-foreground">Clôturé</span>}
                  </div>
                  {e.est_gamou && (
                    <p className="text-sm font-medium text-primary">
                      Gamou · financé par les cotisations mensuelles
                    </p>
                  )}
                  <p className="text-sm capitalize text-muted-foreground">
                    {e.debut_le ? dateLongue.format(new Date(e.debut_le)) : ''}
                  </p>
                  {!e.est_gamou && (
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Collecté</p>
                      <p className="montant">{formaterMontant(collecte)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dépensé</p>
                      <p className="montant">{formaterMontant(e.depense)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reste</p>
                      <p className="montant text-primary">{formaterMontant(e.reste)}</p>
                    </div>
                  </div>
                  )}
                  {!e.est_gamou && pourcent !== null && (
                    <div className="mt-3">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${pourcent}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {pourcent} % du budget de {formaterMontant(budget)}
                      </p>
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}