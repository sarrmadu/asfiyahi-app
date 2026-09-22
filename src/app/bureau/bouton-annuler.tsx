'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formaterMontant } from '@/lib/format'
import { annulerOperation } from './actions'

export function BoutonAnnuler({
  ecritureId,
  description,
  montant,
}: {
  ecritureId: string
  description: string
  montant: number
}) {
  const [ouvert, setOuvert] = useState(false)
  const [motif, setMotif] = useState('')
  const [enCours, startTransition] = useTransition()

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="mt-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-destructive"
      >
        Annuler
      </button>
    )
  }

  function confirmer() {
    startTransition(async () => {
      const r = await annulerOperation(ecritureId, motif)
      if (!r.ok) {
        toast.error(r.erreur)
        return
      }
      toast.success('Opération annulée')
      setOuvert(false)
      setMotif('')
    })
  }

  return (
    <div className="mt-3 w-full space-y-3 rounded-lg border-2 border-destructive/40 bg-destructive/5 p-3">
      <p className="text-sm">
        Annuler <strong>{description}</strong> ({formaterMontant(montant)}) ? Le montant sera
        retiré de la caisse et le reçu ne sera plus valable. L&apos;opération restera visible dans
        le journal.
      </p>
      <textarea
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        rows={2}
        placeholder="Motif obligatoire, ex. : erreur de montant, c'était 2 mois"
        autoFocus
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          onClick={confirmer}
          disabled={enCours || motif.trim().length < 5}
          className="h-11 flex-1"
        >
          {enCours ? 'Annulation…' : "Confirmer l'annulation"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOuvert(false)
            setMotif('')
          }}
          disabled={enCours}
          className="h-11"
        >
          Retour
        </Button>
      </div>
    </div>
  )
}