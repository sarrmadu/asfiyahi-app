'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { seConnecter, type EtatConnexion } from './actions'

function BoutonValider() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      // h-14 = 56px : hauteur minimale imposée par le cahier des charges pour
      // toute action importante, usage à une main sur téléphone.
      className="h-14 w-full text-base font-semibold"
    >
      {pending ? 'Connexion…' : 'Se connecter'}
    </Button>
  )
}

export function FormulaireConnexion({ suite }: { suite: string }) {
  const [etat, action] = useActionState<EtatConnexion, FormData>(seConnecter, {})

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="suite" value={suite} />

      <div className="space-y-2">
        <Label htmlFor="telephone" className="text-base">
          Numéro de téléphone
        </Label>
        <Input
          id="telephone"
          name="telephone"
          type="tel"
          inputMode="numeric"
          autoComplete="username"
          placeholder="77 123 45 67"
          required
          autoFocus
          className="h-14 text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motDePasse" className="text-base">
          Mot de passe
        </Label>
        <Input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
          className="h-14 text-lg"
        />
      </div>

      {etat.erreur && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {etat.erreur}
        </p>
      )}

      <BoutonValider />

      <p className="pt-2 text-center text-sm text-muted-foreground">
        Mot de passe oublié ? Contactez le secrétaire du dahira.
      </p>
    </form>
  )
}
