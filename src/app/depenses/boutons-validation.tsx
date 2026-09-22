'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { rejeterDepense, validerDepense } from './actions'

export function BoutonsValidation({ depenseId }: { depenseId: string }) {
  const [enCours, startTransition] = useTransition()
  const [rejet, setRejet] = useState(false)
  const [motif, setMotif] = useState('')

  function valider() {
    startTransition(async () => {
      const r = await validerDepense(depenseId)
      if (r.ok) toast.success('Dépense validée')
      else toast.error(r.erreur)
    })
  }

  function rejeter() {
    startTransition(async () => {
      const r = await rejeterDepense(depenseId, motif)
      if (r.ok) {
        toast.success('Dépense rejetée')
        setRejet(false)
      } else toast.error(r.erreur)
    })
  }

  if (rejet) {
    return (
      <div className="mt-3 space-y-2">
        <textarea
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          rows={2}
          autoFocus
          placeholder="Motif du rejet (obligatoire)"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={rejeter}
            disabled={enCours || motif.trim().length < 5}
            className="h-11 flex-1"
          >
            Confirmer le rejet
          </Button>
          <Button variant="outline" onClick={() => setRejet(false)} disabled={enCours} className="h-11">
            Retour
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 flex gap-2">
      <Button onClick={valider} disabled={enCours} className="h-11 flex-1">
        {enCours ? '…' : 'Valider'}
      </Button>
      <Button variant="outline" onClick={() => setRejet(true)} disabled={enCours} className="h-11 flex-1">
        Rejeter
      </Button>
    </div>
  )
}