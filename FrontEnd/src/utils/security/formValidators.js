/**
 * Frontend Validation Utils - Contexto Angola
 * Partilha as mesmas expressões regulares que o backend para garantir coerência.
 */

export const regexes = {
    angolaPhone: /^\+2449[123459][0-9]{7}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    safeText: /^[a-zA-Z0-9À-ÖØ-öø-ÿ\s\-\.,!?()]+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/,
    fullNameLetters: /[a-zA-ZÀ-ÖØ-öø-ÿ]/
};

/**
 * Valida telemóvel Angolano
 * @param {string} phone 
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validatePhone = (phone) => {
    if (!phone) return { isValid: false, error: "O número de telefone é obrigatório." };
    if (!regexes.angolaPhone.test(phone.trim())) {
        return { isValid: false, error: "Formato inválido. Use +244 seguido de 9 dígitos de operadoras válidas (Unitel, Movicel, Africell)." };
    }
    return { isValid: true, error: null };
};

/**
 * Valida Email
 * @param {string} email 
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateEmail = (email) => {
    if (!email) return { isValid: false, error: "O e-mail é obrigatório." };
    if (!regexes.email.test(email.trim())) {
        return { isValid: false, error: "Insira um formato de e-mail válido." };
    }
    return { isValid: true, error: null };
};

/**
 * Valida Senha (Letras, símbolos e pelo menos um número)
 * @param {string} password 
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validatePassword = (password) => {
    if (!password) return { isValid: false, error: "A palavra-passe é obrigatória." };
    if (!regexes.password.test(password)) {
        return { 
            isValid: false, 
            error: "A senha deve ter 8+ caracteres e conter obrigatoriamente: letras, símbolos e números." 
        };
    }
    return { isValid: true, error: null };
};

/**
 * Valida o Nome Completo (Nome e Sobrenome, sem apenas números)
 * @param {string} text 
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateFullName = (text) => {
    if (!text || text.trim().split(/\s+/).length < 2) {
        return { isValid: false, error: "Insira o nome e o sobrenome (pelo menos duas palavras)." };
    }
    if (!regexes.fullNameLetters.test(text)) {
        return { isValid: false, error: "O nome não pode ser constituído apenas por números." };
    }
    return validateSafeText(text, "Nome completo", 5, 255);
};

/**
 * Validação Genérica para campos de Texto, prevenindo caracteres perigosos
 * @param {string} text 
 * @param {string} fieldName 
 * @param {number} min 
 * @param {number} max 
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateSafeText = (text, fieldName = "Campo", min = 2, max = 255) => {
    if (!text || text.trim().length < min) {
        return { isValid: false, error: `${fieldName} deve ter no mínimo ${min} caracteres.` };
    }
    if (text.length > max) {
        return { isValid: false, error: `${fieldName} excede o limite de ${max} caracteres.` };
    }
    if (!regexes.safeText.test(text)) {
        return { isValid: false, error: `${fieldName} contém caracteres inválidos. Evite usar símbolos como < > { } ;` };
    }
    return { isValid: true, error: null };
};
