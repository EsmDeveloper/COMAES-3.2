# Guia de Testes - Sistema de Torneios

## 🎯 Objetivos de Teste

- [x] Validar torneios genéricos vs específicos
- [x] Validar bloqueio de participação simultânea
- [x] Validar expiração automática
- [x] Validar filtro de disciplinas

---

## 🧪 Cenários de Teste

### CENÁRIO 1: Torneio Genérico com Múltiplas Disciplinas

**Setup:**
```
1. Criar torneio:
   - Título: "Torneio Geral 2026"
   - tipo_torneio: "generico"
   - disciplina_especifica: NULL
   - Blocos associados:
     • Matemática: 2 blocos (Básico, Avançado)
     • Inglês: 1 bloco (Intermediário)
     • Programação: 0 blocos
```

**Testes:**

| # | Ação | Esperado | Status |
|---|------|----------|--------|
| 1.1 | GET /api/torneios/ativo/disciplinas | `["Matemática", "Inglês"]` (sem Programação) | ✓ |
| 1.2 | Frontend mostra 2 cards (Math, Eng) | Programação não aparece | ✓ |
| 1.3 | Usuário A clica em Matemática | Modal abre normalmente | ✓ |
| 1.4 | Usuário A confirma entrada | Redireciona para torneio Math | ✓ |

---

### CENÁRIO 2: Torneio Específico - Uma Disciplina

**Setup:**
```
1. Criar torneio:
   - Título: "Torneio de Matemática"
   - tipo_torneio: "especifico"
   - disciplina_especifica: "Matemática"
   - Blocos associados: 3 blocos de Matemática
```

**Testes:**

| # | Ação | Esperado | Status |
|---|------|----------|--------|
| 2.1 | GET /api/torneios/ativo/disciplinas | `["Matemática"]` | ✓ |
| 2.2 | Frontend mostra 1 card (Math) | Apenas Matemática disponível | ✓ |
| 2.3 | Usuário B entra em torneio (Math) | Inscrição bem-sucedida | ✓ |
| 2.4 | Verificar: POST /api/participantes/registrar com disciplina "Inglês" | ERRO 400: "Este torneio é específico para Matemática" | ✓ |

---

### CENÁRIO 3: Participação Simultânea Bloqueada

**Setup:**
```
1. Torneio A: Genérico, termina em 1 hora
2. Torneio B: Genérico, termina em 2 horas (começa depois de A)
3. Usuário C: Sem torneio ativo
```

**Testes:**

| # | Ação | Esperado | Status |
|---|------|----------|--------|
| 3.1 | Usuário C entra em Torneio A (Matemática) | Inscrição OK, participacao-ativa = true | ✓ |
| 3.2 | Verificar: GET /api/tournaments/usuario/C/participacao-ativa | `{ ativo: true, torneio: {...} }` | ✓ |
| 3.3 | Usuário C tenta entrar em Torneio B (Inglês) | ERRO 409: "Já participando de Torneio A" | ✓ |
| 3.4 | Simular término de Torneio A (termina_em = agora) | posicao_congelada = true | ✓ |
| 3.5 | GET /api/tournaments/usuario/C/participacao-ativa | `{ ativo: false }` | ✓ |
| 3.6 | Usuário C tenta entrar em Torneio B | Inscrição OK (não há conflito) | ✓ |

---

### CENÁRIO 4: Expiração Automática

**Setup:**
```
1. Torneio expirado:
   - status: "ativo"
   - termina_em: "2026-06-09T09:00:00" (5 minutos atrás)
   - Participantes: 10 usuários confirmados
```

**Testes:**

| # | Ação | Esperado | Status |
|---|------|----------|--------|
| 4.1 | GET /api/torneios/ativo (1.ª vez) | `{ ativo: false, expirou_automaticamente: true }` | ✓ |
| 4.2 | Verificar BD: Torneio.status | Mudou para "finalizado" | ✓ |
| 4.3 | Verificar BD: ParticipanteTorneio.posicao_congelada | Todos = true | ✓ |
| 4.4 | Usuário D tenta entrar no torneio expirado | ERRO 400: "Torneio expirou" | ✓ |
| 4.5 | GET /api/torneios/ativo/disciplinas | `{ ativo: false }` ou lista vazia | ✓ |

---

### CENÁRIO 5: Filtro de Disciplinas sem Blocos

**Setup:**
```
1. Torneio Genérico:
   - tipo_torneio: "generico"
   - Blocos:
     • Matemática: 0 blocos
     • Inglês: 2 blocos
     • Programação: 1 bloco
```

**Testes:**

| # | Ação | Esperado | Status |
|---|------|----------|--------|
| 5.1 | GET /api/torneios/ativo/disciplinas | `["Inglês", "Programação"]` (sem Math) | ✓ |
| 5.2 | Frontend renderiza 2 cards | Matemática não aparece | ✓ |
| 5.3 | Inspecionar dados da API | `disciplinas: ["Inglês", "Programação"]` | ✓ |

---

### CENÁRIO 6: Compatibilidade com Admin Desativar Torneio

**Setup:**
```
1. Torneio Ativo: Torneio C (tipo genérico)
2. Admin quer criar Torneio D novo
```

**Testes:**

