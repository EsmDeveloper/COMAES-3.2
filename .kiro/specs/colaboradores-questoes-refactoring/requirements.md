# Requirements Document: Refatoração dos Módulos de Colaboradores

## Introduction

Este projeto refatora os módulos de "Questões Pendentes" e "Questões dos Colaboradores" para implementar um fluxo completo e consistente de aprovação de questões e blocos de colaboradores, reutilizando a arquitetura, componentes e padrões já estabelecidos nos módulos de Testes e Torneios.

## Glossary

- **Sistema**: A aplicação de administração (AdminDashboard)
- **Colaborador**: Um usuário que cria questões e/ou blocos
- **Questão**: Uma pergunta individual com opções de resposta
- **Bloco**: Um agrupamento de questões (conjunto reutilizável)
- **Admin**: Administrador que aprova/rejeita colaboradores e seu conteúdo
- **Questões Pendentes**: Aba que centraliza questões/blocos aguardando aprovação
- **Questões dos Colaboradores**: Aba que lista questões/blocos aprovados de colaboradores
- **BlocoQuestoesManager**: Componente responsável por gerenciar blocos em diferentes contextos (torneios, testes)
- **Status Pendente**: Estado inicial de questão/bloco criado por colaborador, aguardando validação
- **Status Aprovado**: Estado após aprovação pelo admin, pronto para uso em testes/torneios
- **Status Rejeitado**: Estado após rejeição pelo admin, não disponível para uso
- **Contexto**: O tipo de entidade que contém o bloco (torneio ou teste)
- **Painel do Colaborador**: Interface onde colaboradores criam questões e blocos

## Requirements

### Requirement 1: Receber e Exibir Questões Pendentes

**User Story:** Como um administrador, quero visualizar todas as questões criadas por colaboradores que aguardam aprovação, para que eu possa revisá-las e tomar decisões de aprovação ou rejeição.

#### Acceptance Criteria

1. WHEN a questão é criada no Painel do Colaborador, THE Sistema SHALL adicionar automaticamente um registro em Questões Pendentes com status "pendente"
2. WHEN a página Questões Pendentes é carregada, THE Sistema SHALL exibir todas as questões com status "pendente" em uma tabela com paginação
3. THE Questões Pendentes SHALL exibir: título, criador (colaborador), disciplina, dificuldade, data de criação, status e ações (visualizar, editar, aprovar, rejeitar)
4. WHEN o usuário pesquisa por título, THE Sistema SHALL filtrar questões que correspondem ao termo de busca
5. WHEN o usuário filtra por disciplina ou dificuldade, THE Sistema SHALL exibir apenas questões que correspondem aos critérios selecionados

### Requirement 2: Receber e Exibir Blocos Pendentes

**User Story:** Como um administrador, quero visualizar todos os blocos de questões criados por colaboradores que aguardam aprovação, para que eu possa aprovar ou rejeitar agrupamentos de questões.

#### Acceptance Criteria

1. WHEN um bloco é criado no Painel do Colaborador, THE Sistema SHALL adicionar automaticamente um registro em Questões Pendentes com status "pendente"
2. WHEN a página Questões Pendentes é carregada, THE Sistema SHALL exibir todos os blocos com status "pendente", mostrando: título, criador (colaborador), quantidade de questões, data de criação, status e ações
3. THE Sistema SHALL permitir expandir cada bloco para visualizar suas questões internas
4. WHEN o usuário pesquisa por título de bloco, THE Sistema SHALL filtrar blocos que correspondem ao termo de busca
5. WHEN o usuário filtra por disciplina ou dificuldade, THE Sistema SHALL exibir apenas blocos que possuem questões com essas características

### Requirement 3: Aprovar Questões Pendentes

**User Story:** Como um administrador, quero aprovar questões individuais de colaboradores, para que elas fiquem disponíveis em "Questões dos Colaboradores" e possam ser usadas em testes e torneios.

#### Acceptance Criteria

