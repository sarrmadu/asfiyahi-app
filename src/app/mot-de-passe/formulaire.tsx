'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changerMotDePasse, type EtatMotDePasse } from './actions'

function Bouton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-14 w-full text-base font-semibold">
      {pending ? 'Enregistrement…' : 'Enregistrer mon mot de passe'}
    </Button>
  )
}

export function FormulaireMotDePasse() {
  const [etat, action] = useActionState<EtatMotDePasse, FormData>(changerMotDePasse, {})
  const [voir, setVoir] = useState(false)

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="motDePasse" className="text-base">Nouveau mot de passe</Label>
        <Input
          id="motDePasse"
          name="motDePasse"
          type={voir ? 'text' : 'password'}
          autoComplete="new-password"
          minLength={8}
          required
          className="h-12"
        />
        <p className="text-sm text-muted-foreground">Au moins 8 caractères.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmation" className="text-base">Retapez-le</Label>
        <Input
          id="confirmation"
          name="confirmation"
          type={voir ? 'text' : 'password'}
          autoComplete="new-password"
          minLength={8}
          required
          className="h-12"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={voir} onChange={(e) => setVoir(e.target.checked)} className="size-4" />
        Afficher les mots de passe
      </label>

      {etat.erreur && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {etat.erreur}
        </p>
      )}

      <Bouton />
    </form>
  )
}