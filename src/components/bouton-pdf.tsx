'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

/**
 * Prépare un PDF puis ouvre le menu « Partager » du téléphone
 * (WhatsApp, e-mail…). Sur ordinateur, le PDF est téléchargé.
 * Si le téléphone bloque le partage, un second appui suffit :
 * le fichier est alors déjà prêt. Chaque nouvel envoi reprend les chiffres à jour.
 */
export function BoutonPdf({
  url,
  nomFichier,
  titre,
  libelle,
  variante = 'outline',
  className,
}: {
  url: string
  nomFichier: string
  titre: string
  libelle: string
  variante?: 'default' | 'outline' | 'ghost'
  className?: string
}) {
  const fichierRef = useRef<File | null>(null)
  const [enCours, setEnCours] = useState(false)

  function telecharger(fichier: File) {
    const lienUrl = URL.createObjectURL(fichier)
    const lien = document.createElement('a')
    lien.href = lienUrl
    lien.download = fichier.name
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    setTimeout(() => URL.revokeObjectURL(lienUrl), 10_000)
  }

  async function envoyer() {
    setEnCours(true)
    try {
      if (!fichierRef.current) {
        const rep = await fetch(url)
        if (!rep.ok) throw new Error(await rep.text())
        const blob = await rep.blob()
        fichierRef.current = new File([blob], nomFichier, { type: 'application/pdf' })
      }
      const fichier = fichierRef.current
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [fichier] })) {
        try {
          await navigator.share({ files: [fichier], title: titre })
          fichierRef.current = null // la prochaine fois, chiffres à jour
        } catch (e) {
          const nom = (e as Error).name
          if (nom === 'AbortError') return
          if (nom === 'NotAllowedError') {
            toast.info('Document prêt. Appuyez encore une fois pour l’envoyer.')
            return
          }
          telecharger(fichier)
          fichierRef.current = null
        }
      } else {
        telecharger(fichier)
        fichierRef.current = null
      }
    } catch {
      toast.error('Impossible de préparer le document. Vérifiez la connexion.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Button type="button" variant={variante} onClick={envoyer} disabled={enCours} className={className}>
      {enCours ? 'Préparation…' : libelle}
    </Button>
  )
}