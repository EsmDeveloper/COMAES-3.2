# ✅ CHECKLIST PRÁTICO DE TESTE - COMAES 3.2

**Data:** 6 de Junho de 2026  
**Testador:** ___________________  
**Data do Teste:** ___________________  
**Status:** [ ] Passou | [ ] Falhou

---

## 🚀 PASSO 1: VERIFICAÇÃO DE INFRAESTRUTURA (5 minutos)

### Servidores Rodando?

- [ ] **Port 5177 (Frontend)** está listening
  ```bash
  netstat -ano | findstr :5177
  ```
  Esperado: `LISTENING 0.0.0.0:5177`

- [ ] **Port 3000 (Backend)** está listening
  ```bash
  netstat -ano | findstr :3000
  ```
  Esperado: `LISTENING 0.0.0.0:3000`

- [ ] **Database MySQL** está respondendo
  ```bash
  cd BackEnd
  node verify_data.js
  ```
  Esperado: "273 Questões de Teste de Conhecimento"

### Browser Acesso

- [ ] **Frontend carrega** sem erros
  - URL: http://localhost:5177
  - Resultado: Página de login aparece

- [ ] **Sem erros no console** (F12 → Console)
  - Resultado: Console está limpo

---

## 🔐 PASSO 2: LOGIN E NAVEGAÇÃO (5 minutos)

### Admin Login

- [ ] **Login funciona** com credenciais corretas
  - Email: `admin@comaes.com`
  - Senha: `Senha123!`
  - Resultado: Dashboard administrativo aparece

- [ ] **Logout funciona**
  - Clique: Avatar → Sair
  - Resultado: Volta para login

### Menu Aparece

- [ ] **Sidebar esquerdo** está visível
  - Elementos: Logo, seções de menu

- [ ] **Header superior** está visível
  - Elementos: Título, menu hambúrguer (mobile)

- [ ] **Todas as 7 seções** aparecem no menu:
  - [ ] 📊 Dashboard
  - [ ] 🏆 Torneios & Competições
  - [ ] 📚 Questões & Conteúdo
  - [ ] 👥 Usuários & Comunidade
  - [ ] 🔔 Comunicação
  - [ ] ⚙️ Sistema
  - (Nota: Sistema está vazio)

---

## 📚 PASSO 3: QUESTÕES & CONTEÚDO (15 minutos)

### Menu Principal

- [ ] **Questões & Conteúdo** está visível no menu

- [ ] **Clicando, aparece** a seção correta

### ABA 1: Questões de Torneios 🏆

- [ ] **Aba carrega** sem erros
  - Título: "Questões de Torneios"
  - Subtítulo: "Blocos de questões vinculados a torneios"

- [ ] **14 blocos aparecem** na lista
  - Quantidade esperada: 14
  - Cada um tem: Título, descrição, disciplina, dificuldade, status

- [ ] **Busca funciona**
  - Digite: Um termo qualquer
  - Resultado: Lista filtra dinamicamente

- [ ] **Expandir bloco funciona**
  - Clique no bloco
  - Resultado: Detalhes aparecem
  - Resultado: "Ver Questões" e "Editar" aparecem

- [ ] **Estatísticas aparecem** no rodapé
  - Total de Blocos: 14
  - Publicados: 14
  - Disciplinas: 3

### ABA 2: Questões dos Testes 📚

- [ ] **Aba carrega** sem erros
  - Título: "Questões dos Testes"
  - Subtítulo: "Banco de questões para testes de conhecimento"

- [ ] **273 questões aparecem** (ou paginadas)
  - Quantidade esperada: 273 total
  - Cada uma tem: Enunciado, categoria, dificuldade, pontos

- [ ] **Busca funciona**
  - Digite: Um enunciado ou categoria
  - Resultado: Lista filtra

- [ ] **Categorias exibem**
  - [ ] Matemática
  - [ ] Inglês
  - [ ] Programação

- [ ] **Estatísticas aparecem**
  - Total: 273
  - Por categoria: distribuição visível

### ABA 3: Questões Pendentes ⏳

- [ ] **Aba carrega** sem erros
  - Título: "Questões Pendentes"
  - Subtítulo: "Questões submetidas por colaboradores"

- [ ] **Questões aparecem** (quantidade pode variar)
  - Cada uma tem: Colaborador, enunciado, data, status, disciplina

- [ ] **Status PENDENTE** aparece em vermelho/âmbar
  - Símbolo: ⏳ ou 🔴

- [ ] **Botões de ação aparecem**
  - [ ] [Detalhes]
  - [ ] [Aprovar]
  - [ ] [Rejeitar]

