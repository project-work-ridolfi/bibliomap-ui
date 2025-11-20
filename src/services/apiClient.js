import { useAuthStore } from '@/stores/authStore'
import router from '@/router' 

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Funzione generica per eseguire richieste HTTP con gestione JWT e 401 (Logout).
 * @param {string} endpoint - L'endpoint da chiamare 
 */
async function apiFetch(endpoint, options = {}) {
    
    const authStore = useAuthStore();
    
    const url = `${API_BASE_URL}/api${endpoint}`;    

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: headers,
            credentials: 'include'
        });
        
        
        // 401 forza logout e reindirizzamento
        if (response.status === 401) {
            authStore.logout();
            window.location.href = '/login'; 
            throw new Error('Unauthorized (401): accesso non autorizzato o token scaduto.');
        }

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorBody = null;
            let errorMessage = `API Error ${response.status}: ${response.statusText}`;
            
            // legge corpo errore come JSON se possibile
            if (contentType && contentType.includes('application/json')) {
                try {
                    errorBody = await response.json();
                    errorMessage = errorBody.message || errorBody.details || errorMessage;
                } catch (parseError) {
                    console.warn(`risposta errore ${response.status} non è json valido o parsabile.`);
                }
            } else if (response.status !== 204) {
                const errorText = await response.text();
                console.error('errore backend (non json):', errorText.substring(0, 200));
            }
            
            // rilancia errore con dettagli
            const err = new Error(errorMessage);
            err.status = response.status;
            err.body = errorBody; 
            throw err;
        }

        const text = await response.text();
        
        // se 204 No Content o corpo vuoto
        if (!text || text.trim().length === 0) {
            return null;
        }
        
        // Verifica se è JSON valido prima di parsare
        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error('risposta non è json valido:', text.substring(0, 100));
            throw new Error('risposta server non valida (non json)');
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