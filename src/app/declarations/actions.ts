'use server'

import { revalidatePath } from 'next/cache'
import { exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export type ResultatValidation =
  | { ok: true; recuId: string | null; numeroRecu: string | null }
  | { ok: false; erreur: string }

function rafraichir() {
  revalidatePath('/declarations')
  revalidatePath('/bureau')
  revalidatePath('/')
}

export async function validerDeclaration(id: string): Promise<ResultatValidation> {
  await exigerRole(['president', 'tresorier'])
  const supabase = await createClient()

  const { data: ecritureId, error } = await supabase.rpc('valider_declaration', {
    p_declaration_id: id,
  })
  if (error) return { ok: false, erreur: error.message }

  const { data: recu } = await supabase
    .from('recus')
    .select('id, numero')
    .eq('ecriture_id', ecritureId as string)
    .maybeSingle()

  rafraichir()
  return { ok: true, recuId: recu?.id ?? null, numeroRecu: recu?.numero ?? null }
}

export async function rejeterDeclaration(
  id: string,
  motif: string
): Promise<{ ok: true } | { ok: false; erreur: string }> {
  await exigerRole(['president', 'tresorier'])
  const supabase = await createClient()

  const { error } = await supabase.rpc('rejeter_declaration', {
    p_declaration_id: id,
    p_motif: motif.slice(0, 300),
  })
  if (error) return { ok: false, erreur: error.message }

  rafraichir()
  return { ok: true }
}