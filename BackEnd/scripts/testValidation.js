/**
 * Script Rápido para testar o sistema de validação (Backend)
 * Para executar: node BackEnd/scripts/testValidation.js
 */

import { isValidAngolaPhone, isValidSafeText, isValidEmail } from '../utils/validation/angolaContext.js';
import { strictRegisterValidator, baseSanitizer } from '../middlewares/security/sanitizer.js';

console.log("=== INICIANDO TESTES DE SEGURANÇA (CONTEXTO ANGOLA) ===\n");

// 1. Testes de Telefone
console.log("--- Testando Telefones ---");
const testPhones = [
    { num: "+244923123456", desc: "Unitel (Válido)" },
    { num: "+244912123456", desc: "Movicel (Válido)" },
    { num: "+244951123456", desc: "Africell (Válido)" },
    { num: "+244981123456", desc: "Prefixo Inválido (98)" },
    { num: "923123456", desc: "Falta Código País (+244)" },
    { num: "+24492312345", desc: "Dígitos a menos" },
];

testPhones.forEach(t => {
    console.log(`[${isValidAngolaPhone(t.num) ? 'PASSOU' : 'BLOQUEADO'}] ${t.desc}: ${t.num}`);
});

console.log("\n--- Testando Textos Seguros (Anti-XSS / SQLi) ---");
const testTexts = [
    { text: "João Manuel Goulart", desc: "Nome Normal (Válido)" },
    { text: "João <script>alert(1)</script>", desc: "Ataque XSS Básico" },
    { text: "N'golo Kanté", desc: "Aspas Simples (Potencial SQLi/Bloqueado)" },
    { text: "SELECT * FROM users", desc: "Texto inofensivo mas estranho (Válido se não usar aspas/ponto e vírgula, mas vamos ver o nosso validador)" },
    { text: "DROP TABLE;--", desc: "Tentativa de injeção" }
];

testTexts.forEach(t => {
    console.log(`[${isValidSafeText(t.text) ? 'PASSOU' : 'BLOQUEADO'}] ${t.desc}: ${t.text}`);
});

console.log("\n=== TESTES CONCLUÍDOS ===");
