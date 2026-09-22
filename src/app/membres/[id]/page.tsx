import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formaterMontant } from '@/lib/format'
import { FormulaireMembre } from '../formulaire'
import { AccesMembre } from './acces'
import { RolesMembre } from './roles'
export const metadata = { title: 'Fiche membre' }

export default async function PageFicheMembre({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await exigerRole(['president', 'secretaire'])
  const { id } = await params
  const supabase = await createClient()

  const [{ data: membre }, { data: sections }, { data: dahira }, { data: situation }, { data: categories }] =
    await Promise.all([
      supabase
        .from('membres')
        .select(
          'id, numero_membre, prenom, nom, surnom, telephone, section_id, categorie_id, date_adhesion, cotisation_mensuelle, statut, notes, user_id'
        )
        .eq('id', id)
        .maybeSingle(),
      supabase.from('sections').select('id, nom').eq('actif', true).order('ordre'),
      supabase.from('dahiras').select('cotisation_defaut').single(),
      supabase
        .from('v_situation_membres')
        .select('total_verse, solde_du')
        .eq('membre_id', id)
        .maybeSingle(),
      supabase
        .from('categories_membre')
        .select('id, nom, cotisation_mensuelle')
        .eq('actif', true)
        .order('ordre'),
    ])

  if (!membre) notFound()

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-16 pt-4">
      <header className="mb-5">
        <Link
          href="/membres"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Membres
        </Link>
        <h1 className="text-2xl font-bold">
          {membre.prenom} {membre.nom}
        </h1>
        <p className="text-sm text-muted-foreground">
          {membre.numero_membre} ·{' '}
          {membre.user_id ? 'se connecte à l’application' : 'sans compte de connexion'}
        </p>
      </header>

      {situation && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">Total versé</p>
            <p className="montant mt-1 text-xl">{formaterMontant(situation.total_verse)}</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">Reste dû</p>
            <p
              className={`montant mt-1 text-xl ${Number(situation.solde_du ?? 0) > 0 ? 'text-amber-700' : 'text-primary'}`}
            >
              {Number(situation.solde_du ?? 0) > 0 ? formaterMontant(situation.solde_du) : 'À jour'}
            </p>
          </div>
        </div>
      )}

      <AccesMembre membreId={membre.id} aUnAcces={!!membre.user_id} telephone={membre.telephone} />
      <RolesMembre membreId={membre.id} />
      <FormulaireMembre
        membre={membre}
        sections={sections ?? []}
        categories={categories ?? []}
        cotisationDefaut={dahira?.cotisation_defaut ?? 100000}
      />
    </main>
  )
}