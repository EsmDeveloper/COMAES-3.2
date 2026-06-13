# 🧪 Teste Completo do Fluxo de Colaboradores

**Status**: Pronto para teste manual

**Data**: 12 de Junho de 2026

## Visão Geral do Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuário clica "Torne-se Colaborador"                         │
│    ↓                                                              │
│ 2. Preenche formulário (nome, email, área, documentos, etc.)   │
│    ↓                                                              │
│ 3. Clica "✓ Enviar Candidatura para Análise do Admin"          │
│    ↓                                                              │
│ 4. Candidatura enviada para backend                             │
│    ↓                                                              │
│ 5. Frontend mostra "Aprovação Pendente"                         │
│    ↓                                                              │
│ 6. Admin vê pedido na aba "Pedidos de Colaboradores"           │
│    ↓                                                              │
│ 7. Admin aprova/rejeita                                          │
│    ↓                                                              │
│ 8. Usuário recebe email de confirmação                          │
│    ↓                                                              │
│ 9. Usuário pode fazer login como colaborador                   │
└─────────────────────────────────────────────────────────────────┘
```

## Teste 1: Responsividade do Formulário

**Duração**: ~2 minutos

### Pré-requisitos
- Frontend rodando em http://localhost:5173
- Browser desktop com DevTools

### Passos

1. **Abrir página de colaboradores**
   ```
   URL: http://localhost:5173
   Clique em "Torne-se Colaborador"
   ```

2. **Verificar layout desktop (F12 → Toggle Device Toolbar)**
   ```
   ✓ Responsividade > 1024px (Desktop)
     - Painel azul à esquerda (1/3 da largura)
     - Formulário à direita (2/3 da largura)
     - Todos os 8 campos visíveis
     - Sem scroll horizontal
   
   ✓ Responsividade < 1024px (Tablet)
     - Layout vertical
     - Formulário em card centrado
   
   ✓ Responsividade < 768px (Mobile)
     - Layout móvel compacto
     - Botões e inputs full-width
   ```

3. **Verificar elementos do formulário**
   ```
   ✓ Campo "Nome completo" - PRESENTE e visível
   ✓ Campo "Username público" - visível
   ✓ Campo "E-mail" - visível
   ✓ Campo "Área de especialidade" - dropdown funcional
   ✓ Campo "Nível académico" - dropdown funcional
   ✓ Campo "Biografia profissional" - textarea funcional
   ✓ Campo "Palavra-passe" - com eye icon para toggle
   ✓ Campo "Confirmar palavra-passe" - com eye icon
   ✓ Upload de documentos - zona de drop funcional
   ✓ Resumo da candidatura - visível e atualizado
   ✓ Botão "✓ Enviar Candidatura..." - visível e clicável
   ```

---

## Teste 2: Preenchimento e Validação do Formulário

**Duração**: ~3 minutos

### Dados de Teste

```
Nome: João Silva Técnico
Username: joao_silva_tec
Email: joao@example.com
Área Especialidade: Programação
Nível Académico: Licenciado
Biografia: Sou técnico em programação com 5 anos de experiência em Python e JavaScript. 
           Gosto de ensinar e partilhar conhecimento com jovens estudantes.
