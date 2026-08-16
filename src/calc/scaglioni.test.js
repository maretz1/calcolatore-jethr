import { describe, expect, it } from 'vitest'
import { aliquotaMedia, impostaProgressiva } from './scaglioni.js'

const SCAGLIONI_TEST = [
  { fino: 1000, aliquota: 10 },
  { fino: 2000, aliquota: 20 },
  { fino: null, aliquota: 30 },
]

describe('impostaProgressiva', () => {
  it('applica un\'aliquota unica su tutto l\'imponibile', () => {
    // È il caso delle addizionali comunali come Bologna: un solo scaglione senza limite.
    const { totale } = impostaProgressiva(10000, [{ fino: null, aliquota: 0.8 }])
    expect(totale).toBeCloseTo(80, 6)
  })

  it('tassa ogni scaglione solo per la parte di reddito che gli compete', () => {
    // 1000 x 10% + 1000 x 20% + 500 x 30% = 100 + 200 + 150
    const { totale } = impostaProgressiva(2500, SCAGLIONI_TEST)
    expect(totale).toBeCloseTo(450, 6)
  })

  it('non supera lo scaglione in cui cade l\'imponibile', () => {
    const { totale, dettaglio } = impostaProgressiva(1500, SCAGLIONI_TEST)
    // 1000 x 10% + 500 x 20% = 100 + 100
    expect(totale).toBeCloseTo(200, 6)
    expect(dettaglio).toHaveLength(2)
  })

  it('gestisce l\'imponibile esattamente sul confine di scaglione', () => {
    const { totale, dettaglio } = impostaProgressiva(1000, SCAGLIONI_TEST)
    expect(totale).toBeCloseTo(100, 6)
    // Nessuno scaglione superiore deve comparire nel dettaglio con base zero.
    expect(dettaglio).toHaveLength(1)
  })

  it('restituisce zero su imponibile nullo o negativo', () => {
    expect(impostaProgressiva(0, SCAGLIONI_TEST).totale).toBe(0)
    expect(impostaProgressiva(0, SCAGLIONI_TEST).dettaglio).toEqual([])
    expect(impostaProgressiva(-500, SCAGLIONI_TEST).totale).toBe(0)
  })

  it('espone un dettaglio le cui basi ricostruiscono l\'imponibile', () => {
    const imponibile = 2500
    const { dettaglio } = impostaProgressiva(imponibile, SCAGLIONI_TEST)
    const sommaBasi = dettaglio.reduce((somma, riga) => somma + riga.base, 0)
    expect(sommaBasi).toBeCloseTo(imponibile, 6)
  })

  it('espone un dettaglio le cui imposte ricostruiscono il totale', () => {
    const { totale, dettaglio } = impostaProgressiva(2500, SCAGLIONI_TEST)
    const somma = dettaglio.reduce((acc, riga) => acc + riga.imposta, 0)
    expect(somma).toBeCloseTo(totale, 6)
  })

  it('fallisce se gli scaglioni mancano', () => {
    expect(() => impostaProgressiva(1000, [])).toThrow(/Scaglioni mancanti/)
    expect(() => impostaProgressiva(1000, undefined)).toThrow(/Scaglioni mancanti/)
  })
})

describe('aliquotaMedia', () => {
  it('calcola l\'incidenza percentuale dell\'imposta sull\'imponibile', () => {
    expect(aliquotaMedia(2500, 450)).toBeCloseTo(18, 6)
  })

  it('evita la divisione per zero', () => {
    expect(aliquotaMedia(0, 0)).toBe(0)
  })
})
