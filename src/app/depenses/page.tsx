import Link from 'next/link'
import { aRole, exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formaterMontant } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { BoutonsValidation } from './boutons-validation'

export const metadata = { title: 'Dépenses' }

const dateCourte = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Africa/Dakar',
})

const MODE: Record<string, string> = {
  especes: 'espèces',
  wave: 'Wave',
  orange_money: 'Orange Money',
  free_money: 'Free Money',
  virement: 'virement',
}

function premier<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

type Ligne = {
  id: string
  montant: number
  mode: string
  beneficiaire: string
  motif: string
  categorie: string | null
  statut: string
  motif_rejet: string | null
  date_depense: string
  cree_par: string
  evenements: { titre: string } | { titre: string }[] | null
  caisses: { nom: string } | { nom: string }[] | null
  auteur: { prenom: string; nom: string } | { prenom: string; nom: string }[] | null
}

export default async function PageDepenses({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>
}) {
  const moi = await exigerRole(['president', 'tresorier', 'commissaire'])
  const estPresident = aRole(moi, ['president'])
  const peutSaisir = aRole(moi, ['president', 'tresorier'])
  const { ok } = await searchParams

  const supabase = await createClient()
  const { data } = await supabase
    .from('depenses')
    .select(
      'id, montant, mode, beneficiaire, motif, categorie, statut, motif_rejet, date_depense, cree_par, evenements(titre), caisses(nom), auteur:membres!depenses_cree_par_fkey(prenom, nom)'
    )
    .order('cree_le', { ascending: false })
    .limit(60)

  const lignes = (data ?? []) as unknown as Ligne[]
  const enAttente = lignes.filter((d) => d.statut === 'en_attente_validation')
  const traitees = lignes.filter((d) => d.statut !== 'en_attente_validation')

  function details(d: Ligne) {
    const evt = premier(d.evenements)
    const auteur = premier(d.auteur)
    return (
      <>
        <p className="font-medium">{d.motif}</p>
        <p className="text-sm text-muted-foreground">
          {d.beneficiaire} · {MODE[d.mode] ?? d.mode} · {dateCourte.format(new Date(d.date_depense))}
        </p>
        <p className="text-sm text-muted-foreground">
          {evt ? evt.titre : premier(d.caisses)?.nom}
          {d.categorie ? ` · ${d.categorie}` : ''}
          {auteur ? ` · saisie par ${auteur.prenom} ${auteur.nom}` : ''}
        </p>
      </>
    )
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href="/bureau"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Espace bureau
        </Link>
        <h1 className="text-2xl font-bold">Dépenses</h1>
      </header>

      {ok && (
        <p className="mb-4 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary">{ok}</p>
      )}

      {peutSaisir && (
        <Link href="/depenses/nouvelle" className="mb-6 block">
          <Button className="h-14 w-full text-base font-semibold">+ Nouvelle dépense</Button>
        </Link>
      )}

      {enAttente.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">
            À valider par le président ({enAttente.length})
          </h2>
          <ul className="space-y-3">
            {enAttente.map((d) => (
              <li key={d.id} className="rounded-xl border-2 border-amber-600/40 bg-amber-50/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">{details(d)}</div>
                  <span className="montant shrink-0 text-lg">{formaterMontant(d.montant)}</span>
                </div>
                {estPresident && d.cree_par !== moi.id && <BoutonsValidation depenseId={d.id} />}
                {estPresident && d.cree_par === moi.id && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Vous avez saisi cette dépense : une autre personne du bureau doit la valider.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Historique</h2>
        {traitees.length === 0 ? (
          <p className="rounded-lg bg-muted p-4 text-muted-foreground">Aucune dépense enregistrée.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {traitees.map((d) => (
              <li key={d.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  {details(d)}
                  {d.statut === 'rejetee' && (
                    <p className="text-sm text-destructive">Rejetée : {d.motif_rejet}</p>
                  )}
                </div>
                <span
                  className={`montant shrink-0 ${d.statut === 'rejetee' ? 'text-muted-foreground line-through' : 'text-destructive'}`}
                >
                  −{formaterMontant(d.montant)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}