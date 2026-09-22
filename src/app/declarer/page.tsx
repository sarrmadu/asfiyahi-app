import Link from 'next/link'
import { exigerMembre } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { FormulaireDeclaration } from './formulaire'

export const metadata = { title: 'Déclarer un paiement' }

export default async function PageDeclarer() {
  const moi = await exigerMembre()
  const supabase = await createClient()

  const [{ data: dahira }, { data: evenements }, { data: situation }] = await Promise.all([
    supabase.from('dahiras').select('numero_wave, numero_orange_money').eq('id', moi.dahiraId).maybeSingle(),
    supabase
      .from('evenements')
      .select('id, titre, est_gamou')
      .eq('cloture', false)
      .eq('annule', false)
      .order('debut_le'),
    supabase.from('v_situation_membres').select('cotisation').eq('membre_id', moi.id).maybeSingle(),
  ])

  const dateDuJour = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Dakar' }).format(new Date())

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href="/"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Accueil
        </Link>
        <h1 className="text-2xl font-bold">Déclarer un paiement</h1>
        <p className="text-muted-foreground">
          Vous avez payé par Wave ou Orange Money ? Déclarez-le ici. Le trésorier vérifie puis
          vous recevez votre reçu.
        </p>
      </header>

      <FormulaireDeclaration
        evenements={evenements ?? []}
        numeros={{ wave: dahira?.numero_wave ?? null, orange_money: dahira?.numero_orange_money ?? null }}
        cotisation={Number(situation?.cotisation ?? 0)}
        dateDuJour={dateDuJour}
      />
    </main>
  )
}