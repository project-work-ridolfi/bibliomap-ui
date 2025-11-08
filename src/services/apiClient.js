import { useAuthStore } from '@/stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Funzione generica per eseguire richieste HTTP con gestione JWT e 401 (Logout)
 * @param {string} endpoint - L'endpoint da chiamare 
 * @param {object} options - Opzioni Fetch (method, body, headers, ecc.)
 * @returns {Promise<any>} Il body della risposta parsato come JSON
 */
async function apiFetch(endpoint, options = {}) {
    const authStore = useAuthStore();
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Aggiunge l'header Content-Type se non specificato
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    // Aggiunge JWT 
    if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`;
    }

 try {
        const response = await fetch(url, {
            ...options,
            headers: headers,
        });

        // Gestione 401 (Unauthorized)
        if (response.status === 401) {
            authStore.logout();
            window.location.href = '/login'; 
            throw new Error('Unauthorized (401): Accesso non autorizzato.');
        }

        // Controllo Risposta Generica non OK 
        if (!response.ok) {
            const errorBody = await response.text();
            // Lancia un errore con il corpo della risposta (se disponibile) per il debug
            throw new Error(`API Error ${response.status}: ${errorBody.substring(0, 100) || response.statusText}`);
        }

        // Parsa la risposta JSON 
        const text = await response.text();
        
        // Questo è il punto cruciale: verifica se il corpo non è vuoto prima di parsare
        return text ? JSON.parse(text) : null; 

    } catch (error) {
        throw error;
    }
}


export const apiClient = {
    get: (endpoint, options = {}) => apiFetch(endpoint, { method: 'GET', ...options }),
    // TODO: Aggiungere altri metodi (post, put, delete)
};

export default apiClient;