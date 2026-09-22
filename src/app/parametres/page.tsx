import Link from 'next/link'
import { exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { FormulaireParametres } from './formulaire'
import { ChoixLogo } from './logo'

export const metadata = { title: 'Paramètres' }

export default async function PageParametres() {
  const moi = await exigerRole(['president'])
  const supabase = await createClient()
  const { data: dahira } = await supabase
    .from('dahiras')
    .select('nom, nom_court, ville, numero_wave, numero_orange_money, seuil_double_validation, cotisation_defaut, logo_complet_url')
    .eq('id', moi.dahiraId)
    .single()

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href="/bureau"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Espace bureau
        </Link>
        <h1 className="text-2xl font-bold">Paramètres du dahira</h1>
      </header>

      {dahira && (
        <>
          <ChoixLogo personnalise={!!dahira.logo_complet_url} />
          <FormulaireParametres
            dahira={{
              ...dahira,
              seuil_double_validation: Number(dahira.seuil_double_validation),
              cotisation_defaut: Number(dahira.cotisation_defaut),
            }}
          />
        </>
      )}
    </main>
  )
}