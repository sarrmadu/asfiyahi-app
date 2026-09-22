'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { afficherTelephone, formaterMontant } from '@/lib/format'
import { enregistrerMembre, type EtatFormulaire } from './actions'

export type MembreEdite = {
  id: string
  prenom: string
  nom: string
  surnom: string | null
  telephone: string | null
  section_id: string | null
  date_adhesion: string
  cotisation_mensuelle: number | null
  statut: string
  notes: string | null
}

const classeSelect =
  'h-12 w-full rounded-lg border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring'

function BoutonEnregistrer({ creation }: { creation: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-14 w-full text-base font-semibold">
      {pending ? 'Enregistrement…' : creation ? 'Inscrire le membre' : 'Enregistrer'}
    </Button>
  )
}

export function FormulaireMembre({
  membre,
  sections,
  cotisationDefaut,
}: {
  membre?: MembreEdite
  sections: { id: string; nom: string }[]
  cotisationDefaut: number
}) {
  const [etat, action] = useActionState<EtatFormulaire, FormData>(enregistrerMembre, {})
  const creation = !membre
  const aujourdhui = new Date().toISOString().slice(0, 10)

  return (
    <form action={action} className="space-y-5">
      {membre && <input type="hidden" name="id" value={membre.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prenom" className="text-base">Prénom *</Label>
          <Input id="prenom" name="prenom" required defaultValue={membre?.prenom} className="h-12" autoFocus={creation} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom" className="text-base">Nom *</Label>
          <Input id="nom" name="nom" required defaultValue={membre?.nom} className="h-12" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="surnom" className="text-base">Surnom d&apos;usage</Label>
        <Input
          id="surnom"
          name="surnom"
          defaultValue={membre?.surnom ?? ''}
          placeholder="Ex. : Serigne Modou, Sokhna Awa"
          className="h-12"
        />
        <p className="text-sm text-muted-foreground">
          Le nom sous lequel tout le monde le connaît. Le trésorier pourra le chercher ainsi.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone" className="text-base">Téléphone</Label>
        <Input
          id="telephone"
          name="telephone"
          type="tel"
          inputMode="numeric"
          defaultValue={afficherTelephone(membre?.telephone)}
          placeholder="77 123 45 67"
          className="h-12"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="section_id" className="text-base">Section</Label>
          <select
            id="section_id"
            name="section_id"
            defaultValue={membre?.section_id ?? sections[0]?.id ?? ''}
            className={classeSelect}
          >
            <option value="">— Aucune —</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.nom}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_adhesion" className="text-base">Date d&apos;adhésion</Label>
          <Input
            id="date_adhesion"
            name="date_adhesion"
            type="date"
            max={aujourdhui}
            defaultValue={membre?.date_adhesion ?? aujourdhui}
            className="h-12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cotisation" className="text-base">Cotisation mensuelle (F CFA)</Label>
        <Input
          id="cotisation"
          name="cotisation"
          inputMode="numeric"
          defaultValue={
            membre?.cotisation_mensuelle != null ? String(membre.cotisation_mensuelle / 100) : ''
          }
          placeholder={`${formaterMontant(cotisationDefaut)} (montant habituel)`}
          className="h-12"
        />
        <p className="text-sm text-muted-foreground">
          Laissez vide pour appliquer le montant habituel du dahira.
        </p>
      </div>

      {membre && (
        <div className="space-y-2">
          <Label htmlFor="statut" className="text-base">Statut</Label>
          <select id="statut" name="statut" defaultValue={membre.statut} className={classeSelect}>
            <option value="actif">Actif</option>
            <option value="dispense">Dispensé de cotisation</option>
            <option value="inactif">Inactif (ne fait plus partie du dahira)</option>
          </select>
          <p className="text-sm text-muted-foreground">
            Un membre n&apos;est jamais supprimé : son historique de paiements est conservé.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-base">Notes internes</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={membre?.notes ?? ''}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-sm text-muted-foreground">
          À usage du bureau. N&apos;y notez rien de sensible (santé, conflits).
        </p>
      </div>

      {etat.erreur && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {etat.erreur}
        </p>
      )}

      <BoutonEnregistrer creation={creation} />

      <Link href="/membres" className="block text-center text-sm text-muted-foreground">
        Annuler
      </Link>
    </form>
  )
}