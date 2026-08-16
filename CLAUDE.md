# Calcolatore RAL → Netto — Jet HR Task

## 1. Contesto

Prototipo per una take-home task da product builder a Jet HR: una web app che, data una **RAL** (Retribuzione Annua Lorda), calcola e mostra:

- netto annuale
- netto mensile
- il dettaglio di tutte le trattenute (contributi INPS, IRPEF, addizionali, detrazioni applicate)

Non è richiesta precisione assoluta su tutti i casi possibili: è richiesto un prototipo **funzionante su un caso standard**, con logiche di calcolo comprese e controllabili da chi lo ha costruito (niente black-box da tool no-code). Ogni semplificazione va esplicitata, perché sarà discussa in un eventuale colloquio — per questo questo file elenca sempre, insieme a ogni scelta, il *perché*.

## 2. Caso standard coperto dal prototipo (assunzioni di base)

- Dipendente privato, **contratto a tempo indeterminato**, **full time**, attivo per **365/365 giorni** nell'anno (nessun ragguaglio periodo di lavoro, nessuna gestione di ingresso/uscita a metà anno).
- Residenza fiscale: **selezionabile dall'utente** (regione + comune) — non più fissata a Milano/Lombardia, v. §3.6 e §3.7 per il dettaglio di come sono calcolate le addizionali di conseguenza. Milano/Lombardia restano i valori di default del selettore, in continuità col caso standard originale già verificato.
- Nessuna agevolazione particolare: no welfare aziendale, no fringe benefit, no lavoratori impatriati, no forfait giovani/rimpatriati, no premi di risultato / detassazione al 5%, no straordinari, no TFR in busta paga, no ticket restaurant.
- **Unico percettore di reddito** nel nucleo familiare, reddito complessivo IRPEF coincidente con il reddito da lavoro dipendente (nessun altro reddito, nessun onere deducibile/detraibile al 19% diverso dai carichi di famiglia).
- **Numero di mensilità selezionabile dall'utente: 12, 13 o 14** (default: **13**, la più diffusa nei CCNL italiani). Il netto mensile resta comunque una **media**: `netto mensile = netto annuo / mensilità selezionate` — semplificazione, perché nella realtà la tredicesima (ed eventuale quattordicesima) è tassata separatamente per competenza nel mese di erogazione, non spalmata linearmente sui ratei; il prototipo non modella questa distribuzione, mostra solo una media annua.
- Nessun minimale/massimale contributivo INPS, nessuna gestione di fondi di previdenza complementare/TFR.

## 3. Scelte implementative (decise) e dati 2026

### 3.1 Contributi previdenziali INPS a carico lavoratore

- Aliquota fissa **9,19%** sulla RAL (aliquota IVS ordinaria per il lavoratore dipendente privato, gestione generale INPS — il 33% complessivo si divide in 23,81% a carico datore e 9,19% a carico lavoratore).
- `Contributi INPS lavoratore = RAL × 9,19%`
- `Imponibile fiscale (reddito complessivo IRPEF) = RAL − Contributi INPS lavoratore`

### 3.2 Scaglioni IRPEF 2026

La Legge di Bilancio 2026 ha reso strutturale la riduzione a 3 scaglioni, abbassando inoltre l'aliquota del secondo scaglione dal 35% al 33%:

| Reddito imponibile | Aliquota |
|---|---|
| fino a 28.000 € | 23% |
| da 28.000,01 a 50.000 € | 33% |
| oltre 50.000 € | 43% |

Calcolo per scaglioni progressivi (non aliquota unica sul totale). Nessuna gestione della clausola per redditi > 200.000 € (taglio detrazioni 19%), fuori scope per un impiegato standard.

**No tax area**: 8.500 € di reddito imponibile (invariata) — sotto questa soglia l'IRPEF lorda è 0.

### 3.3 Detrazione per lavoro dipendente (art. 13 TUIR)

