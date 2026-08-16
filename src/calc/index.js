import { getComune, getRegione } from '../data/index.js'
import { addizionaleComunale, addizionaleRegionale } from './addizionali.js'
import { MENSILITA_AMMESSE, MENSILITA_DEFAULT } from './costanti.js'
import { calcolaDetrazioni } from './detrazioni.js'
import { contributiInps, imponibileFiscale } from './inps.js'
import { irpefLorda, irpefNetta } from './irpef.js'

/**
 * Orchestratore: da RAL a netto, passo per passo.
 *
 * Restituisce tutte le grandezze intermedie, non solo il risultato finale: la UI
 * deve poter mostrare il dettaglio delle trattenute senza rifare alcun conto.
 *
 * Convenzione: qui non si arrotonda mai. L'arrotondamento è una scelta di
 * presentazione e vive nel formatter della UI, così le somme restano coerenti.
 *
 * @param {object} input
 * @param {number} input.ral Retribuzione Annua Lorda in euro
 * @param {number} [input.mensilita=13] 12, 13 o 14
 * @param {boolean} [input.coniugeACarico=false]
 * @param {number} [input.figliACarico=0] figli a carico di 21-30 anni
 * @param {string} [input.codiceRegione] default: Emilia-Romagna (src/data)
 * @param {string} [input.codiceComune] default: Bologna (src/data)
 */
export function calcolaNetto({
  ral,
  mensilita = MENSILITA_DEFAULT,
  coniugeACarico = false,
  figliACarico = 0,
  codiceRegione,
  codiceComune,
}) {
  if (!Number.isFinite(ral) || ral < 0) {
    throw new Error('RAL non valida: deve essere un numero maggiore o uguale a zero')
  }
  if (!MENSILITA_AMMESSE.includes(mensilita)) {
    throw new Error(`Mensilità non valide: ammesse ${MENSILITA_AMMESSE.join(', ')}`)
  }
  if (!Number.isInteger(figliACarico) || figliACarico < 0) {
    throw new Error('Numero di figli a carico non valido: deve essere un intero >= 0')
  }

  const regione = getRegione(codiceRegione)
  const comune = getComune(codiceComune)

  const inps = contributiInps(ral)
  const imponibile = imponibileFiscale(ral)

  const lorda = irpefLorda(imponibile)
  const detrazioni = calcolaDetrazioni({ imponibile, coniugeACarico, figliACarico })
  const irpef = irpefNetta(lorda.totale, detrazioni.totale)

  const regionale = addizionaleRegionale(imponibile, regione)
  const comunale = addizionaleComunale(imponibile, comune)

  const totaleTrattenute = inps + irpef + regionale.totale + comunale.totale
  const nettoAnnuo = ral - totaleTrattenute

  return {
    input: { ral, mensilita, coniugeACarico, figliACarico },
    residenza: { regione, comune },

    contributiInps: inps,
    imponibileFiscale: imponibile,

    irpefLorda: lorda.totale,
    irpefScaglioni: lorda.dettaglio,
    detrazioni: detrazioni.voci,
    detrazioniTotali: detrazioni.totale,
    irpefNetta: irpef,
    // Detrazioni non sfruttate perché superiori all'imposta dovuta (incapienza).
    detrazioniNonGodute: Math.max(0, detrazioni.totale - lorda.totale),

    addizionaleRegionale: regionale,
    addizionaleComunale: comunale,

    totaleTrattenute,
    nettoAnnuo,
    nettoMensile: nettoAnnuo / mensilita,
    pressione: ral > 0 ? (totaleTrattenute / ral) * 100 : 0,
  }
}
