import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getMembreCourant } from '@/lib/auth'
import { FormulaireMotDePasse } from './formulaire'

export const metadata = { title: 'Mot de passe' }

export default async function PageMotDePasse() {
  // Pas exigerMembre ici : il renverrait vers cette même page
  const moi = await getMembreCourant()
  if (!moi) redirect('/connexion')

  return (
    <main className="mx-auto min-h-dvh w-full max-w-sm px-5 pb-16 pt-6">
      {!moi.doitChangerMdp && (
        <Link
          href="/"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Accueil
        </Link>
      )}
      <h1 className="mb-2 mt-2 text-2xl font-bold">Choisir mon mot de passe</h1>
      <p className="mb-6 text-muted-foreground">
        {moi.doitChangerMdp
          ? `Bienvenue ${moi.prenom}. Remplacez le mot de passe provisoire reçu du bureau par un mot de passe que vous seul connaissez.`
          : 'Votre nouveau mot de passe remplacera l’ancien.'}
      </p>
      <FormulaireMotDePasse />
    </main>
  )
}