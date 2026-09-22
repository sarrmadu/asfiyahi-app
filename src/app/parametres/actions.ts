'use server'

import { revalidatePath } from 'next/cache'
import { exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { francsEnCentimes, normaliserTelephone } from '@/lib/format'

export type EtatParametres = { erreur?: string; ok?: boolean }

function rafraichir() {
  revalidatePath('/', 'layout')
}

export async function enregistrerParametres(
  _prec: EtatParametres,
  formData: FormData
): Promise<EtatParametres> {
  const moi = await exigerRole(['president'])
  const texte = (cle: string) => String(formData.get(cle) ?? '').trim()

  const nom = texte('nom')
  const nomCourt = texte('nom_court')
  const ville = texte('ville')
  const wave = texte('numero_wave')
  const om = texte('numero_orange_money')
  const seuil = francsEnCentimes(texte('seuil').replace(/\D/g, '') || '0')
  const cotisation = francsEnCentimes(texte('cotisation_defaut').replace(/\D/g, '') || '0')

  if (nom.length < 3 || nom.length > 80) return { erreur: 'Le nom doit faire entre 3 et 80 caractères.' }
  if (nomCourt.length < 2 || nomCourt.length > 30) return { erreur: 'Le nom court doit faire entre 2 et 30 caractères.' }
  if (ville.length > 60) return { erreur: 'Ville trop longue.' }

  const numeroWave = wave ? normaliserTelephone(wave) : null
  if (wave && !numeroWave) return { erreur: 'Numéro Wave invalide. Exemple : 77 123 45 67' }
  const numeroOm = om ? normaliserTelephone(om) : null
  if (om && !numeroOm) return { erreur: 'Numéro Orange Money invalide. Exemple : 77 123 45 67' }

  if (seuil < 100000) return { erreur: 'Le seuil de double validation doit être d’au moins 1 000 F.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('dahiras')
    .update({
      nom,
      nom_court: nomCourt,
      ville: ville || null,
      numero_wave: numeroWave,
      numero_orange_money: numeroOm,
      seuil_double_validation: seuil,
      cotisation_defaut: cotisation,
    })
    .eq('id', moi.dahiraId)

  if (error) return { erreur: 'Enregistrement impossible. Réessayez.' }

  rafraichir()
  return { ok: true }
}

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

export async function changerLogo(formData: FormData): Promise<{ ok: true } | { ok: false; erreur: string }> {
  const moi = await exigerRole(['president'])
  const fichier = formData.get('logo')
  if (!(fichier instanceof File)) return { ok: false, erreur: 'Aucune image reçue.' }
  if (fichier.size > 1024 * 1024) return { ok: false, erreur: 'Image trop lourde (1 Mo maximum).' }

  const octets = new Uint8Array(await fichier.arrayBuffer())
  if (!PNG.every((b, i) => octets[i] === b)) return { ok: false, erreur: 'Format d’image non reconnu.' }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return { ok: false, erreur: 'Configuration incomplète : clé secrète Supabase absente du serveur.' }
  }

  // Un nom de fichier nouveau à chaque fois : aucun ancien logo gardé en cache
  const chemin = `logo-${Date.now()}.png`
  const { error } = await admin.storage.from('dahira').upload(chemin, octets, {
    contentType: 'image/png',
    upsert: false,
  })
  if (error) return { ok: false, erreur: 'Envoi de l’image impossible. Réessayez.' }

  const { data } = admin.storage.from('dahira').getPublicUrl(chemin)

  const supabase = await createClient()
  const { error: erreurMaj } = await supabase
    .from('dahiras')
    .update({ logo_complet_url: data.publicUrl })
    .eq('id', moi.dahiraId)
  if (erreurMaj) return { ok: false, erreur: 'Logo envoyé mais non enregistré. Réessayez.' }

  rafraichir()
  return { ok: true }
}

export async function remettreLogoOrigine(): Promise<{ ok: true } | { ok: false; erreur: string }> {
  const moi = await exigerRole(['president'])
  const supabase = await createClient()
  const { error } = await supabase.from('dahiras').update({ logo_complet_url: null }).eq('id', moi.dahiraId)
  if (error) return { ok: false, erreur: 'Impossible. Réessayez.' }
  rafraichir()
  return { ok: true }
}