- [ ] **Filtros funcionam**
  - Filtrar por status
  - Filtrar por disciplina

### ABA 4: Questões dos Colaboradores 👥

- [ ] **Aba carrega** sem erros
  - Título: "Questões dos Colaboradores"
  - Subtítulo: "Banco validado de questões pedagógicas"

- [ ] **Questões aprovadas aparecem** (6+)
  - Quantidade esperada: Pelo menos 6
  - Cada uma tem: Autor, disciplina, enunciado, dificuldade

- [ ] **Status APROVADO** aparece em verde
  - Símbolo: ✅

- [ ] **Expandir questão funciona**
  - Clique na questão
  - Resultado: Detalhes do autor aparecem

- [ ] **Filtros funcionam**
  - Filtrar por disciplina
  - Filtrar por dificuldade

- [ ] **Estatísticas aparecem**
  - Total aprovado: 6+
  - Colaboradores: Número correto

---

## 👥 PASSO 4: COLABORADORES (10 minutos)

### Pedidos de Colaboradores

- [ ] **Menu → Usuários & Comunidade → Pedidos de Colaboradores**

- [ ] **Pelo menos 2 colaboradores** aparecem
  - Status: PENDENTE 🔴

- [ ] **João** aparece
  - Email: joao.prof.mat@example.com
  - Disciplina: Matemática
  - Status: Pendente

- [ ] **Botões funcionam**
  - [ ] [Aprovar] funciona
  - [ ] [Rejeitar] funciona

### Fluxo de Aprovação

- [ ] **Clicando Aprovar**
  - Modal de confirmação aparece
  - Clique "Confirmar"
  - Status muda de PENDENTE para APROVADO

- [ ] **Clicando Rejeitar**
  - Modal de rejeição aparece
  - Possibilidade de adicionar motivo
  - Status muda de PENDENTE para REJEITADO

---

## 🧪 PASSO 5: FLUXO DE COLABORADOR (10 minutos)

### Test de Colaborador Pendente

- [ ] **Logout** do admin
  - Clique: Avatar → Sair

- [ ] **Login** como João
  - Email: `joao.prof.mat@example.com`
  - Senha: `Senha123!`
  - Resultado: Dashboard ou mensagem de acesso negado aparece

- [ ] **Voltar ao Admin**
  - Logout e re-login como admin

- [ ] **Ir para: Pedidos de Colaboradores**
  - Encontrar João
  - Clicar [Aprovar]
  - Confirmar

### Test de Colaborador Aprovado

- [ ] **Logout** do admin

- [ ] **Login** como Maria
  - Email: `maria.prof.ing@example.com`
  - Senha: `Senha123!`
  - Resultado: Dashboard colaborador aparece (se existir)

- [ ] **Suas questões aparecem** (se existir seção)
  - Status: Alguns PENDENTES, alguns APROVADOS

- [ ] **Voltar ao Admin**
  - Logout e re-login como admin

- [ ] **Ir para: Questões Pendentes**
  - Encontrar questões de Maria
  - Verificar se têm status PENDENTE

- [ ] **Aprovar uma questão de Maria**
  - Clique [Aprovar]
  - Confirmar

- [ ] **Ir para: Questões dos Colaboradores**
  - Procurar questão de Maria
  - Verificar se agora aparece com status APROVADO ✅

---

## 📊 PASSO 6: DADOS E ESTATÍSTICAS (5 minutos)

### Verificar Contagens

- [ ] **Questões de Torneios: 14 blocos**
  - Estatísticas rodapé: 14
  - Resultado: ✅ Correto

- [ ] **Questões dos Testes: 273 questões**
  - Estatísticas rodapé: 273
  - Resultado: ✅ Correto

- [ ] **Blocos: 14 total**
  - Via script: `cd BackEnd && node verify_data.js`
  - Esperado: "14 blocos"
  - Resultado: ✅ Correto

- [ ] **Usuários: 19 total**
  - Via script: `node verify_data.js`
  - Esperado: "19 usuarios"
  - Resultado: ✅ Correto

---

## 🎨 PASSO 7: INTERFACE E RESPONSIVIDADE (5 minutos)

### Desktop (1024px+)

- [ ] **Sidebar** aparece à esquerda
- [ ] **Conteúdo** ocupa espaço restante
- [ ] **Cards/Tabelas** em múltiplas colunas

### Tablet (768-1024px)

- [ ] **Menu hamburger** aparece
- [ ] **Conteúdo** adapta-se
- [ ] **Sidebar** pode ser colapsável

### Mobile (<768px)

- [ ] **Menu hamburger** funciona
- [ ] **Conteúdo** é 1 coluna
- [ ] **Botões** são tappáveis

