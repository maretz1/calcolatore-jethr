import { describe, expect, it } from 'vitest'
import { contributiInps, imponibileFiscale } from './inps.js'

describe('contributiInps', () => {
  it('applica il 9,19% alla RAL', () => {
    // 35.000 x 9,19% = 3.216,50
    expect(contributiInps(35000)).toBeCloseTo(3216.5, 6)
  })

  it('resta proporzionale anche su RAL alte (nessun massimale contributivo)', () => {
    // Semplificazione dichiarata: niente minimale/massimale INPS.
    expect(contributiInps(200000)).toBeCloseTo(18380, 6)
  })

  it('restituisce zero su RAL zero', () => {
    expect(contributiInps(0)).toBe(0)
  })
})

describe('imponibileFiscale', () => {
  it('sottrae i contributi dalla RAL (sono oneri deducibili)', () => {
    // 35.000 - 3.216,50 = 31.783,50
    expect(imponibileFiscale(35000)).toBeCloseTo(31783.5, 6)
  })

  it('vale il 90,81% della RAL', () => {
    expect(imponibileFiscale(50000)).toBeCloseTo(45405, 6)
  })
})
