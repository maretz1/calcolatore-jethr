import { useState } from 'react'
import { MENSILITA_AMMESSE, MENSILITA_DEFAULT } from '../calc/costanti.js'
import { parseImporto } from '../format.js'

/**
 * Form di input. Tiene i campi come stringhe (è quello che l'utente digita) e
 * li converte in numeri solo al momento del calcolo, riportando gli errori
 * accanto al campo che li ha generati.
 */
function FormCalcolo({ onCalcola }) {
  const [ral, setRal] = useState('35.000')
  const [mensilita, setMensilita] = useState(MENSILITA_DEFAULT)
  const [coniugeACarico, setConiugeACarico] = useState(false)
  const [figliACarico, setFigliACarico] = useState('0')
  const [errori, setErrori] = useState({})

  function handleSubmit(evento) {
    evento.preventDefault()

    const ralNumero = parseImporto(ral)
    const figliNumero = Number(figliACarico)
    const nuoviErrori = {}

    if (Number.isNaN(ralNumero)) {
      nuoviErrori.ral = 'Inserisci un importo, per esempio 35.000'
    } else if (ralNumero <= 0) {
      nuoviErrori.ral = 'La RAL deve essere maggiore di zero'
    }

    if (!Number.isInteger(figliNumero) || figliNumero < 0) {
      nuoviErrori.figli = 'Inserisci un numero intero maggiore o uguale a zero'
    }

    setErrori(nuoviErrori)
    if (Object.keys(nuoviErrori).length > 0) return

    onCalcola({
      ral: ralNumero,
      mensilita,
      coniugeACarico,
      figliACarico: figliNumero,
    })
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>I tuoi dati</h2>

      <div className="campi">
        <div className="campo">
          <label htmlFor="ral">RAL — Retribuzione Annua Lorda</label>
          <div className="input-euro">
            <input
              id="ral"
              name="ral"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={ral}
              onChange={(e) => setRal(e.target.value)}
              aria-invalid={Boolean(errori.ral)}
              aria-describedby={errori.ral ? 'errore-ral' : undefined}
            />
            <span aria-hidden="true">€</span>
          </div>
          {errori.ral && (
            <p className="errore" id="errore-ral" role="alert">
              {errori.ral}
            </p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="mensilita">Numero di mensilità</label>
          <select
            id="mensilita"
            name="mensilita"
            value={mensilita}
            onChange={(e) => setMensilita(Number(e.target.value))}
          >
            {MENSILITA_AMMESSE.map((valore) => (
              <option key={valore} value={valore}>
                {valore} mensilità
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="figli">Figli a carico di 21-30 anni</label>
          <input
            id="figli"
            name="figli"
            type="number"
            min="0"
            step="1"
            value={figliACarico}
            onChange={(e) => setFigliACarico(e.target.value)}
            aria-invalid={Boolean(errori.figli)}
            aria-describedby={errori.figli ? 'errore-figli' : 'nota-figli'}
          />
          {errori.figli ? (
            <p className="errore" id="errore-figli" role="alert">
              {errori.figli}
            </p>
          ) : (
            <p className="nota" id="nota-figli">
              È a carico se ha un reddito proprio non superiore a 4.000 € (fino a 24 anni)
              o 2.840,51 € (dai 25).
            </p>
          )}
        </div>

        <div className="campo campo-checkbox">
          <input
            id="coniuge"
            name="coniuge"
            type="checkbox"
            checked={coniugeACarico}
            onChange={(e) => setConiugeACarico(e.target.checked)}
          />
          <label htmlFor="coniuge">Coniuge a carico</label>
        </div>
      </div>

      <button type="submit" className="bottone-principale">
        Calcola
      </button>
    </form>
  )
}

export default FormCalcolo
