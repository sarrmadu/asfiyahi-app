'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { exigerRole } from '@/lib/auth'
import { francsEnCentimes } from '@/lib/format'

export type EtatEvenement = { erreur?: string }

export async function creerEvenement(
  _prec: EtatEvenement,
  formData: FormData
): Promise<EtatEvenement> {
  await exigerRole(['president', 'secretaire'])
  const texte = (cle: string) => String(formData.get(cle) ?? '').trim()
  const chiffres = (cle: string) => texte(cle).replace(/\D/g, '')

  const estGamou = texte('type') === 'gamou'
  const titre = texte('titre')
  const date = texte('date')
  const caisseId = texte('caisse_id')

  if (!titre) return { erreur: "Le nom de l'événement est obligatoire." }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)) return { erreur: 'Date invalide.' }
  if (!estGamou && !caisseId) return { erreur: "Choisissez la caisse de l'événement." }

  const parts: { categorie_id: string; montant: number }[] = []
  for (const [cle, valeur] of formData.entries()) {
    if (!cle.startsWith('part_') || cle === 'part_defaut') continue
    const f = String(valeur).replace(/\D/g, '')
    if (f) parts.push({ categorie_id: cle.slice(5), montant: francsEnCentimes(f) })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('creer_evenement', {
    p_titre: titre,
    p_debut: `${date}:00Z`,
    p_caisse_id: caisseId || '00000000-0000-0000-0000-000000000000',
    p_lieu: texte('lieu') || undefined,
    p_description: texte('description') || undefined,
    p_budget: chiffres('budget') ? francsEnCentimes(chiffres('budget')) : undefined,
    p_part_defaut: chiffres('part_defaut') ? francsEnCentimes(chiffres('part_defaut')) : undefined,
    p_parts: parts,
    p_est_gamou: estGamou,
  })

  if (error) return { erreur: error.message }

  revalidatePath('/evenements')
  redirect(`/evenements/${data}`)
}