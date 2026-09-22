'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { exigerRole } from '@/lib/auth'
import { francsEnCentimes, normaliserTelephone } from '@/lib/format'

export type EtatFormulaire = { erreur?: string }

const STATUTS = ['actif', 'inactif', 'dispense'] as const
type Statut = (typeof STATUTS)[number]

export async function enregistrerMembre(
  _prec: EtatFormulaire,
  formData: FormData
): Promise<EtatFormulaire> {
  const auteur = await exigerRole(['president', 'secretaire'])
  const supabase = await createClient()

  const texte = (cle: string) => String(formData.get(cle) ?? '').trim()
  const id = texte('id')
  const prenom = texte('prenom')
  const nom = texte('nom')
  const surnom = texte('surnom') || null
  const telSaisi = texte('telephone')
  const sectionId = texte('section_id') || null
  const dateAdhesion = texte('date_adhesion')
  const cotiSaisie = texte('cotisation').replace(/\D/g, '')
  const statut = (texte('statut') || 'actif') as Statut
  const notes = texte('notes') || null

  if (!prenom || !nom) {
    return { erreur: 'Le prénom et le nom sont obligatoires.' }
  }

  let telephone: string | null = null
  if (telSaisi) {
    telephone = normaliserTelephone(telSaisi)
    if (!telephone) {
      return { erreur: 'Numéro de téléphone invalide. Exemple : 77 123 45 67' }
    }
    let requete = supabase
      .from('membres')
      .select('numero_membre, prenom, nom')
      .eq('telephone', telephone)
    if (id) requete = requete.neq('id', id)
    const { data: doublon } = await requete.limit(1).maybeSingle()
    if (doublon) {
      return {
        erreur: `Ce numéro appartient déjà à ${doublon.prenom} ${doublon.nom} (${doublon.numero_membre}).`,
      }
    }
  }

  const aujourdhui = new Date().toISOString().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateAdhesion) || dateAdhesion > aujourdhui) {
    return { erreur: "Date d'adhésion invalide." }
  }

  if (!STATUTS.includes(statut)) {
    return { erreur: 'Statut invalide.' }
  }

  const cotisation = cotiSaisie ? francsEnCentimes(cotiSaisie) : null

  const champs = {
    prenom,
    nom,
    surnom,
    telephone,
    section_id: sectionId,
    date_adhesion: dateAdhesion,
    cotisation_mensuelle: cotisation,
    notes,
  }

  if (id) {
    const { error } = await supabase
      .from('membres')
      .update({ ...champs, statut, modifie_le: new Date().toISOString() })
      .eq('id', id)
    if (error) return { erreur: `Enregistrement impossible : ${error.message}` }

    revalidatePath('/membres')
    redirect(`/membres?ok=${encodeURIComponent(`${prenom} ${nom} : modifications enregistrées`)}`)
  }

  for (let essai = 0; essai < 3; essai++) {
    const { data: dernier } = await supabase
      .from('membres')
      .select('numero_membre')
      .eq('dahira_id', auteur.dahiraId)
      .like('numero_membre', 'M-%')
      .order('numero_membre', { ascending: false })
      .limit(1)
      .maybeSingle()

    const suivant = dernier ? parseInt(dernier.numero_membre.slice(2), 10) + 1 : 1
    const numero = `M-${String(suivant).padStart(4, '0')}`

    const { error } = await supabase.from('membres').insert({
      ...champs,
      dahira_id: auteur.dahiraId,
      numero_membre: numero,
      statut: 'actif',
      cree_par: auteur.id,
    })

    if (!error) {
      revalidatePath('/membres')
      redirect(`/membres?ok=${encodeURIComponent(`${prenom} ${nom} inscrit sous le numéro ${numero}`)}`)
    }
    if (error.code !== '23505') {
      return { erreur: `Enregistrement impossible : ${error.message}` }
    }
  }

  return { erreur: 'Numéro de membre déjà utilisé. Réessayez.' }
}