<template>
  <div
    class="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in text-theme-main font-sans">
    <!-- Alert rosso con i prestiti scaduti in entrata e uscita -->
    <div
      v-if="overdueLoans.length > 0 || overdueLentBooks.length > 0"
      class="bg-red-100 dark:bg-red-900/20 border-2 border-red-500 p-6 rounded-2xl space-y-4">
      <h3
        class="text-red-700 dark:text-red-400 font-black flex items-center gap-2 tracking-tighter uppercase text-sm">
        <i class="fa-solid fa-triangle-exclamation"></i> azioni urgenti
        richieste
      </h3>

      <!-- Libri che l'utente deve restituire ai proprietari -->
      <div v-if="overdueLoans.length > 0" class="space-y-2">
        <p class="text-[10px] font-bold text-red-600 uppercase tracking-widest">
          Libri che devi restituire:
        </p>
        <div
          v-for="loan in overdueLoans"
          :key="loan.id"
          class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <p class="text-sm font-bold text-red-800 dark:text-red-300">
            devi restituire
            <router-link
              :to="`/books/${loan.copyId}`"
              class="italic hover:underline"
              >{{ loan.title }}</router-link
            >
            (scaduto il {{ formatDate(loan.expectedReturnDate) }})
          </p>
          <button
            @click="openContactModal(loan)"
            class="mt-3 md:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-red-700 transition">
            contatta proprietario
          </button>
        </div>
      </div>

      <!-- Libri che l'utente ha prestato e sono scaduti -->
      <div v-if="overdueLentBooks.length > 0" class="space-y-2">
        <p class="text-[10px] font-bold text-red-600 uppercase tracking-widest">
          Libri che hai prestato e sono scaduti:
        </p>
        <div
          v-for="loan in overdueLentBooks"
          :key="loan.id"
          class="flex flex-col md:flex-row justify-between items-start md:items-center bg-theme-primary p-4 rounded-xl border border-red-300 dark:border-red-800 shadow-sm">
          <p class="text-sm font-bold text-gray-900 dark:text-red-300">
            <router-link
              :to="`/profile/${loan.requesterId}`"
              class="underline text-gray-900 dark:text-red-300"
              >{{ loan.requesterUsername }}</router-link
            >
            ha ancora <span class="italic">"{{ loan.title }}"</span> (doveva
            rientrare il {{ formatDate(loan.expectedReturnDate) }})
          </p>
          <div class="flex gap-2 mt-3 md:mt-0">
            <button
              @click="openContactModal(loan)"
              class="bg-red-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-red-700 transition">
              sollecita
            </button>
            <button
              @click="openExtendModal(loan)"
              class="bg-paynes-gray text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:opacity-90 transition">
              allunga
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Header della dashboard con titolo e pulsante aggiungi libro -->
    <div
      class="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-thistle pb-6">
      <div>
        <h1 class="text-5xl font-display text-theme-main">
          Centro <span class="text-zomp">operativo</span>
        </h1>
        <p class="opacity-60 text-sm">
          Gestisci i tuoi scambi e le tue letture in corso
        </p>
      </div>
      <router-link
        to="/add-book"
        class="bg-zomp text-white px-5 py-2.5 rounded-xl font-bold text-[10px] shadow-md hover:opacity-90 transition flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> nuovo libro
      </router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-3 space-y-10">
        <!-- Sezione richieste di prestito in sospeso -->
        <section
          v-if="pendingRequests.length > 0"
          class="bg-tea-rose/10 border-l-4 border-tea-rose p-6 rounded-r-2xl space-y-4">
          <h3
            class="font-display text-m text-theme-main flex items-center gap-2">
            <i class="fa-solid fa-bell text-tea-rose"></i> Nuove richieste di
            prestito:
          </h3>
          <div class="space-y-3">
            <div
              v-for="req in pendingRequests"
              :key="req.id"
              class="flex justify-between items-center bg-theme-primary p-4 rounded-xl shadow-sm border border-thistle gap-4">
              <div
                class="flex flex-1 justify-between items-center min-w-0 mr-2">
                <p class="text-sm truncate">
                  <router-link
                    :to="`/profile/${req.requesterId}`"
                    class="font-bold hover:text-zomp"
                    >{{ req.requesterUsername }}</router-link
                  >
                  vorrebbe leggere
                  <router-link
                    :to="`/books/${req.copyId}`"
                    class="italic text-zomp hover:underline"
                    >{{ req.title }}</router-link
                  >
                </p>
                <!-- Badge quando ci sono richieste concorrenti per lo stesso libro -->
                <span
                  v-if="duplicateRequests[req.copyId] > 1"
                  class="shrink-0 text-[8px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse uppercase ml-4">
                  Richiesta concorrente
                </span>
              </div>
              <button
                @click="openManageModal(req)"
                class="shrink-0 bg-zomp text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase">
                gestisci
              </button>
            </div>
          </div>
        </section>

        <!-- Sezione scambi già accettati in attesa di conferma -->
        <section
          v-if="acceptedLoans.length > 0"
          class="bg-zomp/10 border-l-4 border-zomp p-6 rounded-r-2xl space-y-4">
          <h3
            class="font-display text-m text-theme-main flex items-center gap-2">
            <i class="fa-solid fa-handshake text-zomp"></i> Scambi da
            confermare:
          </h3>
          <div class="space-y-3">
            <div
              v-for="loan in acceptedLoans"
              :key="loan.id"
              class="flex justify-between items-center bg-theme-primary p-4 rounded-xl shadow-sm border border-thistle">
              <p class="text-sm">
                <!-- Mostra testo diverso se sono il proprietario o il richiedente -->
                <template v-if="loan.ownerId === userData?.id">
                  Conferma la consegna di
                  <router-link
                    :to="`/books/${loan.copyId}`"
                    class="font-bold hover:text-zomp"
                    >{{ loan.title }}</router-link
                  >
                  a
                  <router-link
                    :to="`/profile/${loan.requesterId}`"
                    class="text-zomp hover:underline"
                    >{{ loan.requesterUsername }}</router-link
                  >
                </template>
                <template v-else>
                  Hai ricevuto
                  <router-link
                    :to="`/books/${loan.copyId}`"
                    class="font-bold hover:text-zomp"
                    >{{ loan.title }}</router-link
                  >
                  da
                  <router-link
                    :to="`/profile/${loan.ownerId}`"
                    class="text-zomp hover:underline"
                    >{{ loan.ownerUsername }}</router-link
                  >
                </template>
              </p>
              <button
                @click="openExchangeModal(loan)"
                class="bg-zomp text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase">
                conferma
              </button>
            </div>
          </div>
        </section>

        <!-- Carousel scorrevole dei libri che l'utente sta attualmente leggendo -->
        <section class="space-y-4">
          <div
            class="flex justify-between items-center border-b border-thistle pb-2">
            <h3 class="text-xl font-display text-theme-main">Stai leggendo:</h3>
            <div v-if="borrowedBooks.length > 3" class="flex gap-2">
              <button
                @click="prevBorrowed"
                :disabled="borrowedIndex === 0"
                class="p-1 disabled:opacity-20 hover:text-zomp transition">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <button
                @click="nextBorrowed"
                :disabled="borrowedIndex >= borrowedBooks.length - 3"
                class="p-1 disabled:opacity-20 hover:text-zomp transition">
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div
            v-if="borrowedBooks.length === 0"
            class="text-sm opacity-40 italic py-4">
            nessun prestito attivo in entrata
          </div>
          <div v-else class="relative overflow-hidden">
            <div
              class="flex transition-transform duration-500 ease-in-out gap-4"
              :style="{
                transform: `translateX(-${borrowedIndex * (100 / 3 + 0.5)}%)`,
              }">
              <div
                v-for="loan in borrowedBooks"
                :key="loan.id"
                class="w-full md:w-[calc(33.333%-11px)] shrink-0 bg-theme-primary p-5 rounded-xl shadow-sm border border-thistle flex flex-col justify-between min-h-[160px]">
                <div>
                  <router-link
                    :to="`/books/${loan.copyId}`"
                    class="block truncate">
                    <h4
                      class="font-bold text-zomp text-lg leading-tight hover:underline">
                      {{ loan.title }}
                    </h4>
                  </router-link>
                  <p class="text-[10px] opacity-60">
                    Proprietario:
                    <router-link
                      :to="`/profile/${loan.ownerId}`"
                      class="hover:text-zomp"
                      >{{ loan.ownerUsername }}</router-link
                    >
                  </p>
                </div>
                <div
                  class="mt-4 flex justify-between items-end pt-3 border-t border-thistle/50">
                  <div class="min-w-0">
                    <p class="text-[8px] font-black opacity-40 uppercase">
                      scadenza
                    </p>
                    <!-- Data di scadenza evidenziata in rosso se scaduta -->
                    <p
                      class="text-xs font-mono"
                      :class="
                        isOverdue(loan.expectedReturnDate)
                          ? 'text-red-500 font-bold'
                          : ''
                      ">
                      {{ formatDate(loan.expectedReturnDate) }}
                    </p>
                  </div>
                  <button
                    @click="openContactModal(loan)"
                    class="text-[9px] font-bold border border-thistle px-2 py-1.5 rounded-lg hover:bg-ash-gray/20 uppercase">
                    Contatta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Carousel scorrevole dei libri che l'utente ha prestato ad altri -->
        <section class="space-y-4">
          <div
            class="flex justify-between items-center border-b border-thistle pb-2">
            <h3 class="text-xl font-display text-theme-main">Hai prestato:</h3>
            <div v-if="lentBooks.length > 3" class="flex gap-2">
              <button
                @click="prevLent"
                :disabled="lentIndex === 0"
                class="p-1 disabled:opacity-20 hover:text-zomp transition">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <button
                @click="nextLent"
                :disabled="lentIndex >= lentBooks.length - 3"
                class="p-1 disabled:opacity-20 hover:text-zomp transition">
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div
            v-if="lentBooks.length === 0"
            class="text-sm opacity-40 italic py-4">
            non hai libri attualmente in prestito ad altri
          </div>
          <div v-else class="relative overflow-hidden">
            <div
              class="flex transition-transform duration-500 ease-in-out gap-4"
              :style="{
                transform: `translateX(-${lentIndex * (100 / 3 + 0.5)}%)`,
              }">
              <div
                v-for="loan in lentBooks"
                :key="loan.id"
                :class="
                  isOverdue(loan.expectedReturnDate)
                    ? 'border-red-400 bg-red-50/30 dark:bg-red-900/10'
                    : 'border-thistle'
                "
                class="w-full md:w-[calc(33.333%-11px)] shrink-0 bg-theme-primary p-5 rounded-xl shadow-sm border flex flex-col justify-between min-h-[160px]">
                <div>
                  <div class="flex justify-between items-start">
                    <router-link
                      :to="`/books/${loan.copyId}`"
                      class="block flex-1 truncate">
                      <h4
                        class="font-bold text-theme-main text-lg leading-tight hover:text-zomp">
                        {{ loan.title }}
                      </h4>
                    </router-link>
                    <!-- Badge rosso evidenzia prestiti scaduti -->
                    <span
                      v-if="isOverdue(loan.expectedReturnDate)"
                      class="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded uppercase font-black"
                      >scaduto</span
                    >
                  </div>
                  <p class="text-[10px] opacity-60">
                    Lettore:
                    <router-link
                      :to="`/profile/${loan.requesterId}`"
                      class="hover:text-zomp"
                      >{{ loan.requesterUsername }}</router-link
                    >
                  </p>
                </div>
                <div
                  class="mt-4 flex flex-col gap-2 pt-3 border-t border-thistle/50">
                  <button
                    @click="openReturnModal(loan)"
                    class="w-full bg-zomp text-white py-2 rounded-lg font-bold text-[9px] uppercase shadow-sm">
                    segnala rientro
                  </button>
                  <button
                    @click="openExtendModal(loan)"
                    class="w-full border border-thistle text-theme-main py-2 rounded-lg font-bold text-[9px] uppercase opacity-70">
                    allunga scadenza
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Sezione storico prestiti conclusi o rifiutati -->
        <section class="space-y-6 pt-10 border-t border-thistle/30">
          <div class="flex justify-between items-center pb-2">
            <h3
              class="text-xl font-display text-theme-main opacity-50 uppercase tracking-widest">
              Attività passate
            </h3>
            <div v-if="loanHistory.length > 6" class="flex gap-2">
              <button
                @click="prevHistory"
                :disabled="historyIndex === 0"
                class="p-1 disabled:opacity-20 hover:text-zomp transition">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <button
                @click="nextHistory"
                :disabled="historyIndex >= loanHistory.length - 6"
                class="p-1 disabled:opacity-20 hover:text-zomp transition">
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div
            v-if="loanHistory.length === 0"
            class="text-xs opacity-40 italic py-4">
            Nessuna operazione archiviata.
          </div>
          <div v-else class="relative overflow-hidden">
            <div
              class="flex transition-transform duration-500 ease-in-out gap-4"
              :style="{
                transform: `translateX(-${(historyIndex / 6) * 100}%)`,
              }">
              <div
                v-for="(chunk, idx) in historyChunks"
                :key="idx"
                class="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="h in chunk"
                  :key="h.id"
                  class="p-4 bg-theme-secondary/40 rounded-2xl border border-thistle/30 flex flex-col justify-between gap-4">
                  <div class="flex justify-between items-start gap-4">
                    <div class="flex flex-col min-w-0">
                      <router-link
                        :to="`/books/${h.copyId}`"
                        class="group truncate block">
                        <span
                          class="font-bold uppercase text-xs text-theme-main group-hover:text-zomp"
                          >{{ h.title }}</span
                        >
                      </router-link>
                      <span class="text-[10px] opacity-60 italic mt-1"
                        >{{
                          h.status === "REJECTED" ? "Rifiutata" : "Conclusa"
                        }}
                        il {{ formatDate(h.updatedAt) }}</span
                      >
                    </div>
                    <span
                      class="text-[9px] font-black uppercase px-2 py-1 rounded-md"
                      :class="
                        h.status === 'REJECTED'
                          ? 'text-red-500 bg-red-500/10'
                          : 'text-zomp bg-zomp/10'
                      ">
                      {{
                        h.ownerId === userData?.id
                          ? h.status === "REJECTED"
                            ? "Hai rifiutato"
                            : "Hai prestato"
                          : "Hai letto"
                      }}
                    </span>
                  </div>
                  <div
                    class="flex justify-between items-center pt-3 border-t border-thistle/20">
                    <p class="text-[10px] opacity-60">
                      {{ h.ownerId === userData?.id ? "A: " : "Da: " }}
                      <router-link
                        :to="`/profile/${
                          h.ownerId === userData?.id ? h.requesterId : h.ownerId
                        }`"
                        class="underline hover:text-zomp">
                        {{
                          h.ownerId === userData?.id
                            ? h.requesterUsername
                            : h.ownerUsername
                        }}
                      </router-link>
                    </p>
                    <!-- Pulsante per richiedere di nuovo lo stesso libro -->
                    <button
                      v-if="h.requesterId === userData?.id"
                      @click="router.push(`/books/${h.copyId}`)"
                      class="text-[9px] font-bold text-zomp hover:underline flex items-center gap-1 uppercase">
                      <i class="fa-solid fa-rotate-right"></i> Chiedi di nuovo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar con navigazione veloce e info privacy -->
      <aside class="lg:col-span-1 space-y-6">
        <section
          class="bg-theme-primary p-6 rounded-2xl shadow-md border border-thistle space-y-6">
          <h3
            class="font-display text-s text-center text-zomp tracking-widest border-b border-thistle pb-2 uppercase">
            Navigazione
          </h3>
          <nav class="flex flex-col gap-3">
            <router-link :to="`/profile/${userData?.id}`" class="nav-link"
              ><i class="fa-solid fa-id-card"></i> Il tuo profilo</router-link
            >
            <router-link to="/libraries" class="nav-link"
              ><i class="fa-solid fa-book-bookmark"></i> Le tue
              librerie</router-link
            >
            <router-link to="/stats" class="nav-link"
              ><i class="fa-solid fa-chart-pie"></i> Tutte le
              statistiche</router-link
            >
            <router-link to="/map" class="nav-link"
              ><i class="fa-solid fa-map-location-dot"></i> Esplora la
              mappa</router-link
            >
          </nav>
        </section>

        <!-- Card info visibilità profilo corrente -->
        <section
          v-if="userData"
          class="p-5 bg-ash-gray/10 rounded-2xl border border-dashed border-thistle text-[10px]">
          <p class="font-black opacity-40 mb-2 uppercase">Privacy Corrente</p>
          <p class="font-bold text-theme-main">
            Visibilità:
            <span class="text-zomp">{{
              formatVisibility(userData.visibility)
            }}</span>
          </p>
          <p class="opacity-60 mt-1 leading-tight">
            Puoi cambiare chi vede la tua posizione nelle impostazioni del
            profilo.
          </p>
        </section>
      </aside>
    </div>

    <!-- Modale per gestire richieste di prestito o contattare utenti -->
    <AppModal
      :is-open="isManageModalOpen"
      :title="modalTitle"
      @close="isManageModalOpen = false">
      <div class="p-6 space-y-6 text-theme-main bg-theme-primary rounded-xl">
        <!-- Avviso quando ci sono richieste concorrenti -->
        <div
          v-if="
            modalForm.action === 'ACCEPT' &&
            duplicateRequests[selectedRequest?.copyId] > 1
          "
          class="px-2 animate-fade-in">
          <p
            class="text-[11px] text-amber-600 dark:text-amber-400 font-bold leading-tight">
            <i class="fa-solid fa-triangle-exclamation mr-1"></i>
            ATTENZIONE: Accettando questa richiesta, le altre
            {{ duplicateRequests[selectedRequest.copyId] - 1 }} richieste
            pendenti verranno rifiutate automaticamente.
          </p>
        </div>

        <!-- Pulsanti accetta/rifiuta visibili solo se non in modalità contatto -->
        <div v-if="!isContactMode" class="flex gap-4">
          <button
            @click="modalForm.action = 'ACCEPT'"
            :class="
              modalForm.action === 'ACCEPT'
                ? 'bg-zomp text-white border-zomp'
                : 'bg-theme-primary border-border-color text-theme-main'
            "
            class="flex-1 py-3 rounded-xl font-bold transition border-2 uppercase text-xs tracking-widest">
            accetta
          </button>
          <button
            @click="modalForm.action = 'REJECT'"
            :class="
              modalForm.action === 'REJECT'
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-theme-primary border-border-color text-theme-main'
            "
            class="flex-1 py-3 rounded-xl font-bold transition border-2 uppercase text-xs tracking-widest">
            rifiuta
          </button>
        </div>

        <!-- Field messaggio con warning privacy -->
        <div class="space-y-2">
          <label
            class="text-[10px] font-black opacity-40 tracking-widest uppercase"
            >messaggio per l'utente</label
          >
          <textarea
            v-model="modalForm.notes"
            class="w-full p-3 bg-theme-primary border border-thistle rounded-xl outline-none text-sm text-theme-main"
            rows="3"
            placeholder="Scrivi qui..."></textarea>
          <p class="text-[9px] text-gray-500 italic leading-tight">
            <i class="fa-solid fa-shield-halved mr-1"></i> Attenzione: i
            messaggi verranno inviati via email. Evita di condividere dati
            sensibili per la tua privacy.
          </p>
        </div>

        <!-- Selezione giorni e orari disponibili per lo scambio -->
        <div
          v-if="modalForm.action === 'ACCEPT' || isContactMode"
          class="space-y-4">
          <label
            class="text-[10px] font-black opacity-40 tracking-widest uppercase"
            >proponi disponibilità per lo scambio</label
          >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="day in days"
              :key="day"
              @click="toggleDay(day)"
              :class="
                modalForm.selectedDays.includes(formatDayFull(day))
                  ? 'bg-zomp text-white border-zomp'
                  : 'bg-theme-secondary border-thistle text-theme-main'
              "
              class="px-3 py-1 border rounded-full text-[10px] font-bold transition uppercase">
              {{ day }}
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="slot in timeSlots"
              :key="slot"
              @click="toggleSlot(slot)"
              :class="
                modalForm.selectedSlots.includes(slot)
                  ? 'bg-zomp text-white border-zomp'
                  : 'bg-theme-secondary border-thistle text-theme-main'
              "
              class="p-2 border rounded-lg text-[10px] font-bold text-left transition uppercase">
              {{ slot }}
            </button>
          </div>
        </div>

        <!-- Pulsanti submit e annulla -->
        <div class="flex gap-3 pt-2">
          <button
            @click="isManageModalOpen = false"
            class="flex-1 py-4 border border-border-color rounded-xl font-bold uppercase text-xs">
            Annulla
          </button>
          <button
            @click="handleModalSubmit"
            :disabled="isProcessing || (!isContactMode && !modalForm.action)"
            class="flex-1 bg-zomp text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 uppercase tracking-widest text-xs">
            {{
              isProcessing
                ? "Invio..."
                : isContactMode
                ? "Invia Messaggio"
                : "Invia Risposta"
            }}
          </button>
        </div>
      </div>
    </AppModal>

    <!-- Modale per confermare l'avvio dello scambio -->
    <AppModal
      :is-open="isExchangeModalOpen"
      title="Conferma Consegna"
      @close="isExchangeModalOpen = false">
      <div
        class="p-6 space-y-6 text-theme-main bg-theme-primary rounded-xl text-center">
        <div
          class="w-16 h-16 bg-zomp/10 rounded-full flex items-center justify-center mx-auto text-zomp">
          <i class="fa-solid fa-handshake text-3xl"></i>
        </div>
        <p class="text-sm">
          Stai confermando che lo scambio di
          <strong>"{{ selectedLoan?.title }}"</strong> è avvenuto con successo.
        </p>
        <div class="flex gap-3">
          <button
            @click="isExchangeModalOpen = false"
            class="flex-1 py-3 border border-border-color rounded-xl font-bold uppercase text-xs">
            Annulla
          </button>
          <button
            @click="executeExchange"
            :disabled="isProcessing"
            class="flex-1 py-3 bg-zomp text-white rounded-xl font-bold shadow-lg uppercase text-xs tracking-widest disabled:opacity-50">
            {{ isProcessing ? "Attendere..." : "Conferma Scambio" }}
          </button>
        </div>
      </div>
    </AppModal>

    <!-- Modale per registrare la restituzione di un libro e aggiornarne la condizione -->
    <AppModal
      :is-open="isReturnModalOpen"
      title="Conferma Restituzione"
      @close="isReturnModalOpen = false">
      <div class="p-6 space-y-6 text-theme-main bg-theme-primary rounded-xl">
        <p class="text-sm">
          Il libro è tornato? Aggiorna la condizione attuale della copia.
        </p>
        <select
          v-model="returnForm.condition"
          class="w-full p-3 bg-theme-primary border border-thistle rounded-xl text-sm text-theme-main outline-none">
          <option
            v-for="opt in conditionOptions"
            :key="opt.value"
            :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <div class="flex gap-3">
          <button
            @click="isReturnModalOpen = false"
            class="flex-1 py-4 border border-border-color rounded-xl font-bold uppercase text-xs">
            Annulla
          </button>
          <button
            @click="confirmReturn"
            :disabled="isProcessing"
            class="flex-1 bg-zomp text-white py-4 rounded-xl font-bold shadow-lg uppercase text-xs tracking-widest disabled:opacity-50">
            {{ isProcessing ? "Invio..." : "Conferma Rientro" }}
          </button>
        </div>
      </div>
    </AppModal>

    <!-- Modale per estendere la scadenza di un prestito -->
    <AppModal
      :is-open="isExtendModalOpen"
      title="Allunga Prestito"
      @close="isExtendModalOpen = false">
      <div class="p-6 space-y-6 text-theme-main bg-theme-primary rounded-xl">
        <p class="text-sm">Di quanti giorni vuoi estendere il prestito?</p>
        <select
          v-model.number="extendForm.days"
          class="w-full p-3 bg-theme-primary border border-thistle rounded-xl text-sm text-theme-main outline-none">
          <option :value="3">3 giorni</option>
          <option :value="7">1 settimana</option>
          <option :value="14">2 settimane</option>
          <option :value="30">1 mese</option>
        </select>
        <div class="flex gap-3">
          <button
            @click="isExtendModalOpen = false"
            class="flex-1 py-4 border border-border-color rounded-xl font-bold uppercase text-xs">
            Annulla
          </button>
          <button
            @click="confirmExtension"
            :disabled="isProcessing"
            class="flex-1 bg-paynes-gray text-white py-4 rounded-xl font-bold shadow-lg uppercase text-xs tracking-widest disabled:opacity-50">
            {{ isProcessing ? "Invio..." : "Conferma Estensione" }}
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import { apiClient } from "@/services/apiClient";
import AppModal from "@/components/AppModal.vue";
import { useRouter } from "vue-router";
import { CONDITIONS } from "@/utils/constants.js";

const router = useRouter();
const userData = ref(null);
const activeLoans = ref([]);
const pendingRequests = ref([]);
const acceptedLoans = ref([]);
const loanHistory = ref([]);
const borrowedIndex = ref(0);
const lentIndex = ref(0);
const historyIndex = ref(0);

// Stato di apertura/chiusura delle modali
const isManageModalOpen = ref(false);
const isContactMode = ref(false);
const isExchangeModalOpen = ref(false);
const isReturnModalOpen = ref(false);
const isExtendModalOpen = ref(false);
const isProcessing = ref(false);

const selectedRequest = ref(null);
const selectedLoan = ref(null);

// Dati della modale gestione richieste
const modalForm = reactive({
  action: "",
  notes: "",
  selectedDays: [],
  selectedSlots: [],
});

// Dati della modale restituzione
const returnForm = reactive({ condition: "great" });

// Dati della modale estensione prestito
const extendForm = reactive({ days: 7 });

// Opzioni giorni e orari per lo scambio
const days = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];
const timeSlots = [
  "mattina 08-12",
  "pranzo 12-14",
  "pomeriggio 14-18",
  "sera 18-20",
];
const conditionOptions = CONDITIONS;

// Calcola il numero di richieste concorrenti per ogni copia
const duplicateRequests = computed(() => {
  const counts = {};
  pendingRequests.value.forEach((r) => {
    counts[r.copyId] = (counts[r.copyId] || 0) + 1;
  });
  return counts;
});

// Libri che l'utente sta attualmente leggendo (prestiti in entrata)
const borrowedBooks = computed(() =>
  activeLoans.value.filter(
    (l) => l.requesterId === userData.value?.id && l.status === "ON_LOAN"
  )
);

// Libri che l'utente ha prestato ad altri (prestiti in uscita)
const lentBooks = computed(() =>
  activeLoans.value.filter(
    (l) => l.ownerId === userData.value?.id && l.status === "ON_LOAN"
  )
);

// Prestiti in entrata scaduti
const overdueLoans = computed(() =>
  borrowedBooks.value.filter((l) => isOverdue(l.expectedReturnDate))
);

// Prestiti in uscita scaduti
const overdueLentBooks = computed(() =>
  lentBooks.value.filter((l) => isOverdue(l.expectedReturnDate))
);

// Dividi lo storico in chunk di 6 per la paginazione
const historyChunks = computed(() => {
  const chunks = [];
  for (let i = 0; i < loanHistory.value.length; i += 6) {
    chunks.push(loanHistory.value.slice(i, i + 6));
  }
  return chunks;
});

// Titolo modale dinamico basato su modalità (gestione o contatto)
const modalTitle = computed(() =>
  isContactMode.value ? "Contatta utente" : "Gestione richiesta"
);

// Converte abbreviazione giorno in nome completo
function formatDayFull(s) {
  return (
    {
      lun: "lunedì",
      mar: "martedì",
      mer: "mercoledì",
      gio: "giovedì",
      ven: "venerdì",
      sab: "sabato",
      dom: "domenica",
    }[s] || s
  );
}

// Aggiunge o rimuove un giorno dalla selezione
function toggleDay(d) {
  const full = formatDayFull(d);
  const i = modalForm.selectedDays.indexOf(full);
  i === -1
    ? modalForm.selectedDays.push(full)
    : modalForm.selectedDays.splice(i, 1);
}

// Aggiunge o rimuove uno slot orario dalla selezione
function toggleSlot(s) {
  const i = modalForm.selectedSlots.indexOf(s);
  i === -1
    ? modalForm.selectedSlots.push(s)
    : modalForm.selectedSlots.splice(i, 1);
}

onMounted(async () => {
  await fetchUserMe();
  await refreshAll();
});

// Carica tutti i dati della dashboard
async function refreshAll() {
  await Promise.all([
    fetchIncomingRequests(),
    fetchActiveLoans(),
    fetchAcceptedLoans(),
    fetchLoanHistory(),
  ]);
}

// Carica dati dell'utente loggato
async function fetchUserMe() {
  try {
    userData.value = await apiClient.get("/users/me");
  } catch (e) {}
}

// Carica richieste di prestito in sospeso ricevute
async function fetchIncomingRequests() {
  try {
    pendingRequests.value =
      (await apiClient.get("/loan/requests/incoming")) || [];
  } catch (e) {}
}

// Carica prestiti attivi (ON_LOAN) in entrata e uscita
async function fetchActiveLoans() {
  try {
    activeLoans.value = (await apiClient.get("/loan/active")) || [];
  } catch (e) {}
}

// Carica prestiti accettati in attesa di conferma dello scambio
async function fetchAcceptedLoans() {
  try {
    const all = await apiClient.get("/loan/all");
    acceptedLoans.value = all.filter((l) => l.status === "ACCEPTED");
  } catch (e) {}
}

// Carica storico prestiti conclusi o rifiutati ordinati per data
async function fetchLoanHistory() {
  try {
    const allLoans = await apiClient.get("/loan/all");
    loanHistory.value = allLoans
      .filter((l) => ["RETURNED", "REJECTED"].includes(l.status))
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  } catch (e) {}
}

// Apre modale per confermare scambio avvenuto
function openExchangeModal(loan) {
  selectedLoan.value = loan;
  isExchangeModalOpen.value = true;
}

// Invia conferma scambio al backend
async function executeExchange() {
  if (!selectedLoan.value || isProcessing.value) return;
  isProcessing.value = true;
  try {
    await apiClient.post(`/loan/${selectedLoan.value.id}/start`);
    isExchangeModalOpen.value = false;
    await refreshAll();
  } catch (e) {
    alert("Errore durante l'avvio del prestito");
  } finally {
    isProcessing.value = false;
  }
}

// Invia conferma restituzione libro con condizione aggiornata
async function confirmReturn() {
  if (isProcessing.value) return;
  isProcessing.value = true;
  try {
    await apiClient.post(`/loan/${selectedLoan.value.id}/return`, {
      condition: returnForm.condition,
    });
    isReturnModalOpen.value = false;
    await refreshAll();
  } catch (e) {
  } finally {
    isProcessing.value = false;
  }
}

// Invia richiesta estensione prestito
async function confirmExtension() {
  if (isProcessing.value) return;
  isProcessing.value = true;
  try {
    await apiClient.patch(`/loan/${selectedLoan.value.id}/extend`, {
      days: extendForm.days,
    });
    isExtendModalOpen.value = false;
    await fetchActiveLoans();
  } catch (e) {
  } finally {
    isProcessing.value = false;
  }
}

// Gestione submit modale: accettazione, rifiuto o contatto
async function handleModalSubmit() {
  if (isProcessing.value) return;

  const payload = {
    notes: modalForm.notes,
    days: modalForm.selectedDays.join(", "),
    slots: modalForm.selectedSlots.join(", "),
  };

  isProcessing.value = true;

  try {
    if (isContactMode.value) {
      await apiClient.post(
        `/loan/${selectedRequest.value.id}/contact`,
        payload
      );
    } else {
      await apiClient.patch(`/loan/${selectedRequest.value.id}/status`, {
        ...payload,
        action: modalForm.action,
      });
    }
    // Chiusura immediata lato client per evitare doppi click
    isManageModalOpen.value = false;
    await refreshAll();
  } catch (e) {
    alert(e.message || "Errore durante l'operazione");
  } finally {
    isProcessing.value = false;
  }
}

// Apre modale gestione richiesta di prestito ricevuta
function openManageModal(req) {
  selectedRequest.value = req;
  isContactMode.value = false;
  Object.assign(modalForm, {
    action: "",
    notes: "",
    selectedDays: [],
    selectedSlots: [],
  });
  isManageModalOpen.value = true;
}

// Apre modale per contattare un utente
function openContactModal(loan) {
  selectedRequest.value = loan;
  isContactMode.value = true;
  Object.assign(modalForm, {
    action: "",
    notes: "",
    selectedDays: [],
    selectedSlots: [],
  });
  isManageModalOpen.value = true;
}

// Apre modale per registrare restituzione libro
function openReturnModal(loan) {
  selectedLoan.value = loan;
  isReturnModalOpen.value = true;
}

// Apre modale per estendere scadenza prestito
function openExtendModal(loan) {
  selectedLoan.value = loan;
  extendForm.days = 7;
  isExtendModalOpen.value = true;
}

// Controlla se una data è scaduta
const isOverdue = (d) => (d ? new Date(d) < new Date() : false);

// Formatta una data in locale italiano
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("it-IT") : "-");

// Converte codice visibilità in etichetta leggibile
const formatVisibility = (v) =>
  ({ all: "Tutti", logged_in: "Registrati", private: "Privato" }[v] ||
  "Privato");

// Paginazione carousel libri in lettura
function nextBorrowed() {
  if (borrowedIndex.value < borrowedBooks.value.length - 3)
    borrowedIndex.value++;
}
function prevBorrowed() {
  if (borrowedIndex.value > 0) borrowedIndex.value--;
}

// Paginazione carousel libri prestati
function nextLent() {
  if (lentIndex.value < lentBooks.value.length - 3) lentIndex.value++;
}
function prevLent() {
  if (lentIndex.value > 0) lentIndex.value--;
}

// Paginazione storico prestiti
function nextHistory() {
  if (historyIndex.value < loanHistory.value.length - 6)
    historyIndex.value += 6;
}
function prevHistory() {
  if (historyIndex.value > 0) historyIndex.value -= 6;
}
</script>

<style scoped>
/* Stile link navigazione sidebar con hover effect */
.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 11px;
  color: var(--theme-main);
  border: 1px solid transparent;
  transition: all 0.2s;
}
.nav-link:hover {
  background: var(--zomp);
  color: white;
  transform: translateX(5px);
}
.nav-link i {
  opacity: 0.5;
  width: 16px;
}
.nav-link:hover i {
  opacity: 1;
}
</style>
