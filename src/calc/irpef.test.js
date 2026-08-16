import { describe, expect, it } from 'vitest'
import { irpefLorda, irpefNetta } from './irpef.js'

describe('irpefLorda', () => {
  it('è zero fino alla no tax area di 8.500 €', () => {
    expect(irpefLorda(8500).totale).toBe(0)
    expect(irpefLorda(5000).totale).toBe(0)
    expect(irpefLorda(0).totale).toBe(0)
  })

  it('scatta appena superata la no tax area', () => {
    // 8.500,01 x 23% = 1.955,0023
    expect(irpefLorda(8500.01).totale).toBeCloseTo(1955.0023, 4)
  })

  it('applica il 23% fino a 28.000 €', () => {
    // 28.000 x 23% = 6.440
    expect(irpefLorda(28000).totale).toBeCloseTo(6440, 6)
  })

  it('applica il 33% sulla sola parte tra 28.000 e 50.000 €', () => {
    // 6.440 + 3.783,50 x 33% = 6.440 + 1.248,555
    expect(irpefLorda(31783.5).totale).toBeCloseTo(7688.555, 6)
  })

  it('applica il 43% sulla sola parte oltre 50.000 €', () => {
    // 28.000 x 23% + 22.000 x 33% + 10.000 x 43% = 6.440 + 7.260 + 4.300
    expect(irpefLorda(60000).totale).toBeCloseTo(18000, 6)
  })

  it('espone il dettaglio per scaglione', () => {
    const { dettaglio } = irpefLorda(60000)
    expect(dettaglio.map((riga) => riga.aliquota)).toEqual([23, 33, 43])
  })
})

describe('irpefNetta', () => {
  it('sottrae le detrazioni dall\'imposta lorda', () => {
    expect(irpefNetta(5000, 2000)).toBeCloseTo(3000, 6)
  })

  it('si ferma a zero: le detrazioni incapienti non generano un credito', () => {
    expect(irpefNetta(1000, 2500)).toBe(0)
  })
})
