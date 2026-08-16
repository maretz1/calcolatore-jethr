import { formatAliquota, formatSoglia } from '../format.js'

/**
 * La residenza fiscale non è un input: è un'assunzione dichiarata del prototipo.
 * Questo pannello la rende esplicita e mostra da dove arrivano i dati usati, anno
 * incluso — così chi legge il risultato sa esattamente cosa sta guardando.
 */
function Residenza({ regione, comune }) {
  const aliquoteRegionali = regione.scaglioni.map((s) => formatAliquota(s.aliquota)).join(' · ')

  return (
    <section className="card residenza">
      <h2>Residenza fiscale</h2>
      <p className="residenza-luogo">
        {comune.nome} ({comune.provincia}) — {regione.nome}
      </p>

      <dl className="residenza-dettagli">
        <div>
          <dt>Addizionale regionale {regione.nome}</dt>
          <dd>
            {aliquoteRegionali} a scaglioni · dato {regione.annoDato} ·{' '}
            <a href={regione.fonte} target="_blank" rel="noreferrer">
              fonte MEF
            </a>
          </dd>
        </div>
        <div>
          <dt>Addizionale comunale {comune.nome}</dt>
          <dd>
            {formatAliquota(comune.scaglioni[0].aliquota)} · esente fino a{' '}
            {formatSoglia(comune.esenzione)} · dato {comune.annoDato} ·{' '}
            <a href={comune.fonte} target="_blank" rel="noreferrer">
              fonte MEF
            </a>
          </dd>
        </div>
      </dl>

      <p className="nota">
        Il prototipo copre una sola residenza fiscale. {comune.notaAnno}
      </p>
    </section>
  )
}

export default Residenza
