import { formatAliquota, formatEuro, formatSoglia } from '../format.js'
import { ALIQUOTA_INPS_LAVORATORE } from '../calc/costanti.js'

/** "23% su 28.000,00 €" — mostra su quale parte di reddito ha morso ogni aliquota. */
function etichettaScaglione(scaglione) {
  return `${formatAliquota(scaglione.aliquota)} su ${formatEuro(scaglione.base)}`
}

function Riga({ voce, importo, segno = '', tipo = '', dettaglio }) {
  return (
    <>
      <tr className={tipo}>
        <th scope="row">
          {segno && <span className="segno">{segno}</span>}
          {voce}
        </th>
        <td>{formatEuro(importo)}</td>
      </tr>
      {dettaglio?.map((riga) => (
        <tr className="riga-dettaglio" key={riga.chiave}>
          <th scope="row">{riga.voce}</th>
          <td>{formatEuro(riga.importo)}</td>
        </tr>
      ))}
    </>
  )
}

/**
 * Il percorso completo dalla RAL al netto, riga per riga.
 * Ogni valore arriva già calcolato da calcolaNetto(): qui non si fa aritmetica.
 */
function DettaglioTrattenute({ risultato }) {
  const {
    input,
    contributiInps,
    imponibileFiscale,
    irpefLorda,
    irpefScaglioni,
    detrazioni,
    detrazioniTotali,
    detrazioniNonGodute,
    irpefNetta,
    addizionaleRegionale,
    addizionaleComunale,
    totaleTrattenute,
    nettoAnnuo,
  } = risultato

  return (
    <section className="card dettaglio">
      <h2>Dettaglio delle trattenute</h2>

      <div className="tabella-scroll">
        <table className="tabella-dettaglio">
          <tbody>
            <Riga voce="RAL — Retribuzione Annua Lorda" importo={input.ral} tipo="riga-base" />
            <Riga
              voce={`Contributi INPS a tuo carico (${formatAliquota(ALIQUOTA_INPS_LAVORATORE)})`}
              importo={contributiInps}
              segno="−"
              tipo="riga-trattenuta"
            />
            <Riga
              voce="Imponibile fiscale"
              importo={imponibileFiscale}
              segno="="
              tipo="riga-subtotale"
            />

            <Riga
              voce="IRPEF lorda"
              importo={irpefLorda}
              dettaglio={irpefScaglioni.map((scaglione) => ({
                chiave: `irpef-${scaglione.aliquota}`,
                voce: etichettaScaglione(scaglione),
                importo: scaglione.imposta,
              }))}
            />
            <Riga
              voce="Detrazioni applicate"
              importo={detrazioniTotali}
              segno="−"
              dettaglio={detrazioni.map((voce) => ({
                chiave: voce.id,
                voce: voce.etichetta,
                importo: voce.importo,
              }))}
            />
            <Riga
              voce="IRPEF netta"
              importo={irpefNetta}
              segno="="
              tipo="riga-trattenuta riga-subtotale"
            />

            <Riga
              voce={`Addizionale regionale ${addizionaleRegionale.regione} (dato ${addizionaleRegionale.annoDato})`}
              importo={addizionaleRegionale.totale}
              segno="−"
              tipo="riga-trattenuta"
              dettaglio={addizionaleRegionale.dettaglio.map((scaglione) => ({
                chiave: `reg-${scaglione.aliquota}`,
                voce: etichettaScaglione(scaglione),
                importo: scaglione.imposta,
              }))}
            />
            <Riga
              voce={`Addizionale comunale ${addizionaleComunale.comune} (dato ${addizionaleComunale.annoDato})`}
              importo={addizionaleComunale.totale}
              segno="−"
              tipo="riga-trattenuta"
              dettaglio={addizionaleComunale.dettaglio.map((scaglione) => ({
                chiave: `com-${scaglione.aliquota}`,
                voce: etichettaScaglione(scaglione),
                importo: scaglione.imposta,
              }))}
            />

            <Riga voce="Totale trattenute" importo={totaleTrattenute} tipo="riga-totale" />
            <Riga voce="Netto annuo" importo={nettoAnnuo} segno="=" tipo="riga-netto" />
          </tbody>
        </table>
      </div>

      {addizionaleComunale.esente && (
        <p className="nota">
          Addizionale comunale azzerata: l&apos;imponibile è sotto la soglia di esenzione di{' '}
          {formatSoglia(addizionaleComunale.sogliaEsenzione)} prevista dal Comune di{' '}
          {addizionaleComunale.comune}. È una soglia, non una franchigia: superata anche di
          poco, l&apos;aliquota si applica sull&apos;intero imponibile.
        </p>
      )}

      {detrazioniNonGodute > 0 && (
        <p className="nota">
          {formatEuro(detrazioniNonGodute)} di detrazioni non vengono utilizzate: superano
          l&apos;IRPEF dovuta e non si trasformano in un credito (incapienza).
        </p>
      )}
    </section>
  )
}

export default DettaglioTrattenute
