'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { afficherTelephone } from '@/lib/format'
import { donnerAcces } from '../acces-actions'

type Resultat = { motDePasse: string; telephone: string; prenom: string }

function messageAcces(r: Resultat): string {
  return [
    'Assalamu alaykum ' + r.prenom + '.',
    "Voici votre accès à l'application du Dahira Asfiyahi Mbour : " + window.location.origin,
    'Numéro : ' + afficherTelephone(r.telephone),
    'Mot de passe provisoire : ' + r.motDePasse,
    'À la première connexion, vous choisirez votre propre mot de passe.',
  ].join('\n')
}

function lienWhatsApp(r: Resultat): string {
  const numero = r.telephone.replace('+', '')
  return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(messageAcces(r))
}

function texteExplication(aUnAcces: boolean, telephone: string | null): string {
  if (aUnAcces) {
    return 'Ce membre peut se connecter. En cas d’oubli, donnez-lui un nouveau mot de passe provisoire.'
  }
  if (telephone) {
    return 'Il se connectera avec son numéro ' + afficherTelephone(telephone) + ' et un mot de passe provisoire, qu’il changera ensuite.'
  }
  return 'Ajoutez son numéro de téléphone ci-dessous pour pouvoir créer son accès.'
}

export function AccesMembre({
  membreId,
  aUnAcces,
  telephone,
}: {
  membreId: string
  aUnAcces: boolean
  telephone: string | null
}) {
  const [enCours, startTransition] = useTransition()
  const [resultat, setResultat] = useState<Resultat | null>(null)

  function lancer() {
    if (aUnAcces) {
      const ok = window.confirm('Donner un nouveau mot de passe provisoire à ce membre ? L’ancien ne marchera plus.')
      if (!ok) return
    }
    startTransition(async () => {
      const r = await donnerAcces(membreId)
      if (!r.ok) {
        toast.error(r.erreur)
        return
      }
      setResultat({ motDePasse: r.motDePasse, telephone: r.telephone, prenom: r.prenom })
    })
  }

  async function copier(r: Resultat) {
    try {
      await navigator.clipboard.writeText(messageAcces(r))
      toast.success('Message copié')
    } catch {
      toast.error('Copie impossible')
    }
  }

  if (resultat) {
    return (
      <section className="mb-6 space-y-3 rounded-xl border p-4">
        <p className="font-semibold">Accès à l&apos;application</p>
        <p className="text-sm text-muted-foreground">Mot de passe provisoire (affiché une seule fois) :</p>
        <p className="rounded-lg bg-muted px-4 py-3 text-center font-mono text-2xl tracking-wider">
          {resultat.motDePasse}
        </p>
        <a href={lienWhatsApp(resultat)} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="h-12 w-full text-base">Envoyer par WhatsApp</Button>
        </a>
        <Button variant="outline" onClick={() => copier(resultat)} className="h-12 w-full text-base">
          Copier le message
        </Button>
      </section>
    )
  }

  return (
    <section className="mb-6 rounded-xl border p-4">
      <p className="font-semibold">Accès à l&apos;application</p>
      <p className="mb-3 mt-1 text-sm text-muted-foreground">{texteExplication(aUnAcces, telephone)}</p>
      <Button
        variant={aUnAcces ? 'outline' : 'default'}
        onClick={lancer}
        disabled={enCours || !telephone}
        className="h-12 w-full text-base"
      >
        {enCours ? 'Préparation…' : aUnAcces ? 'Nouveau mot de passe' : 'Créer son accès'}
      </Button>
    </section>
  )
}