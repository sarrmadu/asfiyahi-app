'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BoutonRecu } from '@/components/bouton-recu'
import { formaterMontant } from '@/lib/format'
import { rejeterDeclaration, validerDeclaration } from './actions'

export function BoutonsDeclaration({ id, montant, nom }: { id: string; montant: number; nom: string }) {
  const [enCours, startTransition] = useTransition()
  const [rejet, setRejet] = useState(false)
  const [motif, setMotif] = useState('')
  const [recu, setRecu] = useState<{ id: string; numero: string } | null>(null)

  function valider() {
    const question = 'Confirmer : ' + formaterMontant(montant) + ' de ' + nom + ' bien reçus sur le compte du dahira ?'
    if (!window.confirm(question)) return
    startTransition(async () => {
      const r = await validerDeclaration(id)
      if (!r.ok) {
        toast.error(r.erreur)
        return
      }
      toast.success(r.numeroRecu ? 'Validé · reçu ' + r.numeroRecu : 'Validé')
      if (r.recuId && r.numeroRecu) setRecu({ id: r.recuId, numero: r.numeroRecu })
    })
  }

  function rejeter() {
    startTransition(async () => {
      const r = await rejeterDeclaration(id, motif)
      if (!r.ok) {
        toast.error(r.erreur)
        return
      }
      toast.success('Déclaration rejetée')
    })
  }

  if (recu) {
    return (
      <BoutonRecu
        recuId={recu.id}
        numero={recu.numero}
        precharger
        variante="default"
        className="mt-3 h-12 w-full text-base"
      />
    )
  }

  if (rejet) {
    return (
      <div className="mt-3 space-y-2">
        <Input
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder="Motif, ex. : référence introuvable sur le relevé"
          className="h-12"
          autoFocus
        />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setRejet(false)} disabled={enCours} className="h-12">
            Retour
          </Button>
          <Button
            variant="destructive"
            onClick={rejeter}
            disabled={enCours || motif.trim().length < 5}
            className="h-12"
          >
            Rejeter
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <Button onClick={valider} disabled={enCours} className="h-12 text-base">
        {enCours ? '…' : 'Valider'}
      </Button>
      <Button variant="outline" onClick={() => setRejet(true)} disabled={enCours} className="h-12 text-base">
        Rejeter
      </Button>
    </div>
  )
}