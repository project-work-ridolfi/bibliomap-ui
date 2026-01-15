# bibliomap-ui

Questo progetto costituisce il frontend dell'applicazione Bibliomap. Il codice è sviluppato utilizzando il framework Vue.js 3.

## INDICE

- [Demo](#demo)
- [Installazione](#installazione)
    - [Prerequisiti](#prerequisiti)
    - [In locale](#in-locale)
    - [Docker](#docker)
- [Struttura del progetto](#struttura-del-progetto)
- [Documentazione Vue](#documentazione-vue)
- [Changelog](./changelog.md)
- [Da Fare](#todo)

## Demo

L’applicazione è disponibile al seguente indirizzo:
[https://bibliomap-ui.onrender.com](https://bibliomap-ui.onrender.com)

## Accesso con utenti demo

Per la demo sono disponibili utenti di test già registrati.
Si può accedere con i seguenti indirizzi email:
- gandalf@middlearth.com
- archer@twelfth.panem
- 42@galaxyguide.com
- pride.prejudice@longbourn.uk
- who@unit.uk
- littlewomen@orchardhouse.us
- moby.dick@pequod.sea

Per tutti gli utenti la password è **Bibliomap2026!**

Questa modalità è consigliata per una prova rapida delle principali funzionalità dell’applicazione, come gestione librerie, libri, prestiti, dashboard e suggerimenti.

## Registrazione di un nuovo utente

In alternativa, è possibile utilizzare il normale flusso di registrazione, che è pienamente operativo.

Il processo prevede:

1. Registrazione con username, email e password.
2. Invio di una mail contenente un codice OTP all’indirizzo inserito.
3. Conferma dell’account tramite OTP.
4. Eventuale impostazione della posizione sulla mappa al primo accesso.

## Nota importante sui cookie di sessione

Backend e frontend dell’applicazione sono deployati su infrastrutture gratuite e sono su domini differenti. In alcuni browser potrebbe essere necessario abilitare il consenso ai cookie cross-site affinché il login funzioni correttamente.

## Funzionalità verificabili durante la demo

Durante la prova dell’applicazione è possibile testare:

- Creazione e modifica di librerie personali.
- Aggiunta, modifica e visualizzazione dei libri.
- Ricerca libri con filtri.
- Sistema di prestiti con richieste, accettazione, restituzione e storico.
- Modalità light e dark.
- Navigazione su mappa e gestione della posizione.
- Gestione del profilo e delle impostazioni di visibilità.

L’applicazione è responsive e accessibile anche da dispositivi mobili.

## Installazione

Questa sezione descrive i passaggi necessari per configurare, installare e avviare l'applicazione sia in ambiente locale che tramite Docker.

### Prerequisiti

Prima di procedere, assicurarsi di avere installato:
- Node.js: Versione 20.0.0 o superiore.
- npm: Versione 10.0.0 o superiore.

e di avere una MapTiler API Key, una chiave API valida ottenibile da MapTiler Cloud, necessaria per il rendering delle mappe.

### Configurazione Ambiente

Il progetto utilizza variabili d'ambiente per la configurazione dei servizi esterni. Queste variabili vengono incorporate nell'applicazione durante la fase di build (o in modalità dev) da Vite.

Creare un file .env nella radice del progetto e impostare le seguenti variabili:

```code
# URL base delle API del backend
VITE_API_URL=http://localhost:8080/api

# Chiave API per il servizio mappe (MapTiler)
VITE_MAPTILER_KEY=la_tua_chiave_maptiler
```

### In locale

Per avviare l'applicazione in modalità di sviluppo locale:

1. Installazione delle dipendenze: Eseguire il comando per scaricare e installare i pacchetti necessari definiti nel package.json

```shell
    npm install
```

2. Avvio del server (l'applicazione sarà accessibile all'indirizzo mostrato nel terminale, localhost:5173):

```shell
    npm run dev
```

3. Compilazione, per generare i file statici ottimizzati nella cartella dist:

```shell
    npm run build
```

### Docker

Il progetto include un Dockerfile.Le variabili d'ambiente devono essere iniettate durante la fase di build dell'immagine, non all'avvio del container. Per questo motivo è necessario utilizzare i build-arg.

1. Costruzione dell'immagine, si deve eseguire il comando di build passando le variabili necessarie:

```shell
docker build \
  --build-arg VITE_API_URL=https://DOMINIO_BACKEND.com/api \
  --build-arg VITE_MAPTILER_KEY=chiave_maptiler \
  -t bibliomap-ui .
```

2. Avvio del container. Una volta creata l'immagine, avviare il container mappando la porta 80:

```shell
docker run -d -p 80:80 --name bibliomap-ui bibliomap-ui
```

## Struttura del progetto

```bash
src/
├── App.vue
├── assets
│   ├── global.css
│   ├── icons
│   │   └── bibliomapicon.png
│   └── light-bg.png
├── components
│   ├── AppFooter.vue
│   ├── AppHeader.vue
│   ├── AppModal.vue
│   ├── AppSidebar.vue
│   ├── GlobalStats.vue
│   ├── LibraryAccordion.vue
│   ├── MiniMap.vue
│   └── UserStats.vue
├── main.js
├── pages
│   ├── AboutPage.vue
│   ├── AddBookPage.vue
│   ├── BookEdit.vue
│   ├── BookPage.vue
│   ├── DashboardPage.vue
│   ├── HomePage.vue
│   ├── LibraryDetailsPage.vue
│   ├── LibraryEdit.vue
│   ├── LibraryPage.vue
│   ├── LoginPage.vue
│   ├── MyLibrariesPage.vue
│   ├── ProfilePage.vue
│   ├── SetLocationPage.vue
│   ├── SignupPage.vue
│   └── StatsPage.vue
├── router
│   └── index.js
├── services
│   ├── apiClient.js
│   └── scannerService.js
├── stores
│   └── authStore.js
└── utils
    ├── constants.js
    ├── helpers.js
    ├── legalTexts.js
    └── pdfGenerator.js
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
- [x] aggiungere utenti demo con password nel readme
- [ ] rel