Rapportata a 365/365 gg (assunzione di contratto attivo tutto l'anno, quindi nessun ragguaglio):

| Reddito imponibile | Detrazione |
|---|---|
| ≤ 15.000 € | 1.955 € (fisso) |
| 15.000,01 – 28.000 € | 1.910 + 1.190 × (28.000 − reddito) / 13.000 |
| 28.000,01 – 50.000 € | 1.910 × (50.000 − reddito) / 22.000 |
| > 50.000 € | 0 |

Nota: esiste un floor minimo di 690 € per i redditi molto bassi a tempo indeterminato — nel range coperto dal caso standard (RAL da impiegato) non si attiva mai, quindi il prototipo può ometterlo o gestirlo come edge case a bassa priorità.

### 3.4 Ulteriore detrazione "cuneo fiscale" (resa strutturale dalla L. di Bilancio 2026)

Per reddito imponibile tra 20.000 e 40.000 €:

| Reddito imponibile | Detrazione ulteriore |
|---|---|
| 20.000,01 – 32.000 € | 1.000 € (fisso) |
| 32.000,01 – 40.000 € | 1.000 × (40.000 − reddito) / 8.000 |
| fuori da questo intervallo | 0 |

⚠️ **Correzione rispetto alla bozza di design**: la nota "bonus per il reddito tra 25k e 35k" era riferita alla misura transitoria 2024 (esonero contributivo IVS 6%/7%). Dal 2025 quella misura è stata sostituita da questa detrazione IRPEF strutturale con soglie **20.000–32.000–40.000**, confermate anche per il 2026: uso queste soglie aggiornate, non 25k/35k.

### 3.5 Detrazioni per carichi di famiglia (art. 12 TUIR)

Input utente: coniuge a carico (sì/no), numero figli a carico **21–30 anni** (i figli under 21 non generano più detrazione IRPEF dal 2022: sono coperti dall'Assegno Unico Universale, che è un beneficio INPS extra-IRPEF e resta **fuori scope** — non è una trattenuta in busta paga).

**Coniuge a carico** (teorica 800 €, decrescente col reddito):

| Reddito imponibile | Detrazione |
|---|---|
| ≤ 15.000 € | 800 + 110 × (15.000 − reddito) / 15.000 |
| 15.000,01 – 40.000 € | 690 € (fisso) |
| 40.000,01 – 80.000 € | 690 × (80.000 − reddito) / 40.000 |
| > 80.000 € | 0 |

Semplificazione: si ignorano le piccole maggiorazioni fisse (+10/+20/+30 €) previste per specifiche sotto-fasce tra 29.000 e 35.200 €.

**Ogni figlio a carico 21–30 anni** (teorica 950 €, decrescente col reddito):

`Detrazione per figlio = 950 × (95.000 − reddito) / 95.000` (0 se reddito > 95.000 €)

Moltiplicata per il numero di figli inseriti dall'utente.

### 3.6 Addizionale regionale IRPEF — selezionabile per regione

L'utente sceglie la **regione di residenza fiscale** da un menu con le **20 regioni italiane, hardcoded** nel codice (nessuna chiamata a API esterne per questo dato: sono solo 20 valori, cambiano raramente, e un elenco statico è più affidabile e verificabile per un prototipo). Ogni regione ha la propria struttura di aliquote sull'imponibile fiscale: alcune regioni applicano un'**aliquota unica**, altre **scaglioni progressivi** (come la Lombardia, v. §3.7.1) — il codice deve quindi trattare l'aliquota unica come caso particolare di "uno scaglione solo", per riusare la stessa funzione di calcolo a scaglioni di §3.2.

Fonte di riferimento per compilare/verificare le 20 aliquote: portale ufficiale del Dipartimento delle Finanze — Addizionali IRPEF (https://www1.finanze.gov.it/finanze3/addizionali/), che pubblica ogni anno le delibere regionali vigenti.

⚠️ Da fare in fase di implementazione: compilare la tabella con le aliquote vigenti 2026 per tutte le 20 regioni. La Lombardia (§3.6.1) è l'unica già verificata alla stesura di questo documento; per le altre 19, verificare sul Dipartimento delle Finanze prima della consegna — non inventare aliquote.

#### 3.6.1 Lombardia (dato già verificato per il 2026)

Calcolata per scaglioni progressivi sull'imponibile fiscale:

| Reddito imponibile | Aliquota |
|---|---|
| fino a 15.000 € | 1,23% |
| 15.000,01 – 28.000 € | 1,58% |
| 28.000,01 – 50.000 € | 1,72% (con detrazione fissa di 150 € sull'addizionale dovuta per questa fascia) |
| oltre 50.000 € | 1,73% |

### 3.7 Addizionale comunale IRPEF — selezionabile per comune (dataset MEF)

L'utente sceglie il **comune di residenza fiscale**, con un selettore filtrato/dipendente dalla regione già scelta (per ridurre la lista a un sottoinsieme gestibile). A differenza delle regioni, i comuni italiani sono troppi (~7.900) per essere hardcoded a mano: aliquota, eventuale soglia di esenzione ed eventuali scaglioni vanno caricati da un **dataset derivato dai dati ufficiali del MEF** (stesso portale Dipartimento delle Finanze — Addizionali IRPEF citato in §3.6), estratto/processato offline in un file statico (es. JSON) incluso nel prototipo — nessuna chiamata ad API esterne a runtime.

- Formato suggerito del dataset: `{ comune, provincia, regione, aliquota, sogliaEsenzione, scaglioni? }`. La maggior parte dei comuni ha aliquota unica e nessuna soglia di esenzione; alcuni (come Milano) hanno una soglia di esenzione fissa; pochi comuni maggiori adottano scaglioni progressivi propri — trattarli come caso generico "scaglioni" se emergono nel dataset, riusando ancora la funzione di calcolo a scaglioni di §3.2, altrimenti semplificare ad aliquota unica + eventuale soglia.
- Se per il comune scelto il dataset MEF non riporta ancora un'aliquota pubblicata per il 2026 al momento dell'estrazione, si usa l'ultima aliquota disponibile (stesso criterio già adottato per Milano, v. sotto).

⚠️ Da fare in fase di implementazione: generare il dataset dei comuni a partire dal file ufficiale MEF (anno più recente disponibile al momento dell'estrazione) e includerlo come asset statico nel prototipo. Milano resta l'unico comune già verificato alla stesura di questo documento:

#### 3.7.1 Milano (dato già verificato per il 2026)

- Aliquota fissa **0,80%**, applicata sull'**intero** imponibile fiscale.
- **Esenzione totale** se il reddito imponibile è ≤ 23.000 €.
- Se il Comune di Milano non ha pubblicato una nuova delibera per il 2026, resta in vigore l'aliquota 2025 (0,80%) — è quella da usare.

### 3.8 Formula finale

```
Contributi INPS         = RAL × 9,19%
Imponibile fiscale       = RAL − Contributi INPS
IRPEF lorda               = calcolo a scaglioni su Imponibile fiscale (§3.2)
Detrazioni IRPEF totali  = detrazione lavoro dipendente (§3.3)
                          + ulteriore detrazione cuneo fiscale (§3.4)
                          + detrazione coniuge a carico (§3.5, se presente)
                          + detrazione figli a carico 21-30 (§3.5, se presenti)
IRPEF netta               = max(0, IRPEF lorda − Detrazioni IRPEF totali)
Addizionale regionale    = calcolo a scaglioni (o aliquota unica) su Imponibile fiscale, per la regione scelta (§3.6)
Addizionale comunale     = calcolo su Imponibile fiscale, per il comune scelto — aliquota/soglia/scaglioni da dataset MEF (§3.7)

Netto annuo = RAL − Contributi INPS − IRPEF netta − Addizionale regionale − Addizionale comunale
Netto mensile = Netto annuo / mensilità selezionate (12, 13 o 14 — default 13, v. §2)
```

## 4. Fonti (dati verificati per il 2026)

- Scaglioni IRPEF 2026 e taglio secondo scaglione al 33%: [informazionefiscale.it](https://www.informazionefiscale.it/IRPEF-scaglioni-aliquote-calcolo), [Agenzia delle Entrate](https://www.agenziaentrate.gov.it/portale/imposta-sul-reddito-delle-persone-fisiche-irpef-/aliquote-e-calcolo-dell-irpef)
- No tax area 8.500 € e detrazione lavoro dipendente: [informazionefiscale.it](https://www.informazionefiscale.it/detrazioni-lavoro-dipendente-importo-calcolo)
- Ulteriore detrazione cuneo fiscale (20k–32k–40k), resa strutturale 2026: [stipendionettocalcolatore.it](https://stipendionettocalcolatore.it/cuneo-fiscale-2026/)
- Detrazione coniuge a carico (art. 12 TUIR, formula per scaglioni): [fiscoinvestimenti.it](https://fiscoinvestimenti.it/coniuge-a-carico-detrazione-documenti-redditi/)
- Detrazione figli a carico 21–30 anni: [fiscomania.com](https://fiscomania.com/detrazione-figli-a-carico-come-cambiano/)
- Addizionale regionale Lombardia 2026: [regione.lombardia.it](https://www.regione.lombardia.it/bollo-auto-e-tributi-regionali/red-addizionale-regionale-irpef), [directio.it](https://directio.it/News/Details/11189/addizionale-regionale-irpef-aliquote-2026)
- Addizionale comunale Milano 2026 (0,80%, esenzione 23.000 €): [Comune di Milano](https://servizicrm.comune.milano.it/centro-supporto/KA-01934/Aliquota-addizionale-comunale-IRPEF)
- Addizionali regionali e comunali IRPEF, tutte le regioni/comuni (dataset ufficiale da cui derivare la tabella delle 20 regioni e il dataset comuni): [Dipartimento delle Finanze — Addizionali IRPEF](https://www1.finanze.gov.it/finanze3/addizionali/)
- Aliquota contributiva IVS lavoratore 9,19%: [dequo.it](https://www.dequo.it/articoli/calcolo-contributi-previdenziali), [money.it](https://www.money.it/contributo-ivs-busta-paga-significato-quanti-soldi-toglie-netto)

Prima di consegnare, ri-verificare questi numeri sulle fonti ufficiali (Agenzia delle Entrate, INPS, sito del Comune di Milano, Regione Lombardia) nel caso siano cambiati tra la stesura di questo documento e l'implementazione — la Legge di Bilancio 2026 era di recentissima approvazione al momento della ricerca.

## 5. Stack tecnico

Prototipo **client-side, single page**, in **React + JavaScript** (niente TypeScript, per restare leggero da leggere/spiegare in un eventuale colloquio):

- **Vite** come build tool (`npm create vite@latest -- --template react`): zero-config, dev server veloce, build statica finale deployabile gratis senza backend (GitHub Pages, Netlify, Vercel).
- Nessuna libreria UI esterna necessaria (niente MUI/Tailwind obbligatori): CSS semplice va bene; eventuali librerie leggere solo se semplificano senza appesantire la spiegazione in colloquio.
- **Logica di calcolo isolata in moduli JS puri**, separati dai componenti React — es. `src/calc/inps.js`, `src/calc/irpef.js`, `src/calc/detrazioni.js`, `src/calc/addizionali.js`, `src/calc/index.js` (orchestratore `calcolaNetto(input)`) — testabili senza montare alcun componente, così in un colloquio è facile mostrare/spiegare ogni pezzo indipendentemente dalla UI.
- **Dati statici come JSON in `src/data/`**: `regioni.json` (le 20 regioni hardcoded, §3.6) e `comuni.json` (dataset derivato dal MEF, §3.7), importati sia dalla logica di calcolo sia dai selettori della UI — stessa fonte di verità, nessuna duplicazione tra dati e dropdown.
- Componenti React minimi, mappati 1:1 sulla UI descritta in §6 (form di input, box risultati, dettaglio trattenute); stato locale con `useState`, nessuno state manager esterno necessario per un form di questa dimensione.

## 6. UI minima richiesta

Input:
- RAL (numero, €)
- Numero di mensilità: selettore **12 / 13 / 14** (default: **13**)
- Regione di residenza fiscale: dropdown con le 20 regioni (default: Lombardia)
- Comune di residenza fiscale: dropdown/autocomplete dipendente dalla regione scelta, popolato dal dataset comuni (default: Milano)
- Coniuge a carico (sì/no)
- Numero figli a carico 21–30 anni (intero ≥ 0)
- Bottone "Calcola"

Output (dopo il click):
- Netto annuale, netto mensile (in evidenza) — netto mensile calcolato sulle mensilità selezionate
- Dettaglio di ogni voce trattenuta: contributi INPS, IRPEF netta (con IRPEF lorda e detrazioni applicate visibili), addizionale regionale (con la regione scelta indicata), addizionale comunale (con il comune scelto indicato)
- Totale generale delle trattenute (RAL − netto annuo) e % di pressione fiscale/contributiva complessiva

## 7. Validazione

Sanity check dei risultati su 2–3 RAL di prova (es. 25.000 €, 35.000 €, 50.000 €) confrontando l'ordine di grandezza con un calcolatore netto/lordo pubblico affidabile (es. calcolatori di sindacati o consulenti del lavoro), solo per intercettare errori grossolani nella formula — non per inseguire una corrispondenza esatta, dato che il prototipo è dichiaratamente semplificato.

## 8. Semplificazioni da tenere pronte per l'interview

Elenco sintetico (già motivato sopra) da poter ripetere a voce:
1. Solo tempo indeterminato, 365 gg, full time.
2. Nessun onere deducibile/detraibile 19% diverso dai carichi di famiglia.
3. Nessuna agevolazione (impatriati, giovani, welfare, premi di risultato...).
4. Unico percettore di reddito in famiglia.
5. Netto mensile = netto annuo / mensilità selezionate (12/13/14, default 13) — non modella la tassazione separata per competenza della tredicesima/quattordicesima, resta una media annua.
6. Nessun minimale/massimale contributivo INPS.
7. Figli a carico gestiti solo nella fascia 21–30 anni (0–20 → Assegno Unico, fuori scope perché non è una trattenuta IRPEF).
8. Ignorate le piccole maggiorazioni fisse della detrazione coniuge in alcune sotto-fasce di reddito.
9. Soglie "cuneo fiscale" aggiornate a 20k/32k/40k (2025-2026), non le vecchie 25k/35k del 2024.
10. Addizionale comunale basata su un dataset MEF estratto staticamente: se un comune non ha ancora pubblicato la delibera 2026 al momento dell'estrazione, si usa l'ultima aliquota disponibile (non un dato aggiornato in tempo reale).
11. Trattamento integrativo ("ex bonus Renzi") escluso dal calcolo per scelta esplicita: non viene stimato né sommato al netto — semplificazione voluta per contenere lo scope del prototipo, da segnalare a voce come nota a parte rispetto alle trattenute/detrazioni effettivamente modellate.

## 9. Consegna

Il link al lavoro (repo GitHub / sito live / cartella Drive) va inviato in **risposta** all'email di invito al task, **senza modificarne l'oggetto**, con `task@jethr.com` in CC.
