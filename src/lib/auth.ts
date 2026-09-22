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
}

/**
 * Membre connecté et ses rôles, en UNE seule requête.
 * cache() : si plusieurs éléments de la même page le demandent, la base
 * n'est interrogée qu'une fois.
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
  }
})

export async function exigerMembre(): Promise<MembreCourant> {
  const membre = await getMembreCourant()
  if (!membre) redirect('/connexion')
  return membre
}

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
  aRole(m, ['president', 'tresorier'])