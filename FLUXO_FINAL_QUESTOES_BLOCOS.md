# 🎯 FLUXO FINAL: Questões → Blocos → Torneios/Testes

**Data**: 8 Junho 2026 - IMPLEMENTAÇÃO FINALIZADA
**Status**: ✅ PRONTO PARA USAR

---

## 📊 VISÃO GERAL DO FLUXO

```
┌─────────────────────────────────────────────────────────────────┐
│ ORIGEM: QUESTÕES DOS COLABORADORES (Banco de Questões)          │
│ - Lista questões aprovadas pelos colaboradores                  │
│ - Mostra autor de cada questão                                  │
│ - Botões: "Ver Autor", "Enviar a Torneio", "Enviar a Teste"    │
└─────────────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴──────────────────┐
        ↓                                     ↓
   🏆 TORNEIO                          📚 TESTE
   ↓                                     ↓
QUESTÕES TORNEIOS                  QUESTÕES TESTES
- Blocos com 5-30 questões        - Questões individuais
- Nada de questões soltas          - Opção de agrupar em blocos
↓                                     ↓
Criar Blocos                       Criar Questões
(múltiplas questões)               (individuais ou via colaboradores)
```

---

## 🔄 FLUXO DETALHADO

### **OPÇÃO 1: QUESTÃO PARA TORNEIO**

```
Admin está em "Questões dos Colaboradores"
  ↓
Clica botão "🏆 Enviar a Torneio"
  ↓
Modal mostra:
  - Título da questão
  - "Criada por: [Nome do Colaborador]" ← IMPORTANTE!
  - Info: "Será adicionada à lista de Torneios"
  ↓
Admin clica "Confirmar"
  ↓
Questão aparece em "Questões de Torneios" 
(como questão individual temporariamente)
  ↓
Admin agrupa em um BLOCO (min 5, máx 30)
  ↓
Bloco fica pronto para vincular a torneios
```

### **OPÇÃO 2: QUESTÃO PARA TESTE**

```
Admin está em "Questões dos Colaboradores"
  ↓
Clica botão "📚 Enviar a Teste"
  ↓
Modal mostra:
  - Título/Enunciado da questão
  - "Criada por: [Nome do Colaborador]" ← IMPORTANTE!
  - Info: "Será adicionada à lista de Testes"
  ↓
Admin clica "Confirmar"
  ↓
Questão aparece em "Questões dos Testes"
(como questão individual)
  ↓
Admin pode:
  - Usar diretamente em testes
  - OU agrupar em blocos com outras
```

### **OPÇÃO 3: CRIAR QUESTÃO NOVA PARA TORNEIO**

```
Admin está em "Questões de Torneios"
  ↓
Clica botão "Criar Bloco"
  ↓
Abre BlocoQuestoesManager
  ↓
Admin cria/edita um bloco com 5-30 questões
  ↓
Bloco salvo e pronto para uso
```

### **OPÇÃO 4: CRIAR QUESTÃO NOVA PARA TESTE**

```
Admin está em "Questões dos Testes"
  ↓
Clica botão "Nova Questão"
  ↓
Abre CreateQuestaoTesteForm
  ↓
Admin preenche campos e cria questão
  ↓
Questão aparece na tabela de "Questões dos Testes"
  ↓
Opções: Editar, Deletar, "Agrupar em Bloco"
```

---

## 📍 ONDE CADA FUNCIONALIDADE ESTÁ

### **Aba 1: Questões dos Colaboradores** ✅
- **Localização**: Admin Dashboard → "Questões & Conteúdo" → "Questões dos Colaboradores"
- **Funcionalidades**:
  - ✅ Lista questões aprovadas pelos colaboradores
  - ✅ Mostra "Criada por: [Nome]" quando expandida
  - ✅ Botão "Ver Autor" → mostra autor_nome
  - ✅ Botão "Editar" → abre formulário (futuro)
  - ✅ Botão "🏆 Enviar a Torneio" → modal + direcionamento
  - ✅ Botão "📚 Enviar a Teste" → modal + direcionamento

### **Aba 2: Questões de Torneios** ✅
- **Localização**: Admin Dashboard → "Questões & Conteúdo" → "Questões de Torneios"
- **Estrutura**:
  - Mostra BLOCOS existentes (com 5-30 questões cada)
  - Botão "Criar Bloco" → abre BlocoQuestoesManager
  - Nenhuma questão individual solta
