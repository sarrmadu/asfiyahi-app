'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { exigerRole } from '@/lib/auth'
import { francsEnCentimes } from '@/lib/format'

export type EtatDepense = { erreur?: string }
export type Resultat = { ok: true } | { ok: false; erreur: string }

const MODES = ['especes', 'wave', 'orange_money', 'free_money', 'virement'] as const
type Mode = (typeof MODES)[number]

function rafraichir() {
  revalidatePath('/depenses')
  revalidatePath('/bureau')
  revalidatePath('/evenements', 'layout')
}

export async function enregistrerDepense(
  _prec: EtatDepense,
  formData: FormData
): Promise<EtatDepense> {
  await exigerRole(['tresorier', 'president'])
  const texte = (cle: string) => String(formData.get(cle) ?? '').trim()

  const evenementId = texte('evenement_id') || null
  const caisseId = texte('caisse_id')
  const montant = texte('montant').replace(/\D/g, '')
  const mode = texte('mode') as Mode
  const beneficiaire = texte('beneficiaire')
  const motif = texte('motif')
  const poste = texte('poste')
  const date = texte('date')

  if (!montant || Number(montant) <= 0) return { erreur: 'Indiquez le montant.' }
  if (!beneficiaire || !motif) return { erreur: 'Le bénéficiaire et le motif sont obligatoires.' }
  if (!MODES.includes(mode)) return { erreur: 'Mode de paiement invalide.' }
  if (!evenementId && !caisseId) return { erreur: 'Choisissez la caisse.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { erreur: 'Date invalide.' }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('enregistrer_depense', {
    p_caisse_id: caisseId || '00000000-0000-0000-0000-000000000000',
    p_montant: francsEnCentimes(montant),
    p_mode: mode,
    p_beneficiaire: beneficiaire,
    p_motif: motif,
    p_categorie: poste || undefined,
    p_evenement_id: evenementId ?? undefined,
    p_date: date,
  })

  if (error) return { erreur: error.message }

  rafraichir()
  const statut = data?.[0]?.statut
  const message =
    statut === 'validee'
      ? 'Dépense enregistrée.'
      : 'Dépense enregistrée. Elle attend la validation du président.'
  redirect(
    evenementId
      ? `/evenements/${evenementId}`
      : `/depenses?ok=${encodeURIComponent(message)}`
  )
}

export async function validerDepense(id: string): Promise<Resultat> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('valider_depense', { p_depense_id: id })
  if (error) return { ok: false, erreur: error.message }
  rafraichir()
  return { ok: true }
}

export async function rejeterDepense(id: string, motif: string): Promise<Resultat> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('rejeter_depense', { p_depense_id: id, p_motif: motif })
  if (error) return { ok: false, erreur: error.message }
  rafraichir()
  return { ok: true }
}