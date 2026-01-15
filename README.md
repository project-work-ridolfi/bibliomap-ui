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
  - [x] recupero password
  - [x] bug: campo nuova password evidenziato in rosso anche quando valido
- [x] /setlocation
  - [x] impostazione posizione separata dalla registrazione
  - [x] bug: rientrando nella mappa questa risulta vuota
- [x] creazione libreria
  - [x] navigazione "indietro" coerente da set location
  - [x] aggiunto pulsante "salta" se si arriva da set location
- [x] aggiunta libro
  - [x] sistemazione css (spaziature e rimozione elementi grafici superflui)
  - [x] modalità dark: campi libro, tag, note e riquadro copertina corretti
  - [x] migliorata gestione tag:
    - [x] tag selezionati su riga separata
    - [x] linea tag più chiaramente navigabile
    - [x] placeholder "aggiungi tag" con pulsante +
- [x] modifica libro
  - [x] in modalità dark i campi condizioni, tag e note non risultano bianchi
  - [x] dopo l’aggiunta i tag non vengono duplicati
- [x] dettaglio libro
  - [x] modalità dark corretta
  - [x] navigazione "indietro" corretta (non ritorna alla modifica)
  - [x] suggerimenti visibili anche se il libro è del proprietario
  - [x] messaggio di cortesia se non ci sono libri simili
  - [x] richiesta prestito dal dettaglio libro
- [x] ricerca libri
  - [x] fix filtro available
  - [x] caricamento con spinner e paginazione
- [x] badge visivo se libro in prestito
- [x] disabilitata eliminazione libro se in prestito
- [x] controllo copertina
- [x] ritaglio immagini con proporzioni cover
- [x] icona "occhio" su libro che porta al dettaglio
- [x] pagina dettaglio libreria
  - [x] visualizzazione mappa come componente riutilizzabile
  - [x] blocco eliminazione libro se non available
  - [x] collegamento richiesta prestito
  - [x] mappa visibile nella pagina libreria
- [x] modifica libreria
  - [x] sistemata modalità dark
- [x] accordion libreria
  - [x] pulsante apertura pagina dettaglio
  - [x] pulsante modifica libreria
- [x] visibilità libreria
- [x] icona "occhio" su libreria che porta a libraries/id
- [x] sidebar
  - [x] menu a tendina con librerie effettive (libraries/:id)
  - [x] verifica visualizzazione di tutte le librerie
  - [x] navigazione corretta verso un’altra libreria (fix reload)
  - [x] aggiunta voce /about
- [x] caricamento immagine accordion: usare cover della copia se presente
- [x] gestione profilo
- [x] pagina profilo
  - [x] cambio visibilità
  - [x] nuova pagina profilo che rimanda alla gestione attuale
  - [x] migliorata visualizzazione richieste
- [x] gestione utente con profilo privato
- [x] suggerimenti utente-utente
  - [x] indice di affinità letteraria basato sui top tag
- [x] suggerimenti libro-libro
  - [x] query spaziale filtrata per tag, distanza e autore
- [x] loans
  - [x] gestione richieste con rispetto delle impostazioni di visibilità
- [x] dashboard
  - [x] funzionamento pulsanti libri prestati
  - [x] modale su restituzione accettata per note e condizione libro
  - [x] vista owner per libro scaduto con azioni disponibili
  - [x] storico prestiti
  - [x] formattazione giorni come elenco separato da virgole
  - [x] messaggio informativo per l’utente su condivisione dati
  - [x] modale con stile coerente tra light e dark
- [x] integrazione api prestiti
  - [x] aggiornato apiclient con endpoint /loans
  - [x] dashboardpage carica prestiti richiesti e attivi
  - [x] collegata richiesta prestito a post /api/loans/request
  - [x] gestione azioni accept/reject via patch status
  - [x] avvio prestito tramite post /start
  - [x] restituzione prestito tramite post /return
- [x] tab "libri che ho prestato"
- [x] tab "libri che sto leggendo"
  - [x] visualizzazione chiara della scadenza con countdown
- [x] header
  - [x] caricamento corretto nome utente
- [x] footer
- [x] font
- [x] fix switch light/dark
- [x] responsive
- [x] gestione errore login 401 con messaggio più chiaro
- [x] controllo condizioni libro
- [x] allungamento prestito
- [x] gestione prestito restituito
- [x] contatori
  - [x] book counter
  - [x] library counter
- [x] statistiche
  - [x] modalità dark
  - [x] metriche di utilizzo
  - [x] titoli più richiesti in formato lista (non grafico)
- [x] mappa
  - [x] mappa integrata nel profilo
  - [x] barra distanza centrata in home
- [x] accessibilità
  - [x] aria-labels ovunque
- [x] comportamento post salvataggio libro migliorato
- [x] caricamento libri in ricerca ottimizzato
- [x] richiesta copia dati con tooltip informativo

- [ ] allineamento modale libro appena aggiunto (bottone centrato o a destra)
- [ ] aggiungere 2 utenti demo con password nel readme
- [ ] rel
