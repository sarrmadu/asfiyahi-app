import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

export type RoleType = Database['public']['Enums']['role_type']

export type MembreCourant = {
  id: string
  dahiraId: string
  numeroMembre: string
  prenom: string
  nom: string
  surnom: string | null
  photoUrl: string | null
  roles: RoleType[]
}

/**
 * Récupère le membre connecté avec ses rôles.
 * Renvoie null si non connecté ou si aucune fiche membre n'est rattachée au
 * compte — cas d'un utilisateur créé dans Supabase mais pas encore inscrit
 * comme membre du dahira.
 */
export async function getMembreCourant(): Promise<MembreCourant | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membre } = await supabase
    .from('membres')
    .select('id, dahira_id, numero_membre, prenom, nom, surnom, photo_url')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membre) return null

  const { data: roles } = await supabase
    .from('membre_roles')
    .select('role')
    .eq('membre_id', membre.id)

  return {
    id: membre.id,
    dahiraId: membre.dahira_id,
    numeroMembre: membre.numero_membre,
    prenom: membre.prenom,
    nom: membre.nom,
    surnom: membre.surnom,
    photoUrl: membre.photo_url,
    roles: (roles ?? []).map((r) => r.role),
  }
}

/** Comme getMembreCourant, mais redirige vers /connexion si absent. */
export async function exigerMembre(): Promise<MembreCourant> {
  const membre = await getMembreCourant()
  if (!membre) redirect('/connexion')
  return membre
}

/**
 * Exige au moins un des rôles indiqués.
 * Le contrôle est aussi appliqué en base par les policies RLS : cette fonction
 * sert à afficher une page d'erreur propre plutôt qu'une liste vide.
 */
export async function exigerRole(roles: RoleType[]): Promise<MembreCourant> {
  const membre = await exigerMembre()
  if (!roles.some((r) => membre.roles.includes(r))) {
    redirect('/acces-refuse')
  }
  return membre
}

export function aRole(membre: MembreCourant | null, roles: RoleType[]): boolean {
  if (!membre) return false
  return roles.some((r) => membre.roles.includes(r))
}

export const estBureau = (m: MembreCourant | null) =>
  aRole(m, ['president', 'tresorier', 'secretaire', 'commissaire'])

export const peutEncaisser = (m: MembreCourant | null) =>
  aRole(m, ['tresorier', 'president'])
