# 🔧 Correção: Admin Não Recebia Blocos

## Problema
O Admin não estava vendo nenhum bloco na aba "Questões de Torneios" porque o filtro estava muito restritivo.

## Causa Raiz
A lógica anterior exigia que o bloco fosse criado por um admin:
```javascript
where.criado_por = { [Op.in]: adminIds };  // ❌ Muito restritivo
```

Se nenhum admin tinha criado blocos ainda, a lista retornava vazia.

## Solução Implementada
Modificado o filtro para permitir:
1. **Blocos criados por admin** - sempre visíveis
2. **Blocos APROVADOS de colaboradores** - visíveis (para gerenciar em torneios)
3. **Blocos PENDENTES de colaboradores** - NÃO visíveis (ficam na aba de aprovação)

### Novo Filtro
```javascript
where[Op.or] = [
  { criado_por: { [Op.in]: adminIds } },  // Blocos do admin
  { status: 'aprovado' }  // Blocos aprovados (de colaboradores)
];
```

## Fluxo de Blocos

### Para o Admin
```
Aba "Questões de Torneios" (Admin)
  ├─ Blocos criados por admin
  └─ Blocos APROVADOS de colaboradores
```

### Para o Colaborador
```
"Criar Blocos" (Colaborador)
  └─ Apenas seus próprios blocos
```

### Blocos Pendentes de Colaborador
```
Aba "Questões Pendentes" (Admin)
  └─ Blocos com status = 'pendente'
```

## Arquivo Modificado
- `BackEnd/controllers/BlocosController.js`

## Testes
- ✅ Admin vê blocos criados por ele
- ✅ Admin vê blocos aprovados de colaboradores
- ✅ Admin NÃO vê blocos pendentes de colaboradores
- ✅ Colaborador vê apenas seus blocos
- ✅ Colaborador PENDENTES vs Aprovados separados corretamente

## Status
✅ Correção implementada e testada
✅ Frontend compilado com sucesso
✅ Commit realizado
