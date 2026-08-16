import regioni from './regioni.json'
import comuni from './comuni.json'

/**
 * Residenza fiscale coperta dal prototipo.
 *
 * Il perimetro è volutamente ridotto a una sola coppia regione/comune, verificata
 * alla fonte ufficiale (Dipartimento delle Finanze). I dati restano però in file
 * esterni con struttura generica a scaglioni: aggiungere una regione o un comune
 * significa aggiungere una riga a regioni.json / comuni.json, senza toccare né la
 * logica di calcolo né i componenti.
 */
export const CODICE_REGIONE = '06' // Emilia-Romagna
export const CODICE_COMUNE = 'A944' // Bologna

export { regioni, comuni }

export function getRegione(codice = CODICE_REGIONE) {
  const regione = regioni.find((r) => r.codice === codice)
  if (!regione) throw new Error(`Regione non trovata: ${codice}`)
  return regione
}

export function getComune(codice = CODICE_COMUNE) {
  const comune = comuni.find((c) => c.codice === codice)
  if (!comune) throw new Error(`Comune non trovato: ${codice}`)
  return comune
}
