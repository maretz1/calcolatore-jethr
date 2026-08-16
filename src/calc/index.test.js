import { describe, expect, it } from 'vitest'
import { calcolaNetto } from './index.js'

/**
 * Casi di sanity check (§7 del documento di progetto): RAL 25.000 / 35.000 / 50.000,
 * residenza Bologna (Emilia-Romagna), 13 mensilità, nessun carico di famiglia.
 *
 * I valori attesi sono calcolati a mano e riportati passo passo nei commenti, così
 * il test verifica davvero la formula e non si limita a fotografare l'output.
 */
describe('calcolaNetto - casi standard', () => {
  it('RAL 25.000 €', () => {
    // INPS         25.000 x 9,19%                          = 2.297,50
    // Imponibile   25.000 - 2.297,50                       = 22.702,50
    // IRPEF lorda  22.702,50 x 23%                         = 5.221,575
    // Detr. lav.   1.910 + 1.190 x (28.000-22.702,50)/13.000 = 2.394,925
    // Detr. cuneo  (20.000 < 22.702,50 <= 32.000)          = 1.000
    // IRPEF netta  5.221,575 - 3.394,925                   = 1.826,65
    // Add. reg.    199,50 + 7.702,50 x 1,93%               =   348,158
    // Add. com.    22.702,50 x 0,80%                       =   181,62
    const r = calcolaNetto({ ral: 25000, mensilita: 13 })

    expect(r.contributiInps).toBeCloseTo(2297.5, 4)
    expect(r.imponibileFiscale).toBeCloseTo(22702.5, 4)
    expect(r.irpefLorda).toBeCloseTo(5221.575, 4)
    expect(r.detrazioniTotali).toBeCloseTo(3394.925, 4)
    expect(r.irpefNetta).toBeCloseTo(1826.65, 4)
    expect(r.addizionaleRegionale.totale).toBeCloseTo(348.158, 3)
    expect(r.addizionaleComunale.totale).toBeCloseTo(181.62, 4)
    expect(r.nettoAnnuo).toBeCloseTo(20346.072, 3)
    expect(r.nettoMensile).toBeCloseTo(1565.082, 3)
    expect(r.pressione).toBeCloseTo(18.616, 3)
  })

  it('RAL 35.000 €', () => {
    // INPS         35.000 x 9,19%                          = 3.216,50
    // Imponibile                                           = 31.783,50
    // IRPEF lorda  6.440 + 3.783,50 x 33%                  = 7.688,555
    // Detr. lav.   1.910 x (50.000-31.783,50)/22.000 + 65  = 1.646,523
    // Detr. cuneo                                          = 1.000
    // IRPEF netta  7.688,555 - 2.646,523                   = 5.042,032
    // Add. reg.    199,50 + 250,90 + 3.783,50 x 2,78%      =   555,581
    // Add. com.    31.783,50 x 0,80%                       =   254,268
    const r = calcolaNetto({ ral: 35000, mensilita: 13 })

    expect(r.contributiInps).toBeCloseTo(3216.5, 4)
    expect(r.imponibileFiscale).toBeCloseTo(31783.5, 4)
    expect(r.irpefLorda).toBeCloseTo(7688.555, 4)
    expect(r.detrazioniTotali).toBeCloseTo(2646.5234, 4)
    expect(r.irpefNetta).toBeCloseTo(5042.0316, 4)
    expect(r.addizionaleRegionale.totale).toBeCloseTo(555.581, 3)
    expect(r.addizionaleComunale.totale).toBeCloseTo(254.268, 4)
    expect(r.nettoAnnuo).toBeCloseTo(25931.6191, 4)
    expect(r.nettoMensile).toBeCloseTo(1994.7399, 4)
  })

  it('RAL 50.000 €', () => {
    // INPS         50.000 x 9,19%                          = 4.595
    // Imponibile                                           = 45.405
    // IRPEF lorda  6.440 + 17.405 x 33%                    = 12.183,65
    // Detr. lav.   1.910 x (50.000-45.405)/22.000          =   398,9295
    // Detr. cuneo  (45.405 > 40.000)                       =        0
    // IRPEF netta  12.183,65 - 398,9295                    = 11.784,7205
    // Add. reg.    199,50 + 250,90 + 17.405 x 2,78%        =   934,259
    // Add. com.    45.405 x 0,80%                          =   363,24
    const r = calcolaNetto({ ral: 50000, mensilita: 13 })

    expect(r.irpefLorda).toBeCloseTo(12183.65, 4)
    expect(r.detrazioniTotali).toBeCloseTo(398.9295, 4)
    expect(r.irpefNetta).toBeCloseTo(11784.7205, 4)
    expect(r.addizionaleRegionale.totale).toBeCloseTo(934.259, 3)
    expect(r.addizionaleComunale.totale).toBeCloseTo(363.24, 4)
    expect(r.nettoAnnuo).toBeCloseTo(32322.7805, 4)
    expect(r.pressione).toBeCloseTo(35.3544, 4)
  })
})

