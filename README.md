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
- [ ] create library
- [ ] add book
- [ ] password dimenticata
- [ ] metriche utilizzo
- [ ] cambia visibilità
- [ ] gestione profilo
- [ ] home
- [ ] left handle bar
- [ ] header
- [ ] css - fonts - notte
- [ ] footer
- [ ] modale richiesta libro
