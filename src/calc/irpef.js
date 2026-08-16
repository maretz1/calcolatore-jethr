import { NO_TAX_AREA, SCAGLIONI_IRPEF } from './costanti.js'
import { impostaProgressiva } from './scaglioni.js'

/**
 * IRPEF lorda: imposta a scaglioni progressivi sull'imponibile fiscale,
 * azzerata sotto la no tax area (v. commento in costanti.js sul perché).
 *
 * @returns {{totale: number, dettaglio: object[]}}
 */
export function irpefLorda(imponibile) {
  if (imponibile <= NO_TAX_AREA) {
    return { totale: 0, dettaglio: [] }
  }
  return impostaProgressiva(imponibile, SCAGLIONI_IRPEF)
}

/**
 * IRPEF netta: le detrazioni possono azzerare l'imposta ma non generare un credito
 * (l'eventuale eccedenza di detrazioni è "incapiente" e viene persa).
 */
export function irpefNetta(lorda, detrazioni) {
  return Math.max(0, lorda - detrazioni)
}
