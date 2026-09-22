'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formaterMontant } from '@/lib/format'
import { enregistrerCotisations, type EtatCategories } from './actions'

function Bouton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-14 w-full text-base font-semibold">
      {pending ? 'Enregistrement…' : 'Enregistrer'}
    </Button>
  )
}

export function FormulaireCategories({
  categories,
  cotisationDefaut,
}: {
  categories: { id: string; nom: string; cotisation_mensuelle: number | null; nb: number }[]
  cotisationDefaut: number
}) {
  const [etat, action] = useActionState<EtatCategories, FormData>(enregistrerCotisations, {})

  return (
    <form action={action} className="space-y-4">
      <ul className="divide-y rounded-xl border">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium">{c.nom}</p>
              <p className="text-sm text-muted-foreground">
                {c.nb} membre{c.nb > 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-36 shrink-0">
              <Input
                name={`coti_${c.id}`}
                inputMode="numeric"
                defaultValue={c.cotisation_mensuelle != null ? String(c.cotisation_mensuelle / 100) : ''}
                placeholder={String(cotisationDefaut / 100)}
                aria-label={`Cotisation mensuelle, ${c.nom}`}
                className="montant h-12 text-right"
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="text-sm text-muted-foreground">
        Montants mensuels en F CFA. Une case vide applique le montant habituel du dahira (
        {formaterMontant(cotisationDefaut)}). Un changement s&apos;applique aussi aux mois déjà
        écoulés dans le calcul des retards.
      </p>

      {etat.erreur && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {etat.erreur}
        </p>
      )}
      {etat.ok && (
        <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary">{etat.ok}</p>
      )}

      <Bouton />
    </form>
  )
}