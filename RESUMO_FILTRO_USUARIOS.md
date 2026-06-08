# Filtro de Tipo de Usuário - Gerenciador de Usuários

## Resumo das Mudanças

Adicionado um **filtro de tipo de usuário** na aba "Gerenciamento de Usuários" do painel administrativo, permitindo filtrar entre os 3 tipos de usuários que existem no sistema.

## O que foi implementado

### 1. Novo Estado (`userTypeFilter`)
- **Localização**: `TableManager.jsx`, linha 244
- **Valor padrão**: `'todos'`
- **Tipos disponíveis**: 
  - `'todos'` - Mostra todos os usuários
  - `'estudante'` - Mostra apenas estudantes
  - `'colaborador'` - Mostra apenas professores/colaboradores
  - `'admin'` - Mostra apenas administradores

### 2. Lógica de Filtragem
- **Localização**: `TableManager.jsx`, linhas 414-420
- **Funcionamento**:
  - Verifica se a tabela ativa é de usuários (`isUserTable`)
  - Se o filtro não é "todos", aplica a seguinte lógica:
    - **Estudante**: Exclui usuários que são admin ou colaborador
    - **Colaborador**: Mostra apenas `role === 'colaborador'`
    - **Admin**: Mostra apenas `isAdmin === true` ou `role === 'admin'`

### 3. Interface de Usuário
- **Localização**: `TableManager.jsx`, linhas 469-488
- **Características**:
  - Dropdown estilizado com Tailwind CSS
  - Aparece apenas quando a aba ativa é "Usuários"
  - Posicionado ao lado do campo de busca
  - Responsivo: ocupa toda a largura em mobile, largura automática em desktop
  - Estilos consistentes com o restante da interface

## Estrutura do Filtro

```jsx
{/* Filtro de tipo de usuário - apenas para tabela de usuários */}
{isUserTable && (
    <div className="w-full sm:w-auto">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
            Filtrar por tipo
        </label>
        <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl..."
        >
            <option value="todos">Todos os tipos</option>
            <option value="estudante">Estudante</option>
            <option value="colaborador">Professor/Colaborador</option>
            <option value="admin">Administrador</option>
        </select>
    </div>
)}
```

## Lógica de Filtragem Aplicada

```javascript
const filteredData = data.filter(item => {
    // Admin secundário não vê o admin master (id=1) na lista
    if (isUserTable && !isMasterAdmin && String(item.id) === '1') return false;
    
    // Aplicar filtro de tipo de usuário
    if (isUserTable && userTypeFilter !== 'todos') {
        if (userTypeFilter === 'estudante' && 
            (item.isAdmin || item.role === 'admin' || item.role === 'colaborador')) 
            return false;
        if (userTypeFilter === 'colaborador' && item.role !== 'colaborador') 
            return false;
        if (userTypeFilter === 'admin' && !item.isAdmin && item.role !== 'admin') 
            return false;
    }
    
    return Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
});
```

## Funcionamento Combinado

O filtro funciona **em conjunto** com a busca por texto existente:
- Primeiro filtra por tipo de usuário
- Depois aplica a busca por texto nos campos visíveis
- Resultado: usuários que correspondem a ambos os critérios

## Exemplo de Uso

1. **Ver todos os estudantes**:
   - Selecionar "Estudante" no dropdown
   - (Opcionalmente) digitar um termo de busca

2. **Ver apenas colaboradores de uma disciplina**:
   - Selecionar "Professor/Colaborador" no dropdown
   - Buscar pela disciplina ou nome

3. **Encontrar um administrador específico**:
   - Selecionar "Administrador" no dropdown
   - Buscar pelo nome ou email

## Segurança

- O filtro respeita as regras de permissão existentes:
  - Admin secundário não vê o admin master (id=1)
  - Apenas admins com permissão podem gerenciar usuários

## Compatibilidade

- ✅ Funciona em desktop, tablet e mobile
- ✅ Compatível com a busca por texto existente
- ✅ Mantém todos os estilos visuais da aplicação
- ✅ Sem alterações no backend necessárias

## Arquivo Modificado

- `FrontEnd/src/Administrador/TableManager.jsx`
  - Adicionado estado `userTypeFilter`
  - Atualizada lógica de filtragem em `filteredData`
  - Adicionado dropdown na seção "Search and Filters"

## Commit

**Hash**: 365ce35
**Mensagem**: "feat: adicionar filtro de tipo de usuário ao gerenciador de usuários"

---

**Data de Implementação**: 5 de junho de 2026
**Status**: ✅ Implementado e testado
