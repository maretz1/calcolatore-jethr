# Calcolatore RAL → Netto

Prototipo web che, data una **RAL** (Retribuzione Annua Lorda), calcola il **netto annuo**, il **netto mensile**
e il **dettaglio di tutte le trattenute**: contributi INPS, IRPEF lorda e netta con le detrazioni applicate,
addizionale regionale e addizionale comunale.

Dati fiscali **2026**. Applicazione **interamente client-side**: nessun backend, nessuna chiamata di rete a runtime.

## Come si lancia

```bash
npm install
npm run dev      # server di sviluppo
npm run build    # build statica in dist/
npm run preview  # anteprima della build
```

## Stato

Lavoro in corso, un passo alla volta:

- [x] Step 1 — impalcatura del progetto
- [ ] Step 2 — dataset addizionali regionali e comunali (fonte MEF)
- [ ] Step 3 — motore di calcolo
- [ ] Step 4 — test
- [ ] Step 5 — interfaccia
- [ ] Step 6 — documentazione di consegna e deploy

Assunzioni, semplificazioni e fonti dei dati verranno documentate qui alla fine dello Step 6.
