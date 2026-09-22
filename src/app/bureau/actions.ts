'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ResultatAnnulation = { ok: true } | { ok: false; erreur: string }

export async function annulerOperation(
  ecritureId: string,
  motif: string
): Promise<ResultatAnnulation> {
  if (motif.trim().length < 5) {
    return { ok: false, erreur: "Indiquez le motif de l'annulation (5 caractères minimum)." }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('annuler_ecriture', {
    p_ecriture_id: ecritureId,
    p_motif: motif.trim().slice(0, 300),
  })

  if (error) return { ok: false, erreur: error.message }

  revalidatePath('/bureau')
  revalidatePath('/membres')
  revalidatePath('/')
  return { ok: true }
}