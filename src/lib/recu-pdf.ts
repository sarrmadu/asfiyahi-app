import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont, type PDFPage } from 'pdf-lib'
import { formaterMontant } from '@/lib/format'
import { nombreEnLettres } from '@/lib/nombre-en-lettres'

export type DonneesRecu = {
  numero: string
  dahiraNom: string
  dahiraVille: string | null
  membreNom: string
  membreNumero: string
  montantCentimes: number
  objet: string
  caisse: string
  mode: string
  dateVersement: string // AAAA-MM-JJ
  encaissePar: string | null
  genereLe: string // horodatage ISO
  annule: { motif: string } | null
}

const VERT = rgb(0.043, 0.365, 0.18) // #0B5D2E
const OR = rgb(0.788, 0.635, 0.153) // #C9A227
const GRIS = rgb(0.42, 0.42, 0.42)
const NOIR = rgb(0.1, 0.1, 0.1)
const ROUGE = rgb(0.75, 0.1, 0.1)

const MODES: Record<string, string> = {
  especes: 'Espèces',
  wave: 'Wave',
  orange_money: 'Orange Money',
  free_money: 'Free Money',
  virement: 'Virement',
  autre: 'Autre',
}

const dateLongue = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Dakar',
})
const dateHeure = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Dakar',
})

/**
 * Les polices intégrées du PDF ne connaissent que l'alphabet latin courant.
 * On remplace les espaces spéciales et on met « ? » pour le reste
 * (lettres arabes par exemple), plutôt que de faire échouer le reçu.
 */
function propre(texte: string, police: PDFFont): string {
  let sortie = ''
  for (const c of texte.replace(/[\u00A0\u202F\u2009]/g, ' ')) {
    try {
      police.encodeText(c)
      sortie += c
    } catch {
      sortie += '?'
    }
  }
  return sortie
}

/** Découpe un texte en lignes qui tiennent dans la largeur donnée. */
function couper(texte: string, police: PDFFont, taille: number, largeur: number): string[] {
  const mots = texte.split(/\s+/)
  const lignes: string[] = []
  let ligne = ''
  for (const mot of mots) {
    const essai = ligne ? `${ligne} ${mot}` : mot
    if (police.widthOfTextAtSize(essai, taille) <= largeur || !ligne) {
      ligne = essai
    } else {
      lignes.push(ligne)
      ligne = mot
    }
  }
  if (ligne) lignes.push(ligne)
  return lignes
}

