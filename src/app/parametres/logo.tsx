'use client'

import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { changerLogo, remettreLogoOrigine } from './actions'

const TAILLE = 512

/** Redimensionne n'importe quelle image en carré PNG de 512 × 512, sans la déformer. */
async function preparerImage(fichier: File): Promise<Blob> {
  const url = URL.createObjectURL(fichier)
  try {
    const img = await new Promise<HTMLImageElement>((ok, ko) => {
      const i = new Image()
      i.onload = () => ok(i)
      i.onerror = () => ko(new Error('image'))
      i.src = url
    })
    const toile = document.createElement('canvas')
    toile.width = TAILLE
    toile.height = TAILLE
    const ctx = toile.getContext('2d')!
    const echelle = Math.min(TAILLE / img.width, TAILLE / img.height)
    const l = img.width * echelle
    const h = img.height * echelle
    ctx.drawImage(img, (TAILLE - l) / 2, (TAILLE - h) / 2, l, h)
    return await new Promise<Blob>((ok, ko) =>
      toile.toBlob((b) => (b ? ok(b) : ko(new Error('png'))), 'image/png')
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function ChoixLogo({ personnalise }: { personnalise: boolean }) {
  const champ = useRef<HTMLInputElement>(null)
  const [apercu, setApercu] = useState<string | null>(null)
  const [image, setImage] = useState<Blob | null>(null)
  const [version, setVersion] = useState(0)
  const [enCours, startTransition] = useTransition()

  async function choisir(fichier: File | undefined) {
    if (!fichier) return
    try {
      const png = await preparerImage(fichier)
      setImage(png)
      setApercu(URL.createObjectURL(png))
    } catch {
      toast.error('Cette image ne peut pas être lue. Essayez une photo PNG ou JPG.')
    }
  }

  function envoyer() {
    if (!image) return
    const donnees = new FormData()
    donnees.append('logo', new File([image], 'logo.png', { type: 'image/png' }))
    startTransition(async () => {
      const r = await changerLogo(donnees)
      if (!r.ok) {
        toast.error(r.erreur)
        return
      }
      toast.success('Nouveau logo enregistré.')
      setApercu(null)
      setImage(null)
      setVersion((v) => v + 1)
    })
  }

  function remettre() {
    if (!window.confirm('Revenir au logo d’origine ?')) return
    startTransition(async () => {
      const r = await remettreLogoOrigine()
      if (!r.ok) toast.error(r.erreur)
      else {
        toast.success('Logo d’origine rétabli.')
        setVersion((v) => v + 1)
      }
    })
  }

  return (
    <section className="mb-8 rounded-xl border p-4">
      <p className="mb-3 font-semibold">Logo</p>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={apercu ?? `/logo-dahira.png?v=${version}`}
          alt="Logo du dahira"
          width={96}
          height={96}
          className="size-24 rounded-lg border object-contain"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={champ}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => choisir(e.target.files?.[0])}
          />
          {apercu ? (
            <>
              <Button onClick={envoyer} disabled={enCours} className="h-11 w-full">
                {enCours ? 'Envoi…' : 'Utiliser ce logo'}
              </Button>
              <Button variant="ghost" onClick={() => { setApercu(null); setImage(null) }} disabled={enCours} className="w-full">
                Annuler
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => champ.current?.click()} disabled={enCours} className="h-11 w-full">
                Choisir une image
              </Button>
              {personnalise && (
                <Button variant="ghost" onClick={remettre} disabled={enCours} className="w-full text-sm">
                  Revenir au logo d&apos;origine
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Utilisé sur la page de connexion, les reçus et les bilans. L&apos;icône de l&apos;application
        installée sur les téléphones ne change pas.
      </p>
    </section>
  )
}