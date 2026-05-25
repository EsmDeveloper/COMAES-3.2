# Reestruturação Completa do Fluxo de Criação de Torneios

## Visão Geral
Transformar o processo de criação de torneios num fluxo profissional, intuitivo e totalmente integrado com o sistema de questões, participantes e rankings.

## Problema Atual
- Fluxo fragmentado entre múltiplas áreas
- Administrador precisa navegar por várias seções para completar uma tarefa
- Confusão operacional e redução de produtividade
- Falta de integração automática entre torneio e questões

## Objetivo Final
Criar experiência semelhante a plataformas profissionais de competições online (Codeforces, HackerRank, etc.)

---

## Requisitos Funcionais

### RF1: Wizard Multi-Step de Criação
O administrador deve passar por 4 passos sequenciais:

#### Passo 1 - Informações Básicas
- Nome do torneio (obrigatório)
- Descrição (obrigatório)
- Disciplina principal (obrigatório)
- Modalidade (obrigatório)
- Nível (obrigatório)
- Imagem/Banner (opcional)
- Regras resumidas (opcional)
- Validações em tempo real

#### Passo 2 - Configuração do Torneio
- Data de início (obrigatório)
- Data de encerramento (obrigatório)
- Número máximo de participantes (obrigatório)
- Número máximo de tentativas (obrigatório)
- Tempo limite por questão (obrigatório)
- Ranking ativo/inativo (toggle)
- Certificados ativos/inativo (toggle)
- Resumo visual das configurações

#### Passo 3 - Questões
Após criar o torneio:
- Exibir "Adicionar Questões Agora"
- Permitir: criar nova, importar existente, duplicar
- Visualizar quantidade por disciplina
- Mostrar: total de questões, total de pontos, distribuição por dificuldade
- Associação automática ao torneio_id

#### Passo 4 - Revisão
- Resumo completo dos dados
- Configurações
- Questões associadas
- Pontuação total
- Participantes máximos
- Confirmação final

### RF2: Página Unificada de Gestão do Torneio
Após criação, administrador acessa página com abas:
1. **Visão Geral** - Dashboard com métricas
2. **Questões** - Gerenciar questões do torneio
3. **Participantes** - Validar e gerenciar participantes
4. **Ranking** - Visualizar ranking em tempo real
5. **Estatísticas** - Análises e relatórios
6. **Configurações** - Editar dados do torneio

Sem necessidade de navegar para outros módulos.

### RF3: Integração Automática com Questões
- Toda questão criada dentro do torneio recebe automaticamente `torneio_id`
- Questões aparecem imediatamente na aba Questões
- Não é necessário selecionar o torneio novamente
- Sistema utiliza exclusivamente `Questao.js`

### RF4: Melhorias de UX
- Barra de progresso do wizard
- Auto-save de rascunho
- Validação instantânea com feedback
- Mensagens claras de erro
- Confirmações visuais
- Loading states
- Navegação entre passos (voltar/avançar)

### RF5: Validações de Negócio
Não permitir:
- Data final menor que data inicial
- Torneio sem nome
- Torneio sem disciplina
- Torneio publicado sem questões
- Limite de participantes inválido (< 1 ou > 1000)
- Tempo limite negativo ou zero

---

## Requisitos Não-Funcionais

### RNF1: Compatibilidade
- Manter compatibilidade com sistema existente
- Não criar modelos legados
- Não criar tabelas duplicadas
- Utilizar apenas modelos atuais

### RNF2: Performance
- Carregamento do wizard < 2s
- Auto-save sem bloquear UI
- Listagem de questões com paginação

### RNF3: Segurança
- Apenas admins podem criar torneios
- Validação de autorização em todas as operações
- Sanitização de inputs

### RNF4: Auditoria
- Registrar criação de torneio
- Registrar modificações
- Rastrear adição de questões

---

## Fluxos de Integração a Validar

### Fluxo 1: Admin → Torneio → Questões
1. Admin cria torneio no wizard
2. Sistema retorna torneio_id
3. Admin adiciona questões
4. Questões recebem torneio_id automaticamente
5. Questões aparecem na aba Questões

### Fluxo 2: Torneio → Participantes
1. Torneio criado e publicado
2. Participantes se inscrevem
3. Sistema valida limite máximo
4. Participantes aparecem na aba Participantes

### Fluxo 3: Participantes → Ranking
1. Participantes fazem tentativas
2. Sistema calcula pontuação
3. Ranking atualiza em tempo real
4. Certificados gerados automaticamente

### Fluxo 4: Ranking → Resultados
1. Ranking finalizado
2. Resultados exportáveis
3. Certificados disponíveis para download

---

## Critérios de Aceitação

- [ ] Wizard multi-step funcional com 4 passos
- [ ] Validações em tempo real implementadas
- [ ] Auto-save de rascunho funcionando
- [ ] Página de gestão com 6 abas operacional
- [ ] Integração automática com Questao.js confirmada
- [ ] Todos os fluxos de integração validados
- [ ] Testes de ponta a ponta passando
- [ ] Documentação atualizada
- [ ] Zero erros de console
- [ ] Responsivo em mobile/tablet/desktop