Palavra-passe: TechPass@123
Confirmar: TechPass@123
Documentos: (opcional) Qualquer ficheiro PDF ou JPG
```

### Passos

1. **Preencher campo "Nome completo"**
   ```
   Input: "João Silva Técnico"
   Esperado:
     ✓ Campo aceita o valor
     ✓ Validação: "✓ Válido" em verde (após blur)
   ```

2. **Preencher campo "Username público"**
   ```
   Input: "joao_silva_tec"
   Esperado:
     ✓ Apenas letras, números, _ e -
     ✓ Entre 3-30 caracteres
     ✓ "✓ Válido" após blur
   ```

3. **Preencher campo "E-mail"**
   ```
   Input: "joao@example.com"
   Esperado:
     ✓ Validação de email com @
     ✓ "✓ Válido" após blur
   ```

4. **Selecionar "Área de especialidade"**
   ```
   Selecione: "Programação"
   Esperado:
     ✓ Dropdown abre
     ✓ Opção selecionável: Matemática, Programação, Inglês
     ✓ Valor atualiza após seleção
   ```

5. **Selecionar "Nível académico"**
   ```
   Selecione: "Licenciado"
   Esperado:
     ✓ Dropdown com 8 opções
     ✓ Valor atualiza
   ```

6. **Preencher "Biografia profissional"**
   ```
   Input: [Ver dados acima]
   Esperado:
     ✓ Textarea aceita valor
     ✓ Contador: "XX/500 caracteres" atualiza
     ✓ Mínimo 30 caracteres (validação)
   ```

7. **Preencher "Palavra-passe"**
   ```
   Input: "TechPass@123"
   Esperado:
     ✓ Texto oculto por padrão
     ✓ Eye icon permite toggle (mostrar/ocultar)
     ✓ Validação: Mínimo 8 caracteres, 1 maiúscula, 1 número, 1 especial
   ```

8. **Preencher "Confirmar palavra-passe"**
   ```
   Input: "TechPass@123"
   Esperado:
     ✓ Eye icon funciona
     ✓ Validação: Deve ser igual à senha anterior
     ✓ "✓ Válido" após blur
   ```

9. **Verificar "Resumo da candidatura"**
   ```
   Esperado:
     ✓ Caixa azul com 📋
     ✓ Mostra: Nome, Email, Área, Nível, Número de documentos
     ✓ Atualiza em tempo real conforme preenche
   ```

---

## Teste 3: Validação e Feedback

**Duração**: ~2 minutos

### Teste 3.1: Campos Obrigatórios Vazios

1. **Clicar "Enviar" sem preencher**
   ```
   Esperado:
     ✓ Mensagem de erro: "Este campo é obrigatório" em TODOS os campos
     ✓ Campos vazios ficam com borda vermelha
     ✓ Não envia para o backend
   ```

2. **Preencher parcialmente e validar**
   ```
   Preencher apenas: Nome e Email
   Clicar "Enviar"
   Esperado:
     ✓ Erros nos campos vazios
     ✓ Nenhuma requisição HTTP
   ```

### Teste 3.2: Validações Específicas

1. **Email inválido**
   ```
   Input: "email_sem_arroba.com"
   Esperado: "Endereço de e-mail inválido"
   ```

2. **Username muito curto**
   ```
   Input: "ab"
   Esperado: "Username deve ter 3-30 caracteres"
   ```

3. **Senha fraca**
   ```
   Input: "123"
   Esperado: "Senha fraca. Use maiúsculas, números e caracteres especiais"
   ```

4. **Senhas não combinam**
   ```
   Senha: "TechPass@123"
   Confirmar: "TechPass@124"
   Esperado (após blur confirm): "As senhas não coincidem"
   ```

5. **Biografia muito curta**
   ```
   Input: "Sou um professor."
   Esperado: "A biografia deve ter pelo menos 30 caracteres"
   ```

---

## Teste 4: Envio da Candidatura

**Duração**: ~5 minutos

### Pré-requisitos
- Backend rodando em http://localhost:3000
- Database MySQL conectada
- Postman ou DevTools Network aberto

### Passos

1. **Preencher formulário completamente** (usar dados do Teste 2)

2. **Clicar "✓ Enviar Candidatura para Análise do Admin"**
   ```
   Esperado (UI):
     ✓ Botão muda para: "⏳ Enviando candidatura..."
     ✓ Spinner de carregamento
     ✓ Botão fica disabled
   ```

3. **Verificar requisição HTTP** (DevTools Network)
   ```
   URL: POST http://localhost:3000/auth/registro-colaborador
   Content-Type: multipart/form-data (automático)
   
   Body esperado:
   {
     "nome": "João Silva Técnico",
     "username": "joao_silva_tec",
     "email": "joao@example.com",
     "password": "TechPass@123",
     "confirmPassword": "TechPass@123",
     "area_especialidade": "programacao",
     "nivel_academico": "licenciado",
     "biografia": "Sou técnico...",
     "documentos": [files array]
   }
   ```

4. **Verificar resposta backend** (Network Response)
   ```
   Status: 201 Created
   
   Response JSON:
   {
     "success": true,
     "message": "Candidatura criada com sucesso",
     "data": {
       "id": [ID gerado],
       "email": "joao@example.com",
       "status": "Pendente"
     }
   }
   ```

5. **Verificar tela pós-envio**
   ```
   Esperado:
     ✓ Página muda para "Aprovação Pendente"
     ✓ Mensagem: "Obrigado pela sua candidatura!"
     ✓ Email exibido: "joao@example.com"
     ✓ Informação: "A sua candidatura será analisada pelo administrador em breve"
     ✓ Botão: "Voltar ao Login"
   ```

---

## Teste 5: Verificar no Painel Admin

**Duração**: ~3 minutos

### Pré-requisitos
- Frontend rodando
- Admin logado em http://localhost:5173/admin

### Passos

1. **Admin navega para "Painel de Administrador"**
   ```
   URL: http://localhost:5173/admin
   ```

2. **Clica na aba "Colaboradores"**
   ```
   Esperado:
     ✓ Aba existe
     ✓ Subtabelas disponíveis
   ```

3. **Clica na sub-aba "Pedidos Pendentes"** (ou equivalente)
   ```
   Esperado:
     ✓ Candidatura de "João Silva Técnico" aparece
     ✓ Mostrados dados: Nome, Email, Área Especialidade, Status
     ✓ Ações disponíveis: Aprovar, Rejeitar, Ver Detalhes
   ```

4. **Clica "Ver Detalhes" ou abre o pedido**
   ```
   Esperado:
     ✓ Mostra todos os dados:
       - Nome: João Silva Técnico
       - Email: joao@example.com
       - Username: joao_silva_tec
       - Área: Programação
       - Nível: Licenciado
       - Biografia: [texto completo]
       - Documentos: [lista de ficheiros se uploaded]
   ```

5. **Admin clica "Aprovar"**
   ```
   Esperado:
     ✓ Candidatura muda para status "Aprovado"
     ✓ Utilizador criado no backend
     ✓ Email de confirmação enviado (se backend implementou)
     ✓ Pedido desaparece de "Pendentes"
   ```

---

## Teste 6: Validar Dados no Backend

**Duração**: ~2 minutos

### Verificar Database MySQL

```sql
-- 1. Verificar se o colaborador foi criado na tabela de utilizadores
SELECT id, nome, email, username, area_especialidade, status 
FROM usuarios 
WHERE username = 'joao_silva_tec';

