# 📚 Exemplos de Uso de Ícones - Painel Administrativo

**Última Atualização:** 21 de Maio de 2026  
**Biblioteca:** Lucide React  
**Versão:** 1.0

---

## 🎯 Exemplos Práticos

### 1. Botão de Criar

```javascript
import { Plus } from 'lucide-react';

export function CreateButton() {
  return (
    <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 whitespace-nowrap">
      <Plus className="w-5 h-5" />
      <span>Adicionar Novo</span>
    </button>
  );
}
```

---

### 2. Botões de Ação em Tabela

```javascript
import { Edit, Trash2, Key, Eye } from 'lucide-react';

export function TableActions({ item, onEdit, onDelete, onResetPassword }) {
  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      {/* Editar */}
      <button
        onClick={() => onEdit(item)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 text-xs font-medium"
        title="Editar"
      >
        <Edit className="w-4 h-4" />
        <span className="hidden sm:inline">Editar</span>
      </button>

      {/* Redefinir Senha */}
      <button
        onClick={() => onResetPassword(item)}
        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 text-xs font-medium"
        title="Redefinir senha"
      >
        <Key className="w-4 h-4" />
        <span className="hidden sm:inline">Senha</span>
      </button>

      {/* Deletar */}
      <button
        onClick={() => onDelete(item)}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 text-xs font-medium"
        title="Excluir"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Excluir</span>
      </button>
    </div>
  );
}
```

---

### 3. Mensagem de Sucesso

```javascript
import { CheckCircle, X } from 'lucide-react';

export function SuccessMessage({ message, onClose }) {
  return (
    <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-sm animate-fade-in flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">Sucesso!</p>
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-green-600 hover:text-green-800 p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

---

### 4. Mensagem de Erro

```javascript
import { AlertCircle, X } from 'lucide-react';

export function ErrorMessage({ message, onClose }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm animate-fade-in flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">Erro</p>
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-red-600 hover:text-red-800 p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

---

### 5. Card de Estatísticas

```javascript
import { Users, Trophy, Ticket, TrendingUp } from 'lucide-react';

export function StatsCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-violet-600',
    orange: 'from-orange-500 to-red-600'
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
        </div>
        <Icon className="w-12 h-12 opacity-80" />
      </div>
    </div>
  );
}

// Uso
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatsCard
    title="Total de Usuários"
    value={1234}
    subtitle="45 administradores"
    icon={Users}
    color="blue"
  />
  <StatsCard
    title="Torneios Ativos"
    value={12}
    subtitle="5 total"
    icon={Trophy}
    color="green"
  />
  <StatsCard
    title="Tickets de Suporte"
    value={8}
    subtitle="3 resolvidos"
    icon={Ticket}
    color="orange"
  />
  <StatsCard
    title="Novos Usuários"
    value={45}
    subtitle="Últimos 7 dias"
    icon={TrendingUp}
    color="purple"
  />
</div>
```

---

### 6. Campo de Senha com Visibilidade

```javascript
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function PasswordField({ value, onChange, placeholder = "Digite sua senha" }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
```

---

### 7. Modal de Confirmação

```javascript
import { AlertCircle, Trash2, X } from 'lucide-react';

export function DeleteConfirmationModal({ item, onConfirm, onCancel, isLoading }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-red-500" />
            Confirmar Exclusão
          </h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
            <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-semibold">Atenção: Ação irreversível</p>
              <p className="text-red-700 text-sm">Esta operação não pode ser desfeita.</p>
            </div>
          </div>
          <p className="text-slate-600">
            Tem certeza que deseja excluir <strong>{item.name}</strong> permanentemente?
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-50 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deletando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Sim, Deletar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### 8. Menu Expansível

```javascript
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function ExpandableMenu({ title, icon: Icon, items }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 rounded-lg mb-2 transition-all duration-200 flex items-center justify-between font-semibold text-sm ${
          isExpanded
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-slate-700 hover:bg-white hover:shadow-md'
        }`}
      >
        <span className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-1 ml-2 mb-3">
          {items.map(item => (
            <button
              key={item.id}
              className="w-full px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 text-slate-600 hover:bg-white hover:shadow-sm"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 9. Estado Vazio

```javascript
import { Inbox } from 'lucide-react';

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <Inbox className="w-12 h-12 text-slate-300" />
      <div className="text-center">
        <p className="text-slate-500 font-medium">{title}</p>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  );
}

// Uso
<EmptyState
  title="Nenhum registro encontrado"
  description="Comece adicionando um novo registro"
/>
```

---

### 10. Barra de Busca

```javascript
import { Search } from 'lucide-react';

export function SearchBar({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
```

---

### 11. Indicador de Carregamento

```javascript
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = "Carregando..." }) {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-slate-600 font-medium">{message}</p>
    </div>
  );
}
```

---

### 12. Badge de Status

```javascript
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export function StatusBadge({ status }) {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Concluído'
    },
    pending: {
      icon: Clock,
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Pendente'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Erro'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 w-fit`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </div>
  );
}

// Uso
<StatusBadge status="completed" />
<StatusBadge status="pending" />
<StatusBadge status="error" />
```

---

## 🎨 Padrões de Cores

### Ações
- **Criar:** Verde (text-green-500)
- **Editar:** Azul (text-blue-500)
- **Deletar:** Vermelho (text-red-500)
- **Salvar:** Azul (text-blue-600)

### Feedback
- **Sucesso:** Verde (text-green-500)
- **Erro:** Vermelho (text-red-500)
- **Aviso:** Âmbar (text-amber-500)
- **Info:** Azul (text-blue-500)

### Estados
- **Ativo:** Verde
- **Inativo:** Cinza
- **Pendente:** Amarelo
- **Erro:** Vermelho

---

## 📏 Tamanhos Padrão

```javascript
// Pequeno (botões compactos)
<Icon className="w-4 h-4" />

// Normal (botões padrão)
<Icon className="w-5 h-5" />

// Grande (botões destacados)
<Icon className="w-6 h-6" />

// Extra grande (cards de stats)
<Icon className="w-12 h-12" />

// Header
<Icon className="w-8 h-8" />
```

---

## ✅ Checklist de Implementação

Ao usar ícones em novos componentes:

- [ ] Importar ícone do Lucide React
- [ ] Usar tamanho apropriado (w-4 h-4, w-5 h-5, etc.)
- [ ] Aplicar cor semântica
- [ ] Adicionar aria-label se necessário
- [ ] Testar em mobile
- [ ] Validar contraste de cores
- [ ] Documentar no ICON_REFERENCE.md

---

## 🔗 Recursos

- **Lucide React:** https://lucide.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Acessibilidade:** https://www.w3.org/WAI/ARIA/

---

**Mantido por:** Equipe de Desenvolvimento COMAES  
**Última Revisão:** 21 de Maio de 2026
