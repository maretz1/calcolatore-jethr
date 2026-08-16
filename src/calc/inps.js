import { ALIQUOTA_INPS_LAVORATORE } from './costanti.js'

/**
 * Contributi previdenziali INPS a carico del lavoratore.
 *
 * Semplificazione: aliquota piena sull'intera RAL, senza minimale né massimale
 * contributivo (il massimale riguarda i soli iscritti dal 1996 con redditi molto
 * alti; nel caso standard coperto dal prototipo non si attiva).
 */
export function contributiInps(ral) {
  return (ral * ALIQUOTA_INPS_LAVORATORE) / 100
}

/**
 * Imponibile fiscale = reddito complessivo ai fini IRPEF.
 * I contributi previdenziali obbligatori sono deducibili, quindi si sottraggono
 * dalla RAL prima di calcolare l'IRPEF e le addizionali.
 */
export function imponibileFiscale(ral) {
  return ral - contributiInps(ral)
}
