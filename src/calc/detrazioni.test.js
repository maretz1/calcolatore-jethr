import { describe, expect, it } from 'vitest'
import {
  calcolaDetrazioni,
  detrazioneConiuge,
  detrazioneCuneoFiscale,
  detrazioneFigli,
  detrazioneLavoroDipendente,
} from './detrazioni.js'

describe('detrazioneLavoroDipendente', () => {
  it('vale 1.955 € fisso fino a 15.000 €', () => {
    expect(detrazioneLavoroDipendente(10000)).toBeCloseTo(1955, 6)
    expect(detrazioneLavoroDipendente(15000)).toBeCloseTo(1955, 6)
  })

  it('passa alla formula della seconda fascia sopra 15.000 €', () => {
    // 1.910 + 1.190 x (28.000 - 15.000,01) / 13.000 = 1.910 + 1.189,999...
    // Discontinuità voluta dal legislatore (art. 13 TUIR): appena sopra i 15.000 €
    // la detrazione salta da 1.955 a circa 3.100 €. Il test la fissa perché non
    // venga "corretta" per errore.
    expect(detrazioneLavoroDipendente(15000.01)).toBeCloseTo(3099.999, 3)
  })

  it('decresce nella fascia 15.000 - 28.000 €', () => {
    // 1.910 + 1.190 x (28.000 - 22.702,50) / 13.000 = 1.910 + 484,925
    // (sotto i 25.000 non spetta la maggiorazione di 65 €)
    expect(detrazioneLavoroDipendente(22702.5)).toBeCloseTo(2394.925, 6)
    // a 28.000 la formula si riduce al termine fisso, più i 65 € di maggiorazione
    expect(detrazioneLavoroDipendente(28000)).toBeCloseTo(1975, 6)
  })

  it('decresce linearmente fino ad azzerarsi a 50.000 €', () => {
    // 1.910 x (50.000 - 31.783,50) / 22.000 = 1.581,5234, più 65 € di maggiorazione
    expect(detrazioneLavoroDipendente(31783.5)).toBeCloseTo(1646.5234, 4)
    expect(detrazioneLavoroDipendente(50000)).toBeCloseTo(0, 6)
  })

  it('è zero oltre i 50.000 €', () => {
    expect(detrazioneLavoroDipendente(60000)).toBe(0)
  })

  it('aggiunge i 65 € dell\'art. 13 c. 1.1 TUIR solo tra 25.000 e 35.000 €', () => {
    // Confronto a cavallo di ciascuna soglia: la differenza deve essere esattamente 65 €.
    expect(detrazioneLavoroDipendente(25000.01) - detrazioneLavoroDipendente(25000))
      .toBeCloseTo(65, 2)
    expect(detrazioneLavoroDipendente(35000) - detrazioneLavoroDipendente(35000.01))
      .toBeCloseTo(65, 2)
    // fuori fascia non si applica
    expect(detrazioneLavoroDipendente(20000)).toBeCloseTo(2642.3077, 4)
  })
})

describe('detrazioneCuneoFiscale', () => {
  it('non spetta fino a 20.000 € inclusi', () => {
    expect(detrazioneCuneoFiscale(20000)).toBe(0)
    expect(detrazioneCuneoFiscale(18000)).toBe(0)
  })

  it('vale 1.000 € pieni tra 20.000 e 32.000 €', () => {
    expect(detrazioneCuneoFiscale(20000.01)).toBeCloseTo(1000, 6)
    expect(detrazioneCuneoFiscale(25000)).toBeCloseTo(1000, 6)
    expect(detrazioneCuneoFiscale(32000)).toBeCloseTo(1000, 6)
  })

  it('decresce linearmente tra 32.000 e 40.000 €', () => {
    // 1.000 x (40.000 - 36.000) / 8.000 = 500
    expect(detrazioneCuneoFiscale(36000)).toBeCloseTo(500, 6)
    expect(detrazioneCuneoFiscale(40000)).toBeCloseTo(0, 6)
  })

  it('è zero oltre i 40.000 €', () => {
    expect(detrazioneCuneoFiscale(45000)).toBe(0)
  })
})

