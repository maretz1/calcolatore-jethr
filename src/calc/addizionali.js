import { impostaProgressiva } from './scaglioni.js'

/**
 * Addizionale regionale IRPEF, calcolata sull'imponibile fiscale con la stessa
 * funzione a scaglioni dell'IRPEF.
 *
 * Semplificazione: si applicano solo le aliquote per scaglione. Eventuali
 * "disposizioni particolari" regionali (detrazioni per carichi di famiglia,
 * esenzioni per categorie specifiche) non sono modellate; per l'Emilia-Romagna
 * la scheda del Dipartimento delle Finanze non ne riporta comunque nessuna.
 *
 * @param {number} imponibile
 * @param {{nome: string, annoDato: number, scaglioni: object[]}} regione da src/data/regioni.json
 */
export function addizionaleRegionale(imponibile, regione) {
  const { totale, dettaglio } = impostaProgressiva(imponibile, regione.scaglioni)

  return {
    totale,
    dettaglio,
    regione: regione.nome,
    annoDato: regione.annoDato,
  }
}

/**
 * Addizionale comunale IRPEF.
 *
 * La soglia di esenzione è una soglia, non una franchigia: se l'imponibile la
 * supera anche di un euro, l'addizionale si paga sull'intero imponibile e non
 * solo sull'eccedenza. È il funzionamento previsto dalla delibera di Bologna
 * (e il motivo per cui intorno alla soglia il netto fa un piccolo scalino).
 *
 * @param {number} imponibile
 * @param {{nome: string, annoDato: number, esenzione: number|null, scaglioni: object[]}} comune da src/data/comuni.json
 */
export function addizionaleComunale(imponibile, comune) {
  const soglia = comune.esenzione ?? 0
  const esente = soglia > 0 && imponibile <= soglia

  if (esente) {
    return {
      totale: 0,
      dettaglio: [],
      comune: comune.nome,
      annoDato: comune.annoDato,
      esente: true,
      sogliaEsenzione: soglia,
    }
  }

  const { totale, dettaglio } = impostaProgressiva(imponibile, comune.scaglioni)

  return {
    totale,
    dettaglio,
    comune: comune.nome,
    annoDato: comune.annoDato,
    esente: false,
    sogliaEsenzione: soglia > 0 ? soglia : null,
  }
}
