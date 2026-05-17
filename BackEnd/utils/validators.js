/**
 * Módulo de Validação Centralizado
 * Engenheiro de Software: Validação de Dados em Sistemas Web
 * 
 * Este módulo contém todas as validações usadas no sistema,
 * garantindo consistência entre frontend e backend.
 */

// ============================================
// REGEX DEFINITIONS
// ============================================

/**
 * Nome Regex: Permite apenas letras (incluindo acentos) e espaços
 * - ^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$ = Apenas letras e espaços
 * - \d+ = rejeita sequências só de números
 */
export const NAME_REGEX = {
    // Regex principal: apenas letras e espaços
    pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/,
    // Regex que detecta números no meio do nome
    hasNumbers: /\d/,
    // Regex que detecta caracteres especiais
    hasSpecialChars: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    // Regex para espaços apenas
    onlySpaces: /^\s*$/,
    // Mensagem de erro
    message: 'Nome inválido. Use apenas letras e espaços.'
};

/**
 * Email Regex: Padrão RFC simplificado mas seguro
 * - ^[^@]+ = Anything before @
 * - @ = literal @
 * - [A-Za-z0-9.-]+ = domain name
 * - \. = literal dot
 * - [A-Za-z]{2,}$ = TLD with at least 2 chars
 */
export const EMAIL_REGEX = {
    // Regex principal para validação de email
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    // Domínios comuns digitados errado
    invalidDomains: /@(gmai|gmal|gmial|gmaill|hotmal|hotmial|outlok|yaho|yhoo)\.com$/i,
    // Email com @@
    doubleAt: /@{2,}/,
    // Email começa ou termina com @
    startsOrEndsWithAt: /^@|@$/,
    // Apenas espaços
    onlySpaces: /^\s*$/,
    // Mensagem de erro
    message: 'Email inválido. Introduza um email válido.'
};

/**
 * Password Regex: Padrão seguro
 * - ^(?=.*[a-z]) = pelo menos uma minúscula
 * - (?=.*[A-Z]) = pelo menos uma maiúscula
 * - (?=.*\d) = pelo menos um número
 * - (?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]) = pelo menos um caractere especial
 * - .{8,}$ = mínimo 8 caracteres
 */
export const PASSWORD_REGEX = {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
    onlySpaces: /^\s*$/,
    message: 'A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.'
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Valida o nome do usuário
 * @param {string} nome - Nome a validar
 * @returns {object} - { valid: boolean, error: string | null }
 */
export function validateNome(nome) {
    // Verifica se está vazio ou apenas espaços
    if (!nome || NAME_REGEX.onlySpaces.test(nome)) {
        return { valid: false, error: 'O nome é obrigatório.' };
    }
    
    // Faz trim para remover espaços extras
    const nomeTrimmed = nome.trim();
    
    // Verifica se tem apenas letras e espaços
    if (!NAME_REGEX.pattern.test(nomeTrimmed)) {
        return { valid: false, error: NAME_REGEX.message };
    }
    
    // Verifica se não contém números
    if (NAME_REGEX.hasNumbers.test(nomeTrimmed)) {
        return { valid: false, error: 'O nome não pode conter números.' };
    }
    
    // Verifica se não contém caracteres especiais
    if (NAME_REGEX.hasSpecialChars.test(nomeTrimmed)) {
        return { valid: false, error: 'O nome não pode conter caracteres especiais.' };
    }
    
    // Verifica comprimento mínimo (2 caracteres)
    if (nomeTrimmed.length < 2) {
        return { valid: false, error: 'O nome deve ter pelo menos 2 caracteres.' };
    }
    
    return { valid: true, error: null };
}

/**
 * Valida o email do usuário
 * @param {string} email - Email a validar
 * @returns {object} - { valid: boolean, error: string | null }
 */
export function validateEmail(email) {
    // Verifica se está vazio ou apenas espaços
    if (!email || EMAIL_REGEX.onlySpaces.test(email)) {
        return { valid: false, error: 'O email é obrigatório.' };
    }
    
    // Faz trim para remover espaços extras
    const emailTrimmed = email.trim();
    
    // Verifica formato básico
    if (!EMAIL_REGEX.pattern.test(emailTrimmed)) {
        return { valid: false, error: EMAIL_REGEX.message };
    }
    
    // Verifica se não tem @@
    if (EMAIL_REGEX.doubleAt.test(emailTrimmed)) {
        return { valid: false, error: 'Email inválido. O formato não é válido.' };
    }
    
    // Verifica se não começa ou termina com @
    if (EMAIL_REGEX.startsOrEndsWithAt.test(emailTrimmed)) {
        return { valid: false, error: 'Email inválido. O formato não é válido.' };
    }
    
    // Verifica domínios digitados errado
    if (EMAIL_REGEX.invalidDomains.test(emailTrimmed)) {
        return { valid: false, error: 'Domínio de email inválido. Verifique o domínio.' };
    }
    
    return { valid: true, error: null };
}

/**
 * Valida a senha do usuário
 * @param {string} password - Senha a validar
 * @returns {object} - { valid: boolean, error: string | null }
 */
export function validatePassword(password) {
    // Verifica se está vazio ou apenas espaços
    if (!password || PASSWORD_REGEX.onlySpaces.test(password)) {
        return { valid: false, error: 'A senha é obrigatória.' };
    }
    
    // Verifica padrão de senha forte
    if (!PASSWORD_REGEX.pattern.test(password)) {
        return { valid: false, error: PASSWORD_REGEX.message };
    }
    
    return { valid: true, error: null };
}

/**
 * Valida todos os campos de uma vez
 * @param {object} data - Dados do usuário { nome, email, password }
 * @returns {object} - { valid: boolean, errors: object }
 */
export function validateUserData(data) {
    const errors = {};
    let isValid = true;
    
    // Valida nome
    if (data.nome !== undefined) {
        const nomeResult = validateNome(data.nome);
        if (!nomeResult.valid) {
            errors.nome = nomeResult.error;
            isValid = false;
        }
    }
    
    // Valida email
    if (data.email !== undefined) {
        const emailResult = validateEmail(data.email);
        if (!emailResult.valid) {
            errors.email = emailResult.error;
            isValid = false;
        }
    }
    
    // Valida senha
    if (data.password !== undefined) {
        const passwordResult = validatePassword(data.password);
        if (!passwordResult.valid) {
            errors.password = passwordResult.error;
            isValid = false;
        }
    }
    
    return { valid: isValid, errors };
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
    validateNome,
    validateEmail,
    validatePassword,
    validateUserData,
    NAME_REGEX,
    EMAIL_REGEX,
    PASSWORD_REGEX
};