'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { exigerMembre } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { francsEnCentimes } from '@/lib/format'

export type EtatDeclaration = { erreur?: string }

const MODES = ['wave', 'orange_money', 'free_money'] as const
type Mode = (typeof MODES)[number]

export async function declarer(_prec: EtatDeclaration, formData: FormData): Promise<EtatDeclaration> {
  await exigerMembre()

  const texte = (cle: string) => String(formData.get(cle) ?? '').trim()
  const montant = francsEnCentimes(texte('montant').replace(/\D/g, '') || '0')
  const mode = texte('mode') as Mode
  const reference = texte('reference')
  const date = texte('date')
  const evenementId = texte('evenement_id')
  const commentaire = texte('commentaire')

  if (!MODES.includes(mode)) return { erreur: 'Choisissez Wave, Orange Money ou Free Money.' }
  if (montant <= 0) return { erreur: 'Indiquez le montant envoyé.' }
  if (reference.length < 4) {
    return { erreur: 'Recopiez la référence de la transaction indiquée dans le SMS.' }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { erreur: 'Date invalide.' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('declarer_paiement', {
    p_montant: montant,
    p_mode: mode,
    p_reference: reference.slice(0, 60),
    p_date: date,
    ...(evenementId ? { p_evenement_id: evenementId } : {}),
    ...(commentaire ? { p_commentaire: commentaire.slice(0, 300) } : {}),
  })

  if (error) return { erreur: error.message }

  revalidatePath('/')
  revalidatePath('/declarations')
  revalidatePath('/bureau')
  redirect('/?declaration=ok')
}