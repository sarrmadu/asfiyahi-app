import Link from 'next/link'
import { exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { FormulaireDepense } from './formulaire'

export const metadata = { title: 'Nouvelle dépense' }

export default async function PageNouvelleDepense({
  searchParams,
}: {
  searchParams: Promise<{ evenement?: string }>
}) {
  await exigerRole(['tresorier', 'president'])
  const { evenement } = await searchParams
  const supabase = await createClient()

  const [{ data: caisses }, { data: evenements }, { data: dahira }] = await Promise.all([
    supabase.from('caisses').select('id, nom, type').eq('actif', true).order('ordre'),
    supabase
      .from('evenements')
      .select('id, titre, caisses(nom)')
      .eq('cloture', false)
      .eq('annule', false)
      .order('debut_le'),
    supabase.from('dahiras').select('seuil_double_validation').single(),
  ])

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href={evenement ? `/evenements/${evenement}` : '/depenses'}
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Retour
        </Link>
        <h1 className="text-2xl font-bold">Nouvelle dépense</h1>
      </header>

      <FormulaireDepense
        caisses={caisses ?? []}
        evenements={(evenements ?? []).map((e) => {
          const c = Array.isArray(e.caisses) ? e.caisses[0] : e.caisses
          return { id: e.id, titre: e.titre, caisse: c?.nom ?? '' }
        })}
        evenementInitial={evenement}
        seuil={dahira?.seuil_double_validation ?? 5000000}
      />
    </main>
  )
}