1. WHEN o admin clica no botão "Aprovar" em uma questão pendente, THE Sistema SHALL exibir um modal de confirmação
2. WHEN o admin confirma a aprovação, THE Sistema SHALL atualizar o status da questão para "aprovada" no banco de dados
3. WHEN a questão é aprovada, THE Sistema SHALL remover automaticamente da aba Questões Pendentes
4. WHEN a questão é aprovada, THE Sistema SHALL adicioná-la automaticamente à aba Questões dos Colaboradores
5. WHEN a questão é aprovada, THE Sistema SHALL notificar o colaborador criador sobre a aprovação

### Requirement 4: Aprovar Blocos Pendentes

**User Story:** Como um administrador, quero aprovar blocos de questões de colaboradores, para que o bloco completo com todas as suas questões fique disponível para uso.

#### Acceptance Criteria

1. WHEN o admin clica no botão "Aprovar Bloco" em um bloco pendente, THE Sistema SHALL exibir um modal de confirmação mostrando o bloco e suas questões
2. WHEN o admin confirma a aprovação do bloco, THE Sistema SHALL atualizar o status do bloco para "aprovado" no banco de dados
3. WHEN o admin aprova um bloco, THE Sistema SHALL também atualizar automaticamente o status de todas as suas questões internas para "aprovada"
4. WHEN um bloco é aprovado, THE Sistema SHALL remover automaticamente da aba Questões Pendentes
5. WHEN um bloco é aprovado, THE Sistema SHALL adicioná-lo automaticamente à aba Questões dos Colaboradores
6. WHEN um bloco é aprovado, THE Sistema SHALL notificar o colaborador criador sobre a aprovação

### Requirement 5: Rejeitar Questões Pendentes

**User Story:** Como um administrador, quero rejeitar questões que não atendem aos critérios de qualidade, para que o colaborador receba feedback e possa melhorar.

#### Acceptance Criteria

1. WHEN o admin clica no botão "Rejeitar" em uma questão pendente, THE Sistema SHALL exibir um modal solicitando um motivo de rejeição
2. WHEN o admin preenche o motivo e confirma a rejeição, THE Sistema SHALL atualizar o status da questão para "rejeitada" no banco de dados
3. WHEN a questão é rejeitada, THE Sistema SHALL remover automaticamente da aba Questões Pendentes
4. WHEN a questão é rejeitada, THE Sistema SHALL armazenar o motivo da rejeição associado à questão
5. WHEN uma questão é rejeitada, THE Sistema SHALL notificar o colaborador com o motivo para que possa corrigir

### Requirement 6: Rejeitar Blocos Pendentes

**User Story:** Como um administrador, quero rejeitar blocos inteiros que não atendem aos critérios, para que o colaborador possa revisar o bloco completo.

#### Acceptance Criteria

1. WHEN o admin clica no botão "Rejeitar Bloco" em um bloco pendente, THE Sistema SHALL exibir um modal solicitando um motivo de rejeição
2. WHEN o admin preenche o motivo e confirma a rejeição, THE Sistema SHALL atualizar o status do bloco para "rejeitado" no banco de dados
3. WHEN um bloco é rejeitado, THE Sistema SHALL não atualizar automaticamente o status das questões internas (ficam pendentes)
4. WHEN um bloco é rejeitado, THE Sistema SHALL armazenar o motivo associado ao bloco
5. WHEN um bloco é rejeitado, THE Sistema SHALL notificar o colaborador com o motivo

### Requirement 7: Exibir Questões Aprovadas dos Colaboradores

**User Story:** Como um administrador, quero visualizar todas as questões aprovadas de colaboradores, para que eu possa gerenciar, editar ou associá-las a testes e torneios.

#### Acceptance Criteria

1. WHEN a página Questões dos Colaboradores é carregada, THE Sistema SHALL exibir todas as questões com status "aprovada" agrupadas por colaborador
2. THE Questões dos Colaboradores SHALL exibir: título, criador (colaborador), disciplina, dificuldade, data de aprovação, status e ações (visualizar, editar, excluir, associar)
3. WHEN o usuário pesquisa por título, THE Sistema SHALL filtrar questões que correspondem ao termo de busca
4. WHEN o usuário filtra por colaborador, disciplina ou dificuldade, THE Sistema SHALL exibir apenas questões que correspondem aos critérios
5. WHEN o usuário clica em "Associar a Teste" ou "Associar a Torneio", THE Sistema SHALL abrir o BlocoQuestoesManager com a questão selecionada

