import { cache } from 'react'
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
  /** Mot de passe provisoire donné par le bureau : à remplacer. */
  doitChangerMdp: boolean
}

/**
 * Récupère le membre connecté avec ses rôles, en une seule requête.
 * `cache` évite de refaire la requête si plusieurs parties de la même page
 * la demandent.
 */
export const getMembreCourant = cache(async (): Promise<MembreCourant | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('membres')
    .select(
      'id, dahira_id, numero_membre, prenom, nom, surnom, photo_url, membre_roles!membre_roles_membre_id_fkey(role)'
    )
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) return null

  const roles = (data.membre_roles as { role: RoleType }[] | null) ?? []
  return {
    id: data.id,
    dahiraId: data.dahira_id,
    numeroMembre: data.numero_membre,
    prenom: data.prenom,
    nom: data.nom,
    surnom: data.surnom,
    photoUrl: data.photo_url,
    roles: roles.map((r) => r.role),
    doitChangerMdp: user.user_metadata?.doit_changer_mdp === true,
  }
})

/**
 * Comme getMembreCourant, mais redirige vers /connexion si absent,
 * et vers /mot-de-passe tant que le mot de passe provisoire n'est pas changé.
 */
export async function exigerMembre(): Promise<MembreCourant> {
  const membre = await getMembreCourant()
  if (!membre) redirect('/connexion')
  if (membre.doitChangerMdp) redirect('/mot-de-passe')
  return membre
}

/**
 * Exige au moins un des rôles indiqués.
 * Le contrôle est aussi appliqué en base par les règles de sécurité : cette
 * fonction sert à afficher une page d'erreur propre plutôt qu'une liste vide.
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