/**
 * Tutti i parametri fiscali/contributivi 2026 in un unico posto.
 *
 * Ogni valore porta la sua fonte: se una legge cambia, si tocca solo questo file.
 * Le aliquote sono espresse in punti percentuali (23 = 23%).
 * Verifica delle fonti: 16/08/2026.
 */

/**
 * Aliquota IVS a carico del lavoratore dipendente privato (gestione generale INPS).
 * Il 33% complessivo si divide in 23,81% datore + 9,19% lavoratore.
 * Fonte: https://www.money.it/contributo-ivs-busta-paga-significato-quanti-soldi-toglie-netto
 */
export const ALIQUOTA_INPS_LAVORATORE = 9.19

/**
 * Scaglioni IRPEF 2026 (L. 199/2025 — Legge di Bilancio 2026): la riduzione a tre
 * scaglioni è strutturale e il secondo scaglione scende dal 35% al 33%.
 * Fonte: https://www.agenziaentrate.gov.it/portale/imposta-sul-reddito-delle-persone-fisiche-irpef-/aliquote-e-calcolo-dell-irpef
 */
export const SCAGLIONI_IRPEF = [
  { fino: 28000, aliquota: 23 },
  { fino: 50000, aliquota: 33 },
  { fino: null, aliquota: 43 },
]

/**
 * "No tax area": sotto questa soglia di reddito imponibile il dipendente non paga IRPEF.
 * Non è una norma a sé: discende dalla detrazione da lavoro dipendente, che fino a
 * 15.000 € vale 1.955 € ed è esattamente pari all'IRPEF lorda di 8.500 € (8.500 × 23%).
 * La teniamo esplicita perché rende leggibile il risultato, ma il calcolo tornerebbe
 * identico anche solo grazie al max(0, lorda − detrazioni) applicato in index.js.
 * Fonte: https://www.informazionefiscale.it/detrazioni-lavoro-dipendente-importo-calcolo
 */
export const NO_TAX_AREA = 8500

/**
 * Detrazione per redditi da lavoro dipendente (art. 13 TUIR), rapportata a 365/365 giorni.
 * Fonte: https://www.informazionefiscale.it/detrazioni-lavoro-dipendente-importo-calcolo
 */
export const DETRAZIONE_LAVORO_DIPENDENTE = {
  fasciaBassa: { limite: 15000, importo: 1955 },
  fasciaMedia: { limite: 28000, base: 1910, quota: 1190, divisore: 13000 },
  fasciaAlta: { limite: 50000, base: 1910, divisore: 22000 },
  /**
   * Art. 13 comma 1.1 TUIR: "La detrazione spettante ai sensi del comma 1 è aumentata
   * di un importo pari a 65 euro, se il reddito complessivo è superiore a 25.000 euro
   * ma non a 35.000 euro". Introdotta dalla L. 234/2021 e mai abrogata.
   *
   * Da non confondere con l'esonero contributivo IVS 6%/7% del 2024, che aveva soglie
   * simili (25k/35k) ma è stato abolito dal 2025, né con l'ulteriore detrazione "cuneo
   * fiscale" di 1.000 € (soglie 20k/32k/40k): sono tre misure distinte e questa si somma
   * alla seconda.
   *
   * Non ragguagliata al periodo di lavoro (circ. Agenzia delle Entrate n. 4/2022, §1.2.1).
   */
  maggiorazione: { da: 25000, a: 35000, importo: 65 },
}

/**
 * Ulteriore detrazione "cuneo fiscale", resa strutturale dalla Legge di Bilancio 2026.
 * Sostituisce l'esonero contributivo transitorio 2024 (che usava soglie 25k/35k).
 * Fonte: https://stipendionettocalcolatore.it/cuneo-fiscale-2026/
 */
export const DETRAZIONE_CUNEO = {
  sogliaMinima: 20000,
  sogliaPiena: 32000,
  sogliaMassima: 40000,
  importo: 1000,
}

/**
 * Detrazione per coniuge a carico (art. 12 TUIR).
 * Fonte: https://fiscoinvestimenti.it/coniuge-a-carico-detrazione-documenti-redditi/
 */
export const DETRAZIONE_CONIUGE = {
  fasciaBassa: { limite: 15000, base: 800, quota: 110, divisore: 15000 },
  fasciaMedia: { limite: 40000, importo: 690 },
  fasciaAlta: { limite: 80000, base: 690, divisore: 40000 },
}

/**
 * Detrazione per ogni figlio a carico di età 21-30 anni (art. 12 TUIR).
 * Sotto i 21 anni non spetta detrazione IRPEF: dal 2022 quei figli sono coperti
 * dall'Assegno Unico Universale, che è un'erogazione INPS e non una trattenuta.
 * Fonte: https://fiscomania.com/detrazione-figli-a-carico-come-cambiano/
 */
export const DETRAZIONE_FIGLI = {
  teorica: 950,
  divisore: 95000,
}

/** Mensilità ammesse dal selettore; 13 è la più diffusa nei CCNL italiani. */
export const MENSILITA_AMMESSE = [12, 13, 14]
export const MENSILITA_DEFAULT = 13
