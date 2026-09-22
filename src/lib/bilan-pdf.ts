import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'

/**
 * Bilan d'un événement au format PDF (A4, plusieurs pages si besoin).
 * Ce fichier ne fait que la mise en page : les textes et montants déjà
 * formatés arrivent tout prêts depuis la route.
 */

export type CarteBilan = { libelle: string; valeur: string; note?: string; accent?: boolean }

export type ColonneBilan = { titre: string; largeur: number; droite?: boolean }

export type TableauBilan = {
  titre: string
  sousTitre?: string
  colonnes: ColonneBilan[] // largeurs en proportions (elles sont ramenées à la page)
  lignes: string[][]
  total?: string[]
  vide?: string
}

export type DonneesBilan = {
  dahiraNom: string
  dahiraVille: string | null
  titre: string
  infos: string[] // lignes sous le titre
  cartes: CarteBilan[]
  remarques: string[]
  tableaux: TableauBilan[]
  signatures: string[]
  piedDePage: string
}

const VERT = rgb(0.043, 0.365, 0.18)
const OR = rgb(0.788, 0.635, 0.153)
const GRIS = rgb(0.42, 0.42, 0.42)
const GRIS_CLAIR = rgb(0.85, 0.85, 0.85)
const FOND = rgb(0.95, 0.97, 0.95)
const NOIR = rgb(0.1, 0.1, 0.1)

const LARGEUR = 595
const HAUTEUR = 842
const MARGE = 40
const BAS = 60 // on garde la place du pied de page

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

/** Raccourcit un texte avec « … » s'il dépasse la largeur. */
function tronquer(texte: string, police: PDFFont, taille: number, largeur: number): string {
  if (police.widthOfTextAtSize(texte, taille) <= largeur) return texte
  let t = texte
  while (t.length > 1 && police.widthOfTextAtSize(t + '…', taille) > largeur) t = t.slice(0, -1)
  return t.trimEnd() + '…'
}

