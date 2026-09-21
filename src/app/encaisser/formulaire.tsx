'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formaterMontant, francsEnCentimes } from '@/lib/format'
import { encaisser } from './actions'

type Caisse = { id: string; nom: string; type: string }

type MembreTrouve = {
  membre_id: string
  numero_membre: string
  nom_affiche: string
  section: string | null
  cotisation: number
}

type Encaisse = { numeroRecu: string; nom: string; montant: number; caisse: string }

const MOIS = [1, 2, 3, 6, 12]
const MONTANTS_USUELS = [500, 1000, 2000, 5000]

export function FormulaireEncaissement({ caisses }: { caisses: Caisse[] }) {
  const [supabase] = useState(() => createClient())
  const rechercheRef = useRef<HTMLInputElement>(null)
  const derniereRequete = useRef(0)

  const [terme, setTerme] = useState('')
  const [resultats, setResultats] = useState<MembreTrouve[]>([])
  const [recherche, setRecherche] = useState(false)
  const [membre, setMembre] = useState<MembreTrouve | null>(null)

  const caisseParDefaut = caisses.find((c) => c.type === 'mensualites') ?? caisses[0]
  const [caisseId, setCaisseId] = useState(caisseParDefaut.id)
  const caisse = caisses.find((c) => c.id === caisseId) ?? caisseParDefaut
  const estMensualites = caisse.type === 'mensualites'

  const [montant, setMontant] = useState('')
  const [mois, setMois] = useState<number | null>(null)

  const [enCours, startTransition] = useTransition()
  const [session, setSession] = useState<Encaisse[]>([])

  const montantCentimes = francsEnCentimes(montant || '0')
  const pret = membre !== null && montantCentimes > 0 && !enCours

  useEffect(() => {
    const t = terme.trim()
    if (membre || t.length < 2) return
    const id = ++derniereRequete.current
    const minuteur = setTimeout(async () => {
      const { data, error } = await supabase.rpc('rechercher_membre', {
        p_terme: t,
        p_limite: 6,
      })
      if (id !== derniereRequete.current) return
      setRecherche(false)
      if (error) {
        toast.error('Recherche impossible. Vérifiez la connexion.')
        return
      }
      setResultats((data ?? []) as MembreTrouve[])
    }, 250)
    return () => clearTimeout(minuteur)
  }, [terme, membre, supabase])

  function saisirTerme(valeur: string) {
    setTerme(valeur)
    if (valeur.trim().length < 2) {
      setResultats([])
      setRecherche(false)
    } else {
      setRecherche(true)
    }
  }

  function choisirMembre(m: MembreTrouve) {
    setMembre(m)
    setResultats([])
    if (estMensualites) {
      setMois(1)
      setMontant(String(m.cotisation / 100))
    }
  }

  function changerMembre() {
    setMembre(null)
    setTerme('')
    setMontant('')
    setMois(null)
    requestAnimationFrame(() => rechercheRef.current?.focus())
  }

  function choisirCaisse(c: Caisse) {
    setCaisseId(c.id)
    if (c.type === 'mensualites' && membre) {
      setMois(1)
      setMontant(String(membre.cotisation / 100))
    } else {
      setMois(null)
      setMontant('')
    }
  }

  function choisirMois(n: number) {
    if (!membre) return
    setMois(n)
    setMontant(String((membre.cotisation * n) / 100))
  }

  function libelle(): string {
    if (estMensualites) {
      return mois ? `Cotisation en espèces — ${mois} mois` : 'Cotisation en espèces'
    }
    return `Espèces — ${caisse.nom}`
  }

  function valider() {
    if (!membre || montantCentimes <= 0) return
    const m = membre
    const montantValide = montantCentimes
    const nomCaisse = caisse.nom

    startTransition(async () => {
      const r = await encaisser({
        membreId: m.membre_id,
        caisseId: caisse.id,
        montantCentimes: montantValide,
        libelle: libelle(),
      })

      if (!r.ok) {
        toast.error(r.erreur)
        return
      }

      toast.success(`Reçu ${r.numeroRecu} — ${formaterMontant(montantValide)}`)
      setSession((s) => [
        { numeroRecu: r.numeroRecu, nom: m.nom_affiche, montant: montantValide, caisse: nomCaisse },
        ...s,
      ])
      changerMembre()
    })
  }

  const totalSession = session.reduce((t, e) => t + e.montant, 0)

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <Label htmlFor="recherche" className="text-base">
          Membre
        </Label>

        {membre ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-primary bg-primary/5 p-4">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{membre.nom_affiche}</p>
              <p className="text-sm text-muted-foreground">
                {membre.numero_membre}
                {membre.section ? ` · ${membre.section}` : ''}
                {' · '}coti {formaterMontant(membre.cotisation)}
              </p>
            </div>
            <Button variant="outline" onClick={changerMembre} disabled={enCours}>
              Changer
            </Button>
          </div>
        ) : (
          <>
            <Input
              id="recherche"
              ref={rechercheRef}
              value={terme}
              onChange={(e) => saisirTerme(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && resultats.length > 0) {
                  e.preventDefault()
                  choisirMembre(resultats[0])
                }
              }}
              placeholder="Nom, surnom, numéro ou téléphone"
              autoComplete="off"
              autoFocus
              className="h-14 text-lg"
            />

            {recherche && <p className="px-1 text-sm text-muted-foreground">Recherche…</p>}

            {!recherche && terme.trim().length >= 2 && resultats.length === 0 && (
              <p className="px-1 text-sm text-muted-foreground">
                Aucun membre trouvé. Essayez le surnom ou le numéro de téléphone.
              </p>
            )}

            {resultats.length > 0 && (
              <ul className="divide-y overflow-hidden rounded-xl border">
                {resultats.map((r) => (
                  <li key={r.membre_id}>
                    <button
                      type="button"
                      onClick={() => choisirMembre(r)}
                      className="flex min-h-14 w-full flex-col items-start justify-center px-4 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none"
                    >
                      <span className="font-medium">{r.nom_affiche}</span>
                      <span className="text-sm text-muted-foreground">
                        {r.numero_membre}
                        {r.section ? ` · ${r.section}` : ''}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section className="space-y-2">
        <p className="text-base font-medium">Caisse</p>
        <div className="grid grid-cols-3 gap-2">
          {caisses.map((c) => (
            <Button
              key={c.id}
              type="button"
              variant={c.id === caisseId ? 'default' : 'outline'}
              aria-pressed={c.id === caisseId}
              onClick={() => choisirCaisse(c)}
              disabled={enCours}
              className="h-14 whitespace-normal px-2 text-sm leading-tight"
            >
              {c.nom}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <Label htmlFor="montant" className="text-base">
          Montant (F CFA)
        </Label>

        {estMensualites ? (
          <div className="flex flex-wrap gap-2">
            {MOIS.map((n) => (
              <Button
                key={n}
                type="button"
                variant={mois === n ? 'default' : 'outline'}
                aria-pressed={mois === n}
                onClick={() => choisirMois(n)}
                disabled={!membre || enCours}
                className="h-12 min-w-16"
              >
                {n} mois
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {MONTANTS_USUELS.map((f) => (
              <Button
                key={f}
                type="button"
                variant={montant === String(f) ? 'default' : 'outline'}
                onClick={() => setMontant(String(f))}
                disabled={enCours}
                className="h-12"
              >
                {formaterMontant(f * 100)}
              </Button>
            ))}
          </div>
        )}

        <Input
          id="montant"
          value={montant}
          onChange={(e) => {
            setMontant(e.target.value.replace(/\D/g, ''))
            setMois(null)
          }}
          inputMode="numeric"
          placeholder="0"
          className="montant h-16 text-right text-3xl"
          disabled={enCours}
        />
      </section>

      <Button
        type="button"
        onClick={valider}
        disabled={!pret}
        className="h-16 w-full text-lg font-semibold"
      >
        {enCours
          ? 'Enregistrement…'
          : montantCentimes > 0
            ? `Encaisser ${formaterMontant(montantCentimes)}`
            : 'Encaisser'}
      </Button>

      {session.length > 0 && (
        <section className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="font-semibold">Cette séance</p>
            <p className="montant text-lg">{formaterMontant(totalSession)}</p>
          </div>
          <ul className="space-y-2 text-sm">
            {session.map((e) => (
              <li key={e.numeroRecu} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  <span className="text-muted-foreground">{e.numeroRecu}</span> · {e.nom}
                </span>
                <span className="montant shrink-0">{formaterMontant(e.montant)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            {session.length} encaissement{session.length > 1 ? 's' : ''}. À comparer avec
            les espèces en main avant de quitter.
          </p>
        </section>
      )}
    </div>
  )
}