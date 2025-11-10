import { useAuthStore } from '@/stores/authStore'
import router from '@/router'

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
let authStore;

export function initApiClient() {
    authStore = useAuthStore();
}

/**
 * Funzione generica per eseguire richieste HTTP con gestione JWT e 401 (Logout)
 * @param {string} endpoint - L'endpoint da chiamare 
 */
async function apiFetch(endpoint, options = {}) {
    if (!authStore) {
        console.error("apiClient non è stato inizializzato!");
        initApiClient(); 
    }
    
    const url = `${API_BASE_URL}/api${endpoint}`;    

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: headers,
        });

        // Gestione 401
        if (response.status === 401) {
            authStore.logout();
            window.location.href = '/login'; 
            throw new Error('Unauthorized (401): Accesso non autorizzato.');
        }

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorMessage = `API Error ${response.status}: ${response.statusText}`;
            
            // Prova a leggere il corpo solo se è JSON
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorBody = await response.json();
                    errorMessage = errorBody.message || errorBody.details || errorMessage;
                } catch (parseError) {
                    // Se non riesce a parsare JSON, usa il messaggio di default
                    console.warn('Risposta errore non è JSON valido');
                }
            } else {
                // Se è HTML o altro, leggi come testo
                const errorText = await response.text();
                console.error('Errore backend (HTML):', errorText.substring(0, 200));
            }
            
            throw new Error(errorMessage);
        }

        const text = await response.text();
        
        // Verifica se il corpo è vuoto
        if (!text || text.trim().length === 0) {
            return null;
        }
        
        // Verifica se è JSON valido prima di parsare
        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error('Risposta non è JSON valido:', text.substring(0, 100));
            throw new Error('Risposta del server non valida (non JSON)');
        }

    } catch (error) {
        // Rilancia l'errore per gestirlo nel componente
        throw error;
    }
}


export const apiClient = {
    get: (endpoint, options = {}) => apiFetch(endpoint, { method: 'GET', ...options }),
    post: (endpoint, data, options = {}) => apiFetch(endpoint, { 
        method: 'POST', 
        body: JSON.stringify(data), 
        ...options 
    }),
};

export default apiClient;