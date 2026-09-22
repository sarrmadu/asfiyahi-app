import Link from 'next/link'
import { exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { FormulaireMembre } from '../formulaire'

export const metadata = { title: 'Inscrire un membre' }

export default async function PageNouveauMembre() {
  await exigerRole(['president', 'secretaire'])
  const supabase = await createClient()

  const [{ data: sections }, { data: dahira }, { data: categories }] = await Promise.all([
    supabase.from('sections').select('id, nom').eq('actif', true).order('ordre'),
    supabase.from('dahiras').select('cotisation_defaut').single(),
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
          href="/membres"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Membres
        </Link>
        <h1 className="text-2xl font-bold">Inscrire un membre</h1>
      </header>

      <FormulaireMembre
        sections={sections ?? []}
        categories={categories ?? []}
        cotisationDefaut={dahira?.cotisation_defaut ?? 100000}
      />
    </main>
  )
}