### Requirement 8: Exibir Blocos Aprovados dos Colaboradores

**User Story:** Como um administrador, quero visualizar blocos aprovados de colaboradores, para que eu possa gerenciá-los e reutilizá-los em testes ou torneios.

#### Acceptance Criteria

1. WHEN a página Questões dos Colaboradores é carregada, THE Sistema SHALL exibir todos os blocos com status "aprovado"
2. THE Questões dos Colaboradores SHALL exibir para cada bloco: título, criador (colaborador), quantidade de questões, data de aprovação, status e ações (visualizar, gerenciar, associar, excluir)
3. WHEN o usuário expande um bloco, THE Sistema SHALL exibir todas as questões dentro do bloco
4. WHEN o usuário pesquisa, THE Sistema SHALL filtrar blocos por título ou nome do colaborador
5. WHEN o usuário clica em "Associar a Teste" ou "Associar a Torneio", THE Sistema SHALL abrir o BlocoQuestoesManager com o bloco selecionado

### Requirement 9: Compatibilidade com BlocoQuestoesManager

**User Story:** Como um administrador, quero que blocos de colaboradores funcionem identicamente aos blocos de testes e torneios, para que o sistema seja consistente.

#### Acceptance Criteria

1. WHEN um bloco aprovado de colaborador é adicionado a um teste via BlocoQuestoesManager, THE Sistema SHALL tratar idêntico a um bloco de teste comum
2. WHEN um bloco aprovado de colaborador é adicionado a um torneio via BlocoQuestoesManager, THE Sistema SHALL tratar idêntico a um bloco de torneio comum
3. WHEN blocos de colaborador são listados no BlocoQuestoesManager, THE Sistema SHALL identificar claramente sua origem (colaborador)
4. WHEN o contexto muda entre torneio e teste, THE Sistema SHALL manter os blocos de colaborador disponíveis em ambos os contextos
5. THE Sistema SHALL reutilizar 100% da lógica existente do BlocoQuestoesManager sem modificações estruturais

### Requirement 10: Editar Questões Pendentes e Aprovadas

**User Story:** Como um administrador, quero editar questões antes da aprovação e após a aprovação, para que eu possa corrigir erros ou melhorar o conteúdo.

#### Acceptance Criteria

1. WHEN o admin abre uma questão pendente e clica "Editar", THE Sistema SHALL exibir um formulário com todos os campos editáveis (título, enunciado, opções, resposta correta, dificuldade, disciplina)
2. WHEN o admin salva as edições de uma questão pendente, THE Sistema SHALL atualizar o registro mantendo o status "pendente"
3. WHEN o admin abre uma questão aprovada e clica "Editar", THE Sistema SHALL exibir um formulário com os mesmos campos editáveis
4. WHEN o admin salva as edições de uma questão aprovada, THE Sistema SHALL atualizar o registro mantendo o status "aprovada"
5. WHEN uma questão é editada, THE Sistema SHALL registrar a data de última modificação

### Requirement 11: Editar Blocos Pendentes e Aprovados

**User Story:** Como um administrador, quero editar blocos antes da aprovação e após a aprovação, para que eu possa ajustar o conteúdo.

#### Acceptance Criteria

1. WHEN o admin clica "Editar Bloco" em um bloco pendente, THE Sistema SHALL exibir um modal permitindo editar o título e gerenciar as questões dentro
2. WHEN o admin adiciona questões ao bloco via edição, THE Sistema SHALL validar que todas as questões são do mesmo colaborador
3. WHEN o admin remove questões do bloco via edição, THE Sistema SHALL atualizar o bloco
4. WHEN o admin salva as edições, THE Sistema SHALL atualizar o bloco mantendo seu status
5. WHEN um bloco é editado, THE Sistema SHALL registrar a data de última modificação

