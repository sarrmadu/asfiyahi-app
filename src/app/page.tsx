import Link from 'next/link'
import { exigerMembre, estBureau, peutEncaisser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formaterMontant, nomAffiche } from '@/lib/format'
import { seDeconnecter } from './connexion/actions'
import { Button } from '@/components/ui/button'
import { BoutonRecu } from '@/components/bouton-recu'

const dateCourte = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Africa/Dakar',
})
const dateLongue = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Dakar',
})

const MODES: Record<string, string> = { wave: 'Wave', orange_money: 'Orange Money', free_money: 'Free Money' }

type Recu = {
  id: string
  numero: string
  ecriture: { id: string; montant: number; libelle: string; date_operation: string } | null
}

export default async function PageAccueil({
  searchParams,
}: {
  searchParams: Promise<{ mdp?: string; declaration?: string }>
}) {
  const moi = await exigerMembre()
  const { mdp, declaration } = await searchParams
  const supabase = await createClient()

  const [
    { data: situation },
    { data: gamou },
    { data: parts },
    { data: recusBruts },
    { data: declarations },
    { data: ouverts },
  ] = await Promise.all([
    supabase.from('v_situation_membres').select('solde_du').eq('membre_id', moi.id).maybeSingle(),
    supabase
      .from('evenements')
      .select('id, titre, debut_le')
      .eq('est_gamou', true)
      .eq('cloture', false)
      .eq('annule', false)
      .order('debut_le')
      .limit(1)
      .maybeSingle(),
    supabase
      .from('v_contributions_evenement')
      .select('evenement_id, attendu, verse, reste')
      .eq('membre_id', moi.id),
    supabase
      .from('recus')
      .select('id, numero, ecriture:ecritures!recus_ecriture_id_fkey(id, montant, libelle, date_operation)')
      .eq('membre_id', moi.id)
      .order('genere_le', { ascending: false })
      .limit(10),
    supabase
      .from('declarations')
      .select('id, montant, mode, statut, motif_rejet, reference_transaction')
      .eq('membre_id', moi.id)
      .neq('statut', 'validee')
      .order('cree_le', { ascending: false })
      .limit(5),
    supabase.from('evenements').select('id, titre, est_gamou').eq('cloture', false).eq('annule', false),
  ])

  // Situation pour le prochain Gamou
  const { data: pourGamou } = gamou
    ? await supabase
        .rpc('situation_gamou', { p_evenement_id: gamou.id })
        .eq('membre_id', moi.id)
        .maybeSingle()
    : { data: null }
  const g = pourGamou as { reste: number; total_verse: number } | null

  // Reçus, en signalant ceux dont le versement a été annulé
  const recus = ((recusBruts ?? []) as unknown as Recu[]).filter((r) => r.ecriture)
  const idsEcritures = recus.map((r) => r.ecriture!.id)
  const { data: annulations } = idsEcritures.length
    ? await supabase.from('ecritures').select('annule_ecriture_id').in('annule_ecriture_id', idsEcritures)
    : { data: [] as { annule_ecriture_id: string | null }[] }
  const annulees = new Set((annulations ?? []).map((a) => a.annule_ecriture_id))

  // Parts d'événements encore ouverts
  const titres = new Map((ouverts ?? []).filter((e) => !e.est_gamou).map((e) => [e.id, e.titre]))
  const mesParts = (parts ?? []).filter((p) => p.evenement_id && titres.has(p.evenement_id))

  const doit = Number(situation?.solde_du ?? 0)
  const aJour = doit <= 0

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Assalamu alaykum</p>
          <h1 className="text-xl font-bold">
            {nomAffiche({ prenom: moi.prenom, nom: moi.nom, surnom: moi.surnom })}
          </h1>
        </div>
        <form action={seDeconnecter}>
          <Button variant="ghost" size="sm" type="submit">
            Quitter
          </Button>
        </form>
      </header>

      {mdp === 'ok' && (
        <p className="mb-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
          Mot de passe enregistré. Gardez-le pour vous.
        </p>
      )}
      {declaration === 'ok' && (
        <p className="mb-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
          Paiement déclaré. Vous recevrez votre reçu dès que le trésorier l&apos;aura vérifié.
        </p>
      )}

      {/* Ma cotisation */}
      <section
        className={`mb-4 rounded-xl border-2 p-5 ${aJour ? 'border-primary' : 'border-amber-600'}`}
      >
        <p className="text-sm text-muted-foreground">Ma cotisation</p>
        {aJour ? (
          <p className="mt-1 text-3xl font-bold text-primary">À jour</p>
        ) : (
          <>
            <p className="montant mt-1 text-3xl font-bold text-amber-700">{formaterMontant(doit)}</p>
            <p className="mt-1 text-sm text-muted-foreground">restant à verser</p>
          </>
        )}
      </section>

      {/* Prochain Gamou */}
      {gamou && g && (
        <section className="mb-4 rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">
            {gamou.titre}
            {gamou.debut_le ? ` · ${dateLongue.format(new Date(gamou.debut_le))}` : ''}
          </p>
          {Number(g.reste) <= 0 ? (
            <p className="mt-1 text-2xl font-bold text-primary">Complet, qu&apos;Allah l&apos;agrée</p>
          ) : (
            <>
              <p className="montant mt-1 text-2xl font-bold text-amber-700">
                {formaterMontant(g.reste)}
              </p>
              <p className="text-sm text-muted-foreground">
                à verser d&apos;ici le Gamou pour être complet
              </p>
            </>
          )}
        </section>
      )}

      {/* Parts d'événements */}
      {mesParts.map((p) => (
        <section key={p.evenement_id} className="mb-4 rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">{titres.get(p.evenement_id!)} · ma part</p>
          {Number(p.reste ?? 0) <= 0 ? (
            <p className="mt-1 text-xl font-bold text-primary">Réglée</p>
          ) : (
            <p className="mt-1 text-xl font-bold">
              <span className="montant text-amber-700">{formaterMontant(p.reste)}</span>
              <span className="text-base font-normal text-muted-foreground">
                {' '}sur {formaterMontant(p.attendu)}
              </span>
            </p>
          )}
        </section>
      ))}

      {peutEncaisser(moi) && (
        <Link href="/encaisser" className="mb-3 mt-6 block">
          <Button className="h-14 w-full text-base font-semibold">Encaisser des espèces</Button>
        </Link>
      )}
      {estBureau(moi) && (
        <Link href="/bureau" className="mb-3 block">
          <Button variant="outline" className="h-14 w-full text-base">
            Espace bureau
          </Button>
        </Link>
      )}
      <Link href="/declarer" className={`mb-3 block ${estBureau(moi) ? '' : 'mt-6'}`}>
        <Button
          variant={estBureau(moi) ? 'outline' : 'default'}
          className={`h-14 w-full text-base ${estBureau(moi) ? '' : 'font-semibold'}`}
        >
          Déclarer un paiement
        </Button>
      </Link>

      {/* Mes déclarations en cours ou refusées */}
      {(declarations ?? []).length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Mes paiements déclarés</h2>
          <ul className="divide-y rounded-xl border">
            {(declarations ?? []).map((d) => (
              <li key={d.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">
                    {MODES[d.mode] ?? d.mode} · {d.reference_transaction}
                  </span>
                  <span className="montant">{formaterMontant(d.montant)}</span>
                </div>
                {d.statut === 'rejetee' ? (
                  <p className="text-sm text-destructive">Refusé : {d.motif_rejet}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">En attente de vérification</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Mes reçus */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Mes reçus</h2>
        {recus.length === 0 ? (
          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Aucun reçu pour l&apos;instant.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {recus.map((r) => {
              const annule = annulees.has(r.ecriture!.id)
              return (
                <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{r.ecriture!.libelle}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.numero} · {dateCourte.format(new Date(`${r.ecriture!.date_operation}T12:00:00Z`))}
                      {annule ? ' · annulé' : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`montant text-sm ${annule ? 'text-muted-foreground line-through' : ''}`}>
                      {formaterMontant(r.ecriture!.montant)}
                    </span>
                    <BoutonRecu recuId={r.id} numero={r.numero} variante="ghost" libelle="PDF" />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="mt-10 text-center text-xs text-muted-foreground">
        <p>
          {moi.numeroMembre} · {moi.roles.join(', ') || 'membre'}
        </p>
        <Link href="/mot-de-passe" className="mt-2 inline-block underline underline-offset-4">
          Changer mon mot de passe
        </Link>
      </div>
    </main>
  )
}