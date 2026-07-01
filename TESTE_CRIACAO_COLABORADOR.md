# 🧪 Guia de Teste - Criação de Colaborador pelo Admin

## 📍 Como Acessar

1. **Login**: admin@comaes.com (password que usas)
2. **Menu Lateral** → 👥 **Usuários & Comunidade**
3. Clicar em: **Gerenciar Usuários**
4. Botão: **➕ Adicionar Usuário**

---

## 🎯 Testar Criação de Colaborador

### Passo 1: Selecionar Tipo de Conta

Na modal que abrir, verás 3 opções:
- [ ] Usuário (estudante)
- [x] **Colaborador** ← Selecionar este
- [ ] Administrador

### Passo 2: Preencher Formulário Completo

**Campos Obrigatórios**:

```
Nome Completo:           João Silva Professor
Username Público:        prof_joao_silva
E-mail:                  joao.silva@exemplo.com
Telefone:                923456789
Data de Nascimento:      1985-05-15
Sexo:                    Masculino
Disciplina:              Matemática
Nível Académico:         Licenciado

Biografia (30-500 chars):
Licenciado em Matemática pela Universidade Agostinho Neto,
com 10 anos de experiência no ensino secundário e técnico.
Especialista em álgebra e geometria analítica.

Senha:                   Senha@123
Confirmar Senha:         Senha@123
```

### Passo 3: Testar Validações

#### ✅ Validação de Username:
- Deixar vazio → deve dar erro
- Digitar "ab" → "deve ter pelo menos 3 caracteres"
- Digitar "prof@joao" → "pode conter apenas letras, números, _ e -"

#### ✅ Validação de Biografia:
- Deixar vazio → "A biografia é obrigatória para colaborador"
- Digitar "teste" (5 chars) → "deve ter pelo menos 30 caracteres"
- Contador deve aparecer: `5/500 caracteres (mínimo 30)`

#### ✅ Validação de Nível Académico:
- Deixar em "Selecione o nível" → "O nível académico é obrigatório para colaborador"

### Passo 4: Submeter

Clicar no botão: **🎓 Criar Colaborador**

---

## ✅ Resultado Esperado

### Sucesso:
```
✅ "Usuário criado com sucesso."
✅ Modal fecha automaticamente
✅ Tabela atualiza com novo colaborador
✅ Status: Aprovado (verde)
✅ Role: colaborador
```

### Verificar no Banco (opcional):
```sql
SELECT id, nome, username, email, role, nivel_academico, 
       disciplina_colaborador, status_colaborador, 
       LENGTH(biografia) as bio_length
FROM usuarios 
WHERE email = 'joao.silva@exemplo.com';
```

Deve retornar:
- `username`: prof_joao_silva
- `role`: colaborador
- `nivel_academico`: licenciado
- `disciplina_colaborador`: matematica (lowercase!)
- `status_colaborador`: aprovado
- `bio_length`: entre 30 e 500

---

## ❌ Testes de Erro

### Teste 1: Username Duplicado
1. Criar colaborador com username: `prof_teste`
2. Tentar criar outro com mesmo username
3. **Espera**: "Este username já está em uso."

### Teste 2: Email Duplicado
1. Usar email que já existe
2. **Espera**: "Este e-mail já está registado."

### Teste 3: Biografia Curta
1. Digitar apenas "Professor de matemática" (23 chars)
2. **Espera**: "A biografia deve ter pelo menos 30 caracteres."

### Teste 4: Biografia Longa
1. Digitar mais de 500 caracteres
2. **Espera**: "A biografia não pode ter mais de 500 caracteres."

---

## 🔍 Verificação Final

### Testar Login do Colaborador Criado:
1. Logout do admin
2. Login com credenciais do colaborador criado
3. Deve redirecionar para: **Painel do Colaborador**
4. Verificar perfil: deve mostrar username, nível académico e biografia

---

## 📊 Checklist de Teste

- [ ] Consegui acessar "Gerenciar Usuários"
- [ ] Vi as 3 opções de tipo de conta (Usuário, Colaborador, Admin)
- [ ] Selecionei "Colaborador" e formulário mudou
- [ ] Formulário tem TODOS os campos:
  - [ ] Nome completo
  - [ ] Username público (NOVO)
  - [ ] E-mail
  - [ ] Telefone
  - [ ] Data de nascimento
  - [ ] Sexo
  - [ ] Disciplina
  - [ ] Nível académico (NOVO - dropdown com 8 opções)
  - [ ] Biografia (NOVO - com contador 30-500)
  - [ ] Senha + confirmação
- [ ] Validações funcionam em tempo real
- [ ] Contador de biografia aparece
- [ ] Consegui criar colaborador com sucesso
- [ ] Colaborador aparece na lista com status "Aprovado"
- [ ] Consegui fazer login com credenciais do colaborador criado

---

## 🐛 Se Algo Não Funcionar

### Erro: "Apenas o Administrador Supremo pode criar outros administradores"
- **Causa**: Está logado com usuário que não é ID=1
- **Solução**: Login com admin@comaes.com (Admin Master)

### Erro: "Unknown column 'username'"
- **Causa**: Banco de dados desatualizado
- **Solução**: Rodar migrations ou verificar se coluna `username` existe na tabela `usuarios`

### Erro: Formulário não muda ao selecionar "Colaborador"
- **Causa**: Cache do browser
- **Solução**: Ctrl+Shift+R (hard refresh) ou limpar cache

### Campos não aparecem
- **Causa**: Frontend não atualizou
- **Solução**: Parar e reiniciar `npm run dev` no frontend

---

## 📞 Problemas?

Se algum teste falhar:
1. Verificar console do browser (F12)
2. Verificar logs do backend
3. Confirmar que UserModal.jsx e UserController.js foram atualizados
4. Verificar se modelo User.js tem campos `username` e `nivel_academico`
