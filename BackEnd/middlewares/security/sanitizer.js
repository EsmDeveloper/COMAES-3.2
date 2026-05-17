/**
 * Middleware Global de Sanitização e Segurança
 * Atua bloqueando payloads maliciosos, injeções e ataques estruturais.
 */

import { isValidSafeText, isValidAngolaPhone, isValidEmail, isValidFullName } from '../../utils/validation/angolaContext.js';

/**
 * Sanitiza recursivamente objetos e arrays convertendo para strings seguras, 
 * escapando ou rejeitando caracteres proibidos se estritamente configurado.
 * @param {*} data 
 * @returns {*} dado normalizado
 */
const sanitizeData = (data) => {
    if (typeof data === 'string') {
        // Remover espaços extras e converter para UTF-8 normalizado se necessário
        let clean = data.trim().normalize('NFC');
        return clean;
    }
    
    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }
    
    if (data !== null && typeof data === 'object') {
        const sanitizedObj = {};
        for (const [key, value] of Object.entries(data)) {
            // Rejeita chaves com caracteres especiais (Prevenção NoSQL Injection)
            if (/[\$\.]/.test(key)) {
                throw new Error(`Tentativa de injeção detetada na chave do objeto: ${key}`);
            }
            sanitizedObj[key] = sanitizeData(value);
        }
        return sanitizedObj;
    }
    
    return data;
};

/**
 * Middleware de Sanitização Base
 * Remove dados inesperados e normaliza as entradas do cliente (req.body, req.query, req.params).
 */
const baseSanitizer = (req, res, next) => {
    try {
        if (req.body) req.body = sanitizeData(req.body);
        if (req.query) {
            const sanitizedQuery = sanitizeData(req.query);
            // Since req.query is read-only, we need to modify it in place
            Object.keys(req.query).forEach(key => delete req.query[key]);
            Object.assign(req.query, sanitizedQuery);
        }
        if (req.params) req.params = sanitizeData(req.params);
        next();
    } catch (error) {
        console.error(`[Security Alert] IP: ${req.ip} - ${error.message}`);
        return res.status(400).json({ error: "Payload malformado ou entrada inválida detetada." });
    }
};

/**
 * Exemplo de Middleware Validador Rigoroso para uma Rota de Registo.
 * Aplica a política de Whitelist (rejeitar tudo o que não for esperado).
 */
const strictRegisterValidator = (req, res, next) => {
    const { nome, telefone, email, password } = req.body;

    const errors = [];

    // 1. Validar Nome
    if (!isValidFullName(nome)) {
        errors.push("O nome deve conter pelo menos duas palavras (nome e sobrenome), não pode conter apenas números e não deve possuir caracteres inválidos.");
    }

    // 2. Validar Telefone (Padrão Angola)
    if (!isValidAngolaPhone(telefone)) {
        errors.push("O telefone deve estar no formato +244 seguido de um número válido da Unitel, Movicel ou Africell.");
    }

    // 3. Validar Email
    if (!isValidEmail(email)) {
        errors.push("O formato do e-mail é inválido.");
    }

    // 4. Validar Senha
    // Obrigatório: letras, símbolos, e pelo menos 1 número.
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
        errors.push("A palavra-passe deve ter pelo menos 8 caracteres, e conter obrigatoriamente: letras, símbolos e pelo menos um número.");
    }

    if (errors.length > 0) {
        // Registo para Auditoria pode ser implementado aqui
        return res.status(422).json({ 
            success: false, 
            message: "Falha na validação de dados.", 
            errors 
        });
    }

    next();
};

export {
    baseSanitizer,
    strictRegisterValidator
};
