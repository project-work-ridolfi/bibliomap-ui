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
    - [x] password dimenticata
    - [x] nuova password rossa anche quando giusto
- [x] /setlocation
  - [x] set location non nella registrazione
  - [x] se vai nella mappa esci e ci torni la mappa e' vuota
- [x] create library
    - [x] torna indietro da set location dovrebbe tornare su set location
    - [x] manca un bottone salta se ci si arriva da set location
- [x] add book
    - [x] fix css, migliora distanze e togli righe brutte
    - [x] modalita' dark aggiungi libro, tag, note e riquadro per copertina sono bianchi
- [x] dettaglio libro modalità dark rimane bianco
- [x] modifica libro condizioni, tag e note in modalita' dark sono bianche
- [x] gestione profilo
- [x] home
    - [x] forse va cambiato il nome
    - [x] mostra disponibili non funziona (non si vede nulla se premuto, non sono sicura che se non e' premuto si vedano anche i libri in prestito)
    - [x] versione dark da aggiustare i bottoni (forse css global)
    - [x] banner con richiesta di accesso in modalita' notte ha lo sfondo dello stesso identico colore del testo
    - [x] se clicchi sul libro dalla lista, ci si avvicina alla libreria di cui fa parte sulla mappa finchè non scompare
- [x] stats
    - [x] dark
    - [x] metriche utilizzo
    - [X] da modificare quelli che si vedono e aggiungere
- [x] loans
    - [x] gestione richieste nome del proprietario va visto se le opzioni di visibilita' lo consentono
- [x] sidebar
    - [x] librerie con menu a tendina delle librerie effettive (in quel caso chiama libraries/:id)
- [x] pagina dettaglio libreria
    - [x] si deve far vedere la mappa (forse mettere come componente, visto che è anche nella gestione del profilo)
    - [x] non si deve poter eliminare un libro che non è in stato available
    - [x] attaccare per la richiesta prestito
    - [x] mappa nella pagina libreria
- [x] modifica libreria
    - [x] modalità notte da aggiustare
- [x] accordion libreria
    - [x] bottone per aprire la pagina anche dall'accordion
    - [x] bottone per modificare la libreria
- [x] profilo
    - [x] cambia visibilità
    - [x] da fare completamente pagina profilo che riporta poi a quella che c'e' ora di gestione
    - [x] gestione richieste rivedere non si vedeno bene
- [ ] dashboard
    - [x] sui libri prestati devono funzionare i bottoni (api per allungare il tempo da fare)
    - [x] sulla restituzione accettata si deve aprire una modale per far aggiungere note se necessario e/o cambiare la condizione del libro
    - [ ] dashboard owner quando libro scaduto anche vede in maniera diversa e può allungare o contattare
    - [x] aggiungi storico dei prestiti su dashboard
    - [ ] manda stringa giorni come giorni completi separati da virgola
    - [x] messaggio per l’utente con testo grigio che dice attento a non condividere stocazzo
    - [x] modale ha bottoni a notte anche quando giorno
- [x] header
    - [ ] nome utente non sempre carica da capi
- [ ] css - fonts - notte
- [ ] footer
- [x] modale richiesta libro
- [x] Aggiornare `apiClient` per includere gli endpoint `/loans` definiti nel BE
- [x] Aggiornare `DashboardPage.vue` per caricare le liste prestiti (requests e active)
- [x] Modificare logica pulsante principale:
    - [x] Se `currentUser == owner`: Mostra "Modifica"
    - [x] Se `copy.status == 'available'`: Mostra "Richiedi Prestito"
    - [x] Se `copy.status == 'on_loan'`: Mostra "Non disponibile (In prestito)"
    - [x] Se richiesta già fatta (`pending`): Mostra "Richiesta inviata" (Disabilitato)
- [x] Collegare click "Richiedi Prestito" alla chiamata `POST /api/loans/request`
- [x] Creare componente/sezione "Richieste in Arrivo":
    - [x] Lista card con: Nome Richiedente, Titolo Libro
    - [x] Bottoni azione: [Accetta] [Rifiuta]
    - [x] Collegare alle chiamate API `PATCH status`
- [x] Creare Tab/Sezione "Libri che ho prestato" (Owner View):
    - [x] Se stato `ACCEPTED`: Mostra bottone [Consegna Libro] (Start Loan)
    - [x] Se stato `ON_LOAN`: Mostra info scadenza e bottone [Segna Restituito]
    - [x] Collegare [Consegna Libro] a `POST /start`
- [x] Creare modale "Conferma Restituzione":
    - [x] Input select per nuova condizione (ottima/buona/ecc)
    - [x] Collegare a `POST /return`
- [x] Creare Tab/Sezione "Libri che sto leggendo" (Requester View):
    - [x] Lista libri presi in prestito
    - [x] Visualizzazione chiara della data di scadenza (countdown se vicina)
- [x] Aggiornare card libro in `LibraryPage`:
    - [x] Aggiungere badge visivo se `status == 'on_loan'`
    - [x] Disabilitare tasto cancellazione se il libro è in prestito attivo
- [ ] fix switch light/dark
- [x] 2025-12-28 13:54:59,843 INFO  [it.uni.api.res.LoggingFilter] (executor-thread-1) <<< OUTGOING RESPONSE: POST /api/auth/login -> Status 401
2025-12-28 13:54:59,844 DEBUG [it.uni.api.res.LoggingFilter] (executor-thread-1) Response Body: ErrorResponse[error=INVALID_CREDENTIALS, message=Credenziali non valide.] da gestire meglio
- [x] controlla condizioni
- [x] aggiungi icona occhio a libreria che porta a libraries/id
- [x] aggiungi icona occhio al libro
- [x] sidebar con tutte le librerie?
- [x] cerca libri per available non funge
- [x] controllo cover
- [x] allunga prestito
- [x] prestito restituito
- [x] suggerimenti nel profilo (User-to-User), indice affinità letteraria, usa toptags dei due utenti.
- [x] suggerimenti dettaglio libro (Item-to-Item), query spaziale filtrata per gli stessi tag del libro corrente + distanza + autore.
- [x] book counter
- [x] lib counter
- [x] gestione profilo
- [x] mappetta
- [x] stats titoli più richiesti lista non bar graph
- [ ] gestione utente se è privato non vede bene
- [ ] torna indietro dal dettaglio libro non dovrebbe portare indietro su modifica (returnTo in book edit e gestito)
- [ ] responsive???
- [ ] book edit una volta aggiunti i tag non si dovrebbero vedere sotto