import { describe, expect, it } from 'vitest'
import { getComune, getRegione } from '../data/index.js'
import { addizionaleComunale, addizionaleRegionale } from './addizionali.js'

const emiliaRomagna = getRegione()
const bologna = getComune()

describe('dati di residenza', () => {
  it('usa Emilia-Romagna e Bologna come giurisdizioni di default', () => {
    expect(emiliaRomagna.nome).toBe('Emilia-Romagna')
    expect(bologna.nome).toBe('Bologna')
  })

  it('mantiene le aliquote verificate alla fonte MEF', () => {
    expect(emiliaRomagna.scaglioni.map((s) => s.aliquota)).toEqual([1.33, 1.93, 2.78, 3.33])
    expect(bologna.scaglioni).toEqual([{ fino: null, aliquota: 0.8 }])
    expect(bologna.esenzione).toBe(15000)
  })
})

describe('addizionaleRegionale (Emilia-Romagna)', () => {
  it('applica gli scaglioni progressivi regionali', () => {
    // 15.000 x 1,33% + 13.000 x 1,93% + 3.783,50 x 2,78%
    // = 199,50 + 250,90 + 105,1813
    const { totale } = addizionaleRegionale(31783.5, emiliaRomagna)
    expect(totale).toBeCloseTo(555.5813, 4)
  })

  it('non supera il primo scaglione sui redditi bassi', () => {
    // 13.621,50 x 1,33%
    const { totale } = addizionaleRegionale(13621.5, emiliaRomagna)
    expect(totale).toBeCloseTo(181.166, 3)
  })

  it('usa il 3,33% solo sulla parte oltre 50.000 €', () => {
    // 199,50 + 250,90 + 22.000 x 2,78% + 10.000 x 3,33% = 199,50 + 250,90 + 611,60 + 333
    const { totale } = addizionaleRegionale(60000, emiliaRomagna)
    expect(totale).toBeCloseTo(1395, 6)
  })

  it('riporta regione e anno del dato usato', () => {
    const risultato = addizionaleRegionale(31783.5, emiliaRomagna)
    expect(risultato.regione).toBe('Emilia-Romagna')
    expect(risultato.annoDato).toBe(2026)
  })
})

describe('addizionaleComunale (Bologna)', () => {
  it('è azzerata dalla soglia di esenzione fino a 15.000 €', () => {
    const risultato = addizionaleComunale(15000, bologna)
    expect(risultato.totale).toBe(0)
    expect(risultato.esente).toBe(true)
  })

  it('la soglia è una soglia, non una franchigia: superata, si paga su tutto', () => {
    // 15.000,01 x 0,80% = 120,00008 — non 0,80% sul solo centesimo eccedente
    const risultato = addizionaleComunale(15000.01, bologna)
    expect(risultato.totale).toBeCloseTo(120.00008, 5)
    expect(risultato.esente).toBe(false)
  })

  it('applica lo 0,80% sull\'intero imponibile', () => {
    // 31.783,50 x 0,80% = 254,268
    expect(addizionaleComunale(31783.5, bologna).totale).toBeCloseTo(254.268, 6)
  })

  it('riporta comune, anno del dato e soglia di esenzione', () => {
    const risultato = addizionaleComunale(31783.5, bologna)
    expect(risultato.comune).toBe('Bologna')
    expect(risultato.annoDato).toBe(2025)
    expect(risultato.sogliaEsenzione).toBe(15000)
  })
})
