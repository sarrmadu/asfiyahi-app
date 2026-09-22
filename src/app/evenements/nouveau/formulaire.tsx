'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formaterMontant } from '@/lib/format'
import { creerEvenement, type EtatEvenement } from '../actions'

const classeChamp =
  'w-full rounded-lg border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring'

function Bouton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-14 w-full text-base font-semibold">
      {pending ? 'Enregistrement…' : "Créer l'événement"}
    </Button>
  )
}

export function FormulaireEvenement({
  caisses,
  categories,
}: {
  caisses: { id: string; nom: string; type: string }[]
  categories: { id: string; nom: string; cotisation_mensuelle: number | null }[]
}) {
  const [etat, action] = useActionState<EtatEvenement, FormData>(creerEvenement, {})
  const [type, setType] = useState<'gamou' | 'autre'>('autre')
  const caisseProjets = caisses.find((c) => c.type === 'projets')?.id ?? caisses[0]?.id

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="type" value={type} />

      <div className="space-y-2">
        <p className="text-base font-medium">Type d&apos;événement</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={type === 'gamou' ? 'default' : 'outline'}
            aria-pressed={type === 'gamou'}
            onClick={() => setType('gamou')}
            className="h-auto min-h-16 flex-col whitespace-normal py-2"
          >
            <span className="font-semibold">Gamou</span>
            <span className="text-xs font-normal opacity-80">financé par les cotisations</span>
          </Button>
          <Button
            type="button"
            variant={type === 'autre' ? 'default' : 'outline'}
            aria-pressed={type === 'autre'}
            onClick={() => setType('autre')}
            className="h-auto min-h-16 flex-col whitespace-normal py-2"
          >
            <span className="font-semibold">Autre événement</span>
            <span className="text-xs font-normal opacity-80">Magal, thiant… avec sa collecte</span>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="titre" className="text-base">Nom *</Label>
        <Input
          id="titre"
          name="titre"
          required
          placeholder={type === 'gamou' ? 'Ex. : Gamou 2027' : 'Ex. : Magal 2026'}
          className="h-12"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-base">Date et heure *</Label>
          <Input id="date" name="date" type="datetime-local" required className="h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lieu" className="text-base">Lieu</Label>
          <Input id="lieu" name="lieu" className="h-12" />
        </div>
      </div>

      {type === 'gamou' ? (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm">
          Le Gamou est financé par la caisse <strong>Mensualités</strong>. Chaque membre est
          complet s&apos;il a payé toutes ses cotisations depuis le Gamou précédent. Les dons
          restent possibles en plus, et ce qui reste après le Gamou est reporté sur le suivant.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="caisse_id" className="text-base">Caisse de l&apos;événement *</Label>
            <select
              id="caisse_id"
              name="caisse_id"
              defaultValue={caisseProjets}
              className={`${classeChamp} h-12`}
            >
              {caisses
                .filter((c) => c.type !== 'mensualites')
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
            </select>
          </div>

          <fieldset className="space-y-3 rounded-xl border p-4">
            <legend className="px-1 text-base font-medium">Part à verser (F)</legend>
            <p className="text-sm text-muted-foreground">
              Laissez vide les catégories qui ne versent pas de part. Les dons restent possibles.
            </p>
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3">
                <Label htmlFor={`part_${c.id}`} className="text-base font-normal">{c.nom}</Label>
                <Input
                  id={`part_${c.id}`}
                  name={`part_${c.id}`}
                  inputMode="numeric"
                  placeholder="0"
                  className="montant h-12 w-36 text-right"
                />
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 border-t pt-3">
              <Label htmlFor="part_defaut" className="text-base font-normal">
                Membres sans catégorie
              </Label>
              <Input
                id="part_defaut"
                name="part_defaut"
                inputMode="numeric"
                placeholder="0"
                className="montant h-12 w-36 text-right"
              />
            </div>
          </fieldset>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="budget" className="text-base">Budget prévu (F)</Label>
        <Input id="budget" name="budget" inputMode="numeric" placeholder="Ex. : 1000000" className="h-12" />
        {type === 'gamou' && categories.some((c) => c.cotisation_mensuelle) && (
          <p className="text-sm text-muted-foreground">
            Pour mémoire, sur 12 mois :{' '}
            {categories
              .filter((c) => c.cotisation_mensuelle)
              .map((c) => `${c.nom} ${formaterMontant((c.cotisation_mensuelle ?? 0) * 12)}`)
              .join(' · ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base">Description</Label>
        <textarea id="description" name="description" rows={3} className={`${classeChamp} py-2`} />
      </div>

      {etat.erreur && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {etat.erreur}
        </p>
      )}

      <Bouton />
      <Link href="/evenements" className="block text-center text-sm text-muted-foreground">
        Annuler
      </Link>
    </form>
  )
}