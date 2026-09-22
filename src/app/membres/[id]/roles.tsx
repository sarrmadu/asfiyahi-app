import { aRole, getMembreCourant, type RoleType } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { FormulaireRoles } from './roles-formulaire'

/** Rôles au bureau d'un membre. Visible et modifiable par le président seulement. */
export async function RolesMembre({ membreId }: { membreId: string }) {
  const moi = await getMembreCourant()
  if (!aRole(moi, ['president'])) return null

  const supabase = await createClient()
  const { data } = await supabase.from('membre_roles').select('role').eq('membre_id', membreId)
  const actuels = (data ?? []).map((r) => r.role as RoleType).filter((r) => r !== 'membre')

  return (
    <section className="mb-6 rounded-xl border p-4">
      <p className="mb-3 font-semibold">Rôle au bureau</p>
      {moi!.id === membreId ? (
        <p className="text-sm text-muted-foreground">
          Vous ne pouvez pas modifier vos propres rôles. Un autre président doit le faire.
        </p>
      ) : (
        <FormulaireRoles membreId={membreId} actuels={actuels} />
      )}
    </section>
  )
}