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
        
        // Se la risposta è 401, forziamo il logout (assumiamo token scaduto)
        if (response.status === 401) {
            authStore.logout();
            window.location.href = '/login'; 
            // Lanciamo un errore standard qui, il flusso si interrompe
            throw new Error('Unauthorized (401): Accesso non autorizzato o token scaduto.');
        }

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorBody = null;
            let errorMessage = `API Error ${response.status}: ${response.statusText}`;
            
            // Tentativo di leggere il corpo JSON (necessario per 403 con retry)
            if (contentType && contentType.includes('application/json')) {
                try {
                    errorBody = await response.json();
                    errorMessage = errorBody.message || errorBody.details || errorMessage;
                } catch (parseError) {
                    console.warn(`Risposta errore ${response.status} non è JSON valido o parsabile.`);
                }
            } else if (response.status !== 204) {
                 // Legge come testo per log di debug se non è JSON
                const errorText = await response.text();
                console.error('Errore backend (non JSON):', errorText.substring(0, 200));
            }
            
            // Lanciamo un oggetto Error che contiene lo status e il body JSON (se presente).
            const err = new Error(errorMessage);
            err.status = response.status;
            err.body = errorBody; 
            throw err;
        }

        const text = await response.text();
        
        // Verifica se il corpo è vuoto (es. 204 No Content)
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