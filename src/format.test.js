import { describe, expect, it } from 'vitest'
import { formatAliquota, formatEuro, formatPercentuale, parseImporto } from './format.js'

describe('parseImporto', () => {
  it('legge un numero semplice', () => {
    expect(parseImporto('35000')).toBe(35000)
  })

  it('legge il punto come separatore delle migliaia', () => {
    expect(parseImporto('35.000')).toBe(35000)
    expect(parseImporto('1.234.567')).toBe(1234567)
  })

  it('legge la virgola come separatore decimale', () => {
    expect(parseImporto('35000,50')).toBe(35000.5)
    expect(parseImporto('35.000,50')).toBe(35000.5)
  })

  it('tratta il punto come decimale quando non raggruppa a tre cifre', () => {
    // "35.5" non è un raggruppamento di migliaia valido: è un decimale
    expect(parseImporto('35.5')).toBe(35.5)
  })

  it('ignora simbolo di euro e spazi', () => {
    expect(parseImporto(' € 35.000,50 ')).toBe(35000.5)
  })

  it('restituisce NaN su input non validi', () => {
    for (const input of ['', '   ', 'abc', '35..000', '-100', '3,5,5', null, undefined, 42]) {
      expect(parseImporto(input)).toBeNaN()
    }
  })
})

describe('formattazione', () => {
  it('formatta gli euro con separatori italiani e due decimali', () => {
    // Intl usa lo spazio unificatore prima del simbolo: si normalizza per il confronto
    expect(formatEuro(25931.619).replace(/\s/g, ' ')).toBe('25.931,62 €')
  })

  it('raggruppa le migliaia anche nei numeri a quattro cifre', () => {
    // Il default italiano (minimumGroupingDigits = 2) darebbe "3216,50 €":
    // in una tabella di importi sembrerebbe un errore di formattazione.
    expect(formatEuro(3216.5).replace(/\s/g, ' ')).toBe('3.216,50 €')
  })

  it('formatta le percentuali con la virgola decimale', () => {
    expect(formatPercentuale(25.9096)).toBe('25,91%')
  })

  it('formatta le aliquote senza decimali inutili', () => {
    expect(formatAliquota(23)).toBe('23%')
    expect(formatAliquota(1.33)).toBe('1,33%')
    expect(formatAliquota(0.8)).toBe('0,8%')
  })
})
