import Link from 'next/link'
import { aRole, exigerRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formaterMontant, nomAffiche } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = { title: 'Espace bureau' }

const ORDRE_CAISSES: Record<string, number> = { mensualites: 1, sociale: 2, projets: 3 }

const dateCourte = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Dakar',
})

function premier<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

export default async function PageBureau() {
  const membre = await exigerRole(['president', 'tresorier', 'secretaire', 'commissaire'])
  const voitFinances = aRole(membre, ['president', 'tresorier', 'commissaire'])
  const peutEncaisser = aRole(membre, ['president', 'tresorier'])

  const supabase = await createClient()

  const [soldes, retards, nbRetards, ecritures, nbDeclarations] = await Promise.all([
    voitFinances
      ? supabase.from('v_soldes_caisses').select('caisse_id, nom, type, solde')
      : null,
    supabase
      .from('v_situation_membres')
      .select('membre_id, numero_membre, prenom, nom, surnom, solde_du')
      .gt('solde_du', 0)
      .order('solde_du', { ascending: false })
      .limit(5),
    supabase
      .from('v_situation_membres')
      .select('membre_id', { count: 'exact', head: true })
      .gt('solde_du', 0),
    voitFinances
      ? supabase
          .from('ecritures')
          .select(
            'id, cree_le, sens, montant, mode, libelle, annule_ecriture_id, caisses(nom), membres!ecritures_membre_id_fkey(prenom, nom, surnom), recus(numero)'
          )
          .order('cree_le', { ascending: false })
          .limit(10)
      : null,
    voitFinances
      ? supabase
          .from('declarations')
          .select('id', { count: 'exact', head: true })
          .eq('statut', 'en_attente')
      : null,
  ])

  const listeSoldes = [...(soldes?.data ?? [])].sort(
    (a, b) => (ORDRE_CAISSES[a.type ?? ''] ?? 9) - (ORDRE_CAISSES[b.type ?? ''] ?? 9)
  )
  const total = listeSoldes.reduce((t, s) => t + Number(s.solde ?? 0), 0)

  type LigneJournal = {
    id: string
    cree_le: string
    sens: string
    montant: number
    mode: string
    libelle: string
    annule_ecriture_id: string | null
    caisses: { nom: string } | { nom: string }[] | null
    membres:
      | { prenom: string; nom: string; surnom: string | null }
      | { prenom: string; nom: string; surnom: string | null }[]
      | null
    recus: { numero: string } | { numero: string }[] | null
  }
  const journal = (ecritures?.data ?? []) as unknown as LigneJournal[]

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-16 pt-4">
      <header className="mb-6">
        <Link
          href="/"
          className="-ml-2 inline-block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          ← Accueil
        </Link>
        <h1 className="text-2xl font-bold">Espace bureau</h1>
      </header>

      {peutEncaisser && (
        <Link href="/encaisser" className="mb-6 block">
          <Button className="h-14 w-full text-base font-semibold">Encaisser des espèces</Button>
        </Link>
        
      )}
      
      <Link href="/membres" className="mb-6 block">
        <Button variant="outline" className="h-14 w-full text-base">
          Membres
        </Button>
      </Link>
      
      {voitFinances && (
        <section className="mb-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Soldes des caisses</h2>
            <p className="montant text-sm text-muted-foreground">
              Total {formaterMontant(total)}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {listeSoldes.map((s) => (
              <Card key={s.caisse_id ?? s.nom}>
                <CardContent className="pt-5">
                  <p className="text-sm text-muted-foreground">{s.nom}</p>
                  <p className="montant mt-1 text-2xl">{formaterMontant(s.solde)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Soldes théoriques, calculés depuis le journal. À rapprocher des espèces et des
            relevés Wave / Orange Money lors de la clôture.
          </p>
        </section>
      )}

      {voitFinances && (nbDeclarations?.count ?? 0) > 0 && (
        <section className="mb-8 rounded-xl border-2 border-amber-600/40 bg-amber-50 p-4">
          <p className="font-semibold">
            {nbDeclarations?.count} paiement{(nbDeclarations?.count ?? 0) > 1 ? 's' : ''} mobile
            money à valider
          </p>
          <p className="text-sm text-muted-foreground">
            L&apos;écran de validation arrive à l&apos;étape suivante.
          </p>
        </section>
      )}

      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Cotisations en retard</h2>
          <p className="text-sm text-muted-foreground">
            {nbRetards.count ?? 0} membre{(nbRetards.count ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        {(retards.data ?? []).length === 0 ? (
          <p className="rounded-lg bg-muted p-4 text-muted-foreground">
            Tous les membres actifs sont à jour.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {(retards.data ?? []).map((r) => (
              <li key={r.membre_id ?? r.numero_membre} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0 truncate">
                  {nomAffiche({ prenom: r.prenom ?? '', nom: r.nom ?? '', surnom: r.surnom })}
                  <span className="ml-2 text-sm text-muted-foreground">{r.numero_membre}</span>
                </span>
                <span className="montant shrink-0 text-amber-700">
                  {formaterMontant(r.solde_du)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {voitFinances && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Dernières opérations</h2>
          {journal.length === 0 ? (
            <p className="rounded-lg bg-muted p-4 text-muted-foreground">
              Aucune opération enregistrée pour l&apos;instant.
            </p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {journal.map((e) => {
                const entree = e.sens === 'recette' || e.sens === 'virement_entrant'
                const m = premier(e.membres)
                const recu = premier(e.recus)
                return (
                  <li key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {m ? nomAffiche(m) : e.libelle}
                        {e.annule_ecriture_id && (
                          <span className="ml-2 rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                            annulation
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dateCourte.format(new Date(e.cree_le))} · {premier(e.caisses)?.nom}
                        {recu ? ` · ${recu.numero}` : ''}
                      </p>
                    </div>
                    <span
                      className={`montant shrink-0 ${entree ? 'text-primary' : 'text-destructive'}`}
                    >
                      {entree ? '+' : '−'}
                      {formaterMontant(e.montant)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}
    </main>
  )
}