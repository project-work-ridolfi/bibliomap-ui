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
- [Da Fare](./devnotes.md)

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
