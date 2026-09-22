'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formaterMontant, francsEnCentimes } from '@/lib/format'
import { enregistrerDepense, type EtatDepense } from '../actions'

const classeChamp =
  'h-12 w-full rounded-lg border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring'

const POSTES = [
  'Bâches et chaises',
  'Sono',
  'Repas',
  'Eau et boissons',
  'Transport',
  'Hébergement',
  'Décoration',
  'Communication',
  'Aide sociale',
  'Divers',
]

const MODES = [
  { valeur: 'especes', libelle: 'Espèces' },
  { valeur: 'wave', libelle: 'Wave' },
  { valeur: 'orange_money', libelle: 'Orange Money' },
  { valeur: 'free_money', libelle: 'Free Money' },
  { valeur: 'virement', libelle: 'Virement' },
]

function Bouton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-14 w-full text-base font-semibold">
      {pending ? 'Enregistrement…' : 'Enregistrer la dépense'}
    </Button>
  )
}

export function FormulaireDepense({
  caisses,
  evenements,
  evenementInitial,
  seuil,
}: {
  caisses: { id: string; nom: string; type: string }[]
  evenements: { id: string; titre: string; caisse: string }[]
  evenementInitial?: string
  seuil: number
}) {
  const [etat, action] = useActionState<EtatDepense, FormData>(enregistrerDepense, {})
  const [evenementId, setEvenementId] = useState(
    evenements.some((e) => e.id === evenementInitial) ? evenementInitial! : ''
  )
  const [montant, setMontant] = useState('')
  const evenement = evenements.find((e) => e.id === evenementId)
  const aujourdhui = new Date().toISOString().slice(0, 10)
  const depasseSeuil = francsEnCentimes(montant || '0') > seuil

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="evenement_id" className="text-base">Pour</Label>
        <select
          id="evenement_id"
          name="evenement_id"
          value={evenementId}
          onChange={(e) => setEvenementId(e.target.value)}
          className={classeChamp}
        >
          <option value="">Dépense courante (sans événement)</option>
          {evenements.map((e) => (
            <option key={e.id} value={e.id}>{e.titre}</option>
          ))}
        </select>
      </div>

      {evenement ? (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm">
          Payée par la caisse <strong>{evenement.caisse}</strong>, celle de l&apos;événement.
        </p>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="caisse_id" className="text-base">Caisse *</Label>
          <select id="caisse_id" name="caisse_id" className={classeChamp} defaultValue="">
            <option value="" disabled>— Choisir —</option>
            {caisses.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="montant" className="text-base">Montant (F CFA) *</Label>
        <Input
          id="montant"
          name="montant"
          inputMode="numeric"
          required
          value={montant}
          onChange={(e) => setMontant(e.target.value.replace(/\D/g, ''))}
          placeholder="0"
          className="montant h-16 text-right text-3xl"
        />
        {depasseSeuil && (
          <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
            Au-delà de {formaterMontant(seuil)}, la dépense devra être validée par le président
            (une autre personne que celle qui la saisit).
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mode" className="text-base">Payée par</Label>
          <select id="mode" name="mode" defaultValue="especes" className={classeChamp}>
            {MODES.map((m) => (
              <option key={m.valeur} value={m.valeur}>{m.libelle}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date" className="text-base">Date</Label>
          <Input id="date" name="date" type="date" defaultValue={aujourdhui} max={aujourdhui} className="h-12" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="poste" className="text-base">Poste</Label>
        <Input id="poste" name="poste" list="postes" placeholder="Ex. : Sono" className="h-12" autoComplete="off" />
        <datalist id="postes">
          {POSTES.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        <p className="text-sm text-muted-foreground">
          Sert à regrouper les dépenses dans le bilan de l&apos;événement.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="beneficiaire" className="text-base">Payé à *</Label>
        <Input id="beneficiaire" name="beneficiaire" required placeholder="Ex. : Mbour Sono Services" className="h-12" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motif" className="text-base">Motif *</Label>
        <Input id="motif" name="motif" required placeholder="Ex. : Location sono pour la nuit" className="h-12" />
      </div>

      {etat.erreur && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {etat.erreur}
        </p>
      )}

      <Bouton />
    </form>
  )
}