| # | Ação | Esperado | Status |
|---|------|----------|--------|
| 6.1 | Admin vai criar novo torneio | Sistema avisa: "Torneio C ainda ativo" | ✓ |
| 6.2 | Admin finaliza Torneio C manualmente | status = "finalizado" | ✓ |
| 6.3 | Admin cria Torneio D novo | Operação bem-sucedida | ✓ |
| 6.4 | GET /api/torneios/ativos (máximo 1) | Apenas Torneio D retorna | ✓ |

---

## 🔍 Verificações Técnicas

### Banco de Dados

```sql
-- Verificar torneios genéricos
SELECT id, titulo, tipo_torneio, disciplina_especifica, status
FROM torneios
WHERE tipo_torneio = 'generico';

-- Verificar participantes ativos
SELECT usuario_id, torneio_id, disciplina_competida, posicao_congelada
FROM participantes_torneios
WHERE status = 'confirmado' AND posicao_congelada = false;

-- Verificar rankings congelados
SELECT usuario_id, torneio_id, posicao, posicao_congelada, tempo_congelamento
FROM participantes_torneios
WHERE posicao_congelada = true;
```

### Logs Backend

Procurar por:
```
[TorneioController] Criando torneio com dados: { tipo_torneio, disciplina_especifica }
✅ NOVO: Validar tipo_torneio
❄️ Congelando ranking do torneio
⏰ Torneio expirou automaticamente. Finalizando...
```

### Console Frontend

```javascript
// DevTools → Console
// Procurar por:
console.log('📋 Disciplinas disponíveis:', disciplinasData);
console.log('🎯 Torneio específico para:', disciplinaEspecifica);
console.log('🌐 Disciplinas genéricas disponíveis:', disciplinasData.disciplinas);
```

---

## 📊 Casos Edge/Limite

### Edge Case 1: Torneio com Data Exatamente Agora

```
termina_em: 2026-06-09T09:30:00.000Z
now:        2026-06-09T09:30:00.000Z (momento exato)

Esperado: torneio AINDA ativo (now <= fim, não >)
```

**Teste:**
```bash
# Criar torneio com termina_em = agora
# GET /api/torneios/ativo dentro de 1 segundo
# Deve retornar { ativo: true }
```

### Edge Case 2: Transição 23:59 → 00:00

```
Usuário A entra em torneio 23:59:58
Torneio termina 23:59:59
Mudança de dia 00:00:00
Usuário B tenta entrar

Esperado: User B recebe "Torneio expirou"
```

### Edge Case 3: Usuário em Múltiplos Blocos do Mesmo Torneio

```
Caso: Usuário tenta:
1. Inscrever em Matemática (Torneio A)
2. Inscrever em Inglês (Torneio A)

Esperado: 
- OK para (1)
- ERRO 409 para (2) porque já participa de Torneio A
```

**Teste:**
```sql
SELECT COUNT(*) as inscricoes
FROM participantes_torneios
WHERE usuario_id = 'USER_X'
AND status = 'confirmado'
AND posicao_congelada = false;
-- Deve retornar sempre ≤ 1 por torneio diferente
```

---

## 🚀 Protocolo de Teste Manual

### Pré-requisitos
- [ ] Banco de dados sincronizado
- [ ] Backend rodando (`npm start`)
- [ ] Frontend rodando (`npm run dev`)
- [ ] Usuário teste criado e autenticado
- [ ] 2+ torneios criados (genérico e específico)

### Execução

**Passo 1: Teste Genérico**
```
1. Abrir http://localhost:5173/entrar-no-torneio
2. Verificar que apenas disciplinas com blocos aparecem
3. Clicar em uma
4. Confirmar entrada
5. Verificar redireccionamento correto
```

**Passo 2: Teste Participação Dupla**
```
1. Enquanto em Torneio A, abrir nova aba
2. Tentar entrar em Torneio B
3. Verificar mensagem de erro
4. Fechar aba de Torneio A (ou esperar terminar)
5. Tentar novamente em Torneio B
6. Deve funcionar
```

**Passo 3: Teste Expiração**
```
1. Criar torneio com termina_em = -1 minuto
2. Tentar entrar
3. Verificar erro "expirou"
4. Ir para admin, ver status = "finalizado"
```

---

## 📝 Relatório de Teste

Após completar todos os testes, preencher:

```
Data: [DATA]
Testador: [NOME]
Build: COMAES 3.2

Resultado Geral: ✅ PASSOU / ❌ FALHOU / ⚠️  PARCIAL

Detalhes:
- Cenário 1 (Genérico): [RESULTADO]
- Cenário 2 (Específico): [RESULTADO]
- Cenário 3 (Simultânea): [RESULTADO]
- Cenário 4 (Expiração): [RESULTADO]
- Cenário 5 (Filtro): [RESULTADO]
- Cenário 6 (Admin): [RESULTADO]

Problemas encontrados:
[LISTAR]

Recomendações:
[LISTAR]

Assinado: ________________________
```

---

## 🎓 Documentação Relacionada

- `CORRECOES_TORNEIOS_SISTEMA_FINAL.md` - Detalhes técnicos completos
- `MUDANCAS_TORNEIOS_RESUMO.txt` - Resumo visual das mudanças
- Código-fonte:
  - `BackEnd/controllers/TorneoController.js` (inscreverParticipante)
  - `BackEnd/index.js` (endpoints /api/torneios/ativo e /disciplinas)
  - `FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx` (filtro)

---

**Versão:** 1.0  
**Criado:** 09 de Junho de 2026  
**Status:** Pronto para Teste
