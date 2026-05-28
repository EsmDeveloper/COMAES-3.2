# Requirements Document

## Introduction

Este documento descreve os requisitos para o **Sistema de Blocos de Questões** (Question Blocks System) do painel administrativo da plataforma COMAES. O objetivo é substituir o modelo atual de listas planas de questões individuais por uma arquitetura modular e reutilizável baseada em **blocos de questões**. Cada bloco agrupa questões por disciplina e nível de dificuldade, podendo ser reutilizado em múltiplos torneios ativos. A lógica interna de questões (respostas, validações, pontuação) permanece inalterada — apenas a organização estrutural e a interface administrativa são modificadas.

O sistema abrange duas áreas do painel administrativo:
1. **Questões de Torneios** — atualmente gerenciadas por `QuestoesManager.jsx`
2. **Questões do Teste de Conhecimento** — atualmente gerenciadas por `TesteConhecimentoManager.jsx`

---

## Glossary

- **Bloco de Questões (Question Block)**: Unidade modular que agrupa questões de uma mesma disciplina e nível de dificuldade, com título, metadados e lista de até 30 questões individuais.
- **Disciplina**: Área de conhecimento de um bloco. Valores válidos: `Matemática`, `Programação`, `Inglês`.
- **Dificuldade**: Nível de complexidade de um bloco. Valores válidos: `Fácil`, `Médio`, `Difícil`.
- **Bloco Padrão**: Um dos 9 blocos pré-existentes criados automaticamente (3 disciplinas × 3 dificuldades) para cada contexto (torneios e teste de conhecimento).
- **Bloco Personalizado**: Bloco adicional criado pelo administrador além dos blocos padrão.
- **Associação de Torneio**: Configuração que vincula um bloco de questões a um ou mais torneios ativos.
- **Admin_Panel**: O painel administrativo da plataforma COMAES, acessível via `AdminDashboard.jsx`.
- **QuestoesManager**: Componente React responsável pela gestão de questões de torneios (`QuestoesManager.jsx`).
- **TesteConhecimentoManager**: Componente React responsável pela gestão de questões do Teste de Conhecimento (`TesteConhecimentoManager.jsx`).
- **Questao**: Modelo de dados de uma questão individual de torneio (`BackEnd/models/Questao.js`).
- **QuestaoTesteConhecimento**: Modelo de dados de uma questão individual do Teste de Conhecimento (`BackEnd/models/QuestaoTesteConhecimento.js`).
- **BlocoQuestoes**: Novo modelo de dados que representa um bloco de questões.
- **Aba de Auditoria**: Aba adicional "Visualizar Todas as Questões" para inspeção e manutenção individual de questões.

---

## Requirements

### Requirement 1: Criação de Blocos de Questões

**User Story:** Como administrador, quero criar blocos de questões agrupados por disciplina e dificuldade, para que eu possa organizar o conteúdo de forma modular e reutilizável em vez de gerenciar listas enormes de questões individuais.

#### Acceptance Criteria

1. WHEN o administrador acessa a aba de questões de torneios ou do teste de conhecimento, THE Admin_Panel SHALL exibir a ação principal como "Criar Bloco de Questões" em substituição à ação "Criar Questão".
2. WHEN o administrador inicia a criação de um bloco, THE Admin_Panel SHALL apresentar um formulário com os campos: título do bloco (texto livre), disciplina (seleção entre Matemática, Programação, Inglês), e nível de dificuldade (seleção entre Fácil, Médio, Difícil).
3. THE BlocoQuestoes SHALL aceitar uma lista de zero a 30 questões individuais associadas ao bloco, permitindo que blocos sejam criados e salvos sem questões.
4. IF o administrador tentar salvar um bloco com mais de 30 questões, THEN THE Admin_Panel SHALL exibir uma mensagem de erro indicando o limite máximo de 30 questões por bloco.
5. IF o administrador tentar salvar um bloco sem título, THEN THE Admin_Panel SHALL exibir uma mensagem de aviso indicando que o título é obrigatório e permitir que o bloco seja criado com o aviso visível.
6. IF o administrador tentar salvar um bloco sem selecionar disciplina ou dificuldade, THEN THE Admin_Panel SHALL exibir uma mensagem de erro indicando os campos obrigatórios ausentes.
7. WHEN um bloco é criado com sucesso, THE Admin_Panel SHALL exibir uma mensagem de confirmação e atualizar a lista de blocos sem recarregar a página.

---

### Requirement 2: Blocos Padrão por Disciplina e Dificuldade

**User Story:** Como administrador, quero que cada disciplina já tenha 3 blocos padrão (Fácil, Médio, Difícil) disponíveis desde o início, para que eu possa começar a adicionar questões imediatamente sem precisar criar a estrutura do zero.

#### Acceptance Criteria