export async function genererBilanPdf(d: DonneesBilan, logo: Uint8Array | null): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(d.titre)
  doc.setAuthor(d.dahiraNom)
  doc.setCreator(d.dahiraNom)

  const normal = await doc.embedFont(StandardFonts.Helvetica)
  const gras = await doc.embedFont(StandardFonts.HelveticaBold)

  let page: PDFPage = doc.addPage([LARGEUR, HAUTEUR])
  let y = HAUTEUR - MARGE

  const ecrire = (
    t: string,
    x: number,
    yy: number,
    o: { taille?: number; police?: PDFFont; couleur?: ReturnType<typeof rgb>; droite?: boolean; largeurMax?: number } = {}
  ) => {
    const police = o.police ?? normal
    const taille = o.taille ?? 10
    let s = propre(t, police)
    if (o.largeurMax) s = tronquer(s, police, taille, o.largeurMax)
    const px = o.droite ? x - police.widthOfTextAtSize(s, taille) : x
    page.drawText(s, { x: px, y: yy, size: taille, font: police, color: o.couleur ?? NOIR })
  }

  const nouvellePage = () => {
    page = doc.addPage([LARGEUR, HAUTEUR])
    y = HAUTEUR - MARGE
  }
  /** Passe à la page suivante s'il reste moins de `h` points. */
  const place = (h: number) => {
    if (y - h < BAS) {
      nouvellePage()
      return true
    }
    return false
  }

  // --- En-tête -----------------------------------------------------------------
  page.drawRectangle({ x: 0, y: HAUTEUR - 6, width: LARGEUR, height: 6, color: VERT })
  page.drawRectangle({ x: 0, y: HAUTEUR - 9, width: LARGEUR, height: 3, color: OR })

  let xNom = MARGE
  if (logo) {
    try {
      const image = await doc.embedPng(logo)
      page.drawImage(image, { x: MARGE, y: y - 56, width: 60, height: 60 })
      xNom = MARGE + 74
    } catch {
      // sans logo
    }
  }
  ecrire(d.dahiraNom, xNom, y - 22, { taille: 16, police: gras, couleur: VERT })
  if (d.dahiraVille) ecrire(d.dahiraVille, xNom, y - 38, { taille: 9, couleur: GRIS })
  y -= 90

  ecrire(d.titre, MARGE, y, { taille: 17, police: gras, largeurMax: LARGEUR - 2 * MARGE })
  y -= 18
  for (const info of d.infos) {
    ecrire(info, MARGE, y, { taille: 10, couleur: GRIS, largeurMax: LARGEUR - 2 * MARGE })
    y -= 14
  }

  // --- Cartes de synthèse ------------------------------------------------------
  y -= 10
  const parLigne = 3
  const ecart = 10
  const largeurCarte = (LARGEUR - 2 * MARGE - ecart * (parLigne - 1)) / parLigne
  const hauteurCarte = 58
  d.cartes.forEach((c, i) => {
    const col = i % parLigne
    if (col === 0 && i > 0) y -= hauteurCarte + ecart
    const x = MARGE + col * (largeurCarte + ecart)
    page.drawRectangle({
      x,
      y: y - hauteurCarte,
      width: largeurCarte,
      height: hauteurCarte,
      color: c.accent ? FOND : rgb(1, 1, 1),
      borderColor: c.accent ? VERT : GRIS_CLAIR,
      borderWidth: c.accent ? 1.2 : 0.8,
    })
    ecrire(c.libelle, x + 10, y - 16, { taille: 8.5, couleur: GRIS, largeurMax: largeurCarte - 20 })
    ecrire(c.valeur, x + 10, y - 36, {
      taille: 15,
      police: gras,
      couleur: c.accent ? VERT : NOIR,
      largeurMax: largeurCarte - 20,
    })
    if (c.note) ecrire(c.note, x + 10, y - 50, { taille: 7.5, couleur: GRIS, largeurMax: largeurCarte - 20 })
  })
  if (d.cartes.length > 0) y -= hauteurCarte + 16

  for (const r of d.remarques) {
    ecrire(r, MARGE, y, { taille: 10, largeurMax: LARGEUR - 2 * MARGE })
    y -= 14
  }

  // --- Tableaux ----------------------------------------------------------------
  const largeurUtile = LARGEUR - 2 * MARGE
  const hLigne = 17

  for (const t of d.tableaux) {
    y -= 14
    place(60)
    ecrire(t.titre, MARGE, y, { taille: 12.5, police: gras, couleur: VERT })
    y -= 14
    if (t.sousTitre) {
      ecrire(t.sousTitre, MARGE, y, { taille: 9, couleur: GRIS, largeurMax: largeurUtile })
      y -= 13
    }

    const somme = t.colonnes.reduce((s, c) => s + c.largeur, 0)
    const largeurs = t.colonnes.map((c) => (c.largeur / somme) * largeurUtile)

    const ligne = (cellules: string[], o: { entete?: boolean; fond?: boolean; grasse?: boolean }) => {
      if (o.fond) {
        page.drawRectangle({ x: MARGE, y: y - 5, width: largeurUtile, height: hLigne, color: o.entete ? VERT : FOND })
      }
      let x = MARGE
      cellules.forEach((cel, i) => {
        const col = t.colonnes[i]
        const w = largeurs[i]
        const police = o.entete || o.grasse ? gras : normal
        ecrire(cel, col.droite ? x + w - 5 : x + 5, y, {
          taille: 9,
          police,
          couleur: o.entete ? rgb(1, 1, 1) : NOIR,
          droite: col.droite,
          largeurMax: w - 10,
        })
        x += w
      })
      y -= hLigne
    }

    const entete = () => ligne(t.colonnes.map((c) => c.titre), { entete: true, fond: true })

    y -= 4
    entete()
    if (t.lignes.length === 0) {
      ecrire(t.vide ?? 'Aucune ligne.', MARGE + 5, y, { taille: 9, couleur: GRIS })
      y -= hLigne
    }
    t.lignes.forEach((cellules, i) => {
      if (place(hLigne)) {
        y -= 4
        entete()
      }
      ligne(cellules, { fond: i % 2 === 1 })
    })
    if (t.total) {
      if (place(hLigne + 4)) entete()
      page.drawLine({ start: { x: MARGE, y: y + hLigne - 4 }, end: { x: MARGE + largeurUtile, y: y + hLigne - 4 }, thickness: 0.8, color: VERT })
      ligne(t.total, { grasse: true })
    }
  }

  // --- Signatures --------------------------------------------------------------
  if (d.signatures.length > 0) {
    y -= 24
    place(80)
    const larg = largeurUtile / d.signatures.length
    d.signatures.forEach((s, i) => {
      const x = MARGE + i * larg
      ecrire(s, x, y, { taille: 10, police: gras })
      page.drawLine({ start: { x, y: y - 50 }, end: { x: x + larg - 20, y: y - 50 }, thickness: 0.5, color: GRIS })
    })
    y -= 60
  }

  // --- Pied de page sur chaque page --------------------------------------------
  const pages = doc.getPages()
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: MARGE, y: 40 }, end: { x: LARGEUR - MARGE, y: 40 }, thickness: 0.6, color: OR })
    const pied = propre(d.piedDePage, normal)
    p.drawText(tronquer(pied, normal, 8, 420), { x: MARGE, y: 27, size: 8, font: normal, color: GRIS })
    const num = `Page ${i + 1} / ${pages.length}`
    p.drawText(num, {
      x: LARGEUR - MARGE - normal.widthOfTextAtSize(num, 8),
      y: 27,
      size: 8,
      font: normal,
      color: GRIS,
    })
  })

  return doc.save()
}