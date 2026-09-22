'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { exigerRole } from '@/lib/auth'
import { francsEnCentimes } from '@/lib/format'

export type EtatCategories = { erreur?: string; ok?: string }

export async function enregistrerCotisations(
  _prec: EtatCategories,
  formData: FormData
): Promise<EtatCategories> {
  await exigerRole(['president'])
  const supabase = await createClient()

  for (const [cle, valeur] of formData.entries()) {
    if (!cle.startsWith('coti_')) continue
    const id = cle.slice(5)
    const chiffres = String(valeur).replace(/\D/g, '')
    const { error } = await supabase
      .from('categories_membre')
      .update({ cotisation_mensuelle: chiffres ? francsEnCentimes(chiffres) : null })
      .eq('id', id)
    if (error) return { erreur: `Enregistrement impossible : ${error.message}` }
  }

  revalidatePath('/categories')
  revalidatePath('/membres')
  revalidatePath('/bureau')
  return { ok: 'Cotisations enregistrées.' }
}