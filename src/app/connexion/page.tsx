import { FormulaireConnexion } from './formulaire'

export const metadata = {
  title: 'Connexion',
}

export default async function PageConnexion({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>
}) {
  const { suite } = await searchParams

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          {/* Le logo complet viendra ici une fois la marque simplifiée produite */}
          <div
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ backgroundColor: '#0B5D2E' }}
            aria-hidden
          >
            DA
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Dahira Asfiyahi</h1>
          <p className="mt-1 text-muted-foreground">Mbour</p>
        </div>

        <FormulaireConnexion suite={suite ?? '/'} />
      </div>
    </main>
  )
}
