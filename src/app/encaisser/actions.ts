'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ResultatEncaissement =
  | { ok: true; numeroRecu: string; recuId: string }
  | { ok: false; erreur: string }

const MONTANT_MAX = 10_000_000 * 100

export async function encaisser(entree: {
  membreId: string
  caisseId: string
  montantCentimes: number
  libelle: string
  evenementId?: string | null
}): Promise<ResultatEncaissement> {
  const { membreId, caisseId, montantCentimes, libelle, evenementId } = entree

  if (!membreId || !caisseId) {
    return { ok: false, erreur: 'Choisissez un membre et une caisse.' }
  }
  if (!Number.isInteger(montantCentimes) || montantCentimes <= 0) {
    return { ok: false, erreur: 'Montant invalide.' }
  }
  if (montantCentimes > MONTANT_MAX) {
    return { ok: false, erreur: 'Montant anormalement élevé. Vérifiez la saisie.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('encaisser_especes', {
    p_membre_id: membreId,
    p_caisse_id: caisseId,
    p_montant: montantCentimes,
    p_libelle: libelle.slice(0, 200),
    ...(evenementId ? { p_evenement_id: evenementId } : {}),
  })

  if (error) {
    return { ok: false, erreur: error.message }
  }

  const numeroRecu = data?.[0]?.numero_recu
  const recuId = data?.[0]?.recu_id
  if (!numeroRecu || !recuId) {
    return { ok: false, erreur: 'Encaissement non confirmé. Vérifiez le journal avant de recommencer.' }
  }

  revalidatePath('/')
  revalidatePath('/bureau')
  revalidatePath('/evenements', 'layout')
  return { ok: true, numeroRecu, recuId }
}