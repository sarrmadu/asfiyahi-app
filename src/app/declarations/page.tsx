import Link from 'next/link'
import { aRole, exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formaterMontant, nomAffiche } from '@/lib/format'
import { BoutonsDeclaration } from './boutons'

export const metadata = { title: 'Paiements déclarés' }

const MODES: Record<string, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  free_money: 'Free Money',
  virement: 'Virement',
}
const STATUTS: Record<string, string> = { validee: 'Validé', rejetee: 'Rejeté', en_attente: 'En attente' }

const dateCourte = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Africa/Dakar',
})

type Ligne = {
  id: string
  montant: number
  mode: string
  reference_transaction: string
  date_paiement: string
  commentaire: string | null
  statut: string
  motif_rejet: string | null
  membre: { prenom: string; nom: string; surnom: string | null; numero_membre: string } | null
  evenement: { titre: string; est_gamou: boolean } | null
}

const COLONNES =
  'id, montant, mode, reference_transaction, date_paiement, commentaire, statut, motif_rejet, ' +
  'membre:membres!declarations_membre_id_fkey(prenom, nom, surnom, numero_membre), ' +
  'evenement:evenements!declarations_evenement_id_fkey(titre, est_gamou)'

function objet(l: Ligne) {
  if (!l.evenement) return 'Cotisation'
  return l.evenement.est_gamou ? 'Don · ' + l.evenement.titre : l.evenement.titre
}

export default async function PageDeclarations() {
  const moi = await exigerRole(['president', 'tresorier', 'commissaire'])
  const peutValider = aRole(moi, ['president', 'tresorier'])
  const supabase = await createClient()

  const [{ data: attente }, { data: traitees }] = await Promise.all([
    supabase.from('declarations').select(COLONNES).eq('statut', 'en_attente').order('cree_le'),
    supabase
      .from('declarations')
      .select(COLONNES)
      .neq('statut', 'en_attente')
      .order('traitee_le', { ascending: false })
      .limit(20),
  ])

  const enAttente = (attente ?? []) as unknown as Ligne[]
  const historique = (traitees ?? []) as unknown as Ligne[]
  const total = enAttente.reduce((t, l) => t + Number(l.montant), 0)

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href="/bureau"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Espace bureau
        </Link>
        <h1 className="text-2xl font-bold">Paiements déclarés</h1>
        <p className="text-muted-foreground">
          Comparez chaque référence avec le relevé Wave ou Orange Money du dahira avant de valider.
        </p>
      </header>

      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">À vérifier</h2>
          {enAttente.length > 0 && <p className="montant text-sm text-muted-foreground">{formaterMontant(total)}</p>}
        </div>

        {enAttente.length === 0 ? (
          <p className="rounded-lg bg-muted p-4 text-muted-foreground">Aucun paiement en attente.</p>
        ) : (
          <ul className="space-y-3">
            {enAttente.map((l) => {
              const nom = l.membre ? nomAffiche(l.membre) : 'Membre'
              return (
                <li key={l.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{nom}</p>
                      <p className="text-sm text-muted-foreground">
                        {l.membre?.numero_membre} · {objet(l)}
                      </p>
                    </div>
                    <p className="montant shrink-0 text-xl">{formaterMontant(l.montant)}</p>
                  </div>
                  <p className="mt-2 text-sm">
                    {MODES[l.mode] ?? l.mode} · réf. <span className="font-mono font-semibold">{l.reference_transaction}</span>{' '}
                    · {dateCourte.format(new Date(l.date_paiement + 'T12:00:00Z'))}
                  </p>
                  {l.commentaire && <p className="mt-1 text-sm text-muted-foreground">« {l.commentaire} »</p>}
                  {peutValider && <BoutonsDeclaration id={l.id} montant={Number(l.montant)} nom={nom} />}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {historique.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Derniers traités</h2>
          <ul className="divide-y rounded-xl border">
            {historique.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate">{l.membre ? nomAffiche(l.membre) : 'Membre'}</p>
                  <p className="text-sm text-muted-foreground">
                    {objet(l)} · {MODES[l.mode] ?? l.mode} · {l.reference_transaction}
                  </p>
                  {l.motif_rejet && <p className="text-sm text-destructive">{l.motif_rejet}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className={`montant ${l.statut === 'rejetee' ? 'text-muted-foreground line-through' : ''}`}>
                    {formaterMontant(l.montant)}
                  </p>
                  <p className="text-xs text-muted-foreground">{STATUTS[l.statut] ?? l.statut}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}