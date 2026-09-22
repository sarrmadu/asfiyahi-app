/**
 * Écrit un nombre entier en toutes lettres, en français.
 * 24000 -> "vingt-quatre mille"
 * Utilisé sur les reçus : le montant en lettres évite les falsifications.
 */

const UNITES = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
  'dix-sept', 'dix-huit', 'dix-neuf',
]
const DIZAINES = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt']

/** 0 à 99. `final` : le nombre termine le montant (accord de « quatre-vingts »). */
function moinsDeCent(n: number, final: boolean): string {
  if (n < 20) return UNITES[n]
  const d = Math.floor(n / 10)
  let u = n % 10
  // 70-79 et 90-99 : soixante-dix, quatre-vingt-dix…
  if (d === 7 || d === 9) u += 10
  const base = DIZAINES[d]
  if (u === 0) return d === 8 && final ? 'quatre-vingts' : base
  if (u === 1 && d !== 8 && d !== 9) return `${base} et un`
  if (u === 11 && d === 7) return 'soixante et onze'
  return `${base}-${UNITES[u]}`
}

/** 0 à 999 */
function moinsDeMille(n: number, final: boolean): string {
  const c = Math.floor(n / 100)
  const reste = n % 100
  let texte = ''
  if (c === 1) texte = 'cent'
  else if (c > 1) texte = `${UNITES[c]} cent${reste === 0 && final ? 's' : ''}`
  if (reste > 0) texte = `${texte} ${moinsDeCent(reste, final)}`.trim()
  return texte
}

export function nombreEnLettres(nombre: number): string {
  const n = Math.floor(Math.abs(nombre))
  if (n === 0) return 'zéro'

  const milliards = Math.floor(n / 1_000_000_000)
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000)
  const milliers = Math.floor((n % 1_000_000) / 1000)
  const reste = n % 1000

  const parties: string[] = []
  if (milliards > 0) {
    parties.push(`${moinsDeMille(milliards, true)} milliard${milliards > 1 ? 's' : ''}`)
  }
  if (millions > 0) {
    parties.push(`${moinsDeMille(millions, true)} million${millions > 1 ? 's' : ''}`)
  }
  if (milliers > 0) {
    // « mille » est invariable et ne prend pas « un » devant
    parties.push(milliers === 1 ? 'mille' : `${moinsDeMille(milliers, false)} mille`)
  }
  if (reste > 0) parties.push(moinsDeMille(reste, true))

  return parties.join(' ')
}