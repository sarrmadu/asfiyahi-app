import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PageAccesRefuse() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold">Accès non autorisé</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        Cette page est réservée à certains membres du bureau. Si vous pensez
        qu&apos;il s&apos;agit d&apos;une erreur, contactez le président du dahira.
      </p>
      <Link href="/" className="mt-8">
        <Button className="h-12 px-8">Retour à l&apos;accueil</Button>
      </Link>
    </main>
  )
}
