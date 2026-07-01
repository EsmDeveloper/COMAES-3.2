# 🔍 Debug: Toggle de Administrador/Colaborador Não Aparece

**Data**: 22 de Junho de 2026  
**Problema**: As opções de "Administrador" e "Colaborador" não aparecem ao criar usuário

---

## 🎯 O Que Foi Corrigido

### **Ficheiro**: `FrontEnd/src/Administrador/UserModal.jsx`

**Antes:**
```javascript
const isSuperAdmin = Boolean(currentUser?.isAdmin);
```

**Depois (CORRIGIDO):**
```javascript
const isSuperAdmin = (
  String(currentUser?.id) === '1' || 
  Boolean(currentUser?.isAdmin) || 
  currentUser?.role === 'admin'
);
```

Agora verifica **3 condições** para identificar o Admin Master:
1. ✅ ID do usuário é 1
2. ✅ Campo `isAdmin` é true
3. ✅ Campo `role` é 'admin'

---

## 🔍 Como Verificar se Está Funcionando

### **Passo 1: Abrir Console do Navegador**

1. Pressione `F12` no navegador
2. Vá para a aba **Console**

### **Passo 2: Login como Admin Master**

```
Email: admin@comaes.com
Senha: [sua senha]
```

### **Passo 3: Ir para Gerenciar Usuários**

```
Painel Admin → Usuários & Comunidade → Gerenciar Usuários
```

### **Passo 4: Clicar em "Adicionar Usuário"**

Ao clicar, o console deve mostrar:

```
[UserModal] currentUser: {
  id: 1,
  nome: "Administrador Master",
  email: "admin@comaes.com",
  role: "admin",
  isAdmin: true,
  ...
}
[UserModal] isSuperAdmin: true
```

### **Passo 5: Verificar se o Toggle Aparece**

Se `isSuperAdmin: true`, deve aparecer:

```
┌────────────────────────────────────────┐
│   Tipo de conta                        │
│                                        │
│  [👤 Usuário]  [👨‍🏫 Colaborador]  [🛡️ Admin] │
│                                        │
└────────────────────────────────────────┘
```

---

## ❌ Se Ainda Não Aparecer

### **Cenário 1: `isSuperAdmin: false` no console**

**Problema**: O `currentUser` não tem ID=1 ou role='admin'

**Solução**:
```javascript
// Verificar no console o que está em currentUser
console.log(currentUser);

// Se id não é 1 ou role não é 'admin', o user não é Admin Master
// Verificar no banco de dados:
```

```sql
SELECT id, nome, email, role FROM usuarios WHERE email = 'admin@comaes.com';
```

### **Cenário 2: Console não mostra nada**

**Problema**: O modal não está abrindo ou há erro no componente

**Solução**:
1. Verificar erros no console (aba Console do F12)
2. Recarregar a página com `Ctrl + F5`
3. Limpar cache do navegador

### **Cenário 3: `currentUser` é `null` ou `undefined`**

**Problema**: O TableManager não está passando o user corretamente

**Solução**:
Verificar no TableManager.jsx linha 586:
```javascript
currentUser={user}  // Deve estar passando o user do useAuth()
```

---

## 🔧 Verificação Manual do Banco de Dados

```sql
-- 1. Verificar o Admin Master
SELECT id, nome, email, role 
FROM usuarios 
WHERE email = 'admin@comaes.com';

-- Resultado esperado:
-- id: 1
-- nome: Administrador Master
-- email: admin@comaes.com
-- role: admin
```

Se o resultado for diferente, há um problema no banco de dados.

---

## 🚀 Forçar Atualização do Frontend

Se fez alterações no código:

```bash
# No terminal, na pasta FrontEnd
npm run build

# Ou reiniciar o servidor de desenvolvimento
# Ctrl+C para parar
npm run dev
```

No navegador:
1. Pressione `Ctrl + Shift + Delete`
2. Limpar cache e cookies
3. Fechar e reabrir o navegador
4. Fazer login novamente

---

## ✅ Checklist de Verificação

- [ ] Console mostra `[UserModal] isSuperAdmin: true`
- [ ] Console mostra `currentUser.id: 1`
- [ ] Console mostra `currentUser.role: "admin"`
- [ ] Toggle com 3 opções aparece no modal
- [ ] Pode clicar em "Administrador" e "Colaborador"
- [ ] Formulário muda conforme o tipo selecionado

---

## 📞 Logs Úteis para Debug

Adicionar temporariamente no início do componente UserModal:

```javascript
useEffect(() => {
  console.log('='.repeat(50));
  console.log('UserModal Debug Info:');
  console.log('mode:', mode);
  console.log('currentUser:', currentUser);
  console.log('currentUser?.id:', currentUser?.id);
  console.log('String(currentUser?.id) === "1":', String(currentUser?.id) === '1');
  console.log('currentUser?.isAdmin:', currentUser?.isAdmin);
  console.log('currentUser?.role:', currentUser?.role);
  console.log('isSuperAdmin:', isSuperAdmin);
  console.log('isCreate:', isCreate);
  console.log('='.repeat(50));
}, [mode, currentUser, isSuperAdmin, isCreate]);
```

---

## 🎯 Resultado Esperado

Quando tudo estiver correto:

1. ✅ Console mostra `isSuperAdmin: true`
2. ✅ Modal mostra 3 opções de tipo de conta
3. ✅ Ao selecionar "Administrador": formulário simplificado (email + senha)
4. ✅ Ao selecionar "Colaborador": formulário completo + disciplina
5. ✅ Ao selecionar "Usuário": formulário completo padrão

---

**Próximos Passos**:
1. Abrir console (F12)
2. Ir para "Gerenciar Usuários"
3. Clicar "Adicionar Usuário"
4. Verificar logs no console
5. Reportar o que aparece se ainda não funcionar