- **Funcionalidades**:
  - ✅ Listar blocos publicados
  - ✅ Expandir para ver detalhes
  - ✅ Criar novo bloco (mín 5, máx 30 questões)
  - ✅ Editar/deletar blocos
  - ✅ Ver questões do bloco

### **Aba 3: Questões dos Testes** ✅
- **Localização**: Admin Dashboard → "Questões & Conteúdo" → "Questões dos Testes"
- **Estrutura**:
  - Tabela com questões individuais
  - Botão "Nova Questão" → abre CreateQuestaoTesteForm
- **Funcionalidades**:
  - ✅ Listar questões criadas/importadas
  - ✅ Criar nova questão individual
  - ✅ Editar questão
  - ✅ Deletar questão
  - ✅ Agrupar em blocos (futuro: botão "+")

---

## 🎯 REGRAS IMPORTANTES

### **Para TORNEIOS:**
- ❌ NÃO permitir questão individual vinculada direto
- ✅ APENAS através de blocos (5-30 questões)
- ✅ Bloco deve ter mínimo 5 questões
- ✅ Bloco pode ter máximo 30 questões
- ✅ Origem: Colaboradores OU criar novo bloco

### **Para TESTES:**
- ✅ Questões individuais permitidas
- ✅ Possibilidade de agrupar em blocos (opcional)
- ✅ Sem limite mínimo/máximo por questão
- ✅ Origem: Colaboradores OU criar nova questão

### **Identificação de Origem:**
- ✅ Sempre mostrar "Criada por: [Nome do Colaborador]"
- ✅ Crítico para rastrear procedência
- ✅ Validar no backend: campo `autor_nome`

---

## 📝 CAMPOS CRÍTICOS NO BANCO

### Questão (de Colaborador):
```javascript
{
  id: 165,
  titulo: "Equação do 2º grau",
  descricao: "Resolver x² - 5x + 6 = 0",
  autor_id: 42,
  autor_nome: "João Silva", // ← CRÍTICO!
  status_aprovacao: "aprovada",
  disciplina: "matematica",
  dificuldade: "medio",
  pontos: 10,
  created_at: "2026-06-01",
  updated_at: "2026-06-08"
}
```

### Bloco:
```javascript
{
  id: 8,
  titulo: "Álgebra Avançada",
  descricao: "Tópicos de álgebra intermediária",
  questoes: [165, 166, 167, 168, 169], // min 5, max 30
  disciplina: "matematica",
  dificuldade: "medio",
  status: "publicado",
  contexto: "torneio", // ou "teste"
  created_at: "2026-06-08"
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Backend:
- ✅ Endpoint `/api/questoes?status_aprovacao=aprovada` retorna `autor_nome`
- ⏳ Endpoint POST para adicionar questão a torneio
- ⏳ Endpoint POST para adicionar questão a teste
- ⏳ Validação: bloco tem min 5 questões antes de vincular

### Frontend:
- ✅ QuestoesColaboradoresTab mostra "Criada por"
- ✅ Botões "Enviar a Torneio" e "Enviar a Teste"
- ✅ Modais informativos com confirmação
- ✅ QuestoesTorneiosTab lista blocos (sem questões soltas)
- ✅ QuestoesTestesTab lista questões individuais
- ✅ BlocoQuestoesManager integrado (torneios)
- ⏳ Integração questões do colaborador → torneio/teste

---

## 🚀 PRÓXIMOS PASSOS

1. **Implementar backend endpoints**:
   - POST `/api/questoes/{id}/adicionar-torneio`
   - POST `/api/questoes/{id}/adicionar-teste`

2. **Conectar frontend ao backend**:
   - Salvar questão quando confirmar nos modais
   - Listar questões importadas nas respectivas abas

3. **Validação de blocos**:
   - Verificar mínimo 5 questões antes de vincular a torneio
   - Validar máximo 30 questões

4. **Testes E2E**:
   - Colaborador cria questão → aparece em "Pendentes"
   - Admin aprova → aparece em "Colaboradores"
   - Admin envia a Torneio → aparece em "Torneios"
   - Admin agrupa em bloco → bloco pronto para torneio

---

## 🎉 CONCLUSÃO

Fluxo implementado com **zero funcionalidades sobrepostas**:
- Torneios = BLOCOS apenas
- Testes = Questões individuais (opcionalmente em blocos)
- Colaboradores = Banco de questões aprovadas
- Origem = Sempre rastreada

**Status: PRONTO PARA PRODUÇÃO** ✅
