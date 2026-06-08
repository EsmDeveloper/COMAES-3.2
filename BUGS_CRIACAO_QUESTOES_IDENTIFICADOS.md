# 🔴 BUGS CRÍTICOS - CRIAÇÃO DE QUESTÕES

**Data**: 7 de Junho de 2026  
**Severidade**: 🔴 CRÍTICA  
**Impacto**: Questões não são criadas, validação falha silenciosamente

---

## 🐛 BUG 1: Data Structure Mismatch - Opções (formato incorreto)

### Problema
- **Frontend**: Form envia `opcoes` como array de OBJETOS: `{ texto: '', correta: true, explicacao: '' }`
- **Backend**: Controller espera array de STRINGS para multipla_escolha e valida com `.includes(resposta_correta)`

```javascript
// Frontend envia isso:
opcoes: [
  { texto: 'A', correta: true, explicacao: 'Exp' },
  { texto: 'B', correta: false, explicacao: '' }
]

// Backend espera validar assim:
else if (!dados.opcoes.includes(dados.resposta_correta)) {
  erros.push('resposta_correta deve estar entre as opções disponíveis');
}
```

**Resultado**: Sempre falha na validação com `resposta_correta não está nas opções`

### Solução
- Converter frontend para enviar `opcoes` como array de strings
- Manter estrutura com `texto` localmente no form, mas enviar apenas os textos para API

---

## 🐛 BUG 2: Campo resposta_correta incorreto para múltipla escolha

### Problema
- **Frontend**: Form cria campo `resposta_correta` vazio string
- **Backend**: Valida como string, mas em múltipla escolha deveria ser a OPÇÃO correta

```javascript
// Form inicia assim:
resposta_correta: initialData?.resposta_correta || '',

// Backend valida:
if (!dados.resposta_correta) erros.push('resposta_correta é obrigatória');
```

**Resultado**: Campo fica vazio quando user marca checkbox "Correta" em opção

### Solução
- Inicializar `resposta_correta` com valor padrão da primeira opção
- Ao marcar opção como correta, atualizar `resposta_correta` para o texto dessa opção
- Enviar para API o TEXTO da opção correta, não um índice

---

## 🐛 BUG 3: Validação frontend não sincroniza com backend

### Problema
Form valida localmente mas não mapeia os mesmos campos para backend:
- Frontend valida `resposta_esperada` (texto aberto)
- Backend espera `resposta_correta` (string para qualquer tipo)

```javascript
// Frontend:
resposta_esperada: initialData?.resposta_esperada || '',

// Backend:
if (!dados.resposta_correta) erros.push('resposta_correta é obrigatória');
```

**Resultado**: Campo com nome errado não é enviado, backend rejeita

### Solução
- Renomear campo frontend de `resposta_esperada` para `resposta_correta`
- Usar mesmo nome para todos os tipos (múltipla, texto, código)

---

## 🐛 BUG 4: Disciplina não é definida quando admin cria

### Problema
- Admin cria questão sem que `disciplina` seja obrigatória no formulário
- Backend valida: `if (!dados.disciplina) erros.push('disciplina é obrigatória')`
- Admin não tem campo disciplina no form (supostamente)

**Resultado**: Questão não é criada, admin não sabe por que

### Solução
- Adicionar dropdown `disciplina` ao formulário
- Ou: Se admin, aceitar disciplina vazia e colocar como 'genérica'
- Ou: Fazer disciplina depender do contexto (colaborador tem sua, admin choose)

---

## 🐛 BUG 5: Endpoint discrepância /api/questoes vs /api/admin/questoes

### Problema
- Frontend (CreateQuestaoForm da Administrador): Envia para `/api/questoes` (relativo)
- AdminService.js usa baseURL `/api/admin/`
- Routes em backend: `POST /api/questoes` com middleware `canManageQuestoes`

**Resultado**: CreateQuestaoForm usa axios direto, ignora adminService, pode cair em CORS ou autenticação

