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
- [x] create library
- [x] add book
    - [x] fix css, migliora distanze e togli righe brutte
    - [ ] modalita' dark aggiungi libro, tage note e riquardo per copertina sono bianchi
- [x] dettaglio libro modalità dark rimane bianco
- [ ] modifica libro condizioni, tag e note in modalita' dark sono bianche
- [ ] password dimenticata
- [ ] metriche utilizzo
- [ ] cambia visibilità
- [x] gestione profilo
- [x] home
    - [ ] forse va cambiato il nome
    - [x] mostra disponibili non funziona (non si vede nulla se premuto, non sono sicura che se non e' premuto si vedano anche i libri in prestito)
    - [x] versione dark da aggiustare i bottoni (forse css global)
    - [x] banner con richiesta di accesso in modalita' notte ha lo sfondo dello stesso identico colore del testo
- [ ] stats
    - [ ] dark
- [ ] loans
    - [ ] gestione richieste nome del proprietario va visto se le opzioni di visibilita' lo consentono
- [x] sidebar
    - [x] librerie con menu a tendina delle librerie effettive (in quel caso chiama libraries/:id)
- [ ] pagina dettaglio libreria
    - [ ] si deve far vedere la mappa (forse mettere come componente, visto che è anche nella gestione del profilo)
    - [ ] non si deve poter eliminare un libro che non è in stato available
    - [ ] attaccare per la richiesta prestito
- [ ] profilo
    - [ ] da fare completamente pagina profilo
    - [ ] gestione richieste rivedere non si vedeno bene
- [ ] dashboard
    - [ ] riepilogo e analisi bloccati a 0 implementare le req giuste
    - [ ] sui libri prestati devono funzionare i bottoni (api per allungare il tempo da fare)
    - [ ] sulla restituzione accettata si deve aprire una modale per far aggiungere note se necessario e/o cambiare la condizione del libro
    - [ ] i bottoni della componente library accordion non fungono dalla dashboard
    - [ ] aggiunta mappetta
- [x] header
- [ ] css - fonts - notte
- [ ] footer
- [x] modale richiesta libro
- [x] Aggiornare `apiClient` per includere gli endpoint `/loans` definiti nel BE
- [x] Aggiornare `DashboardPage.vue` per caricare le liste prestiti (requests e active)
- [x] Modificare logica pulsante principale:
    - Se `currentUser == owner`: Mostra "Modifica"
    - Se `copy.status == 'available'`: Mostra "Richiedi Prestito"
    - Se `copy.status == 'on_loan'`: Mostra "Non disponibile (In prestito)"
    - Se richiesta già fatta (`pending`): Mostra "Richiesta inviata" (Disabilitato)
- [x] Collegare click "Richiedi Prestito" alla chiamata `POST /api/loans/request`
- [x] Creare componente/sezione "Richieste in Arrivo":
    - Lista card con: Nome Richiedente, Titolo Libro
    - Bottoni azione: [Accetta] [Rifiuta]
    - Collegare alle chiamate API `PATCH status`
- [x] Creare Tab/Sezione "Libri che ho prestato" (Owner View):
    - Se stato `ACCEPTED`: Mostra bottone [Consegna Libro] (Start Loan)
    - Se stato `ON_LOAN`: Mostra info scadenza e bottone [Segna Restituito]
    - Collegare [Consegna Libro] a `POST /start`
- [x] Creare modale "Conferma Restituzione":
    - Input select per nuova condizione (ottima/buona/ecc)
    - Collegare a `POST /return`
- [x] Creare Tab/Sezione "Libri che sto leggendo" (Requester View):
    - Lista libri presi in prestito
    - Visualizzazione chiara della data di scadenza (countdown se vicina)
- [x] Aggiornare card libro in `LibraryPage`:
    - Aggiungere badge visivo se `status == 'on_loan'`
    - Disabilitare tasto cancellazione se il libro è in prestito attivo
- [ ] fix switch light/dark
- [ ] 2025-12-28 13:54:59,843 INFO  [it.uni.api.res.LoggingFilter] (executor-thread-1) <<< OUTGOING RESPONSE: POST /api/auth/login -> Status 401
2025-12-28 13:54:59,844 DEBUG [it.uni.api.res.LoggingFilter] (executor-thread-1) Response Body: ErrorResponse[error=INVALID_CREDENTIALS, message=Credenziali non valide.] da gestire meglio
- [ ] controlla condizioni
- [ ] aggiungi icona occhio a libreria che porta a libraries/id
- [ ] aggiungi icona occhio al libro
- [ ] sidebar con tutte le librerie?
- [ ] stats
- [ ] mappa nella pagina libreria
- [ ] cerca libri per available non funge
- [ ] controllo cover
- [ ] allunga prestito
- [ ] prestito restituito
- [ ] stats settimana null