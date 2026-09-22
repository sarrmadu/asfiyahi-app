'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cloturerEvenement } from './cloture-actions'

export function BoutonCloturer({ evenementId, titre }: { evenementId: string; titre: string }) {
  const [enCours, startTransition] = useTransition()
  const [confirmer, setConfirmer] = useState(false)

  function cloturer() {
    startTransition(async () => {
      const r = await cloturerEvenement(evenementId)
      if (!r.ok) {
        toast.error(r.erreur)
        setConfirmer(false)
        return
      }
      toast.success('Événement clôturé. Son bilan est maintenant définitif.')
    })
  }

  return (
    <section className="mt-10 rounded-xl border border-dashed p-4">
      <p className="font-semibold">Clôturer l&apos;événement</p>
      <p className="mb-3 mt-1 text-sm text-muted-foreground">
        Quand tout est encaissé et payé : plus aucun versement ni aucune dépense ne pourra être
        ajouté à « {titre} », et son bilan deviendra définitif. Cette action ne peut pas être annulée.
      </p>
      {confirmer ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setConfirmer(false)} disabled={enCours} className="h-12">
            Retour
          </Button>
          <Button variant="destructive" onClick={cloturer} disabled={enCours} className="h-12">
            {enCours ? 'Clôture…' : 'Oui, clôturer'}
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setConfirmer(true)} className="h-12 w-full text-base">
          Clôturer l&apos;événement
        </Button>
      )}
    </section>
  )
}