### Solução
- Usar adminService para enviar (garante auth header + CORS)
- Ou: Verificar se axios.post direto tem Bearer token correto

---

## 🐛 BUG 6: Falta tratamento de erro na validação de opções

### Problema
Backend valida:
```javascript
if (!Array.isArray(dados.opcoes) || dados.opcoes.length === 0) {
  erros.push('Questão de múltipla escolha deve ter no mínimo 2 opções');
}
```

Mas se `dados.opcoes` vem como `null` ou `undefined`, erro está ERRADO (diz 2 opções quando deveria dizer 0)

**Resultado**: User confuso, mensagem de erro não faz sentido

### Solução
- Melhorar validação para diferenciar entre `null`, `[]`, e `[1 item]`
- Enviar mensagens claras

---

## 🐛 BUG 7: Validação de resposta_correta para múltipla escolha QUEBRADA

### Problema
Backend faz:
```javascript
else if (!dados.opcoes.includes(dados.resposta_correta)) {
  erros.push('resposta_correta deve estar entre as opções disponíveis');
}
```

Se `opcoes` é array de OBJETOS `{ texto: 'A', correta: true }` e `resposta_correta` é string `'A'`, `.includes()` NUNCA vai funcionar:
- `[{ texto: 'A' }].includes('A')` → **false**

**Resultado**: Questão SEMPRE falha validation para múltipla escolha

### Solução
- Extrair array de strings das opções: `opcoes.map(o => o.texto)` 
- Depois validar `.includes(resposta_correta)`
- Ou: Frontend envia `[{ texto: 'A', ... }, ...]` e backend extrai strings na validação

---

## 🐛 BUG 8: Middleware canManageQuestoes pode falhar silenciosamente

### Problema
```javascript
if (!dbUser) {
  return res.status(401).json({ message: 'Usuario nao encontrado.' });
}
```

Usuário pode estar deletado da DB mas token ainda válido. Error retorna 401 mas frontend mostra loading infinito se não trata.

**Resultado**: Form fica "salvando..." forever

### Solução
- Frontend precisa timeout no axios (atualmente nenhum)
- Backend precisa cacheamento de user validation

---

## 🐛 BUG 9: Opções formatação inconsistente (string vs object vs array)

### Problema
Sequelize pode retornar `opcoes` JSON como:
- String (em alguns drivers MySQL)
- Object/Array
- null

Nenhuma normalização no controller.

**Resultado**: Sometimes API retorna opcoes como string, frontend quebra

### Solução
- Backend: normalizar opcoes em controller.criar() e carregarQuiz()
- Frontend: sempre parsear como JSON antes de usar

---

## ✅ CORREÇÕES A IMPLEMENTAR

### Prioridade 1 (CRÍTICO - Bloqueia criação):
1. [ ] Bug 7: Validação opções quebrada
2. [ ] Bug 1: Data structure mismatch opções
3. [ ] Bug 2: resposta_correta vazio

### Prioridade 2 (ALTA - Confunde user):
4. [ ] Bug 3: Campo resposta_esperada vs resposta_correta
5. [ ] Bug 5: Endpoint discrepância
6. [ ] Bug 4: Disciplina não definida

### Prioridade 3 (MÉDIA - Edge cases):
7. [ ] Bug 6: Tratamento erro opções vazio
8. [ ] Bug 8: Timeout axios
9. [ ] Bug 9: Normalização opcoes

---

## 📊 MATRIZ DE TESTE

| Tipo | Caso | Esperado | Status |
|------|------|----------|--------|
| Múltipla Escolha | 2+ opções com correta | Criar com sucesso | 🔴 FALHA |
| Múltipla Escolha | 1 opção | Erro "mínimo 2" | 🔴 FALHA |
| Texto | Sem resposta_correta | Aviso ou aceitar vazio | ? |
| Código | Com linguagem | Criar com sucesso | ? |
| Sem Disciplina | Admin cria | ? | 🔴 FALHA |

---