describe('calcolaNetto - coerenza del risultato', () => {
  it('le trattenute di dettaglio ricostruiscono esattamente il netto', () => {
    for (const ral of [12000, 25000, 35000, 50000, 120000]) {
      const r = calcolaNetto({ ral })
      const somma =
        r.contributiInps +
        r.irpefNetta +
        r.addizionaleRegionale.totale +
        r.addizionaleComunale.totale

      expect(somma).toBeCloseTo(r.totaleTrattenute, 6)
      expect(r.nettoAnnuo).toBeCloseTo(ral - somma, 6)
    }
  })

  it('divide il netto annuo per le mensilità scelte', () => {
    const r = calcolaNetto({ ral: 35000, mensilita: 14 })
    expect(r.nettoMensile).toBeCloseTo(r.nettoAnnuo / 14, 6)
  })

  it('le mensilità cambiano il netto mensile ma non quello annuo', () => {
    const a = calcolaNetto({ ral: 35000, mensilita: 12 })
    const b = calcolaNetto({ ral: 35000, mensilita: 14 })
    expect(a.nettoAnnuo).toBeCloseTo(b.nettoAnnuo, 6)
    expect(a.nettoMensile).toBeGreaterThan(b.nettoMensile)
  })

  it('applica le detrazioni per carichi di famiglia', () => {
    const senza = calcolaNetto({ ral: 35000 })
    const con = calcolaNetto({ ral: 35000, coniugeACarico: true, figliACarico: 2 })
    // 690 (coniuge) + 2 x 632,165 (figli) = 1.954,33 di detrazioni in più,
    // che si traducono in altrettanta IRPEF in meno.
    expect(con.detrazioniTotali - senza.detrazioniTotali).toBeCloseTo(1954.33, 4)
    expect(senza.irpefNetta - con.irpefNetta).toBeCloseTo(1954.33, 4)
    expect(con.nettoAnnuo).toBeGreaterThan(senza.nettoAnnuo)
  })

  it('esenta l\'addizionale comunale sotto la soglia di Bologna', () => {
    // RAL 15.000 -> imponibile 13.621,50, sotto i 15.000 € di soglia
    const r = calcolaNetto({ ral: 15000 })
    expect(r.addizionaleComunale.totale).toBe(0)
    expect(r.addizionaleComunale.esente).toBe(true)
  })

  it('non produce IRPEF sotto la no tax area e segnala l\'incapienza', () => {
    // RAL 9.000 -> imponibile 8.172,90, sotto la no tax area di 8.500
    const r = calcolaNetto({ ral: 9000 })
    expect(r.irpefLorda).toBe(0)
    expect(r.irpefNetta).toBe(0)
    expect(r.detrazioniNonGodute).toBeCloseTo(1955, 6)
  })

  it('gestisce la RAL zero senza divisioni per zero', () => {
    const r = calcolaNetto({ ral: 0 })
    expect(r.nettoAnnuo).toBe(0)
    expect(r.pressione).toBe(0)
  })
})

describe('calcolaNetto - validazione input', () => {
  it('rifiuta una RAL non numerica o negativa', () => {
    expect(() => calcolaNetto({ ral: -1 })).toThrow(/RAL non valida/)
    expect(() => calcolaNetto({ ral: Number.NaN })).toThrow(/RAL non valida/)
    expect(() => calcolaNetto({})).toThrow(/RAL non valida/)
  })

  it('accetta solo 12, 13 o 14 mensilità', () => {
    expect(() => calcolaNetto({ ral: 35000, mensilita: 15 })).toThrow(/Mensilità non valide/)
    for (const mensilita of [12, 13, 14]) {
      expect(() => calcolaNetto({ ral: 35000, mensilita })).not.toThrow()
    }
  })

  it('rifiuta un numero di figli non intero o negativo', () => {
    expect(() => calcolaNetto({ ral: 35000, figliACarico: -1 })).toThrow(/figli/)
    expect(() => calcolaNetto({ ral: 35000, figliACarico: 1.5 })).toThrow(/figli/)
  })

  it('rifiuta una residenza non presente nei dati', () => {
    expect(() => calcolaNetto({ ral: 35000, codiceComune: 'Z999' })).toThrow(/Comune non trovato/)
    expect(() => calcolaNetto({ ral: 35000, codiceRegione: '99' })).toThrow(/Regione non trovata/)
  })
})
