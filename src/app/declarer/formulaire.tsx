'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { afficherTelephone, formaterMontant } from '@/lib/format'
import { declarer, type EtatDeclaration } from './actions'

const classeChamp =
  'w-full rounded-lg border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring'

const MODES = [
  { code: 'wave', nom: 'Wave' },
  { code: 'orange_money', nom: 'Orange Money' },
  { code: 'free_money', nom: 'Free Money' },
] as const

function Bouton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-14 w-full text-base font-semibold">
      {pending ? 'Envoi…' : 'Déclarer mon paiement'}
    </Button>
  )
}

export function FormulaireDeclaration({
  evenements,
  numeros,
  cotisation,
  dateDuJour,
}: {
  evenements: { id: string; titre: string; est_gamou: boolean }[]
  numeros: { wave: string | null; orange_money: string | null }
  cotisation: number
  dateDuJour: string
}) {
  const [etat, action] = useActionState<EtatDeclaration, FormData>(declarer, {})
  const [mode, setMode] = useState<string>('wave')
  const numero = mode === 'wave' ? numeros.wave : mode === 'orange_money' ? numeros.orange_money : null

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="mode" value={mode} />

      <div className="space-y-2">
        <Label htmlFor="evenement_id" className="text-base">C&apos;est pour</Label>
        <select id="evenement_id" name="evenement_id" defaultValue="" className={`${classeChamp} h-12`}>
          <option value="">Ma cotisation mensuelle</option>
          {evenements.map((e) => (
            <option key={e.id} value={e.id}>
              {e.est_gamou ? `Un don pour ${e.titre}` : e.titre}
            </option>
          ))}
        </select>
        {cotisation > 0 && (
          <p className="text-sm text-muted-foreground">Votre cotisation : {formaterMontant(cotisation)} par mois.</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-base font-medium">Payé avec</p>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => (
            <Button
              key={m.code}
              type="button"
              variant={mode === m.code ? 'default' : 'outline'}
              aria-pressed={mode === m.code}
              onClick={() => setMode(m.code)}
              className="h-12 whitespace-normal px-2 text-sm leading-tight"
            >
              {m.nom}
            </Button>
          ))}
        </div>
        {numero && (
          <p className="rounded-lg bg-muted px-4 py-3 text-sm">
            Numéro du dahira : <strong className="montant">{afficherTelephone(numero)}</strong>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="montant" className="text-base">Montant envoyé (F CFA)</Label>
        <Input id="montant" name="montant" inputMode="numeric" required placeholder="0" className="montant h-14 text-right text-2xl" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference" className="text-base">Référence de la transaction</Label>
        <Input id="reference" name="reference" required autoComplete="off" autoCapitalize="characters" className="h-12 font-mono" />
        <p className="text-sm text-muted-foreground">
          Recopiez le code indiqué dans le SMS de confirmation (ou dans l&apos;historique de l&apos;appli).
          Le trésorier le compare à son relevé.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date" className="text-base">Date du paiement</Label>
        <Input id="date" name="date" type="date" required defaultValue={dateDuJour} max={dateDuJour} className="h-12" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="commentaire" className="text-base">Remarque (facultatif)</Label>
        <textarea id="commentaire" name="commentaire" rows={2} maxLength={300} className={`${classeChamp} py-2`} />
      </div>

      {etat.erreur && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {etat.erreur}
        </p>
      )}

      <Bouton />
      <Link href="/" className="block text-center text-sm text-muted-foreground">
        Annuler
      </Link>
    </form>
  )
}