1. WHEN o sistema de blocos de questões é inicializado pela primeira vez em um contexto (torneios ou teste de conhecimento), THE Admin_Panel SHALL exibir 9 blocos padrão pré-criados: um bloco Fácil, um Médio e um Difícil para cada uma das 3 disciplinas (Matemática, Programação, Inglês).
2. THE Admin_Panel SHALL exibir os blocos padrão agrupados visualmente por disciplina, com os 3 níveis de dificuldade de cada disciplina apresentados juntos.
3. WHEN o administrador acessa um bloco padrão vazio, THE Admin_Panel SHALL indicar visualmente que o bloco não possui questões e exibir a opção de adicionar questões somente nesse contexto de visualização do bloco vazio.
4. THE Admin_Panel SHALL permitir que o administrador edite o título e os metadados dos blocos padrão.
5. THE Admin_Panel SHALL impedir a exclusão dos 9 blocos padrão, exibindo uma mensagem explicativa caso o administrador tente excluí-los.

---

### Requirement 3: Reutilização de Blocos em Múltiplos Torneios

**User Story:** Como administrador, quero associar um bloco de questões a múltiplos torneios ativos, para que eu não precise duplicar questões e possa reutilizar o mesmo conteúdo em diferentes competições.

#### Acceptance Criteria

1. WHEN o administrador edita um bloco de questões de torneio, THE Admin_Panel SHALL exibir uma seção de "Associação de Torneios" com a lista de torneios ativos disponíveis para seleção.
2. THE Admin_Panel SHALL permitir que o administrador selecione um ou mais torneios ativos para associar ao bloco, utilizando checkboxes ou radio buttons para cada torneio disponível.
3. WHEN o administrador salva as associações de um bloco, THE Admin_Panel SHALL persistir as associações entre o bloco e os torneios selecionados sem alterar a lógica interna das questões.
4. WHEN um bloco está associado a múltiplos torneios, THE Admin_Panel SHALL exibir a lista de todos os torneios associados na visualização do bloco, independentemente do status atual de atividade de cada torneio.
5. THE Admin_Panel SHALL permitir que o administrador remova a associação de um bloco com um torneio específico sem excluir o bloco ou as questões.
6. WHEN o administrador acessa a seção de associação de torneios e nenhum torneio ativo estiver disponível, THE Admin_Panel SHALL exibir automaticamente uma mensagem informando que não há torneios ativos para associação.

---

### Requirement 4: Gestão de Questões Dentro de um Bloco

**User Story:** Como administrador, quero adicionar, editar e remover questões individuais dentro de um bloco, para que eu possa manter o conteúdo de cada bloco atualizado sem alterar a lógica de respostas e pontuação existente.

#### Acceptance Criteria

1. WHEN o administrador abre um bloco de questões, THE Admin_Panel SHALL exibir a lista de questões contidas no bloco com título, tipo e pontuação de cada questão.
2. WHEN o administrador adiciona uma questão a um bloco, THE Admin_Panel SHALL utilizar os formulários existentes (`CreateQuestaoForm` para torneios e `CreateQuestaoTesteForm` para teste de conhecimento) sem modificar sua lógica interna de validação e persistência.
3. WHEN o administrador edita uma questão dentro de um bloco, THE Admin_Panel SHALL utilizar os formulários existentes (`EditQuestaoForm` e `EditQuestaoTesteForm`) sem modificar sua lógica interna.
4. WHEN o administrador remove uma questão de um bloco, THE Admin_Panel SHALL exibir um modal de confirmação antes de executar a remoção.
5. THE Admin_Panel SHALL exibir o contador de questões do bloco (ex: "12/30 questões") em tempo real conforme questões são adicionadas ou removidas.
6. WHILE o bloco contém 30 questões, THE Admin_Panel SHALL desabilitar o botão de adicionar questão e exibir uma mensagem indicando que o limite de 30 questões foi atingido.

---

### Requirement 5: Visualização Organizada por Blocos

**User Story:** Como administrador, quero visualizar as questões organizadas em blocos ao invés de uma lista plana, para que eu possa navegar e gerenciar o conteúdo de forma mais eficiente.

#### Acceptance Criteria

1. THE Admin_Panel SHALL substituir a visualização de lista plana de questões por uma visualização em grade ou lista de cards de blocos, onde cada card representa um bloco de questões.
2. THE Admin_Panel SHALL exibir em cada card de bloco: título do bloco, disciplina, nível de dificuldade, número de questões (ex: "8/30"), e torneios associados (para blocos de torneio).
3. THE Admin_Panel SHALL aplicar codificação visual por dificuldade nos cards: verde para Fácil, amarelo para Médio, vermelho para Difícil, independentemente da disciplina do bloco.
4. THE Admin_Panel SHALL aplicar codificação visual por disciplina nos cards: azul para Matemática, roxo para Programação, verde-azulado para Inglês.
5. THE Admin_Panel SHALL permitir filtrar a visualização de blocos por disciplina e por nível de dificuldade.
6. WHEN o administrador clica em um card de bloco, THE Admin_Panel SHALL expandir o bloco em linha (inline) para exibir sua lista de questões quando a visualização for em lista, ou navegar para uma página de detalhe quando a visualização for em grade.

