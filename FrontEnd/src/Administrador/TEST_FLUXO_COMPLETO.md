# Teste Manual - Fluxo Completo Questões Pendentes & Colaboradores

## 🎯 Objetivo
Validar que o fluxo completo funciona de ponta a ponta sem erros e com interface consistente.

## 📋 Pré-requisitos
- [ ] Estar autenticado como admin
- [ ] Ter o painel de administrador aberto
- [ ] Console do navegador aberto (F12)
- [ ] Ter pelo menos 1 questão pendente criada por um colaborador
- [ ] Ter pelo menos 1 bloco de colaborador aprovado

---

## 🧪 Testes - Aba "Questões Pendentes"

### 1.1 - Carregamento e Filtros
**Passos:**
1. Navegue para aba "Questões Pendentes"
2. Aguarde o carregamento da lista

**Validar:**
- [ ] Lista de questões pendentes carrega sem erros
- [ ] Console limpo (sem erros vermelhos)
- [ ] Cada questão mostra: disciplina, dificuldade, pontos, data
- [ ] Cards têm estilo consistente (azul) com outras abas

**Filtros:**
1. Digite no campo de busca: "matemática"
2. Selecione filtro de disciplina

**Validar:**
- [ ] Busca filtra por título/descrição
- [ ] Filtro de disciplina funciona
- [ ] Contador de questões atualiza
- [ ] "Sem resultados" aparece se não houver match

---

### 1.2 - Ver Detalhes
**Passos:**
1. Clique no botão "Ver detalhes" de uma questão

**Validar:**
- [ ] Modal abre corretamente
- [ ] Mostra: título, descrição, alternativas, explicação
- [ ] Resposta correta é destacada em verde
- [ ] Fechar modal (X) funciona
- [ ] Sem erros no console

---

### 1.3 - Aprovar Questão
**Passos:**
1. Clique no botão "Aprovar" de uma questão

**Validar:**
- [ ] Botão mostra loading ("Aprovando...")
- [ ] Questão desaparece da lista (removida de pendentes)
- [ ] Toast verde aparece no canto inferior direito: "Questão aprovada!"
- [ ] Lista se atualiza automaticamente
- [ ] Sem erros no console

**Validar também:**
- [ ] Questão aprovada agora aparece em "Questões dos Colaboradores"
  (se estiver em bloco aprovado)

---

### 1.4 - Rejeitar Questão
**Passos:**
1. Clique no botão "Rejeitar" de uma questão
2. Modal de rejeição abre
3. Digite motivo: "Enunciado mal formulado"
4. Clique "Rejeitar"

**Validar:**
- [ ] Modal abre com título e campo de motivo
- [ ] Campo de motivo é obrigatório (mostra erro se vazio)
- [ ] Clique rejeitar mostra loading
- [ ] Questão desaparece da lista
- [ ] Toast sucesso aparece
- [ ] Sem erros no console

---

## 🧪 Testes - Aba "Questões dos Colaboradores"

### 2.1 - Carregamento e Lista de Blocos
**Passos:**
1. Navegue para aba "Questões dos Colaboradores"
2. Aguarde o carregamento

**Validar:**
- [ ] Lista de blocos carrega sem erros
- [ ] Cada bloco mostra: título, disciplina, dificuldade, status
- [ ] Status (Publicado/Rascunho) é visível
- [ ] Barra de progresso (questões/limite) é exibida
- [ ] Nome do colaborador criador é mostrado
- [ ] Console limpo

---

### 2.2 - Filtros e Busca
**Passos:**
1. Digite no campo de busca: "Álgebra"
2. Selecione filtro de disciplina: "Matemática"
3. Clique "Atualizar"

**Validar:**
- [ ] Busca filtra blocos por título e nome do colaborador
- [ ] Filtro de disciplina funciona
- [ ] Botão Atualizar recarrega a lista
- [ ] "Nenhum bloco disponível" aparece se sem resultados

---

### 2.3 - Expandir Bloco
**Passos:**
1. Clique no ícone de olho (Eye icon) de um bloco
2. Aguarde carregamento das questões

**Validar:**
- [ ] Bloco se expande
- [ ] Mostra loading spinner enquanto carrega
- [ ] Lista de questões do bloco aparece
- [ ] Cada questão mostra: número, título, pontos, dificuldade
- [ ] Questões são clicáveis

---

### 2.4 - Ver Detalhes de Questão
**Passos:**
1. Com bloco expandido, clique em uma questão da lista

**Validar:**
- [ ] Modal de detalhes abre
- [ ] Mostra completo: título, disciplina, dificuldade, alternativas
- [ ] Resposta correta destacada
- [ ] Fechar (X) funciona

---

### 2.5 - Deletar Bloco
**Passos:**
1. Clique no ícone de lixo (Trash) de um bloco
2. Modal de confirmação aparece
3. Clique "Deletar"

**Validar:**
- [ ] Modal de confirmação mostra nome do bloco
- [ ] Avisos: "As questões não serão apagadas, apenas removidas do bloco"
- [ ] Clique Deletar mostra loading
- [ ] Bloco desaparece da lista
- [ ] Toast verde: "Bloco deletado com sucesso"
- [ ] Sem erros no console

