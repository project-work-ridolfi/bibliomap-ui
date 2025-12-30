/**
 * verifica se la stringa fornita è un formato email valido.
 * @param {string} email - stringa da validare
 * @returns {boolean} - true se il formato è valido
 */
export function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

import { apiClient } from "@/services/apiClient";

/**
 * Configurazione dei testi per le modali di eliminazione
 */
export const deleteConfig = {
    library: {
        title: "Elimina libreria",
        message: (name) => `Sei sicuro di voler eliminare la libreria "${name}"?
        Questa azione cancellerà anche tutti i libri contenuti al suo interno.`,
        confirmBtn: "elimina definitivamente",
        successMsg: "libreria eliminata con successo."
    },
    book: {
        title: "Rimuovi libro",
        message: (title) => `Vuoi rimuovere definitivamente "${title}" dalla tua collezione?`,
        confirmBtn: "elimina",
        successMsg: "libro rimosso correttamente."
    }
};

/**
 * Logica di chiamata API centralizzata
 */
export const executeDeletion = async (type, id) => {
    const endpoint = type === 'library' ? `/libraries/${id}` : `/copies/${id}`;
    try {
        await apiClient.delete(endpoint);
        return { success: true };
    } catch (error) {
        console.error(`errore eliminazione ${type}:`, error);
        return { 
            success: false, 
            error: error.body?.message || "non è stato possibile completare l'operazione." 
        };
    }
};