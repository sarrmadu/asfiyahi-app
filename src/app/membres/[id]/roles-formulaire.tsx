'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { RoleType } from '@/lib/auth'
import { enregistrerRoles } from './roles-actions'

const ROLES: { code: RoleType; nom: string; aide: string }[] = [
  { code: 'president', nom: 'Président', aide: 'Tous les droits, dont les paramètres et les rôles' },
  { code: 'tresorier', nom: 'Trésorier', aide: 'Encaisse, valide les paiements, saisit les dépenses' },
  { code: 'secretaire', nom: 'Secrétaire', aide: 'Gère les membres et les événements' },
  { code: 'commissaire', nom: 'Commissaire aux comptes', aide: 'Consulte les comptes, sans rien modifier' },
]

export function FormulaireRoles({ membreId, actuels }: { membreId: string; actuels: RoleType[] }) {
  const [choisis, setChoisis] = useState<RoleType[]>(actuels)
  const [enCours, startTransition] = useTransition()
  const modifie = [...choisis].sort().join() !== [...actuels].sort().join()

  function basculer(r: RoleType) {
    setChoisis((c) => (c.includes(r) ? c.filter((x) => x !== r) : [...c, r]))
  }

  function enregistrer() {
    if (choisis.includes('president') && !actuels.includes('president')) {
      const ok = window.confirm('Donner le rôle de président ? Cette personne aura tous les droits, y compris sur les rôles.')
      if (!ok) return
    }
    startTransition(async () => {
      const r = await enregistrerRoles(membreId, choisis)
      if (!r.ok) {
        toast.error(r.erreur)
        return
      }
      toast.success('Rôles enregistrés.')
    })
  }

  return (
    <div className="space-y-2">
      {ROLES.map((r) => (
        <label key={r.code} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
          <input
            type="checkbox"
            checked={choisis.includes(r.code)}
            onChange={() => basculer(r.code)}
            disabled={enCours}
            className="mt-1 size-5"
          />
          <span>
            <span className="block font-medium">{r.nom}</span>
            <span className="block text-sm text-muted-foreground">{r.aide}</span>
          </span>
        </label>
      ))}
      {modifie && (
        <Button onClick={enregistrer} disabled={enCours} className="mt-2 h-12 w-full text-base">
          {enCours ? 'Enregistrement…' : 'Enregistrer les rôles'}
        </Button>
      )}
    </div>
  )
}