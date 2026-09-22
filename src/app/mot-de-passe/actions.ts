'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getMembreCourant } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export type EtatMotDePasse = { erreur?: string }

export async function changerMotDePasse(
  _prec: EtatMotDePasse,
  formData: FormData
): Promise<EtatMotDePasse> {
  const moi = await getMembreCourant()
  if (!moi) redirect('/connexion')

  const motDePasse = String(formData.get('motDePasse') ?? '')
  const confirmation = String(formData.get('confirmation') ?? '')

  if (motDePasse.length < 8) {
    return { erreur: 'Au moins 8 caractères.' }
  }
  if (/^(\d)\1+$/.test(motDePasse) || motDePasse === '12345678' || motDePasse === '87654321') {
    return { erreur: 'Ce mot de passe est trop facile à deviner.' }
  }
  if (motDePasse !== confirmation) {
    return { erreur: 'Les deux mots de passe ne sont pas identiques.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: motDePasse,
    data: { doit_changer_mdp: false },
  })

  if (error) {
    if (error.code === 'same_password') {
      return { erreur: 'Choisissez un mot de passe différent de l’ancien.' }
    }
    if (error.code === 'weak_password') {
      return { erreur: 'Mot de passe trop faible. Mélangez lettres et chiffres.' }
    }
    return { erreur: 'Enregistrement impossible. Réessayez dans un instant.' }
  }

  revalidatePath('/', 'layout')
  redirect('/?mdp=ok')
}