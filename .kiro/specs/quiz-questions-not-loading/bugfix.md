# Bugfix Requirements Document

## Introduction

Este documento descreve os requisitos para corrigir o bug onde as questões de teste não são carregadas e exibidas na interface quando o usuário seleciona uma categoria (Matemática, Programação ou Inglês) na página de testes (Teste.jsx).

**Impacto:** Funcionalidade principal da página de testes está completamente quebrada, impedindo usuários de realizar testes de conhecimento em todas as três categorias disponíveis.

**Causa Raiz:** Incompatibilidade de formato de dados entre o frontend (Teste.jsx) e o backend (questoesService.js). O frontend espera campos `opcao_a`, `opcao_b`, `opcao_c`, `opcao_d`, `texto_pergunta`, mas o backend retorna `questao`, `opcoes` (array), `respostaCorreta`, `dificuldade`, `peso`.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN o frontend recebe dados do endpoint `/api/questoes/quiz/:area` com formato `{ questao, opcoes[], respostaCorreta, dificuldade, peso }` THEN o sistema tenta mapear campos inexistentes (`opcao_a`, `opcao_b`, `opcao_c`, `opcao_d`, `texto_pergunta`) resultando em questões vazias ou undefined

1.2 WHEN o frontend tenta acessar `q.opcao_a`, `q.opcao_b`, `q.opcao_c`, `q.opcao_d` em questões que possuem apenas `q.opcoes[]` THEN o sistema retorna undefined para todas as opções

1.3 WHEN o frontend tenta acessar `q.texto_pergunta` em questões que possuem apenas `q.questao` THEN o sistema retorna undefined para o texto da pergunta

1.4 WHEN o mapeamento de dados falha devido à incompatibilidade de formato THEN a interface exibe "Carregando Questões..." indefinidamente ou mostra cards de questões vazios sem conteúdo

### Expected Behavior (Correct)

2.1 WHEN o frontend recebe dados do endpoint `/api/questoes/quiz/:area` THEN o sistema SHALL processar corretamente o formato retornado pelo backend transformando `opcoes[]` em campos individuais ou adaptando o frontend para consumir arrays

2.2 WHEN o backend retorna questões com formato `{ id, questao, opcoes[], respostaCorreta, dificuldade, peso }` THEN o sistema SHALL mapear `questao` para `texto_pergunta` e `opcoes[0..3]` para `opcao_a`, `opcao_b`, `opcao_c`, `opcao_d`

2.3 WHEN o usuário clica em uma categoria (matematica, programacao, ingles) THEN o sistema SHALL carregar as questões do backend via API `/api/questoes/quiz/:area` e exibir corretamente todas as informações (pergunta e opções de resposta)

2.4 WHEN as questões são carregadas com sucesso THEN o sistema SHALL permitir que o usuário visualize as perguntas, selecione respostas e interaja com o quiz normalmente

### Unchanged Behavior (Regression Prevention)

3.1 WHEN o usuário não está autenticado THEN o sistema SHALL CONTINUE TO exibir a tela de acesso restrito com redirecionamento para login

3.2 WHEN o usuário seleciona uma resposta e envia via `enviarTentativa` THEN o sistema SHALL CONTINUE TO validar a resposta no backend e retornar pontuação correta

3.3 WHEN o timer de 30 segundos expira para uma questão THEN o sistema SHALL CONTINUE TO avançar automaticamente para a próxima questão

3.4 WHEN o usuário completa todas as questões do quiz THEN o sistema SHALL CONTINUE TO exibir a tela de resultados com pontuação, acertos, erros e total de questões

3.5 WHEN o usuário clica em "Voltar para áreas" THEN o sistema SHALL CONTINUE TO retornar à tela de seleção de categorias

3.6 WHEN questões de diferentes áreas (matematica, ingles, programacao) são solicitadas THEN o sistema SHALL CONTINUE TO filtrar corretamente por disciplina no backend