### Requirement 12: Excluir Questões e Blocos

**User Story:** Como um administrador, quero excluir questões e blocos inadequados, para que não fiquem poluindo a base de dados.

#### Acceptance Criteria

1. WHEN o admin clica no botão "Excluir" em uma questão, THE Sistema SHALL exibir um modal de confirmação
2. WHEN o admin confirma a exclusão, THE Sistema SHALL remover a questão do banco de dados
3. WHEN o admin exclui uma questão, IF a questão está associada a um bloco, THE Sistema SHALL atualizar a quantidade de questões do bloco
4. WHEN o admin clica no botão "Excluir Bloco", THE Sistema SHALL exibir um modal de confirmação mostrando quantas questões serão afetadas
5. WHEN o admin confirma a exclusão do bloco, THE Sistema SHALL remover o bloco do banco de dados (questões individuais permanecem)

### Requirement 13: Estados Consistentes com Padrão Existente

**User Story:** Como um desenvolvedor, quero que o sistema de estados de questões/blocos seja consistente com testes e torneios, para que o código seja previsível.

#### Acceptance Criteria

1. THE Sistema SHALL usar os mesmos nomes de estado em todas as abas: "pendente", "aprovada/o", "rejeitada/o"
2. WHEN exibindo status, THE Sistema SHALL usar a mesma paleta de cores para cada estado em todas as abas
3. WHEN manipulando estados, THE Sistema SHALL usar os mesmos métodos e convenções do código existente
4. THE Sistema SHALL sincronizar estados via banco de dados sem polling, reutilizando o padrão existente de Socket.IO quando aplicável

### Requirement 14: Performance e Paginação

**User Story:** Como um admin, quero que as abas carreguem rapidamente mesmo com muitas questões/blocos, para que eu possa trabalhar eficientemente.

#### Acceptance Criteria

1. WHEN a aba Questões Pendentes é aberta, THE Sistema SHALL carregar os dados e renderizar em menos de 2 segundos
2. THE Sistema SHALL implementar paginação com limite de 10-20 itens por página, reutilizando o componente de paginação existente
3. WHEN o usuário muda de página, THE Sistema SHALL carregar apenas os dados necessários via API
4. THE Questões dos Colaboradores SHALL também usar paginação com o mesmo padrão
5. THE Sistema SHALL manter estado de filtros e busca ao paginar

### Requirement 15: Tratamento de Erros e Estados Vazios

**User Story:** Como um usuário, quero ver mensagens claras quando algo dá errado ou quando não há dados, para que eu entenda o que está acontecendo.

#### Acceptance Criteria

1. WHEN uma aba não possui questões/blocos para exibir, THE Sistema SHALL mostrar uma mensagem amigável: "Nenhuma questão/bloco pendente"
2. WHEN uma requisição à API falha, THE Sistema SHALL exibir uma mensagem de erro e um botão para tentar novamente
3. WHEN os dados estão carregando, THE Sistema SHALL exibir um loading state consistente com o resto da aplicação
4. IF um erro ocorre durante aprovação/rejeição, THE Sistema SHALL notificar o usuário e permitir tentar novamente
5. WHEN um bloco não possui questões válidas, THE Sistema SHALL exibir um aviso antes de permitir aprovação

### Requirement 16: Reutilização de Componentes Existentes

**User Story:** Como um desenvolvedor, quero reutilizar ao máximo componentes já existentes, para que o código seja limpo e consistente.

#### Acceptance Criteria

1. THE Sistema SHALL usar o mesmo componente de tabela para exibir questões/blocos que é usado em testes e torneios
2. THE Sistema SHALL usar os mesmos formulários de edição de questões (CreateQuestaoForm, EditQuestaoForm)
3. THE Sistema SHALL usar os mesmos componentes de filtro, busca e paginação do projeto
4. THE Sistema SHALL usar o mesmo sistema de notificações e feedback visual existente
5. THE Sistema SHALL minimizar código novo, reutilizando hooks e utilities já existentes

