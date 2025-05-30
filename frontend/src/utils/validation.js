/**
 * Valida o formato de um endereço de e-mail.
 * @param {string} email - O e-mail a ser validado.
 * @returns {boolean} - True se o e-mail for válido, False caso contrário.
 */
export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Valida se uma senha atende aos critérios mínimos (ex: pelo menos 6 caracteres).
 * @param {string} password - A senha a ser validada.
 * @returns {boolean} - True se a senha for válida, False caso contrário.
 */
export const validatePassword = (password) => {
  return password.length >= 6;
};

/**
 * Valida se dois campos de senha são idênticos.
 * @param {string} password - A primeira senha.
 * @param {string} confirmPassword - A senha de confirmação.
 * @returns {boolean} - True se as senhas coincidirem, False caso contrário.
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};