describe('detrazioneConiuge', () => {
  it('decresce da 800 a 690 € nella prima fascia', () => {
    expect(detrazioneConiuge(0)).toBeCloseTo(800, 6)
    // 800 - 110 x (7.500 / 15.000) = 800 - 55
    expect(detrazioneConiuge(7500)).toBeCloseTo(745, 6)
  })

  it('si raccorda senza salti con la fascia fissa a 690 €', () => {
    // È la verifica che la formula corretta sia 800 - 110 x (reddito/15.000):
    // a 15.000 € deve valere esattamente 690, come la fascia successiva.
    expect(detrazioneConiuge(15000)).toBeCloseTo(690, 6)
    expect(detrazioneConiuge(15000.01)).toBeCloseTo(690, 6)
  })

  it('resta fissa a 690 € fino a 40.000 €', () => {
    expect(detrazioneConiuge(31783.5)).toBeCloseTo(690, 6)
    expect(detrazioneConiuge(40000)).toBeCloseTo(690, 6)
  })

  it('decresce linearmente fino ad azzerarsi a 80.000 €', () => {
    // 690 x (80.000 - 60.000) / 40.000 = 345
    expect(detrazioneConiuge(60000)).toBeCloseTo(345, 6)
    expect(detrazioneConiuge(80000)).toBeCloseTo(0, 6)
  })

  it('è zero oltre gli 80.000 €', () => {
    expect(detrazioneConiuge(90000)).toBe(0)
  })
})

describe('detrazioneFigli', () => {
  it('è zero senza figli a carico', () => {
    expect(detrazioneFigli(31783.5, 0)).toBe(0)
  })

  it('vale 950 x (95.000 - reddito) / 95.000 per figlio', () => {
    // 950 x (95.000 - 31.783,50) / 95.000 = 950 x 0,66543...
    expect(detrazioneFigli(31783.5, 1)).toBeCloseTo(632.165, 3)
  })

  it('si moltiplica per il numero di figli', () => {
    const uno = detrazioneFigli(31783.5, 1)
    expect(detrazioneFigli(31783.5, 3)).toBeCloseTo(uno * 3, 6)
  })

  it('si azzera a 95.000 € di reddito', () => {
    expect(detrazioneFigli(95000, 2)).toBeCloseTo(0, 6)
    expect(detrazioneFigli(100000, 2)).toBe(0)
  })
})

describe('calcolaDetrazioni', () => {
  it('somma solo le detrazioni effettivamente spettanti', () => {
    const { voci, totale } = calcolaDetrazioni({
      imponibile: 31783.5,
      coniugeACarico: false,
      figliACarico: 0,
    })
    // lavoro dipendente 1.581,52 + 65 + cuneo 1.000; coniuge e figli non spettano
    expect(voci.map((voce) => voce.id)).toEqual(['lavoroDipendente', 'cuneoFiscale'])
    expect(totale).toBeCloseTo(2646.5234, 4)
  })

  it('include coniuge e figli quando presenti', () => {
    const { voci, totale } = calcolaDetrazioni({
      imponibile: 31783.5,
      coniugeACarico: true,
      figliACarico: 2,
    })
    expect(voci.map((voce) => voce.id)).toEqual([
      'lavoroDipendente',
      'cuneoFiscale',
      'coniuge',
      'figli',
    ])
    // 1.646,5234 + 1.000 + 690 + 1.264,33 (= 2 x 632,165)
    expect(totale).toBeCloseTo(4600.8534, 4)
  })

  it('etichetta i figli al singolare quando è uno solo', () => {
    const { voci } = calcolaDetrazioni({
      imponibile: 31783.5,
      coniugeACarico: false,
      figliACarico: 1,
    })
    const figli = voci.find((voce) => voce.id === 'figli')
    expect(figli.etichetta).toContain('1 figlio')
  })

  it('non restituisce voci a importo zero', () => {
    const { voci } = calcolaDetrazioni({
      imponibile: 60000,
      coniugeACarico: false,
      figliACarico: 0,
    })
    // oltre 50.000 non spetta né lavoro dipendente né cuneo
    expect(voci).toEqual([])
  })
})
