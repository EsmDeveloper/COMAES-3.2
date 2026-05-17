/**
 * Módulo de Validação - Contexto Angola
 * Foco em regras estritas baseadas no padrão angolano.
 */

// Regex rigoroso para telemóveis de Angola (Unitel, Movicel, Africell)
// Formato: +244 seguido de 9, depois 1,2,3,4,5 ou 9, e depois 7 dígitos.
const ANGOLA_PHONE_REGEX = /^\+2449[123459][0-9]{7}$/;

// Regex para Bilhete de Identidade Angolano (Padrão Antigo e Novo)
// Normalmente 9 números + 2 letras + 3 números, ou 14 caracteres variados dependendo da província
const ANGOLA_BI_REGEX = /^[0-9]{9}[A-Z]{2}[0-9]{3}$/;

/**
 * Valida o número de telefone de acordo com operadoras de Angola
 * @param {string} phone - O número a validar (ex: +244923123456)
 * @returns {boolean} - Verdadeiro se for válido
 */
const isValidAngolaPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    // Remover espaços em branco no início e fim
    const cleanPhone = phone.trim();
    return ANGOLA_PHONE_REGEX.test(cleanPhone);
};

/**
 * Retorna qual a operadora baseada no prefixo (útil para auditoria ou segmentação)
 * @param {string} phone 
 * @returns {string|null} - 'Unitel', 'Movicel', 'Africell' ou null
 */
const getOperator = (phone) => {
    if (!isValidAngolaPhone(phone)) return null;
    const prefix = phone.substring(4, 6); // ex: '92'
    
    if (['92', '93', '94'].includes(prefix)) return 'Unitel';
    if (['91', '99'].includes(prefix)) return 'Movicel';
    if (['95'].includes(prefix)) return 'Africell';
    
    return 'Desconhecida';
};

/**
 * Valida o Bilhete de Identidade Nacional
 * @param {string} bi 
 * @returns {boolean}
 */
const isValidBI = (bi) => {
    if (!bi || typeof bi !== 'string') return false;
    return ANGOLA_BI_REGEX.test(bi.trim().toUpperCase());
};

/**
 * Valida textos comuns rejeitando caracteres HTML ou comandos SQL (Whitelist básica)
 * Permite Letras (incluindo acentos PT-PT), Números, Espaços e Pontuação básica
 * @param {string} text 
 * @param {number} minLength 
 * @param {number} maxLength 
 * @returns {boolean}
 */
const isValidSafeText = (text, minLength = 2, maxLength = 255) => {
    if (!text || typeof text !== 'string') return false;
    
    const cleanText = text.trim();
    if (cleanText.length < minLength || cleanText.length > maxLength) return false;

    // Rejeita qualquer texto que contenha < > { } ; ' "
    const dangerousChars = /[<>{};'"]/;
    if (dangerousChars.test(cleanText)) return false;

    // Whitelist de caracteres seguros
    const safeTextRegex = /^[a-zA-Z0-9À-ÖØ-öø-ÿ\s\-\.,!?()]+$/;
    return safeTextRegex.test(cleanText);
};

/**
 * Validação segura de E-mail
 * @param {string} email 
 * @returns {boolean}
 */
const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    
    // Expressão regular RFC 5322 simplificada
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Valida o Nome Completo (Pelo menos duas palavras, não pode ser só números)
 * @param {string} name 
 * @returns {boolean}
 */
const isValidFullName = (name) => {
    if (!name || typeof name !== 'string') return false;
    const cleanName = name.trim();
    
    // Deve ter pelo menos duas palavras
    const words = cleanName.split(/\s+/);
    if (words.length < 2) return false;
    
    // Pelo menos uma das palavras deve conter letras (não pode ser apenas números)
    const hasLettersRegex = /[a-zA-ZÀ-ÖØ-öø-ÿ]/;
    if (!hasLettersRegex.test(cleanName)) return false;

    // Deve passar no teste básico de segurança de texto (tamanho e caracteres perigosos)
    return isValidSafeText(cleanName, 5, 255);
};

export {
    isValidAngolaPhone,
    getOperator,
    isValidBI,
    isValidSafeText,
    isValidFullName,
    isValidEmail
};
