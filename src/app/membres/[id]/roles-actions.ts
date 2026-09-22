'use server'

import { revalidatePath } from 'next/cache'
import { exigerRole, type RoleType } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

const ROLES_BUREAU: RoleType[] = ['president', 'tresorier', 'secretaire', 'commissaire']

export async function enregistrerRoles(
  membreId: string,
  roles: RoleType[]
): Promise<{ ok: true } | { ok: false; erreur: string }> {
  await exigerRole(['president'])
  const choisis = roles.filter((r) => ROLES_BUREAU.includes(r))

  const supabase = await createClient()
  const { error } = await supabase.rpc('definir_roles', { p_membre_id: membreId, p_roles: choisis })
  if (error) return { ok: false, erreur: error.message }

  revalidatePath(`/membres/${membreId}`)
  revalidatePath('/roles')
  return { ok: true }
}