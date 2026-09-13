import { exigerMembre, estBureau, peutEncaisser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formaterMontant, nomAffiche } from '@/lib/format'
import { seDeconnecter } from './connexion/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default async function PageAccueil() {
  const membre = await exigerMembre()
  const supabase = await createClient()

  // Situation de cotisation du membre connecté (vue v_situation_membres)
  const { data: situation } = await supabase
    .from('v_situation_membres')
    .select('solde_du, mois_ecoules, cotisation')
    .eq('membre_id', membre.id)
    .maybeSingle()

  const doit = Number(situation?.solde_du ?? 0)
  const aJour = doit <= 0

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Assalamu alaykum</p>
          <h1 className="text-xl font-bold">
            {nomAffiche({
              prenom: membre.prenom,
              nom: membre.nom,
              surnom: membre.surnom,
            })}
          </h1>
        </div>
        <form action={seDeconnecter}>
          <Button variant="ghost" size="sm" type="submit">
            Quitter
          </Button>
        </form>
      </header>

      {/* Carte de statut : l'information que le membre vient chercher */}
      <Card className="mb-6 border-2" style={{ borderColor: aJour ? '#0B5D2E' : '#B45309' }}>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Ma cotisation</p>
          {aJour ? (
            <p className="mt-1 text-3xl font-bold" style={{ color: '#0B5D2E' }}>
              À jour
            </p>
          ) : (
            <>
              <p className="mt-1 text-3xl font-bold tabular-nums" style={{ color: '#B45309' }}>
                {formaterMontant(doit)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">restant à verser</p>
            </>
          )}
        </CardContent>
      </Card>

      {peutEncaisser(membre) && (
        <Link href="/encaisser" className="mb-3 block">
          <Button className="h-14 w-full text-base font-semibold">
            Encaisser des espèces
          </Button>
        </Link>
      )}

      {estBureau(membre) && (
        <Link href="/bureau" className="block">
          <Button variant="outline" className="h-14 w-full text-base">
            Espace bureau
          </Button>
        </Link>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        {membre.numeroMembre} · {membre.roles.join(', ') || 'membre'}
      </p>
    </main>
  )
}
