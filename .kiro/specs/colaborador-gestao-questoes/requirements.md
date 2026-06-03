# Requirements Document: Colaborador (Professor) - Gestão de Questões

## Introduction

Este documento detalha os requisitos para a implementação do perfil "Colaborador" (professor) no sistema COMAES. O colaborador é um terceiro papel de usuário, além de "estudante" e "admin", com acesso restrito exclusivamente à gestão de questões da disciplina a ele atribuída.

O sistema já possui a estrutura base implementada no modelo User.js com o campo `role` contendo o ENUM ('estudante', 'colaborador', 'admin') e o campo `disciplina_colaborador` para تحديد a disciplina do professor.

## Glossary

- **Usuario**: Entidade que representa um usuário do sistema, com campos: id, nome, telefone, email, nascimento, sexo, password, escola, imagem, biografia, role, disciplina_colaborador, isAdmin
- **Questao**: Entidade que representa uma questão do sistema, com campos: id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, linguagem, midia, autor_id, status_aprovacao, revisado_por, revisado_em, motivo_rejeicao
- **Disciplina**: Entidade que representa uma disciplina acadêmica, com campos: id, nome, slug, descricao, cor, ativo
- **Role**: Papel do usuário no sistema: estudante, colaborador, ou admin
- **disciplina_colaborador**: Campo que indica a disciplina atribuída ao colaborador: matematica, ingles, ou programacao
- **status_aprovacao**: Status de aprovação de uma questão: pendente, aprovada, ou rejeitada
- **JWT**: Json Web Token para autenticação
- **RBAC**: Role-Based Access Control - Controle de acesso baseado em papéis
- **API**: Application Programming Interface
- **OAuth**: Protocolo de autenticação social (Google)

## Requirements

### Requirement 1

**User Story:** Como um professor (colaborador), eu quero poder fazer login no sistema com minhas credenciais, para que eu possa acessar as funcionalidades de gestão de questões da minha disciplina.

#### Acceptance Criteria

1. WHEN a user provides valid credentials (email and password), THE AuthController SHALL verify the credentials against the database and return a valid JWT token
2. WHEN a user provides invalid email, THE AuthController SHALL return an error message "Email inválido"
3. WHEN a user provides invalid password, THE AuthController SHALL return an error message "Senha incorreta"
4. WHEN a user provides credentials for a non-existent user, THE AuthController SHALL return an error message "Usuário não encontrado"
5. WHEN authentication is successful, THE AuthController SHALL return a JWT token containing id, email, role, and disciplina_colaborador in the payload
6. WHEN authentication is successful, THE AuthController SHALL NOT return the user's password in the response

### Requirement 2

**User Story:** Como um professor (colaborador), eu quero criar questões para a minha disciplina, para que os estudantes possam respondê-las nos torneios.

#### Acceptance Criteria

1. WHEN a collaborator creates a question, THE QuestaoController SHALL create the question with status_aprovacao set to 'pendente'
2. WHEN a collaborator creates a question with disciplina different from their disciplina_colaborador, THE QuestaoController SHALL return error "Você só pode criar questões para sua disciplina"
3. WHEN a collaborator provides valid question data, THE QuestaoController SHALL save the question with autor_id set to the collaborator's user id
4. WHEN a collaborator creates a question with tipo 'multipla_escolha', THE QuestaoController SHALL require the opcoes field to be a valid JSON array
5. WHEN a collaborator provides invalid question data, THE QuestaoController SHALL return an appropriate validation error
6. THE QuestaoController SHALL return the created question with all provided fields

### Requirement 3

**User Story:** Como um professor (colaborador), eu quero listar as questões que criei, para que eu possa visualizar e gerenciar o meu conteúdo.

#### Acceptance Criteria

1. WHEN a collaborator requests their questions, THE QuestaoController SHALL return only questions where autor_id equals the collaborator's id
2. WHEN a collaborator requests their questions, THE QuestaoController SHALL filter results to return only questions from the collaborator's disciplina_colaborador
3. WHEN a collaborator provides a disciplina filter different from their disciplina_colaborador, THE QuestaoController SHALL return error "Você só pode ver questões da sua disciplina"
4. WHEN a collaborator provides optional filters (dificuldade, status_aprovacao), THE QuestaoController SHALL apply those filters to the query
5. THE QuestaoController SHALL return an empty array if the collaborator has no questions

### Requirement 4

**User Story:** Como um professor (colaborador), eu quero atualizar as questões que criei, para que eu possa corrigir erros ou melhorar o conteúdo.

#### Acceptance Criteria

