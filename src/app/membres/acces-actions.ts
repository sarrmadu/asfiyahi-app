'use server'

import { randomInt } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { exigerRole, type RoleType } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type ResultatAcces =
  | { ok: true; motDePasse: string; telephone: string; prenom: string }
  | { ok: false; erreur: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Même adresse technique que la page de connexion : 221771234567@dahira.invalid */
function adresseTechnique(telephoneE164: string): string {
  return `${telephoneE164.replace('+', '')}@dahira.invalid`
}

/** 8 caractères faciles à lire et à recopier (pas de 0/O, 1/l/i). */
function motDePasseProvisoire(): string {
  const lettres = 'abcdefghjkmnpqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += lettres[randomInt(lettres.length)]
  return `${s.slice(0, 4)}-${s.slice(4)}`
}

type Admin = ReturnType<typeof createAdminClient>

/** Retrouve un compte existant par son adresse (cas d'un ancien essai). */
async function trouverCompte(admin: Admin, email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) return null
    const trouve = data.users.find((u) => u.email?.toLowerCase() === email)
    if (trouve) return trouve.id
    if (data.users.length < 1000) return null
  }
  return null
}

/**
 * Crée l'accès d'un membre, ou lui donne un nouveau mot de passe provisoire
 * s'il en a déjà un (mot de passe oublié). Le membre devra le changer à sa
 * première connexion.
 */
export async function donnerAcces(membreId: string): Promise<ResultatAcces> {
  const moi = await exigerRole(['president', 'secretaire'])
  if (!UUID.test(membreId)) return { ok: false, erreur: 'Membre introuvable.' }

  const supabase = await createClient()
  const { data: m } = await supabase
    .from('membres')
    .select('id, prenom, telephone, statut, user_id, membre_roles!membre_roles_membre_id_fkey(role)')
    .eq('id', membreId)
    .maybeSingle()

  if (!m) return { ok: false, erreur: 'Membre introuvable.' }
  if (m.id === moi.id) {
    return { ok: false, erreur: 'Pour votre propre compte, utilisez « Changer mon mot de passe » sur l’accueil.' }
  }
  if (m.statut === 'inactif') return { ok: false, erreur: 'Ce membre est inactif.' }
  if (!m.telephone) {
    return { ok: false, erreur: 'Ajoutez d’abord son numéro de téléphone : c’est son identifiant.' }
  }
  const roles = (m.membre_roles as { role: RoleType }[] | null) ?? []
  if (roles.length > 0 && !moi.roles.includes('president')) {
    return { ok: false, erreur: 'Seul le président peut gérer l’accès d’un membre du bureau.' }
  }

  const email = adresseTechnique(m.telephone)
  const motDePasse = motDePasseProvisoire()
  const metadonnees = { doit_changer_mdp: true }

  let admin: Admin
  try {
    admin = createAdminClient()
  } catch {
    return { ok: false, erreur: 'Configuration incomplète : clé secrète Supabase absente du serveur.' }
  }

  if (m.user_id) {
    // Déjà un accès : nouveau mot de passe (et numéro mis à jour s'il a changé)
    const { error } = await admin.auth.admin.updateUserById(m.user_id, {
      email,
      password: motDePasse,
      email_confirm: true,
      user_metadata: metadonnees,
    })
    if (error) return { ok: false, erreur: 'Impossible de changer le mot de passe. Réessayez.' }
  } else {
    let userId: string | null = null
    let cree = false
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: motDePasse,
      email_confirm: true,
      user_metadata: metadonnees,
    })
    if (data?.user) {
      userId = data.user.id
      cree = true
    } else if (error?.code === 'email_exists') {
      // Un compte existe déjà pour ce numéro : on le reprend s'il est libre
      userId = await trouverCompte(admin, email)
      if (userId) {
        const { data: autre } = await admin
          .from('membres')
          .select('prenom, nom')
          .eq('user_id', userId)
          .maybeSingle()
        if (autre) {
          return { ok: false, erreur: `Ce numéro sert déjà à ${autre.prenom} ${autre.nom} pour se connecter.` }
        }
        await admin.auth.admin.updateUserById(userId, { password: motDePasse, user_metadata: metadonnees })
      }
    }
    if (!userId) return { ok: false, erreur: 'Création de l’accès impossible. Réessayez.' }

    const { error: erreurLien } = await admin
      .from('membres')
      .update({ user_id: userId })
      .eq('id', m.id)
      .is('user_id', null)
    if (erreurLien) {
      if (cree) await admin.auth.admin.deleteUser(userId)
      return { ok: false, erreur: 'Le compte n’a pas pu être rattaché au membre. Réessayez.' }
    }
  }

  revalidatePath(`/membres/${m.id}`)
  return { ok: true, motDePasse, telephone: m.telephone, prenom: m.prenom }
}