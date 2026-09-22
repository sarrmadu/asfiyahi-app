'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { afficherTelephone } from '@/lib/format'
import { enregistrerParametres, type EtatParametres } from './actions'

type Dahira = {
  nom: string
  nom_court: string
  ville: string | null
  numero_wave: string | null
  numero_orange_money: string | null
  seuil_double_validation: number
  cotisation_defaut: number
}

function Bouton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-14 w-full text-base font-semibold">
      {pending ? 'Enregistrement…' : 'Enregistrer'}
    </Button>
  )
}

function Champ({
  id,
  label,
  aide,
  ...props
}: { id: string; label: string; aide?: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base">{label}</Label>
      <Input id={id} name={id} className="h-12" {...props} />
      {aide && <p className="text-sm text-muted-foreground">{aide}</p>}
    </div>
  )
}

export function FormulaireParametres({ dahira }: { dahira: Dahira }) {
  const [etat, action] = useActionState<EtatParametres, FormData>(enregistrerParametres, {})

  return (
    <form action={action} className="space-y-5">
      <Champ id="nom" label="Nom complet" defaultValue={dahira.nom} required aide="Affiché en tête des reçus et des bilans." />
      <Champ id="nom_court" label="Nom court" defaultValue={dahira.nom_court} required />
      <Champ id="ville" label="Ville" defaultValue={dahira.ville ?? ''} />

      <fieldset className="space-y-4 rounded-xl border p-4">
        <legend className="px-1 text-base font-medium">Paiements mobiles</legend>
        <p className="text-sm text-muted-foreground">Affichés aux membres quand ils déclarent un paiement.</p>
        <Champ
          id="numero_wave"
          label="Numéro Wave du dahira"
          inputMode="tel"
          defaultValue={afficherTelephone(dahira.numero_wave)}
        />
        <Champ
          id="numero_orange_money"
          label="Numéro Orange Money du dahira"
          inputMode="tel"
          defaultValue={afficherTelephone(dahira.numero_orange_money)}
        />
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border p-4">
        <legend className="px-1 text-base font-medium">Règles financières</legend>
        <Champ
          id="seuil"
          label="Double validation au-delà de (F)"
          inputMode="numeric"
          defaultValue={String(dahira.seuil_double_validation / 100)}
          aide="Une dépense plus élevée doit être validée par le président."
        />
        <Champ
          id="cotisation_defaut"
          label="Cotisation mensuelle par défaut (F)"
          inputMode="numeric"
          defaultValue={String(dahira.cotisation_defaut / 100)}
          aide="Pour les membres sans catégorie. Les montants par catégorie se règlent dans Catégories."
        />
      </fieldset>

      {etat.erreur && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {etat.erreur}
        </p>
      )}
      {etat.ok && (
        <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">Paramètres enregistrés.</p>
      )}

      <Bouton />
    </form>
  )
}