### Dark/Light Mode (se existir)

- [ ] [ ] Tema claro funciona
- [ ] [ ] Tema escuro funciona (se implementado)

---

## ⚡ PASSO 8: PERFORMANCE E ERROS (5 minutos)

### Console (F12 → Console)

- [ ] **Sem erros vermelhos**
  - Resultado: Console limpo

- [ ] **Sem warnings críticos**
  - Warnings de build ok
  - Errors: NENHUM

- [ ] **Network tab (F12 → Network)**
  - Requisições carregam rápido (<500ms)
  - Status 200 OK para APIs

### Performance

- [ ] **Aba "Questões de Torneios" carrega** <2s
- [ ] **Aba "Questões dos Testes" carrega** <2s
- [ ] **Aba "Questões Pendentes" carrega** <2s
- [ ] **Aba "Questões dos Colaboradores" carrega** <2s

---

## 📝 PASSO 9: CREDENCIAIS FUNCIONAM? (5 minutos)

- [ ] **Admin@comaes.com / Senha123!**
  - [ ] Login funciona
  - [ ] Acesso completo
  - [ ] Logout funciona

- [ ] **joao.prof.mat@example.com / Senha123!**
  - [ ] Login funciona
  - [ ] Status: Pendente (visível no perfil)

- [ ] **maria.prof.ing@example.com / Senha123!**
  - [ ] Login funciona
  - [ ] Status: Aprovado (visível no perfil)
  - [ ] Questões aparecem (se houver seção)

- [ ] **carlos.prof.prog@example.com / Senha123!**
  - [ ] Login funciona
  - [ ] Status: Aprovado
  - [ ] Questões no banco: Sim

---

## 🐛 PASSO 10: BUGS ENCONTRADOS?

### Registrar Bugs

Preencha cada bug encontrado:

**BUG #1**
- Descrição: ___________________________
- Como reproduzir: ___________________________
- Esperado: ___________________________
- Observado: ___________________________
- Severidade: [ ] Crítica [ ] Alta [ ] Média [ ] Baixa

**BUG #2**
- Descrição: ___________________________
- Como reproduzir: ___________________________
- Esperado: ___________________________
- Observado: ___________________________
- Severidade: [ ] Crítica [ ] Alta [ ] Média [ ] Baixa

**BUG #3**
- Descrição: ___________________________
- Como reproduzir: ___________________________
- Esperado: ___________________________
- Observado: ___________________________
- Severidade: [ ] Crítica [ ] Alta [ ] Média [ ] Baixa

---

## 💡 PASSO 11: SUGESTÕES DE MELHORIA

[ ] Melhoria #1: _________________________________

[ ] Melhoria #2: _________________________________

[ ] Melhoria #3: _________________________________

---

## ✅ RESUMO FINAL

### Resultado Geral

- [ ] **PASSOU** - Sistema funcionando 100%
- [ ] **PASSOU COM RESSALVAS** - Bugs encontrados, mas funcionável
- [ ] **FALHOU** - Problemas críticos impedem uso

### Pontos Positivos

✅ ___________________________
✅ ___________________________
✅ ___________________________

### Pontos Negativos

❌ ___________________________
❌ ___________________________
❌ ___________________________

---

## 📋 CHECKLIST FINAL

- [ ] Todos os 10 passos completados
- [ ] Console sem erros críticos
- [ ] Todas as 4 abas funcionam
- [ ] Dados aparecem corretamente
- [ ] Credenciais funcionam
- [ ] Responsividade OK
- [ ] Sem bugs críticos encontrados

---

## 📞 CONTATO PARA SUPORTE

Se encontrar problemas:

1. Verifique se os servidores estão rodando
2. Verifique se o banco tem dados (node verify_data.js)
3. Consulte: `STATUS_VERIFICACAO_SISTEMA.md`
4. Consulte: `CREDENCIAIS_ACESSO_RAPIDO.md`

---

## 🎓 Documentos de Referência

- **LEIA_PRIMEIRO_DOCUMENTACAO_INDEX.md** - Índice geral
- **RESUMO_EXECUTIVO_CONCLUSAO.md** - Resumo do projeto
- **STATUS_VERIFICACAO_SISTEMA.md** - Status técnico
- **CREDENCIAIS_ACESSO_RAPIDO.md** - Credenciais e URLs
- **GUIA_VISUAL_MENU_NOVO.md** - Estrutura visual
- **DIAGRAMA_SISTEMA_FINAL.txt** - Diagramas do sistema

---

**Testador:** ___________________  
**Data:** ___________________  
**Assinatura:** ___________________

---

*Checklist de Teste - COMAES 3.2 - Junho 2026*
