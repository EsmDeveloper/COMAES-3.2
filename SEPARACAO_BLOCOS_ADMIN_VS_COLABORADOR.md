# 🔧 Separação de Blocos: Admin vs Colaborador

## Problema
Os blocos criados pelo **Colaborador** estavam aparecendo na aba **"Questões de Torneios"** do Admin, que deveria mostrar apenas blocos criados pelo Admin.

## Solução Implementada

### 1. **Backend - BlocosController.js**
Modificado o método `listarBlocos()` para filtrar blocos por tipo de usuário:

```javascript
if (req.user?.isColaborador) {
  // Colaborador vê apenas SEUS blocos e sua disciplina
  where.disciplina = req.user.disciplina_colaborador;
  where.criado_por = req.user.id;  // ✅ Filtrar para ver apenas seus blocos
} else {
  // Admin vê apenas blocos criados por admin
  const admins = await User.findAll({
    attributes: ['id'],
    where: { is_colaborador: false }
  });
  const adminIds = admins.map(u => u.id);
  where.criado_por = { [Op.in]: adminIds };  // ✅ Apenas blocos de admin
}
```

**O que muda:**
- **Admin**: Agora vê apenas blocos onde `criado_por` é um admin (is_colaborador = false)
- **Colaborador**: Continua vendo apenas seus próprios blocos

### 2. **Fluxo de Dados**

**Quando Admin acessa "Questões de Torneios":**
```
QuestoesTorneiosTab.jsx
  ↓ fetchBlocos()
  ↓ GET /api/blocos
  ↓ BlocosController.listarBlocos()
  ↓ Filtra: WHERE criado_por IN (admin_ids)
  ↓ Retorna: Apenas blocos do Admin
```

**Quando Colaborador acessa "Criar Blocos":**
```
ColaboradorDashboard.jsx (CriarBlocosTab)
  ↓ GET /api/colaborador/blocos
  ↓ ColaboradorController.listarBlocosColaborador()
  ↓ Retorna: Apenas blocos do próprio Colaborador
```

## Endpoints Envolvidos

- **Admin**: `GET /api/blocos` → Retorna apenas blocos criados por admins
- **Colaborador**: `GET /api/colaborador/blocos` → Retorna apenas blocos do colaborador autenticado

## Arquivos Modificados

1. **BackEnd/controllers/BlocosController.js**
   - Adicionado import: `import User from '../models/User.js';`
   - Modificado: `export const listarBlocos()`
   - Lógica de filtro: Separação por `is_colaborador` e `criado_por`

## Logs para Debug

O sistema agora registra:
```
📦 Bloco {id} ({titulo}): {N} questões novo modelo + {M} questões modelo antigo = {total} total
```

## Testes Recomendados

1. ✅ Admin cria bloco → Aparece em "Questões de Torneios"
2. ✅ Colaborador cria bloco → NÃO aparece em "Questões de Torneios" do Admin
3. ✅ Colaborador vê apenas seus blocos em "Criar Blocos"
4. ✅ Múltiplos colaboradores veem apenas seus próprios blocos

## Notas

- O filtro `is_colaborador = false` identifica admins
- Blocos com status "pendente" continuam sendo blocos do colaborador aguardando aprovação
- Admin pode ver blocos em qualquer status (pendente, aprovado, rejeitado) se criados por admin
