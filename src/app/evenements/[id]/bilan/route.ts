import { aRole, getMembreCourant } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formaterMontant, nomAffiche } from '@/lib/format'
import { genererBilanPdf, type CarteBilan, type TableauBilan } from '@/lib/bilan-pdf'

/**
 * GET /evenements/<id>/bilan : bilan de l'événement en PDF.
 *   ?membres=0 : version sans la liste nominative des membres
 * Réservé au président, au trésorier et au commissaire aux comptes.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const dateLongue = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Dakar',
})
const dateSimple = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Dakar',
})
const dateCourte = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Africa/Dakar',
})
const heure = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Dakar',
})

async function chargerLogo(origine: string): Promise<Uint8Array | null> {
  try {
    const rep = await fetch(new URL('/logo-dahira.png', origine), { cache: 'no-store' })
    if (!rep.ok) return null
    return new Uint8Array(await rep.arrayBuffer())
  } catch {
    return null
  }
}

function un<T>(valeur: T | T[] | null | undefined): T | null {
  if (Array.isArray(valeur)) return valeur[0] ?? null
  return valeur ?? null
}

const F = (centimes: number) => formaterMontant(centimes)
const jourCourt = (iso: string) => dateCourte.format(new Date(`${iso}T12:00:00Z`))

function nomFichier(titre: string): string {
  const base = titre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `Bilan-${base || 'evenement'}.pdf`
}

type Personne = {
  id: string
  prenom: string
  nom: string
  surnom: string | null
  numero_membre: string
  categories_membre: { nom: string } | { nom: string }[] | null
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const moi = await getMembreCourant()
  if (!moi) return new Response('Connexion requise.', { status: 401 })
  if (!aRole(moi, ['president', 'tresorier', 'commissaire'])) {
    return new Response('Accès réservé au président, au trésorier et au commissaire aux comptes.', {
      status: 403,
    })
  }

  const { id } = await params
  if (!UUID.test(id)) return new Response('Événement introuvable.', { status: 404 })
  const avecMembres = new URL(request.url).searchParams.get('membres') !== '0'

  const supabase = await createClient()
  const { data: evt } = await supabase
    .from('evenements')
    .select('id, titre, debut_le, lieu, budget, cloture, est_gamou, caisses(nom)')
    .eq('id', id)
    .maybeSingle()
  if (!evt) return new Response('Événement introuvable.', { status: 404 })

  const [{ data: dahira }, { data: journal }, { data: depenses }, logo] = await Promise.all([
    supabase.from('dahiras').select('nom, ville, pays').eq('id', moi.dahiraId).maybeSingle(),
    // Journal de l'événement, sans les opérations annulées
    supabase
      .from('v_ecritures_effectives')
      .select('sens, montant, membre_id, depense_id')
      .eq('evenement_id', id),
    supabase
      .from('depenses')
      .select('id, montant, beneficiaire, motif, categorie, date_depense')
      .eq('evenement_id', id)
      .eq('statut', 'validee')
      .order('date_depense'),
    chargerLogo(request.url),
  ])

  // --- Versements par membre (dons compris) -----------------------------------
  const versements = new Map<string, number>()
  const depensesEffectives = new Set<string>()
  for (const e of journal ?? []) {
    if (e.sens === 'recette' && e.membre_id) {
      versements.set(e.membre_id, (versements.get(e.membre_id) ?? 0) + Number(e.montant))
    }
    if (e.sens === 'depense' && e.depense_id) depensesEffectives.add(e.depense_id)
  }

  const idsMembres = [...versements.keys()]
  const { data: personnes } = idsMembres.length
    ? await supabase
        .from('membres')
        .select('id, prenom, nom, surnom, numero_membre, categories_membre(nom)')
        .in('id', idsMembres)
    : { data: [] as Personne[] }
  const fiche = new Map(((personnes ?? []) as unknown as Personne[]).map((p) => [p.id, p]))

  // --- Dépenses (hors dépenses annulées dans le journal) -----------------------
  const listeDepenses = (depenses ?? []).filter((d) => depensesEffectives.has(d.id))
  const totalDepenses = listeDepenses.reduce((t, d) => t + Number(d.montant), 0)
  const parPoste = new Map<string, number>()
  for (const d of listeDepenses) {
    const poste = d.categorie || 'Divers'
    parPoste.set(poste, (parPoste.get(poste) ?? 0) + Number(d.montant))
  }

  const tableauDepenses: TableauBilan = {
    titre: 'Dépenses',
    colonnes: [
      { titre: 'Date', largeur: 12 },
      { titre: 'Poste', largeur: 16 },
      { titre: 'Bénéficiaire', largeur: 22 },
      { titre: 'Motif', largeur: 32 },
      { titre: 'Montant', largeur: 18, droite: true },
    ],
    lignes: listeDepenses.map((d) => [
      jourCourt(d.date_depense),
      d.categorie || 'Divers',
      d.beneficiaire,
      d.motif,
      F(Number(d.montant)),
    ]),
    total: ['', '', '', 'Total des dépenses', F(totalDepenses)],
    vide: 'Aucune dépense validée.',
  }
  const tableauPostes: TableauBilan = {
    titre: 'Dépenses par poste',
    colonnes: [
      { titre: 'Poste', largeur: 60 },
      { titre: 'Part', largeur: 15, droite: true },
      { titre: 'Montant', largeur: 25, droite: true },
    ],
    lignes: [...parPoste.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([poste, total]) => [
        poste,
        totalDepenses > 0 ? `${Math.round((total / totalDepenses) * 100)} %` : '',
        F(total),
      ]),
  }

  // --- Contenu selon le type d'événement --------------------------------------
  const caisse = un(evt.caisses as { nom: string } | { nom: string }[] | null)
  const infos = [
    [evt.debut_le ? dateLongue.format(new Date(evt.debut_le)) : '', evt.lieu].filter(Boolean).join(' · '),
  ]
  const cartes: CarteBilan[] = []
  const remarques: string[] = []
  const tableaux: TableauBilan[] = []

  const ligneDon = (membreId: string, montant: number) => {
    const p = fiche.get(membreId)
    return [p?.numero_membre ?? '', p ? nomAffiche(p) : 'Membre', F(montant)]
  }
  const colonnesDons = [
    { titre: 'N°', largeur: 12 },
    { titre: 'Membre', largeur: 63 },
    { titre: 'Montant', largeur: 25, droite: true },
  ]

  if (evt.est_gamou) {
    const [{ data: bilan }, { data: situation }] = await Promise.all([
      supabase.rpc('bilan_gamou', { p_evenement_id: id }).maybeSingle(),
      supabase.rpc('situation_gamou', { p_evenement_id: id }),
    ])
    const b = bilan as {
      date_debut: string; report: number; cotisations: number; dons: number; depenses: number; reste: number
    } | null
    const lignes = (situation ?? []) as {
      numero_membre: string; prenom: string; nom: string; surnom: string | null
      categorie: string | null; total_du: number; total_verse: number; reste: number
    }[]

    if (b) infos.push(`Caisse : ${caisse?.nom ?? 'Mensualités'} · cycle de cotisation du ${dateSimple.format(new Date(`${b.date_debut}T12:00:00Z`))} au Gamou`)
    cartes.push(
      { libelle: 'Report de l’an dernier', valeur: F(Number(b?.report ?? 0)) },
      { libelle: 'Cotisations de l’année', valeur: F(Number(b?.cotisations ?? 0)) },
      { libelle: 'Dons', valeur: F(Number(b?.dons ?? 0)) },
      { libelle: 'Dépenses', valeur: F(Number(b?.depenses ?? 0)) },
      { libelle: 'Reste', valeur: F(Number(b?.reste ?? 0)), note: 'reporté sur le prochain Gamou', accent: true },
    )
    if (evt.budget) cartes.push({ libelle: 'Budget prévu', valeur: F(Number(evt.budget)) })

    const complets = lignes.filter((l) => Number(l.reste) <= 0).length
    const resteTotal = lignes.reduce((t, l) => t + Number(l.reste), 0)
    remarques.push(
      `${complets} membre${complets > 1 ? 's' : ''} complet${complets > 1 ? 's' : ''} sur ${lignes.length}` +
        (resteTotal > 0 ? ` · ${F(resteTotal)} de cotisations restent à collecter` : '')
    )

    if (avecMembres) {
      tableaux.push({
        titre: 'Cotisations des membres',
        sousTitre: 'Dû au Gamou : toutes les mensualités depuis l’adhésion, jusqu’au mois du Gamou.',
        colonnes: [
          { titre: 'N°', largeur: 10 },
          { titre: 'Membre', largeur: 32 },
          { titre: 'Catégorie', largeur: 16 },
          { titre: 'Dû', largeur: 14, droite: true },
          { titre: 'Versé', largeur: 14, droite: true },
          { titre: 'Reste', largeur: 14, droite: true },
        ],
        lignes: lignes.map((l) => [
          l.numero_membre,
          nomAffiche(l),
          l.categorie ?? '',
          F(Number(l.total_du)),
          F(Number(l.total_verse)),
          Number(l.reste) > 0 ? F(Number(l.reste)) : 'Complet',
        ]),
        vide: 'Aucun membre actif.',
      })
      const dons = [...versements.entries()].sort((a, b) => b[1] - a[1])
      tableaux.push({
        titre: 'Dons pour le Gamou',
        colonnes: colonnesDons,
        lignes: dons.map(([m, v]) => ligneDon(m, v)),
        total: ['', 'Total des dons', F(dons.reduce((t, [, v]) => t + v, 0))],
        vide: 'Aucun don enregistré.',
      })
    }
  } else {
    const [{ data: bilan }, { data: parts }] = await Promise.all([
      supabase
        .from('v_bilan_evenements')
        .select('collecte, depense, a_des_parts')
        .eq('evenement_id', id)
        .maybeSingle(),
      supabase
        .from('v_contributions_evenement')
        .select('membre_id, numero_membre, prenom, nom, surnom, categorie, attendu, verse, reste')
        .eq('evenement_id', id)
        .order('nom'),
    ])
    const collecte = Number(bilan?.collecte ?? 0)
    const depense = Number(bilan?.depense ?? 0)
    const budget = Number(evt.budget ?? 0)

    if (caisse) infos.push(`Caisse : ${caisse.nom}`)
    cartes.push(
      { libelle: 'Collecté', valeur: F(collecte), note: budget > 0 ? `sur ${F(budget)} prévus` : undefined },
      { libelle: 'Dépensé', valeur: F(depense) },
      { libelle: 'Reste', valeur: F(collecte - depense), accent: true },
    )
    remarques.push(`${versements.size} membre${versements.size > 1 ? 's ont' : ' a'} contribué.`)

    const lignesParts = parts ?? []
    if (bilan?.a_des_parts) {
      const regles = lignesParts.filter((p) => Number(p.reste ?? 0) <= 0).length
      const resteParts = lignesParts.reduce((t, p) => t + Number(p.reste ?? 0), 0)
      remarques.push(
        `${regles} membre${regles > 1 ? 's ont réglé leur' : ' a réglé sa'} part sur ${lignesParts.length}` +
          (resteParts > 0 ? ` · ${F(resteParts)} restent à collecter` : '')
      )
    }

    if (avecMembres) {
      const avecPart = new Set<string>()
      if (bilan?.a_des_parts) {
        for (const p of lignesParts) if (p.membre_id) avecPart.add(p.membre_id)
        tableaux.push({
          titre: 'Parts des membres',
          colonnes: [
            { titre: 'N°', largeur: 10 },
            { titre: 'Membre', largeur: 32 },
            { titre: 'Catégorie', largeur: 16 },
            { titre: 'Part', largeur: 14, droite: true },
            { titre: 'Versé', largeur: 14, droite: true },
            { titre: 'Reste', largeur: 14, droite: true },
          ],
          lignes: lignesParts.map((p) => [
            p.numero_membre ?? '',
            nomAffiche({ prenom: p.prenom ?? '', nom: p.nom ?? '', surnom: p.surnom }),
            p.categorie ?? '',
            F(Number(p.attendu ?? 0)),
            F(Number(p.verse ?? 0)),
            Number(p.reste ?? 0) > 0 ? F(Number(p.reste)) : 'Réglé',
          ]),
          total: [
            '',
            'Total',
            '',
            F(lignesParts.reduce((t, p) => t + Number(p.attendu ?? 0), 0)),
            F(lignesParts.reduce((t, p) => t + Number(p.verse ?? 0), 0)),
            F(lignesParts.reduce((t, p) => t + Number(p.reste ?? 0), 0)),
          ],
        })
      }
      const autres = [...versements.entries()]
        .filter(([m]) => !avecPart.has(m))
        .sort((a, b) => b[1] - a[1])
      if (!bilan?.a_des_parts || autres.length > 0) {
        tableaux.push({
          titre: bilan?.a_des_parts ? 'Autres versements (dons)' : 'Versements des membres',
          colonnes: colonnesDons,
          lignes: autres.map(([m, v]) => ligneDon(m, v)),
          total: ['', 'Total', F(autres.reduce((t, [, v]) => t + v, 0))],
          vide: 'Aucun versement enregistré.',
        })
      }
    }
  }

  const maintenant = new Date()
  infos.push(
    evt.cloture
      ? 'Bilan définitif (événement clôturé)'
      : `Situation arrêtée au ${dateSimple.format(maintenant)} à ${heure.format(maintenant)}`
  )

  tableaux.push(tableauDepenses)
  if (parPoste.size > 1) tableaux.push(tableauPostes)

  const pdf = await genererBilanPdf(
    {
      dahiraNom: dahira?.nom ?? 'Dahira Asfiyahi Mbour',
      dahiraVille: [dahira?.ville, dahira?.pays].filter(Boolean).join(', ') || null,
      titre: `Bilan : ${evt.titre}`,
      infos,
      cartes,
      remarques,
      tableaux,
      signatures: ['Le trésorier', 'Le président', 'Le commissaire aux comptes'],
      piedDePage: `${dahira?.nom ?? 'Dahira'} · ${evt.titre} · établi le ${dateCourte.format(maintenant)} par ${moi.prenom} ${moi.nom}`,
    },
    logo
  )

  return new Response(new Blob([pdf as BlobPart], { type: 'application/pdf' }), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${nomFichier(evt.titre)}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}