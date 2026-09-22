import Link from 'next/link'
import { exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { FormulaireEncaissement } from './formulaire'

export const metadata = { title: 'Encaisser' }

export default async function PageEncaisser({
  searchParams,
}: {
  searchParams: Promise<{ evenement?: string }>
}) {
  await exigerRole(['tresorier', 'president'])
  const { evenement } = await searchParams

  const supabase = await createClient()
  const [{ data: caisses }, { data: evenements }] = await Promise.all([
    supabase.from('caisses').select('id, nom, type').eq('actif', true).order('ordre'),
    supabase
      .from('evenements')
      .select('id, titre, caisse_id, est_gamou, contribution_par_membre, evenement_parts(montant)')
      .eq('cloture', false)
      .eq('annule', false)
      .order('debut_le'),
  ])

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href={evenement ? `/evenements/${evenement}` : '/'}
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Retour
        </Link>
        <h1 className="text-2xl font-bold">Encaisser des espèces</h1>
      </header>

      {caisses && caisses.length > 0 ? (
        <FormulaireEncaissement
          caisses={caisses}
          evenements={(evenements ?? []).map((e) => ({
            id: e.id,
            titre: e.titre,
            caisse_id: e.caisse_id,
            est_gamou: e.est_gamou,
            a_des_parts:
              e.contribution_par_membre != null ||
              (Array.isArray(e.evenement_parts) && e.evenement_parts.length > 0),
          }))}
          evenementInitial={evenement}
        />
      ) : (
        <p className="rounded-lg bg-muted p-4 text-muted-foreground">
          Aucune caisse active. Le président doit en activer une dans les paramètres.
        </p>
      )}
    </main>
  )
}