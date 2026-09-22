import Link from 'next/link'
import { exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { FormulaireEvenement } from './formulaire'

export const metadata = { title: 'Nouvel événement' }

export default async function PageNouvelEvenement() {
  await exigerRole(['president', 'secretaire'])
  const supabase = await createClient()
  const [{ data: caisses }, { data: categories }] = await Promise.all([
    supabase.from('caisses').select('id, nom, type').eq('actif', true).order('ordre'),
    supabase
      .from('categories_membre')
      .select('id, nom, cotisation_mensuelle')
      .eq('actif', true)
      .order('ordre'),
  ])

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href="/evenements"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Événements
        </Link>
        <h1 className="text-2xl font-bold">Nouvel événement</h1>
      </header>
      <FormulaireEvenement caisses={caisses ?? []} categories={categories ?? []} />
    </main>
  )
}