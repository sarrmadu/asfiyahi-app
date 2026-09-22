import Image from 'next/image'
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
        <div className="mb-8 text-center">
          <Image
            src="/logo.png"
            alt="Logo du Dahira Asfiyahi de Mbour"
            width={160}
            height={160}
            priority
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold tracking-tight">Dahira Asfiyahi</h1>
          <p className="mt-1 text-muted-foreground">Mbour</p>
        </div>

        <FormulaireConnexion suite={suite ?? '/'} />
      </div>
    </main>
  )
}