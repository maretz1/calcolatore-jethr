/**
 * Calcolo di un'imposta per scaglioni progressivi.
 *
 * È l'unica funzione di calcolo dell'imposta del progetto: la usano l'IRPEF,
 * l'addizionale regionale e l'addizionale comunale. Un'aliquota unica è
 * semplicemente il caso particolare "un solo scaglione senza limite superiore":
 * `[{ fino: null, aliquota: 0.8 }]`.
 *
 * Progressivo significa che ogni aliquota si applica solo alla parte di reddito
 * compresa nel suo scaglione, non all'intero reddito.
 *
 * @param {number} imponibile importo su cui calcolare l'imposta
 * @param {{fino: number|null, aliquota: number}[]} scaglioni in ordine crescente;
 *        `fino` è il limite superiore dello scaglione (`null` = nessun limite),
 *        `aliquota` è in punti percentuali (23 = 23%)
 * @returns {{totale: number, dettaglio: {da: number, a: number|null, aliquota: number, base: number, imposta: number}[]}}
 */
export function impostaProgressiva(imponibile, scaglioni) {
  if (!Array.isArray(scaglioni) || scaglioni.length === 0) {
    throw new Error('Scaglioni mancanti')
  }

  const dettaglio = []
  let totale = 0
  let limiteInferiore = 0

  for (const scaglione of scaglioni) {
    if (imponibile <= limiteInferiore) break

    const limiteSuperiore = scaglione.fino ?? Infinity
    const base = Math.min(imponibile, limiteSuperiore) - limiteInferiore
    const imposta = (base * scaglione.aliquota) / 100

    totale += imposta
    dettaglio.push({
      da: limiteInferiore,
      a: scaglione.fino,
      aliquota: scaglione.aliquota,
      base,
      imposta,
    })

    limiteInferiore = limiteSuperiore
  }

  return { totale, dettaglio }
}

/**
 * Aliquota media effettiva risultante dagli scaglioni, in punti percentuali.
 * Serve solo a rendere leggibile il risultato in UI (es. "1,93% medio").
 */
export function aliquotaMedia(imponibile, imposta) {
  if (imponibile <= 0) return 0
  return (imposta / imponibile) * 100
}
