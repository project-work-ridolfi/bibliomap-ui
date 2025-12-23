# bibliomap-ui

Questo progetto costituisce il frontend dell'applicazione Bibliomap. Il codice è sviluppato utilizzando il framework Vue 3 e utilizza Vite come strumento di build e server di sviluppo.

## INDICE

- [Installazione](#installazione)
- [Sviluppo](#sviluppo)
- [Compilazione](#compilazione)
- [Documentazione Vue](#documentazione-vue)
- [Da Fare](#todo)

## Installazione

Prima di avviare il progetto è necessario installare tutte le dipendenze elencate nel file package.json. Eseguire il comando nella root del progetto:

```shell
    npm install
```

## Sviluppo

Per avviare il server di sviluppo locale. Questa modalità abilita l'Hot Module Replacement (HMR) per vedere le modifiche in tempo reale:

```shell
    npm run dev
```

Il terminale mostrerà l'indirizzo locale (solitamente http://localhost:5173) dove è possibile visualizzare l'applicazione.

## Compilazione

Per creare la build di produzione ottimizzata e minificata. I file generati verranno posizionati nella cartella `dist`:

```shell
    npm run build
```

## Documentazione Vue

Questo template utilizza Vue 3 con la sintassi `<script setup>`.

* Per approfondire la sintassi script setup consultare la [documentazione ufficiale](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup).
* Per maggiori informazioni sugli strumenti di sviluppo consultare la [Guida Vue](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## TODO

- [x] /signup
- [x] /login
- [x] /setlocation
  - [ ] set location non nella registrazione
  - [ ] se vai nella mappa esci e ci torni la mappa e' vuota
- [ ] create library
- [ ] add book
    - [ ] fix css, migliora distanze e togli righe brutte
- [ ] password dimenticata
- [ ] metriche utilizzo
- [ ] cambia visibilità
- [ ] gestione profilo
- [ ] home
- [x] sidebar
- [x] header
- [ ] css - fonts - notte
- [ ] footer
- [ ] modale richiesta libro
- [ ] Aggiornare `apiClient` per includere gli endpoint `/loans` definiti nel BE
- [ ] Aggiornare `DashboardPage.vue` per caricare le liste prestiti (requests e active)
- [ ] Modificare logica pulsante principale:
    - Se `currentUser == owner`: Mostra "Modifica"
    - Se `copy.status == 'available'`: Mostra "Richiedi Prestito"
    - Se `copy.status == 'on_loan'`: Mostra "Non disponibile (In prestito)"
    - Se richiesta già fatta (`pending`): Mostra "Richiesta inviata" (Disabilitato)
- [ ] Collegare click "Richiedi Prestito" alla chiamata `POST /api/loans/request`
- [ ] Creare componente/sezione "Richieste in Arrivo":
    - Lista card con: Nome Richiedente, Titolo Libro
    - Bottoni azione: [Accetta] [Rifiuta]
    - Collegare alle chiamate API `PATCH status`
- [ ] Creare Tab/Sezione "Libri che ho prestato" (Owner View):
    - Se stato `ACCEPTED`: Mostra bottone [Consegna Libro] (Start Loan)
    - Se stato `ON_LOAN`: Mostra info scadenza e bottone [Segna Restituito]
    - Collegare [Consegna Libro] a `POST /start`
- [ ] Creare modale "Conferma Restituzione":
    - Input select per nuova condizione (ottima/buona/ecc)
    - Collegare a `POST /return`
- [ ] Creare Tab/Sezione "Libri che sto leggendo" (Requester View):
    - Lista libri presi in prestito
    - Visualizzazione chiara della data di scadenza (countdown se vicina)
- [ ] Aggiornare card libro in `LibraryPage`:
    - Aggiungere badge visivo se `status == 'on_loan'`
    - Disabilitare tasto cancellazione se il libro è in prestito attivo
- [ ] fix switch light/dark