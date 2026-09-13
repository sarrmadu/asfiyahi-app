'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { normaliserTelephone } from '@/lib/format'

export type EtatConnexion = { erreur?: string }

/**
 * Connexion par numéro de téléphone et mot de passe.
 *
 * Supabase Auth exige un identifiant email ou téléphone. On utilise le mode
 * email avec une adresse dérivée du numéro : le membre ne voit jamais cette
 * adresse, il saisit uniquement son numéro. Cela évite d'avoir à brancher un
 * fournisseur SMS payant dès le départ, tout en gardant le téléphone comme
 * identifiant naturel.
 */
export async function seConnecter(
  _prec: EtatConnexion,
  formData: FormData
): Promise<EtatConnexion> {
  const saisie = String(formData.get('telephone') ?? '')
  const motDePasse = String(formData.get('motDePasse') ?? '')
  const suite = String(formData.get('suite') ?? '/')

  const telephone = normaliserTelephone(saisie)
  if (!telephone) {
    return { erreur: 'Numéro invalide. Exemple : 77 123 45 67' }
  }
  if (motDePasse.length < 6) {
    return { erreur: 'Mot de passe trop court.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: emailInterne(telephone),
    password: motDePasse,
  })

  if (error) {
    // Message volontairement vague : ne pas révéler si le numéro existe.
    return { erreur: 'Numéro ou mot de passe incorrect.' }
  }

  revalidatePath('/', 'layout')
  redirect(suite.startsWith('/') ? suite : '/')
}

export async function seDeconnecter() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/connexion')
}

/**
 * Adresse technique dérivée du numéro. Jamais affichée au membre.
 * Le domaine .invalid est réservé par la RFC 2606 : il ne peut pas exister
 * réellement, ce qui évite tout envoi de courrier par erreur.
 */
function emailInterne(telephoneE164: string): string {
  return `${telephoneE164.replace('+', '')}@dahira.invalid`
}
