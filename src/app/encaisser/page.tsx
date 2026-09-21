import Link from 'next/link'
import { exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { FormulaireEncaissement } from './formulaire'

export const metadata = { title: 'Encaisser' }

export default async function PageEncaisser() {
  await exigerRole(['tresorier', 'president'])

  const supabase = await createClient()
  const { data: caisses } = await supabase
    .from('caisses')
    .select('id, nom, type')
    .eq('actif', true)
    .order('ordre')

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href="/"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Accueil
        </Link>
        <h1 className="text-2xl font-bold">Encaisser des espèces</h1>
      </header>

      {caisses && caisses.length > 0 ? (
        <FormulaireEncaissement caisses={caisses} />
      ) : (
        <p className="rounded-lg bg-muted p-4 text-muted-foreground">
          Aucune caisse active. Le président doit en activer une dans les paramètres.
        </p>
      )}
    </main>
  )
}