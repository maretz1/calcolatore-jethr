/**
 * Formattazione e parsing dei numeri secondo le convenzioni italiane.
 *
 * L'arrotondamento vive solo qui: i moduli di src/calc/ lavorano sempre a piena
 * precisione, così le somme mostrate restano coerenti con quelle calcolate.
 */

/**
 * useGrouping: 'always' è voluto. Il CLDR italiano usa minimumGroupingDigits = 2,
 * quindi per default i numeri a quattro cifre non vengono raggruppati: in una
 * tabella di importi si leggerebbe "3216,50 €" accanto a "35.000,00 €", che sembra
 * un errore. In ambito finanziario il separatore si mette sempre.
 */
const EURO = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: 'always',
})

const PERCENTUALE = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const ALIQUOTA = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  useGrouping: 'always',
})

/** 25931.619 -> "25.931,62 €" */
export function formatEuro(valore) {
  return EURO.format(valore)
}

/** 25.9096 -> "25,91%" (il valore è già in punti percentuali) */
export function formatPercentuale(valore) {
  return `${PERCENTUALE.format(valore)}%`
}

/** 1.33 -> "1,33%"; 23 -> "23%" */
export function formatAliquota(valore) {
  return `${ALIQUOTA.format(valore)}%`
}

/** 15000 -> "15.000 €"; usato per le soglie, dove i decimali sono rumore */
export function formatSoglia(valore) {
  return `${ALIQUOTA.format(valore)} €`
}

/**
 * Legge un importo scritto a mano accettando le convenzioni italiane.
 *
 * "35000", "35.000", "35000,50", "35.000,50" e "€ 35.000" danno tutti lo stesso
 * numero. Il caso ambiguo è il punto isolato: in "35.000" è un separatore di
 * migliaia, in "35.5" è un decimale. Si trattano i punti come migliaia solo se
 * raggruppano cifre a tre a tre.
 *
 * @returns {number} NaN se la stringa non è un importo valido
 */
export function parseImporto(testo) {
  if (typeof testo !== 'string') return Number.NaN

  const pulito = testo.replace(/[€\s]/g, '')
  if (pulito === '') return Number.NaN

  const haVirgola = pulito.includes(',')
  const haPunto = pulito.includes('.')

  let normalizzato = pulito
  if (haVirgola && haPunto) {
    normalizzato = pulito.replace(/\./g, '').replace(',', '.')
  } else if (haVirgola) {
    normalizzato = pulito.replace(',', '.')
  } else if (haPunto && /^\d{1,3}(\.\d{3})+$/.test(pulito)) {
    normalizzato = pulito.replace(/\./g, '')
  }

  return /^\d+(\.\d+)?$/.test(normalizzato) ? Number(normalizzato) : Number.NaN
}
