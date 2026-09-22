'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

/**
 * Envoie le reçu PDF par WhatsApp (ou tout autre appli) grâce au menu
 * « Partager » du téléphone. Sur ordinateur, le reçu est téléchargé.
 *
 * `precharger` : le PDF est préparé dès l'affichage du bouton. Sur iPhone,
 * le partage doit suivre le clic immédiatement, sinon Safari le bloque.
 */
export function BoutonRecu({
  recuId,
  numero,
  precharger = false,
  variante = 'outline',
  libelle = 'Envoyer le reçu',
  className,
}: {
  recuId: string
  numero: string
  precharger?: boolean
  variante?: 'default' | 'outline' | 'ghost'
  libelle?: string
  className?: string
}) {
  const fichierRef = useRef<File | null>(null)
  const [enCours, setEnCours] = useState(false)

  async function obtenirFichier(): Promise<File> {
    if (fichierRef.current) return fichierRef.current
    const rep = await fetch(`/recus/${recuId}/pdf`)
    if (!rep.ok) throw new Error('telechargement')
    const blob = await rep.blob()
    fichierRef.current = new File([blob], `Recu-${numero}.pdf`, { type: 'application/pdf' })
    return fichierRef.current
  }

  useEffect(() => {
    if (precharger) obtenirFichier().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precharger, recuId])

  function telecharger(fichier: File) {
    const url = URL.createObjectURL(fichier)
    const lien = document.createElement('a')
    lien.href = url
    lien.download = fichier.name
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }

  async function envoyer() {
    setEnCours(true)
    try {
      const fichier = await obtenirFichier()
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [fichier] })) {
        try {
          await navigator.share({ files: [fichier], title: `Reçu ${numero}` })
        } catch (e) {
          const nom = (e as Error).name
          if (nom === 'AbortError') return // l'utilisateur a fermé le menu
          if (nom === 'NotAllowedError') {
            // Le téléphone a bloqué le partage : on réessaie au prochain clic,
            // le fichier est maintenant prêt.
            toast.info('Reçu prêt. Appuyez encore une fois pour l’envoyer.')
            return
          }
          telecharger(fichier)
        }
      } else {
        telecharger(fichier)
      }
    } catch {
      toast.error('Impossible de préparer le reçu. Vérifiez la connexion.')
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