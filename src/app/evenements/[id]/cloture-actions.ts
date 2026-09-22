'use server'

import { revalidatePath } from 'next/cache'
import { exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function cloturerEvenement(id: string): Promise<{ ok: true } | { ok: false; erreur: string }> {
  await exigerRole(['president'])
  const supabase = await createClient()

  const { error } = await supabase.rpc('cloturer_evenement', { p_evenement_id: id })
  if (error) return { ok: false, erreur: error.message }

  revalidatePath(`/evenements/${id}`)
  revalidatePath('/evenements')
  revalidatePath('/encaisser')
  revalidatePath('/')
  return { ok: true }
}