-- Esperado:
-- id: [gerado]
-- nome: João Silva Técnico
-- email: joao@example.com
-- username: joao_silva_tec
-- area_especialidade: programacao
-- status: Aprovado (após admin aprovar)

-- 2. Verificar senha foi guardada com hash
SELECT password FROM usuarios WHERE username = 'joao_silva_tec';

-- Esperado:
-- password: [hash bcrypt, não texto plano]

-- 3. Verificar biografia
SELECT biografia FROM usuarios WHERE username = 'joao_silva_tec';

-- 4. Verificar documentos se foram guardados
SELECT id, nome_arquivo, tipo FROM documentos_colaborador 
WHERE usuario_id = [ID do João];
```

---

## Teste 7: Login como Colaborador

**Duração**: ~2 minutos

### Passos

1. **Navegar para login**
   ```
   URL: http://localhost:5173
   ```

2. **Fazer login com credenciais do João**
   ```
   Utilizador: joao_silva_tec (ou email)
   Senha: TechPass@123
   ```

3. **Verificar redirecionamento**
   ```
   Esperado:
     ✓ Login bem-sucedido
     ✓ Redirecionado para página de colaborador
     ✓ Dashboard mostra: "Bem-vindo, João!"
   ```

4. **Verificar funcionalidades de colaborador**
   ```
   ✓ Abas disponíveis: Minhas Questões, Meus Blocos, etc.
   ✓ Pode criar questões
   ✓ Pode criar blocos
   ```

---

## Checklist de Conclusão

### Frontend Responsividade
- [ ] Desktop (1920px+): Layout 1/3 + 2/3, sem scroll horizontal
- [ ] Tablet (1024px): Layout mantém proporção
- [ ] Mobile (<768px): Layout vertical, card centrado

### Formulário
- [ ] Nome campo presente e funcional
- [ ] Todos os 8 campos visíveis
- [ ] Validações funcionam
- [ ] Mensagens de erro em português
- [ ] Botão envio funciona

### Backend
- [ ] POST /auth/registro-colaborador recebe dados corretamente
- [ ] Area_especialidade salva corretamente (NÃO null)
- [ ] Documentos salvos se enviados
- [ ] Resposta HTTP 201 com dados do colaborador

### Admin Panel
- [ ] Abas de colaboradores existem
- [ ] Pedidos pendentes aparecem
- [ ] Admin pode aprovar/rejeitar
- [ ] Dados do colaborador mostram completos

### Email
- [ ] Email de confirmação enviado após aprovação (se implementado)

### Database
- [ ] Utilizador criado com role "colaborador"
- [ ] area_especialidade = "programacao" (não null)
- [ ] Senha guardada como hash bcrypt
- [ ] Status = "Aprovado" após admin aprovar

---

## Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Formulário não visível no desktop | Abrir DevTools, Ctrl+Shift+M para toggle mobile, verificar se md:hidden está funcionando |
| Campo Nome não existe | Refresh página, limpar cache (Ctrl+Shift+Delete) |
| area_especialidade null no DB | Verificar `BackEnd/controllers/colaboradorRegistroController.js` linha ~115 |
| Erro 404 ao enviar | Backend não rodando em :3000? Verificar `npm start` no BackEnd |
| Validação não funciona | Abrir Console (F12), verificar se algum JS error |
| Email não chega | Backend pode não ter SMTP configurado |

---

## Próximas Sessões

Após este teste completo, as próximas tarefas poderão incluir:
1. Implementar envio de emails (se não estiver)
2. Criar dashboard de colaborador
3. Implementar sistema de questões
4. Criar sistema de blocos de questões
5. Implementar torneios com questões