---

## 🔄 Teste de Fluxo Completo

### 3.1 - Questão: Pendente → Aprovada → Colaborador
**Passos:**
1. Vá para "Questões Pendentes"
2. Aprove uma questão (que está em um bloco de colaborador aprovado)
3. Vá para "Questões dos Colaboradores"
4. Expanda o bloco desse colaborador
5. Verifique se a questão aparece no bloco

**Validar:**
- [ ] Questão aprovada aparece no bloco
- [ ] Número de questões no bloco aumentou
- [ ] Barra de progresso atualizada
- [ ] Sem erros no console em nenhuma aba

---

### 3.2 - Questão: Rejeição não afeta Colaborador
**Passos:**
1. Vá para "Questões Pendentes"
2. Rejeite uma questão (com motivo)
3. Vá para "Questões dos Colaboradores"
4. Verifique bloco - questão rejeitada não deve aparecer

**Validar:**
- [ ] Questão rejeitada não aparece no bloco
- [ ] Número de questões do bloco não aumentou
- [ ] Barra de progresso não mudou
- [ ] Sem erros no console

---

## 🎨 Testes de UI/UX

### 4.1 - Consistência Visual
**Verificar em ambas as abas:**

- [ ] Mesmas cores azuis usadas
- [ ] Badges têm mesmo estilo:
  - [ ] Disciplina: azul
  - [ ] Dificuldade: cores (fácil verde, médio amarelo, difícil vermelho)
  - [ ] Status: cores apropriadas
- [ ] Modais têm mesmo design
- [ ] Botões têm mesmo estilo
- [ ] Fonte e espaçamento consistentes

### 4.2 - Responsividade
**Em desktop (> 1200px):**
- [ ] Layout em grid (3 colunas ou mais)
- [ ] Tudo legível

**Em tablet (768px - 1024px):**
- [ ] Layout em grid (2 colunas)
- [ ] Botões acessíveis

**Em mobile (< 768px):**
- [ ] Layout em coluna única
- [ ] Modais ajustam tamanho
- [ ] Texto não é quebrado

---

## 🧹 Teste de Console

### 5.1 - Sem Erros Vermelhos
**Passos:**
1. Abra F12 (Console)
2. Execute todos os testes acima
3. Não deve haver nenhuma mensagem de erro em vermelho

**Validar:**
- [ ] Console limpo (apenas logs de info)
- [ ] Sem warnings de React: "Each child in a list should have a key prop"
- [ ] Sem warnings de TypeScript
- [ ] Sem warnings de deprecação

### 5.2 - Logs Informativos
**Verificar:**
- [ ] Logs mostram carregamento: "✅ Questões pendentes carregadas: X"
- [ ] Logs mostram erros: "❌ Erro ao..."
- [ ] Sem logs de debug deixados

---

## 📊 Checklist de Sucesso Final

### Funcionalidades
- [ ] Listar questões pendentes
- [ ] Buscar questões
- [ ] Filtrar por disciplina
- [ ] Ver detalhes completos
- [ ] Aprovar questão
- [ ] Rejeitar com motivo
- [ ] Listar blocos de colaboradores
- [ ] Buscar blocos
- [ ] Filtrar blocos
- [ ] Expandir bloco
- [ ] Ver questões do bloco
- [ ] Deletar bloco
- [ ] Fluxo completo: Pendente → Aprovada → Colaborador

### Qualidade
- [ ] Console sem erros
- [ ] Loading states claros
- [ ] Toasts funcionam
- [ ] Modais funcionam
- [ ] UI consistente
- [ ] Responsiva
- [ ] Performance OK

### Integração
- [ ] Sem imports quebrados
- [ ] Componentes compartilhados funcionam
- [ ] Reutilização em 100%

---

## 🐛 Se encontrar problemas

### Problema: "Erro ao carregar questões"
- [ ] Verificar se backend está rodando
- [ ] Verificar se token é válido
- [ ] Verificar se API retorna dados corretos
- [ ] Console mostra endpoint exato?

### Problema: Modal não fecha
- [ ] Verificar se onClose está sendo chamado
- [ ] Verificar se isOpen está mudando
- [ ] Inspecionar elemento (DevTools)

### Problema: Componente não renderiza
- [ ] Verificar import do componente
- [ ] Verificar se nome do componente está correto
- [ ] Verificar console por erro de import

### Problema: Estilo quebrado
- [ ] Verificar se Tailwind CSS está carregando
- [ ] Verificar se className está correto
- [ ] Inspecionar elemento no DevTools

---

## ✅ Resultado Final

Se todos os testes passarem:

```
RESULTADO: ✅ REFATORAÇÃO COMPLETA E VALIDADA

✅ 0% código duplicado
✅ 100% componentes reutilizados
✅ Console limpo
✅ Fluxo completo testado
✅ UI consistente
✅ Performance OK
✅ Pronto para produção
```

---

**Testes realizados em:** [Data e Hora]
**Testador:** [Seu nome]
**Status:** ✅ PASSOU / ❌ FALHOU
