import {
  DETRAZIONE_CONIUGE,
  DETRAZIONE_CUNEO,
  DETRAZIONE_FIGLI,
  DETRAZIONE_LAVORO_DIPENDENTE,
} from './costanti.js'

/**
 * Detrazione per redditi da lavoro dipendente (art. 13 TUIR).
 * Decresce al crescere del reddito e si azzera oltre i 50.000 €.
 *
 * Comprende la maggiorazione di 65 € dell'art. 13 comma 1.1 TUIR per i redditi
 * tra 25.000 e 35.000 €: piccola, ma è il tipo di dettaglio che fa divergere il
 * risultato da quello dei calcolatori pubblici proprio nella fascia più comune.
 *
 * Semplificazione: non è gestito il floor di 690 € previsto per i redditi molto
 * bassi a tempo indeterminato; nel range coperto dal prototipo non si attiva mai,
 * perché la formula resta ampiamente sopra quel valore fino a 50.000 €.
 */
export function detrazioneLavoroDipendente(imponibile) {
  const { fasciaBassa, fasciaMedia, fasciaAlta, maggiorazione } =
    DETRAZIONE_LAVORO_DIPENDENTE

  if (imponibile <= 0) return 0

  const bonus =
    imponibile > maggiorazione.da && imponibile <= maggiorazione.a
      ? maggiorazione.importo
      : 0

  if (imponibile <= fasciaBassa.limite) return fasciaBassa.importo

  if (imponibile <= fasciaMedia.limite) {
    return (
      fasciaMedia.base +
      (fasciaMedia.quota * (fasciaMedia.limite - imponibile)) / fasciaMedia.divisore +
      bonus
    )
  }

  if (imponibile <= fasciaAlta.limite) {
    return (
      (fasciaAlta.base * (fasciaAlta.limite - imponibile)) / fasciaAlta.divisore + bonus
    )
  }

  return 0
}

/**
 * Ulteriore detrazione "cuneo fiscale" (strutturale dal 2026).
 * 1.000 € pieni tra 20.000 e 32.000 €, poi decrescente fino ad azzerarsi a 40.000 €.
 */
export function detrazioneCuneoFiscale(imponibile) {
  const { sogliaMinima, sogliaPiena, sogliaMassima, importo } = DETRAZIONE_CUNEO

  if (imponibile <= sogliaMinima) return 0
  if (imponibile <= sogliaPiena) return importo
  if (imponibile <= sogliaMassima) {
    return (importo * (sogliaMassima - imponibile)) / (sogliaMassima - sogliaPiena)
  }
  return 0
}

/**
 * Detrazione per coniuge a carico (art. 12 TUIR).
 *
 * Nota sulla prima fascia: la formula corretta è `800 − 110 × (reddito / 15.000)`,
 * decrescente da 800 € a 690 €. La bozza di progetto riportava `800 + 110 × (15.000 −
 * reddito) / 15.000`, che crescerebbe da 800 a 910 € e creerebbe un salto rispetto
 * alla fascia successiva (fissa a 690 €). Con la formula corretta il raccordo è esatto:
 * a 15.000 € entrambe le fasce valgono 690 €.
 *
 * Semplificazione: si ignorano le maggiorazioni fisse (+10/+20/+30 €) previste per
 * alcune sotto-fasce tra 29.000 e 35.200 €.
 */
export function detrazioneConiuge(imponibile) {
  const { fasciaBassa, fasciaMedia, fasciaAlta } = DETRAZIONE_CONIUGE

  if (imponibile <= 0) return fasciaBassa.base
  if (imponibile <= fasciaBassa.limite) {
    return fasciaBassa.base - (fasciaBassa.quota * imponibile) / fasciaBassa.divisore
  }
  if (imponibile <= fasciaMedia.limite) return fasciaMedia.importo
  if (imponibile <= fasciaAlta.limite) {
    return (fasciaAlta.base * (fasciaAlta.limite - imponibile)) / fasciaAlta.divisore
  }
  return 0
}

/**
 * Detrazione per figli a carico di età 21-30 anni, moltiplicata per il numero di figli.
 *
 * Semplificazione: non è applicata la maggiorazione del limite di reddito prevista
 * quando i figli sono più di uno (95.000 € + 15.000 € per ciascun figlio oltre il primo).
 */
export function detrazioneFigli(imponibile, numeroFigli) {
  if (numeroFigli <= 0) return 0
  const { teorica, divisore } = DETRAZIONE_FIGLI
  if (imponibile > divisore) return 0

  const perFiglio = (teorica * (divisore - Math.max(0, imponibile))) / divisore
  return perFiglio * numeroFigli
}

/**
 * Tutte le detrazioni IRPEF applicabili, già pronte per la UI.
 *
 * @returns {{voci: {id: string, etichetta: string, importo: number}[], totale: number}}
 *          `voci` contiene solo le detrazioni effettivamente spettanti (importo > 0)
 */
export function calcolaDetrazioni({ imponibile, coniugeACarico, figliACarico }) {
  const candidate = [
    {
      id: 'lavoroDipendente',
      etichetta: 'Detrazione da lavoro dipendente',
      importo: detrazioneLavoroDipendente(imponibile),
    },
    {
      id: 'cuneoFiscale',
      etichetta: 'Ulteriore detrazione (cuneo fiscale)',
      importo: detrazioneCuneoFiscale(imponibile),
    },
    {
      id: 'coniuge',
      etichetta: 'Detrazione per coniuge a carico',
      importo: coniugeACarico ? detrazioneConiuge(imponibile) : 0,
    },
    {
      id: 'figli',
      etichetta:
        figliACarico === 1
          ? 'Detrazione per 1 figlio a carico (21-30 anni)'
          : `Detrazione per ${figliACarico} figli a carico (21-30 anni)`,
      importo: detrazioneFigli(imponibile, figliACarico),
    },
  ]

  const voci = candidate.filter((voce) => voce.importo > 0)
  const totale = voci.reduce((somma, voce) => somma + voce.importo, 0)

  return { voci, totale }
}
