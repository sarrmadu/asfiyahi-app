import { getMembreCourant } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { nomAffiche } from '@/lib/format'
import { genererRecuPdf } from '@/lib/recu-pdf'

/**
 * GET /recus/<id>/pdf : le reçu au format PDF.
 * Les règles de la base décident qui peut le lire : le membre concerné,
 * le président, le trésorier et le commissaire aux comptes.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Le logo est chargé une fois puis gardé en mémoire
let logoEnCache: Uint8Array | null = null

async function chargerLogo(origine: string): Promise<Uint8Array | null> {
  if (logoEnCache) return logoEnCache
  try {
    const rep = await fetch(new URL('/logo.png', origine))
    if (!rep.ok) return null
    logoEnCache = new Uint8Array(await rep.arrayBuffer())
    return logoEnCache
  } catch {
    return null
  }
}

/** Une relation peut revenir sous forme d'objet ou de tableau selon les types. */
function un<T>(valeur: T | T[] | null | undefined): T | null {
  if (Array.isArray(valeur)) return valeur[0] ?? null
  return valeur ?? null
}

type Personne = { prenom: string; nom: string; surnom?: string | null; numero_membre?: string }

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const moi = await getMembreCourant()
  if (!moi) return new Response('Connexion requise.', { status: 401 })

  const { id } = await params
  if (!UUID.test(id)) return new Response('Reçu introuvable.', { status: 404 })

  const supabase = await createClient()
  const { data: recu } = await supabase
    .from('recus')
    .select(
      `id, numero, genere_le, ecriture_id,
       membre:membres!recus_membre_id_fkey(prenom, nom, surnom, numero_membre),
       ecriture:ecritures!recus_ecriture_id_fkey(
         montant, libelle, mode, date_operation,
         caisse:caisses!ecritures_caisse_id_fkey(nom),
         auteur:membres!ecritures_cree_par_fkey(prenom, nom, surnom)
       )`
    )
    .eq('id', id)
    .maybeSingle()

  if (!recu) return new Response('Reçu introuvable.', { status: 404 })

  const ecriture = un(recu.ecriture as unknown) as {
    montant: number
    libelle: string
    mode: string
    date_operation: string
    caisse: { nom: string } | { nom: string }[] | null
    auteur: Personne | Personne[] | null
  } | null
  const membre = un(recu.membre as unknown) as Personne | null
  if (!ecriture || !membre) return new Response('Reçu introuvable.', { status: 404 })

  const [{ data: dahira }, { data: annulation }, logo] = await Promise.all([
    supabase.from('dahiras').select('nom, ville, pays').eq('id', moi.dahiraId).maybeSingle(),
    supabase
      .from('ecritures')
      .select('motif_annulation')
      .eq('annule_ecriture_id', recu.ecriture_id)
      .maybeSingle(),
    chargerLogo(request.url),
  ])

  const auteur = un(ecriture.auteur)
  const pdf = await genererRecuPdf(
    {
      numero: recu.numero,
      dahiraNom: dahira?.nom ?? 'Dahira Asfiyahi Mbour',
      dahiraVille: [dahira?.ville, dahira?.pays].filter(Boolean).join(', ') || null,
      membreNom: nomAffiche(membre),
      membreNumero: membre.numero_membre ?? '',
      montantCentimes: Number(ecriture.montant),
      objet: ecriture.libelle,
      caisse: un(ecriture.caisse)?.nom ?? '',
      mode: ecriture.mode,
      dateVersement: ecriture.date_operation,
      encaissePar: auteur ? `${auteur.prenom} ${auteur.nom}` : null,
      genereLe: recu.genere_le,
      annule: annulation ? { motif: annulation.motif_annulation ?? '' } : null,
    },
    logo
  )

  return new Response(new Blob([pdf as BlobPart], { type: 'application/pdf' }), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Recu-${recu.numero}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}