1. WHEN a collaborator updates a question, THE QuestaoController SHALL verify that the question's autor_id matches the collaborator's id
2. WHEN a collaborator attempts to update a question from another collaborator, THE QuestaoController SHALL return error "Acesso negado"
3. WHEN a collaborator updates an approved question, THE QuestaoController SHALL return error "Não é possível editar questões já aprovadas" and set status back to 'pendente'
4. WHEN a collaborator provides valid updated data, THE QuestaoController SHALL save the changes and return the updated question
5. WHEN a collaborator updates the disciplina field, THE QuestaoController SHALL verify it matches the collaborator's disciplina_colaborador

### Requirement 5

**User Story:** Como um professor (colaborador), eu quero excluir as questões que criei, para que eu possa remover conteúdo irrelevante ou incorreto.

#### Acceptance Criteria

1. WHEN a collaborator deletes a question, THE QuestaoController SHALL verify that the question's autor_id matches the collaborator's id
2. WHEN a collaborator attempts to delete a question from another collaborator, THE QuestaoController SHALL return error "Acesso negado"
3. WHEN a collaborator deletes a question, THE QuestaoController SHALL permanently remove the question from the database
4. WHEN a collaborator deletes a question, THE Questao SHALL cascade delete associated responses if any exist

### Requirement 6

**User Story:** Como administrador (admin), eu quero visualizar todas as questões pendentes de aprovação, para que eu possa revisá-las e decidir se devem ser publicadas.

#### Acceptance Criteria

1. WHEN an admin requests pending questions, THE QuestaoController SHALL return all questions where status_aprovacao equals 'pendente'
2. WHEN an admin requests pending questions, THE QuestaoController SHALL include questions from all disciplines and all collaborators
3. THE QuestaoController SHALL return questions ordered by createdAt descending (newest first)
4. THE QuestaoController SHALL include the autor information (nome, email) with each question

### Requirement 7

**User Story:** Como administrador (admin), eu quero aprovar questões criadas por colaboradores, para que elas possam ser utilizadas nos torneios.

#### Acceptance Criteria

1. WHEN an admin approves a question, THE QuestaoController SHALL update status_aprovacao to 'aprovada'
2. WHEN an admin approves a question, THE QuestaoController SHALL set revisado_por to the admin's user id
3. WHEN an admin approves a question, THE QuestaoController SHALL set revisado_em to the current timestamp
4. WHEN an admin attempts to approve a question that does not exist, THE QuestaoController SHALL return error "Questão não encontrada"
5. WHEN an admin attempts to approve an already approved question, THE QuestaoController SHALL return error "Questão já está aprovada"
6. THE QuestaoController SHALL return the updated question with all review fields populated

### Requirement 8

**User Story:** Como administrador (admin), eu quero rejeitar questões que não atendem aos critérios de qualidade, para que os colaboradores possam saber o motivo e corrigi-las.

#### Acceptance Criteria

1. WHEN an admin rejects a question, THE QuestaoController SHALL require a motivo_rejeicao (rejection reason) to be provided
2. WHEN an admin rejects a question without a motivo_rejeicao, THE QuestaoController SHALL return error "Motivo da rejeição é obrigatório"
3. WHEN an admin rejects a question, THE QuestaoController SHALL update status_aprovacao to 'rejeitada'
4. WHEN an admin rejects a question, THE QuestaoController SHALL set motivo_rejeicao with the provided reason
5. WHEN an admin rejects a question, THE QuestaoController SHALL set revisado_por to the admin's user id and revisado_em to the current timestamp
6. THE QuestaoController SHALL return the updated question with all review fields populated

### Requirement 9

**User Story:** Como administrador (admin), eu quero criar novas disciplinas no sistema, para que eu possa organizar o conteúdo acadêmico.

#### Acceptance Criteria

1. WHEN an admin creates a new disciplina, THE DisciplinaController SHALL require nome (name) to be provided and unique
2. WHEN an admin creates a new disciplina, THE DisciplinaController SHALL automatically generate a slug from the nome
3. WHEN an admin creates a disciplina with a nome that already exists, THE DisciplinaController SHALL return error "Disciplina já existe"
4. THE DisciplinaController SHALL allow setting descricao and cor (hex color) as optional fields
5. THE DisciplinaController SHALL set ativo to true by default
6. THE DisciplinaController SHALL return the created disciplina with all fields

### Requirement 10

**User Story:** Como administrador (admin), eu quero listar todas as disciplinas cadastradas, para que eu possa visualizar a organização do sistema.

#### Acceptance Criteria

1. WHEN an admin requests all disciplinas, THE DisciplinaController SHALL return all disciplinas regardless of their ativo status
2. WHEN an admin requests all disciplinas, THE DisciplinaController SHALL order them by nome ascending
3. THE DisciplinaController SHALL include disciplina_colaborador count information if requested

### Requirement 11

**User Story:** Como administrador (admin), eu quero atribuir um usuário como colaborador de uma disciplina específica, para que ele possa criar questões para essa área.

