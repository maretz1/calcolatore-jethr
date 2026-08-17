import { formatAliquota, formatSoglia } from '../format.js'

/**
 * La residenza fiscale non è un input: è un'assunzione dichiarata del prototipo.
 * Questo pannello la rende esplicita e mostra da dove arrivano i dati usati, anno
 * incluso — così chi legge il risultato sa esattamente cosa sta guardando.
 * Raccoglie anche le altre semplificazioni del prototipo, così chi legge il netto
 * ha in un unico posto tutto ciò che il calcolo dà per assunto.
 */
function Residenza({ regione, comune }) {
  const aliquoteRegionali = regione.scaglioni.map((s) => formatAliquota(s.aliquota)).join(' · ')

  return (
    <section className="card residenza">
      <h2>Assunzioni del prototipo</h2>
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

      <h3>Semplificazioni applicate</h3>
      <ul className="assunzioni-elenco">
        <li>Dipendente privato a tempo indeterminato, full time, 365 giorni l&apos;anno</li>
        <li>
          Nessuna agevolazione (impatriati, welfare, premi di risultato) né trattamento
          integrativo
        </li>
        <li>Unico percettore di reddito, nessun onere deducibile oltre ai carichi di famiglia</li>
        <li>Netto mensile come media annua: la tredicesima non è tassata separatamente</li>
        <li>
          Una sola residenza fiscale coperta ({comune.nome}, {regione.nome}), non selezionabile
        </li>
      </ul>

      <p className="nota">
        Assunzioni, semplificazioni e fonti complete sono elencate nel README del progetto.
      </p>
    </section>
  )
}

export default Residenza
