import { useState } from 'react'
import './App.css'
import { calcolaNetto } from './calc/index.js'
import { getComune, getRegione } from './data/index.js'
import DettaglioTrattenute from './components/DettaglioTrattenute.jsx'
import FormCalcolo from './components/FormCalcolo.jsx'
import Residenza from './components/Residenza.jsx'
import Risultati from './components/Risultati.jsx'

const regione = getRegione()
const comune = getComune()

function App() {
  const [risultato, setRisultato] = useState(null)
  const [erroreCalcolo, setErroreCalcolo] = useState(null)

  function handleCalcola(input) {
    try {
      setRisultato(calcolaNetto(input))
      setErroreCalcolo(null)
    } catch (errore) {
      setRisultato(null)
      setErroreCalcolo(errore.message)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Calcolatore RAL → Netto</h1>
        <p>
          Dalla Retribuzione Annua Lorda al netto in busta paga, con il dettaglio di ogni
          trattenuta. Dati fiscali 2026.
        </p>
      </header>

      <FormCalcolo onCalcola={handleCalcola} />

      {erroreCalcolo && (
        <p className="card errore" role="alert">
          {erroreCalcolo}
        </p>
      )}

      {risultato && (
        <>
          <Risultati risultato={risultato} />
          <DettaglioTrattenute risultato={risultato} />
        </>
      )}

      <Residenza regione={regione} comune={comune} />
    </div>
  )
}

export default App