#### Acceptance Criteria

1. WHEN an admin assigns a disciplina to a user, THE UserController SHALL update the user's role to 'colaborador'
2. WHEN an admin assigns a disciplina to a user, THE UserController SHALL set disciplina_colaborador to the specified disciplina
3. WHEN an admin attempts to assign disciplina to a user with role 'admin', THE UserController SHALL return error "Não é possível atribuir disciplina a admin"
4. WHEN an admin provides an invalid disciplina, THE UserController SHALL return error "Disciplina inválida"
5. WHEN an admin attempts to assign disciplina to a non-existent user, THE UserController SHALL return error "Usuário não encontrado"
6. THE UserController SHALL return the updated user with role and disciplina_colaborador populated

### Requirement 12

**User Story:** Como administrador (admin), eu quero listar os colaboradores de uma disciplina específica, para que eu possa gerenciar a equipe.

#### Acceptance Criteria

1. WHEN an admin requests collaborators by disciplina, THE DisciplinaController SHALL return all users where disciplina_colaborador matches the requested disciplina
2. THE DisciplinaController SHALL return user information including id, nome, email, and disciplina_colaborador

### Requirement 13

**User Story:** Como sistema, eu quero garantir que apenas usuários autenticados acessem as funcionalidades protegidas, para que a segurança seja mantida.

#### Acceptance Criteria

1. WHEN a request is made without a valid JWT token, THE AuthMiddleware SHALL return HTTP 401 Unauthorized
2. WHEN a request is made with an expired JWT token, THE AuthMiddleware SHALL return HTTP 401 Unauthorized
3. WHEN a request is made with an invalid JWT token, THE AuthMiddleware SHALL return HTTP 401 Unauthorized
4. THE AuthMiddleware SHALL extract user information from the token and attach it to the request object

### Requirement 14

**User Story:** Como sistema, eu quero garantir que cada usuário tenha acesso apenas às funcionalidades permitidas pelo seu papel, para que o RBAC seja respeitado.

#### Acceptance Criteria

1. WHEN a user with role 'estudante' attempts to access collaborator routes, THE RoleMiddleware SHALL return HTTP 403 Forbidden
2. WHEN a user with role 'colaborador' attempts to access admin routes, THE RoleMiddleware SHALL return HTTP 403 Forbidden
3. WHEN a user with role 'estudante' attempts to access admin routes, THE RoleMiddleware SHALL return HTTP 403 Forbidden
4. THE RoleMiddleware SHALL allow access to admin routes only for users with role 'admin'
5. THE RoleMiddleware SHALL allow access to collaborator routes only for users with role 'colaborador'

### Requirement 15

**User Story:** Como sistema, eu quero garantir que a integridade dos dados de revisão seja mantida, para que o histórico de aprovações seja confiável.

#### Acceptance Criteria

1. WHEN a question has status_aprovacao 'pendente', THE System SHALL ensure revisado_por is NULL
2. WHEN a question has status_aprovacao 'pendente', THE System SHALL ensure revisado_em is NULL
3. WHEN a question has status_aprovacao 'aprovada' or 'rejeitada', THE System SHALL ensure revisado_por is NOT NULL
4. WHEN a question has status_aprovacao 'aprovada' or 'rejeitada', THE System SHALL ensure revisado_em is NOT NULL
5. WHEN a question has status_aprovacao 'rejeitada', THE System SHALL ensure motivo_rejeicao is NOT NULL

### Requirement 16

**User Story:** Como usuário, eu quero que我的登录会话在24小时后过期, para que a segurança seja mantida mesmo se o token for comprometido.

#### Acceptance Criteria

1. WHEN a JWT token is generated, THE AuthController SHALL set the expiration to 24 hours
2. WHEN a user attempts to use an expired token, THE AuthMiddleware SHALL reject the request with HTTP 401

### Requirement 17 (Regression)

**User Story:** Como usuário existente, eu quero que as funcionalidades existentes não sejam afetadas pela adição do novo perfil, para que eu possa continuar usando o sistema normalmente.

#### Acceptance Criteria

1. THE existing authentication flow for students SHALL remain unchanged
2. THE existing admin functionality SHALL remain unchanged
3. THE existing public routes (GET /api/torneios) SHALL remain accessible without authentication
4. THE existing question answering flow for students SHALL remain unchanged

### Requirement 18 (Regression)

**User Story:** Como administrador, eu quero que todas as funcionalidades existentes de gestão continuem funcionando, para que a adição do colaborador não quebre o sistema.

#### Acceptance Criteria

1. THE existing TorneioController create and update operations SHALL continue to work as before
2. THE existing statistics endpoints SHALL continue to return data
3. THE existing user management (except disciplina assignment) SHALL remain unchanged
4. THE existing news management SHALL remain unchanged