export async function genererRecuPdf(d: DonneesRecu, logo: Uint8Array | null): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`Reçu ${d.numero}`)
  doc.setAuthor(d.dahiraNom)
  doc.setCreator(d.dahiraNom)

  // Format A5 : lisible sur téléphone et imprimable
  const page = doc.addPage([420, 595])
  const { width: L, height: H } = page.getSize()
  const marge = 32
  const normal = await doc.embedFont(StandardFonts.Helvetica)
  const gras = await doc.embedFont(StandardFonts.HelveticaBold)

  const texte = (
    p: PDFPage,
    t: string,
    x: number,
    y: number,
    opts: { taille?: number; police?: PDFFont; couleur?: ReturnType<typeof rgb>; droite?: boolean } = {}
  ) => {
    const police = opts.police ?? normal
    const taille = opts.taille ?? 10
    const s = propre(t, police)
    const px = opts.droite ? x - police.widthOfTextAtSize(s, taille) : x
    p.drawText(s, { x: px, y, size: taille, font: police, color: opts.couleur ?? NOIR })
  }

  // --- Bandeau supérieur -----------------------------------------------------
  page.drawRectangle({ x: 0, y: H - 6, width: L, height: 6, color: VERT })
  page.drawRectangle({ x: 0, y: H - 9, width: L, height: 3, color: OR })

  let y = H - 40
  let xTitre = marge
  if (logo) {
    try {
      const image = await doc.embedPng(logo)
      const cote = 64
      page.drawImage(image, { x: marge, y: y - cote + 12, width: cote, height: cote })
      xTitre = marge + cote + 14
    } catch {
      // logo illisible : on continue sans
    }
  }
  texte(page, d.dahiraNom, xTitre, y - 4, { taille: 15, police: gras, couleur: VERT })
  if (d.dahiraVille) texte(page, d.dahiraVille, xTitre, y - 20, { taille: 9, couleur: GRIS })

  // --- Titre et numéro -------------------------------------------------------
  y -= 80
  texte(page, 'REÇU DE VERSEMENT', marge, y, { taille: 13, police: gras })
  texte(page, d.numero, L - marge, y, { taille: 11, police: gras, couleur: VERT, droite: true })
  y -= 16
  texte(page, `Versement du ${dateLongue.format(new Date(`${d.dateVersement}T12:00:00Z`))}`, marge, y, {
    taille: 9,
    couleur: GRIS,
  })

  // --- Montant ---------------------------------------------------------------
  const francs = Math.round(d.montantCentimes / 100)
  const enLettres = `${nombreEnLettres(francs)} franc${francs > 1 ? 's' : ''} CFA`
  const lettres = enLettres.charAt(0).toUpperCase() + enLettres.slice(1)
  const lignesLettres = couper(propre(lettres, normal), normal, 9, L - 2 * marge - 28)

  y -= 22
  const hauteurMontant = 68 + 12 * lignesLettres.length
  page.drawRectangle({
    x: marge,
    y: y - hauteurMontant,
    width: L - 2 * marge,
    height: hauteurMontant,
    color: rgb(0.95, 0.97, 0.95),
    borderColor: VERT,
    borderWidth: 1,
  })
  texte(page, 'Montant reçu', marge + 14, y - 20, { taille: 9, couleur: GRIS })
  texte(page, formaterMontant(d.montantCentimes) + ' CFA', marge + 14, y - 46, {
    taille: 24,
    police: gras,
    couleur: VERT,
  })
  lignesLettres.forEach((l, i) => texte(page, l, marge + 14, y - 64 - i * 12, { taille: 9 }))
  y -= hauteurMontant

  // --- Détails ---------------------------------------------------------------
  y -= 28
  const lignes: [string, string][] = [
    ['Reçu de', `${d.membreNom}`],
    ['N° de membre', d.membreNumero],
    ['Objet', d.objet],
    ['Caisse', d.caisse],
    ['Mode de paiement', MODES[d.mode] ?? d.mode],
  ]
  if (d.encaissePar) lignes.push(['Encaissé par', d.encaissePar])

  const xValeur = marge + 110
  const largeurValeur = L - marge - xValeur
  for (const [libelle, valeur] of lignes) {
    texte(page, libelle, marge, y, { taille: 10, couleur: GRIS })
    const morceaux = couper(propre(valeur, gras), gras, 10, largeurValeur)
    morceaux.forEach((m, i) => texte(page, m, xValeur, y - i * 13, { taille: 10, police: gras }))
    y -= 13 * morceaux.length + 9
    page.drawLine({
      start: { x: marge, y: y + 4 },
      end: { x: L - marge, y: y + 4 },
      thickness: 0.4,
      color: rgb(0.85, 0.85, 0.85),
    })
    y -= 6
  }

  // --- Annulation ------------------------------------------------------------
  if (d.annule) {
    page.drawText('ANNULÉ', {
      x: 95,
      y: 230,
      size: 72,
      font: gras,
      color: ROUGE,
      opacity: 0.25,
      rotate: degrees(30),
    })
    y -= 8
    const motif = couper(propre(`Ce versement a été annulé. Motif : ${d.annule.motif}`, gras), gras, 10, L - 2 * marge)
    for (const m of motif) {
      texte(page, m, marge, y, { taille: 10, police: gras, couleur: ROUGE })
      y -= 13
    }
  } else {
    y -= 8
    texte(page, 'Merci pour votre contribution. Qu’Allah l’agrée.', marge, y, { taille: 10, couleur: VERT })
  }

  // --- Pied de page ----------------------------------------------------------
  page.drawLine({
    start: { x: marge, y: 52 },
    end: { x: L - marge, y: 52 },
    thickness: 0.6,
    color: OR,
  })
  texte(page, `Reçu établi le ${dateHeure.format(new Date(d.genereLe))}`, marge, 38, { taille: 8, couleur: GRIS })
  texte(page, 'Document généré par l’application du dahira', marge, 27, { taille: 8, couleur: GRIS })
  texte(page, d.numero, L - marge, 38, { taille: 8, couleur: GRIS, droite: true })

  return doc.save()
}