# Calcolatore RAL → Netto

Data una **RAL** (Retribuzione Annua Lorda), calcola il **netto annuo**, il **netto mensile** e il
**dettaglio di ogni trattenuta**: contributi INPS, IRPEF lorda e netta con tutte le detrazioni
applicate, addizionale regionale e addizionale comunale.

**→ [Prova il calcolatore](https://maretz1.github.io/calcolatore-jethr/)**

Dati fiscali **2026**. Applicazione interamente client-side: nessun backend, nessuna chiamata di rete
a runtime, nessun tool no-code — la logica di calcolo è scritta a mano, isolata e coperta da test.

---

## Come si lancia in locale

```bash
npm install
npm run dev      # server di sviluppo su http://localhost:5173
npm test         # 80 test sulla logica di calcolo
npm run build    # build statica in dist/
```

## Come si calcola il netto

```
Contributi INPS        = RAL × 9,19%
Imponibile fiscale     = RAL − Contributi INPS

IRPEF lorda            = imposta a scaglioni progressivi sull'imponibile (23% / 33% / 43%)
Detrazioni             = lavoro dipendente (+ maggiorazione 65 € tra 25k e 35k)
                       + ulteriore detrazione "cuneo fiscale"
                       + coniuge a carico, se presente
                       + figli a carico 21-30 anni, se presenti
IRPEF netta            = max(0, IRPEF lorda − Detrazioni)

Addizionale regionale  = imposta a scaglioni sull'imponibile (Emilia-Romagna)
Addizionale comunale   = 0 se imponibile ≤ soglia di esenzione, altrimenti imponibile × aliquota (Bologna)

Netto annuo            = RAL − Contributi INPS − IRPEF netta − Addizionale regionale − Addizionale comunale
Netto mensile          = Netto annuo / mensilità scelte (12, 13 o 14)
```

## Architettura

```
src/
├── calc/                 logica di calcolo: moduli JS puri, zero React
│   ├── costanti.js       tutti i parametri fiscali 2026, ognuno con la sua fonte
│   ├── scaglioni.js      impostaProgressiva() — l'unica funzione d'imposta del progetto
│   ├── inps.js           contributi e imponibile fiscale
│   ├── irpef.js          IRPEF lorda (con no tax area) e netta (con incapienza)
│   ├── detrazioni.js     le quattro detrazioni + aggregatore per la UI
│   ├── addizionali.js    addizionale regionale e comunale
│   └── index.js          calcolaNetto() — orchestratore
├── data/                 dati fiscali locali, separati dal codice
│   ├── regioni.json      Emilia-Romagna: scaglioni, norme, fonte, anno
│   └── comuni.json       Bologna: aliquota, esenzione, delibera, fonte, anno
├── components/           UI React, un componente per blocco visivo
└── format.js             formattazione e parsing in convenzioni italiane
```

Tre scelte che vale la pena spiegare:

- **Una sola funzione d'imposta.** `impostaProgressiva()` calcola IRPEF, addizionale regionale e
  addizionale comunale. Un'aliquota unica non è un caso a parte: è `[{ fino: null, aliquota: 0.8 }]`,
  cioè uno scaglione senza limite superiore. Meno codice, un solo posto dove può nascondersi un bug.
- **Nessun arrotondamento nella logica.** `src/calc/` lavora sempre a piena precisione; si arrotonda
  solo in `format.js`, al momento di mostrare il numero. Così le voci di dettaglio sommano
  esattamente al totale, senza centesimi che ballano.
- **`calcolaNetto()` restituisce tutte le grandezze intermedie**, non solo il netto: la UI mostra il
  dettaglio senza rifare un solo conto.

## Dati fiscali e fonti

Tutti i valori sono stati verificati il **16/08/2026**. Le addizionali vengono dalle schede ufficiali
del Dipartimento delle Finanze (MEF), non da fonti secondarie.

| Dato | Valore | Fonte |
|---|---|---|
| Contributi INPS a carico lavoratore | 9,19% | aliquota IVS gestione generale |
| Scaglioni IRPEF 2026 | 23% ≤28k · 33% 28–50k · 43% >50k | [Agenzia delle Entrate](https://www.agenziaentrate.gov.it/portale/imposta-sul-reddito-delle-persone-fisiche-irpef-/aliquote-e-calcolo-dell-irpef) (L. 199/2025) |
| No tax area | 8.500 € | art. 13 TUIR |
| Detrazione lavoro dipendente | 1.955 € → 0 tra 15k e 50k, +65 € tra 25k e 35k | art. 13 c. 1 e c. 1.1 TUIR |
| Ulteriore detrazione "cuneo fiscale" | 1.000 € tra 20k e 32k, decrescente fino a 40k | strutturale dal 2026 |
| Detrazioni carichi di famiglia | coniuge (art. 12 TUIR), figli 21-30 anni | art. 12 TUIR |
| **Addizionale regionale Emilia-Romagna 2026** | 1,33% · 1,93% · 2,78% · 3,33% a scaglioni | [scheda MEF regione 06](https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/addregirpef/addregirpef.php?reg=06&anno=2026) |
| **Addizionale comunale Bologna** | 0,80%, esente fino a 15.000 € | [scheda MEF comune A944](https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/nuova_addcomirpef/risultato.htm?anno=2025&cm=&pr=BO&cc=A944&r=1) |

## Cosa copre e cosa no

Il caso standard coperto: **dipendente privato, tempo indeterminato, full time, 365 giorni l'anno,
unico percettore di reddito in famiglia, nessuna agevolazione**.

Le semplificazioni sono scelte esplicite, non omissioni:

1. **Una sola residenza fiscale: Bologna (Emilia-Romagna)**, non selezionabile. Il dataset MEF
   completo dei ~7.900 comuni ha oltre il 60% delle voci senza delibera 2026 (4.894 su 7.897) e
   descrive le fasce in testo libero non normalizzato: costo di parsing alto per un dato peggiore.
   Il motore è già data-driven — estendere significa aggiungere righe a `regioni.json` / `comuni.json`,
   senza toccare la logica.
2. **Aliquota comunale di Bologna dall'ultimo anno pubblicato (2025)**: il Comune non ha ancora
   deliberato per il 2026, quindi vale l'ultima aliquota disponibile. La UI dichiara l'anno del dato.
3. **Netto mensile = netto annuo / mensilità**: una media. Nella realtà tredicesima e quattordicesima
   sono tassate nel mese di erogazione, non spalmate sui ratei.
4. **Trattamento integrativo ("ex bonus Renzi") escluso** dal calcolo, per scelta di scope.
5. Nessun minimale/massimale contributivo INPS, nessuna previdenza complementare, nessun TFR in
   busta paga.
6. Nessun onere deducibile o detraibile al 19% diverso dai carichi di famiglia.
7. Figli a carico solo nella fascia **21-30 anni**: sotto i 21 non spetta detrazione IRPEF, c'è
   l'Assegno Unico, che è un'erogazione INPS e non una trattenuta in busta paga.
8. Ignorate le maggiorazioni fisse (+10/+20/+30 €) della detrazione coniuge in alcune sotto-fasce.
9. Disposizioni particolari regionali (detrazioni o esenzioni per categorie) non modellate: per
   l'Emilia-Romagna la scheda MEF non ne riporta comunque nessuna.

## Tre errori trovati e corretti in fase di implementazione

Il lavoro di verifica non ha solo confermato i dati di progetto: ne ha corretti tre.

**1. Mancava la maggiorazione di 65 €** (art. 13 c. 1.1 TUIR, redditi tra 25.000 e 35.000 €, in vigore
dalla L. 234/2021). Era stata scartata per un'attribuzione sbagliata: intorno a quella fascia di
reddito insistono tre misure diverse — l'esonero contributivo IVS 6%/7% (abolito dal 2025), la
detrazione "cuneo fiscale" da 1.000 € (soglie 20k/32k/40k) e questa maggiorazione, che è
indipendente da entrambe ed è rimasta. Scartando la prima si era persa anche la terza.

**2. Formula della detrazione coniuge sbagliata** sotto i 15.000 €. La versione di partenza,
`800 + 110 × (15.000 − reddito)/15.000`, cresce da 800 a 910 € e crea un salto contro la fascia
successiva, fissa a 690 €. La formula corretta dell'art. 12 TUIR è `800 − 110 × reddito/15.000`:
decresce da 800 a 690 € e a 15.000 € si raccorda esattamente con la fascia successiva. Un test fissa
proprio questa continuità.

**3. Detrazione regionale inesistente.** Il progetto iniziale prevedeva la Lombardia con una
detrazione fissa di 150 € sulla fascia 28k–50k: la scheda MEF della Lombardia non ne riporta traccia.
Il perimetro è poi cambiato, ma la lezione vale: per le addizionali si usa solo la fonte ufficiale.

## Validazione

**80 test** (`npm test`) sui moduli di `src/calc/` e su `format.js`: confini esatti di ogni scaglione e
di ogni fascia di detrazione, incapienza, no tax area, soglia di esenzione comunale, validazione degli
input e quadratura `RAL − trattenute = netto`. I valori attesi sono derivati a mano nei commenti dei
test, non copiati dall'output del codice.

Confronto con calcolatori pubblici (Bologna, 13 mensilità, nessun carico di famiglia):

| RAL | Netto annuo | Riferimenti pubblici | Scarto |
|---|---|---|---|
| 25.000 € | 20.346,07 € | ~20.875 € (fonte che esclude le addizionali locali) | −529 €, pari **esattamente** alla somma delle due addizionali (348,16 + 181,62) |
| 35.000 € | 25.931,62 € | 25.937 – 25.975 € | da −5 a −43 € (−0,2%) |

Lo scarto a 25.000 € si spiega interamente con le addizionali, quindi non nasconde un errore di
formula; la differenza residua a 35.000 € è ciò che ha fatto emergere la maggiorazione di 65 €.

## Deploy

Push su `main` → GitHub Actions esegue lint, test e build, e pubblica su GitHub Pages
(`.github/workflows/deploy.yml`). Se lint o test falliscono, il sito non viene aggiornato.
