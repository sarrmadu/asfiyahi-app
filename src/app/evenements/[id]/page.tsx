import Link from 'next/link'
import { notFound } from 'next/navigation'
import { aRole, exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formaterMontant, nomAffiche } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { BoutonPdf } from '@/components/bouton-pdf'
export const metadata = { title: 'Événement' }

const dateLongue = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Dakar',
})
const dateCourte = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Dakar',
})

const STATUT_DEPENSE: Record<string, string> = {
  validee: 'Validée',
  en_attente_validation: 'À valider par le président',
  rejetee: 'Rejetée',
}

type SituationGamou = {
  membre_id: string
  numero_membre: string
  prenom: string
  nom: string
  surnom: string | null
  categorie: string | null
  total_verse: number
  reste: number
}

type LigneMembre = {
  membre_id: string | null
  numero_membre: string | null
  prenom: string | null
  nom: string | null
  surnom: string | null
  categorie: string | null
  verse: number
  reste: number
}

function Carte({ titre, montant, note, accent }: { titre: string; montant: number; note?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${accent ? 'border-2 border-primary' : 'border'}`}>
      <p className="text-sm text-muted-foreground">{titre}</p>
      <p className={`montant mt-1 text-xl ${accent ? 'text-primary' : ''}`}>{formaterMontant(montant)}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}

function ListeMembres({ titre, lignes, libelleComplet }: { titre: string; lignes: LigneMembre[]; libelleComplet: string }) {
  const aJour = lignes.filter((l) => l.reste <= 0)
  const enRetard = lignes.filter((l) => l.reste > 0)
  const resteTotal = enRetard.reduce((t, l) => t + l.reste, 0)

  return (
    <section className="mb-8">
      <h2 className="mb-1 text-lg font-semibold">{titre}</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        {aJour.length} {libelleComplet} · {enRetard.length} pas encore
        {resteTotal > 0 ? ` · ${formaterMontant(resteTotal)} restent à collecter` : ''}
      </p>

      {enRetard.length > 0 && (
        <ul className="mb-3 divide-y rounded-xl border">
          {enRetard.map((l) => (
            <li key={l.membre_id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="min-w-0">
                <span className="block truncate">
                  {nomAffiche({ prenom: l.prenom ?? '', nom: l.nom ?? '', surnom: l.surnom })}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {l.numero_membre}
                  {l.categorie ? ` · ${l.categorie}` : ' · sans catégorie'}
                </span>
              </span>
              <span className="shrink-0 text-right text-sm">
                <span className="montant text-amber-700">reste {formaterMontant(l.reste)}</span>
                {l.verse > 0 && (
                  <span className="block text-xs text-muted-foreground">déjà {formaterMontant(l.verse)}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {aJour.length > 0 && (
        <details className="rounded-xl border">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
            Voir les {aJour.length} membre{aJour.length > 1 ? 's' : ''} à jour
          </summary>
          <ul className="divide-y border-t">
            {aJour.map((l) => (
              <li key={l.membre_id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                <span className="min-w-0 truncate">
                  {nomAffiche({ prenom: l.prenom ?? '', nom: l.nom ?? '', surnom: l.surnom })}
                </span>
                <span className="montant shrink-0 text-primary">{formaterMontant(l.verse)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}

export default async function PageEvenement({ params }: { params: Promise<{ id: string }> }) {
  const moi = await exigerRole(['president', 'tresorier', 'secretaire', 'commissaire'])
  const peutEncaisser = aRole(moi, ['president', 'tresorier'])
  const voitFinances = aRole(moi, ['president', 'tresorier', 'commissaire'])
  const { id } = await params

  const supabase = await createClient()
  const { data: evt } = await supabase
    .from('evenements')
    .select('id, titre, debut_le, lieu, budget, cloture, est_gamou, caisses(nom)')
    .eq('id', id)
    .maybeSingle()

  if (!evt) notFound()
  const caisse = Array.isArray(evt.caisses) ? evt.caisses[0] : evt.caisses

  const { data: depenses } = voitFinances
    ? await supabase
        .from('depenses')
        .select('id, montant, beneficiaire, motif, categorie, statut, date_depense')
        .eq('evenement_id', id)
        .order('date_depense', { ascending: false })
    : { data: [] as never[] }

  let cartes: React.ReactNode
  let membres: React.ReactNode = null

  if (evt.est_gamou) {
    const [{ data: bilan }, { data: situation }] = await Promise.all([
      supabase.rpc('bilan_gamou', { p_evenement_id: id }).maybeSingle(),
      supabase.rpc('situation_gamou', { p_evenement_id: id }),
    ])
    const b = bilan as {
      date_debut: string; report: number; cotisations: number; dons: number; depenses: number; reste: number
    } | null

    cartes = (
      <>
        {b && (
          <p className="mb-3 text-sm text-muted-foreground">
            Cycle de cotisation : du {dateCourte.format(new Date(b.date_debut))} au Gamou
          </p>
        )}
        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Carte titre="Report de l'an dernier" montant={b?.report ?? 0} />
          <Carte titre="Cotisations de l'année" montant={b?.cotisations ?? 0} />
          <Carte titre="Dons" montant={b?.dons ?? 0} />
          <Carte titre="Dépenses" montant={b?.depenses ?? 0} />
          <Carte
            titre="Reste"
            montant={b?.reste ?? 0}
            note="reporté sur le prochain Gamou"
            accent
          />
        </section>
      </>
    )

    membres = (
      <ListeMembres
        titre="Membres complets pour le Gamou"
        libelleComplet="complets"
        lignes={((situation ?? []) as SituationGamou[]).map((s) => ({
          membre_id: s.membre_id,
          numero_membre: s.numero_membre,
          prenom: s.prenom,
          nom: s.nom,
          surnom: s.surnom,
          categorie: s.categorie,
          verse: Number(s.total_verse ?? 0),
          reste: Number(s.reste ?? 0),
        }))}
      />
    )
  } else {
    const [{ data: bilan }, { data: parts }] = await Promise.all([
      supabase
        .from('v_bilan_evenements')
        .select('collecte, depense, a_des_parts')
        .eq('evenement_id', id)
        .maybeSingle(),
      supabase
        .from('v_contributions_evenement')
        .select('membre_id, numero_membre, prenom, nom, surnom, categorie, verse, reste')
        .eq('evenement_id', id)
        .order('nom'),
    ])
    const collecte = Number(bilan?.collecte ?? 0)
    const depense = Number(bilan?.depense ?? 0)
    const budget = Number(evt.budget ?? 0)

    cartes = (
      <section className="mb-8 grid grid-cols-3 gap-3">
        <Carte
          titre="Collecté"
          montant={collecte}
          note={budget > 0 ? `sur ${formaterMontant(budget)} prévus` : undefined}
        />
        <Carte titre="Dépensé" montant={depense} />
        <Carte titre="Reste" montant={collecte - depense} accent />
      </section>
    )

    if (bilan?.a_des_parts) {
      membres = (
        <ListeMembres
          titre="Parts des membres"
          libelleComplet="ont payé leur part"
          lignes={(parts ?? []).map((p) => ({
            membre_id: p.membre_id,
            numero_membre: p.numero_membre,
            prenom: p.prenom,
            nom: p.nom,
            surnom: p.surnom,
            categorie: p.categorie,
            verse: Number(p.verse ?? 0),
            reste: Number(p.reste ?? 0),
          }))}
        />
      )
    }
  }

  const parPoste = new Map<string, number>()
  for (const d of depenses ?? []) {
    if (d.statut !== 'validee') continue
    const poste = d.categorie || 'Divers'
    parPoste.set(poste, (parPoste.get(poste) ?? 0) + Number(d.montant))
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href="/evenements"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Événements
        </Link>
        <h1 className="text-2xl font-bold">{evt.titre}</h1>
        <p className="capitalize text-muted-foreground">
          {evt.debut_le ? dateLongue.format(new Date(evt.debut_le)) : ''}
        </p>
        <p className="text-sm text-muted-foreground">
          {evt.lieu ? `${evt.lieu} · ` : ''}Caisse : {caisse?.nom ?? '—'}
          {evt.cloture ? ' · Clôturé' : ''}
        </p>
      </header>

      {peutEncaisser && !evt.cloture && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {evt.est_gamou ? (
            <>
              <Link href="/encaisser" className="block">
                <Button className="h-14 w-full text-base font-semibold">Encaisser une cotisation</Button>
              </Link>
              <Link href={`/encaisser?evenement=${evt.id}`} className="block">
                <Button variant="outline" className="h-14 w-full text-base">Encaisser un don</Button>
              </Link>
            </>
          ) : (
            <Link href={`/encaisser?evenement=${evt.id}`} className="block">
              <Button className="h-14 w-full text-base font-semibold">Encaisser</Button>
            </Link>
          )}
          <Link href={`/depenses/nouvelle?evenement=${evt.id}`} className="block">
            <Button variant="outline" className="h-14 w-full text-base">Ajouter une dépense</Button>
          </Link>
        </div>
      )}

            {cartes}

      {voitFinances && (
        <section className="mb-8 rounded-xl border p-4">
          <p className="font-semibold">Bilan de l&apos;événement</p>
          <p className="mb-3 text-sm text-muted-foreground">
            Un PDF avec les chiffres, les versements des membres et les dépenses, à partager
            au bureau ou dans le groupe WhatsApp du dahira.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <BoutonPdf
              url={`/evenements/${evt.id}/bilan`}
              nomFichier={`Bilan-${evt.titre.replace(/\s+/g, '-')}.pdf`}
              titre={`Bilan ${evt.titre}`}
              libelle="Partager le bilan"
              variante="default"
              className="h-12 w-full text-base"
            />
            <BoutonPdf
              url={`/evenements/${evt.id}/bilan?membres=0`}
              nomFichier={`Bilan-${evt.titre.replace(/\s+/g, '-')}.pdf`}
              titre={`Bilan ${evt.titre}`}
              libelle="Sans la liste des membres"
              className="h-12 w-full text-base"
            />
          </div>
        </section>
      )}
      {membres}

      {voitFinances && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Dépenses</h2>

          {parPoste.size > 0 && (
            <ul className="mb-4 space-y-1 rounded-xl bg-muted p-4 text-sm">
              {[...parPoste.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([poste, total]) => (
                  <li key={poste} className="flex justify-between">
                    <span>{poste}</span>
                    <span className="montant">{formaterMontant(total)}</span>
                  </li>
                ))}
            </ul>
          )}

          {(depenses ?? []).length === 0 ? (
            <p className="rounded-lg bg-muted p-4 text-muted-foreground">
              Aucune dépense enregistrée pour cet événement.
            </p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {(depenses ?? []).map((d) => (
                <li key={d.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{d.motif}</p>
                    <p className="text-sm text-muted-foreground">
                      {d.beneficiaire}
                      {d.categorie ? ` · ${d.categorie}` : ''} · {STATUT_DEPENSE[d.statut] ?? d.statut}
                    </p>
                  </div>
                  <span
                    className={`montant shrink-0 ${d.statut === 'rejetee' ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {formaterMontant(d.montant)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  )
}