---

### Requirement 6: Aba de Auditoria de Questões Individuais

**User Story:** Como administrador, quero ter acesso a uma aba dedicada para visualizar todas as questões individualmente, para que eu possa realizar auditorias, manutenção e buscas sem precisar navegar bloco a bloco.

#### Acceptance Criteria

1. THE Admin_Panel SHALL adicionar uma aba "Visualizar Todas as Questões" tanto na seção de questões de torneios quanto na seção de questões do teste de conhecimento.
2. WHEN o administrador acessa a aba de auditoria, THE Admin_Panel SHALL exibir todas as questões em formato de tabela com colunas: título/enunciado, disciplina/categoria, dificuldade, pontos, bloco de origem, e ações (editar, excluir).
3. THE Admin_Panel SHALL manter os filtros existentes de busca por texto, disciplina/categoria e dificuldade na aba de auditoria.
4. WHEN o administrador edita uma questão pela aba de auditoria, THE Admin_Panel SHALL utilizar os formulários de edição existentes sem modificar sua lógica interna.
5. WHEN o administrador exclui uma questão pela aba de auditoria, THE Admin_Panel SHALL exibir um modal de confirmação e, após confirmação, remover a questão do bloco ao qual pertence.
6. THE Admin_Panel SHALL exibir o nome do bloco de origem de cada questão na coluna "Bloco de Origem" da tabela de auditoria.

---

### Requirement 7: Persistência e Modelo de Dados de Blocos

**User Story:** Como desenvolvedor, quero que os blocos de questões sejam persistidos no banco de dados com um modelo dedicado, para que as associações entre blocos, questões e torneios sejam mantidas de forma consistente.

#### Acceptance Criteria

1. THE BlocoQuestoes SHALL ser persistido em uma tabela dedicada `blocos_questoes` com os campos: `id`, `titulo`, `disciplina`, `dificuldade`, `contexto` (enum: `torneio`, `teste_conhecimento`), `created_at`, `updated_at`.
2. THE BlocoQuestoes SHALL ter uma associação de chave estrangeira com o modelo `Questao` para blocos de torneio, e com o modelo `QuestaoTesteConhecimento` para blocos de teste de conhecimento, através de uma tabela de junção `bloco_questoes_items`.
3. THE BlocoQuestoes SHALL ter uma tabela de junção `bloco_torneio_associacoes` para registrar as associações entre blocos de torneio e torneios ativos.
4. WHEN um bloco é excluído, THE BlocoQuestoes SHALL remover as associações na tabela de junção mas NÃO excluir as questões individuais associadas ao bloco.
5. THE BlocoQuestoes SHALL validar no nível do banco de dados que o campo `disciplina` aceita apenas os valores `matematica`, `programacao`, `ingles`.
6. THE BlocoQuestoes SHALL validar no nível do banco de dados que o campo `dificuldade` aceita apenas os valores `facil`, `medio`, `dificil`.

---

### Requirement 8: Compatibilidade com Lógica Interna Existente

**User Story:** Como desenvolvedor, quero garantir que a reestruturação visual e organizacional não altere a lógica interna de questões, para que o funcionamento do quiz, pontuação e validações permaneça intacto.

#### Acceptance Criteria

1. THE Admin_Panel SHALL manter os modelos `Questao.js` e `QuestaoTesteConhecimento.js` sem alterações em seus campos, validações e associações existentes.
2. THE Admin_Panel SHALL manter os controllers `QuestoesControllerRefactored.js` e `TesteConhecimentoController.js` sem alterações em seus endpoints de criação, edição, exclusão e listagem de questões individuais.
3. THE Admin_Panel SHALL manter os formulários `CreateQuestaoForm.jsx`, `EditQuestaoForm.jsx`, `CreateQuestaoTesteForm.jsx` e `EditQuestaoTesteForm.jsx` sem alterações em sua lógica de validação e submissão.
4. WHEN o sistema de quiz carrega questões via `GET /api/questoes/quiz/:area`, THE Admin_Panel SHALL garantir que o endpoint continue funcionando sem modificações, retornando questões da tabela `questoes_teste_conhecimento`.
5. WHEN o sistema de torneio carrega questões via `GET /api/questoes/torneio/:torneioId`, THE Admin_Panel SHALL garantir que o endpoint continue funcionando sem modificações, retornando questões da tabela `questoes`.
