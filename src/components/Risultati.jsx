import { formatEuro, formatPercentuale } from '../format.js'

/** Il risultato in evidenza: netto annuo e netto mensile. */
function Risultati({ risultato }) {
  const { nettoAnnuo, nettoMensile, input, totaleTrattenute, pressione } = risultato

  return (
    <section className="card risultati">
      <h2>Il tuo netto</h2>

      <div className="risultati-evidenza">
        <div className="risultato">
          <span className="risultato-etichetta">Netto annuo</span>
          <strong className="risultato-valore">{formatEuro(nettoAnnuo)}</strong>
        </div>
        <div className="risultato">
          <span className="risultato-etichetta">
            Netto mensile su {input.mensilita} mensilità
          </span>
          <strong className="risultato-valore">{formatEuro(nettoMensile)}</strong>
        </div>
      </div>

      <p className="risultati-sintesi">
        Su una RAL di {formatEuro(input.ral)} trattieni {formatEuro(totaleTrattenute)} tra
        contributi e imposte, pari al {formatPercentuale(pressione)} del lordo.
      </p>

      <p className="nota">
        Il netto mensile è una media: nella realtà la tredicesima (e la quattordicesima)
        vengono tassate nel mese in cui sono erogate, non spalmate sui ratei.
      </p>
    </section>
  )
}

export default Risultati
