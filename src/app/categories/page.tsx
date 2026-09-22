import Link from 'next/link'
import { exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { FormulaireCategories } from './formulaire'

export const metadata = { title: 'Catégories et cotisations' }

export default async function PageCategories() {
  await exigerRole(['president'])
  const supabase = await createClient()

  const [{ data: categories }, { data: dahira }, { data: membres }] = await Promise.all([
    supabase
      .from('categories_membre')
      .select('id, nom, cotisation_mensuelle')
      .eq('actif', true)
      .order('ordre'),
    supabase.from('dahiras').select('cotisation_defaut').single(),
    supabase.from('membres').select('categorie_id').neq('statut', 'inactif'),
  ])

  const compte = new Map<string | null, number>()
  for (const m of membres ?? []) {
    compte.set(m.categorie_id, (compte.get(m.categorie_id) ?? 0) + 1)
  }
  const sansCategorie = compte.get(null) ?? 0

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href="/bureau"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Espace bureau
        </Link>
        <h1 className="text-2xl font-bold">Catégories et cotisations</h1>
      </header>

      {sansCategorie > 0 && (
        <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {sansCategorie} membre{sansCategorie > 1 ? 's n’ont' : ' n’a'} pas encore de catégorie.
          Ouvrez leur fiche dans <Link href="/membres" className="underline">Membres</Link> pour
          la choisir.
        </p>
      )}

      <FormulaireCategories
        categories={(categories ?? []).map((c) => ({ ...c, nb: compte.get(c.id) ?? 0 }))}
        cotisationDefaut={dahira?.cotisation_defaut ?? 100000}
      />
    </main>
  )
}