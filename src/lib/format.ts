/**
 * Les montants sont stockés en CENTIMES (bigint) en base.
 * 1 000 F CFA = 100000. Aucun calcul monétaire ne doit utiliser de décimal.
 */

/** 150000 -> "1 500 F" */
export function formaterMontant(centimes: number | bigint | null | undefined): string {
  if (centimes === null || centimes === undefined) return '0 F'
  const francs = Number(centimes) / 100
  // Espace insécable fine avant le F pour éviter une coupure en fin de ligne
  return `${francs.toLocaleString('fr-FR').replace(/\u202F|\s/g, '\u00A0')}\u00A0F`
}

/** 150000 -> "1 500" (sans unité, pour les champs de saisie) */
export function montantEnFrancs(centimes: number | bigint | null | undefined): number {
  if (centimes === null || centimes === undefined) return 0
  return Number(centimes) / 100
}

/** "1500" ou 1500 -> 150000 centimes */
export function francsEnCentimes(francs: string | number): number {
  const n = typeof francs === 'string'
    ? parseFloat(francs.replace(/[^\d.,-]/g, '').replace(',', '.'))
    : francs
  if (isNaN(n)) return 0
  return Math.round(n * 100)
}

/**
 * Normalise un numéro sénégalais au format E.164.
 * Accepte : 77 123 45 67, 0771234567, +221771234567, 221771234567
 * Renvoie  : +221771234567, ou null si le format est invalide.
 */
export function normaliserTelephone(saisie: string): string | null {
  if (!saisie) return null
  let n = saisie.replace(/[\s.\-()]/g, '')

  if (n.startsWith('+221')) n = n.slice(4)
  else if (n.startsWith('221')) n = n.slice(3)
  else if (n.startsWith('00221')) n = n.slice(5)
  else if (n.startsWith('0')) n = n.slice(1)

  // Les mobiles sénégalais : 9 chiffres commençant par 7
  if (!/^7[05678]\d{7}$/.test(n)) return null
  return `+221${n}`
}

/** "+221771234567" -> "77 123 45 67" */
export function afficherTelephone(e164: string | null | undefined): string {
  if (!e164) return ''
  const n = e164.replace('+221', '')
  if (n.length !== 9) return e164
  return `${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 7)} ${n.slice(7)}`
}

/** Nom affiché : privilégie le surnom, souvent le seul nom d'usage réel. */
export function nomAffiche(m: {
  prenom: string
  nom: string
  surnom?: string | null
}): string {
  return m.surnom ? `${m.surnom} (${m.prenom} ${m.nom})` : `${m.prenom} ${m.nom}`
}
