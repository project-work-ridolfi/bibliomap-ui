/**
 * verifica se la stringa fornita è un formato email valido.
 * @param {string} email - stringa da validare
 * @returns {boolean} - true se il formato è valido
 */
export function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}