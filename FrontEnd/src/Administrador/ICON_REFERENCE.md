# 🎨 Referência de Ícones - Painel Administrativo

**Última Atualização:** 21 de Maio de 2026  
**Biblioteca:** Lucide React  
**Status:** ✅ Todos os emojis substituídos

---

## 📦 Importação Padrão

```javascript
import { 
  // Ações
  Plus, Edit, Trash2, Save, X, Eye, EyeOff,
  // Navegação
  Menu, ArrowLeft, ChevronDown,
  // Feedback
  CheckCircle, AlertCircle, Loader2,
  // Dados
  Users, Trophy, Ticket, TrendingUp, Inbox,
  // Conteúdo
  FileText, BookOpen, Code, Calculator, Globe,
  // Sistema
  Settings, Lock, Key, Crown, Shield, Database,
  // Comunicação
  Bell, Send, Search, Filter,
  // Outros
  BarChart3, Award, Medal, Target, Zap, Briefcase, HelpCircle, Clock, Calendar
} from 'lucide-react';
```

---

## 🎯 Ícones por Contexto

### Ações Principais

| Ação | Ícone | Tamanho | Cor | Exemplo |
|------|-------|--------|-----|---------|
| Criar | `<Plus />` | w-4 h-4 | text-green-500 | Botão "Adicionar" |
| Editar | `<Edit />` | w-4 h-4 | text-blue-500 | Botão "Editar" |
| Deletar | `<Trash2 />` | w-4 h-4 | text-red-500 | Botão "Excluir" |
| Salvar | `<Save />` | w-4 h-4 | text-blue-600 | Botão "Salvar" |
| Fechar | `<X />` | w-5 h-5 | text-slate-400 | Botão fechar modal |
| Mostrar | `<Eye />` | w-4 h-4 | text-slate-400 | Mostrar senha |
| Ocultar | `<EyeOff />` | w-4 h-4 | text-slate-400 | Ocultar senha |

### Navegação

| Elemento | Ícone | Tamanho | Cor | Exemplo |
|----------|-------|--------|-----|---------|
| Menu | `<Menu />` | w-6 h-6 | text-slate-600 | Botão menu mobile |
| Voltar | `<ArrowLeft />` | w-4 h-4 | text-white | Botão "Voltar ao site" |
| Expandir | `<ChevronDown />` | w-4 h-4 | text-slate-600 | Seções expansíveis |

### Feedback e Status

| Status | Ícone | Tamanho | Cor | Exemplo |
|--------|-------|--------|-----|---------|
| Sucesso | `<CheckCircle />` | w-5 h-5 | text-green-500 | Mensagem de sucesso |
| Erro | `<AlertCircle />` | w-5 h-5 | text-red-500 | Mensagem de erro |
| Aviso | `<AlertCircle />` | w-8 h-8 | text-red-500 | Modal de confirmação |
| Carregando | `<Loader2 />` | w-4 h-4 | text-white | Spinner de loading |

### Dados e Estatísticas

| Tipo | Ícone | Tamanho | Cor | Exemplo |
|------|-------|--------|-----|---------|
| Usuários | `<Users />` | w-12 h-12 | opacity-80 | Card de estatísticas |
| Torneios | `<Trophy />` | w-12 h-12 | opacity-80 | Card de estatísticas |
| Suporte | `<Ticket />` | w-12 h-12 | opacity-80 | Card de estatísticas |
| Crescimento | `<TrendingUp />` | w-12 h-12 | opacity-80 | Card de estatísticas |
| Vazio | `<Inbox />` | w-12 h-12 | text-slate-300 | Estado vazio de tabela |

### Conteúdo

| Tipo | Ícone | Tamanho | Cor | Exemplo |
|------|-------|--------|-----|---------|
| Arquivo | `<FileText />` | w-5 h-5 | text-slate-600 | Tentativas, Notícias |
| Livro | `<BookOpen />` | w-5 h-5 | text-slate-600 | Questões |
| Código | `<Code />` | w-5 h-5 | text-slate-600 | Programação |
| Calculadora | `<Calculator />` | w-5 h-5 | text-slate-600 | Matemática |
| Globo | `<Globe />` | w-5 h-5 | text-slate-600 | Inglês |

### Sistema e Segurança

| Elemento | Ícone | Tamanho | Cor | Exemplo |
|----------|-------|--------|-----|---------|
| Configurações | `<Settings />` | w-5 h-5 | text-slate-600 | Menu de sistema |
| Segurança | `<Lock />` | w-3 h-3 | text-slate-400 | Indicador de segurança |
| Chave | `<Key />` | w-4 h-4 | text-amber-500 | Redefinir senha |
| Admin | `<Crown />` | w-4 h-4 | text-purple-600 | Privilégios admin |
| Permissões | `<Shield />` | w-5 h-5 | text-slate-600 | Funções/Permissões |
| Banco de Dados | `<Database />` | w-5 h-5 | text-slate-600 | Redefinições |

### Comunicação

| Elemento | Ícone | Tamanho | Cor | Exemplo |
|----------|-------|--------|-----|---------|
| Notificações | `<Bell />` | w-8 h-8 | text-blue-600 | Header do painel |
| Enviar | `<Send />` | w-4 h-4 | text-white | Botão enviar |
| Buscar | `<Search />` | w-4 h-4 | text-gray-400 | Campo de busca |
| Filtrar | `<Filter />` | w-4 h-4 | text-gray-600 | Botão de filtro |

### Outros

| Elemento | Ícone | Tamanho | Cor | Exemplo |
|----------|-------|--------|-----|---------|
| Dashboard | `<BarChart3 />` | w-8 h-8 | text-blue-600 | Menu principal |
| Conquistas | `<Award />` | w-5 h-5 | text-slate-600 | Gamificação |
| Medalhas | `<Medal />` | w-5 h-5 | text-slate-600 | Conquistas de usuário |
| Alvo | `<Target />` | w-5 h-5 | text-slate-600 | Participantes |
| Raio | `<Zap />` | w-5 h-5 | text-slate-600 | Suporte/Operações |
| Pasta | `<Briefcase />` | w-5 h-5 | text-slate-600 | Funções |
| Ajuda | `<HelpCircle />` | w-5 h-5 | text-slate-600 | Perguntas |
| Relógio | `<Clock />` | w-4 h-4 | text-gray-500 | Tempo/Data |
| Calendário | `<Calendar />` | w-4 h-4 | text-gray-500 | Data |

---

## 💡 Padrões de Uso

### Botões de Ação

```javascript
// Criar
<button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
  <Plus className="w-4 h-4" />
  <span>Adicionar</span>
</button>

// Editar
<button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5">
  <Edit className="w-4 h-4" />
  <span className="hidden sm:inline">Editar</span>
</button>

// Deletar
<button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5">
  <Trash2 className="w-4 h-4" />
  <span className="hidden sm:inline">Excluir</span>
</button>
```

### Mensagens de Feedback

```javascript
// Sucesso
<div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center gap-3">
  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
  <div>
    <p className="font-semibold">Sucesso!</p>
    <p className="text-sm">Operação realizada com sucesso</p>
  </div>
</div>

// Erro
<div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center gap-3">
  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
  <div>
    <p className="font-semibold">Erro</p>
    <p className="text-sm">Ocorreu um erro ao processar</p>
  </div>
</div>
```

### Cards de Estatísticas

```javascript
<div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-white/80 text-sm font-medium mb-1">Total de Usuários</p>
      <p className="text-3xl font-bold mb-1">1,234</p>
      <p className="text-white/70 text-sm">45 administradores</p>
    </div>
    <Users className="w-12 h-12 opacity-80" />
  </div>
</div>
```

### Campos de Senha

```javascript
<div className="relative">
  <input 
    type={showPassword ? 'text' : 'password'} 
    className="w-full px-4 py-2.5 border rounded-xl"
    placeholder="Digite sua senha"
  />
  <button 
    type="button" 
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
  >
    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
</div>
```

---

## 🎨 Tamanhos Recomendados

| Contexto | Tamanho | Classe Tailwind |
|----------|---------|-----------------|
| Botões pequenos | 16px | w-4 h-4 |
| Botões normais | 20px | w-5 h-5 |
| Botões grandes | 24px | w-6 h-6 |
| Cards de stats | 48px | w-12 h-12 |
| Headers | 32px | w-8 h-8 |
| Inline (labels) | 16px | w-4 h-4 |

---

## 🎯 Cores Recomendadas

| Tipo | Cor | Classe Tailwind |
|------|-----|-----------------|
| Sucesso | Verde | text-green-500 |
| Erro | Vermelho | text-red-500 |
| Aviso | Âmbar | text-amber-500 |
| Info | Azul | text-blue-500 |
| Neutro | Cinza | text-slate-400 |
| Destaque | Roxo | text-purple-600 |

---

## ✅ Checklist para Novos Componentes

Ao criar novos componentes no painel administrativo:

- [ ] Usar ícones do Lucide React (não emojis)
- [ ] Importar ícones necessários no topo do arquivo
- [ ] Usar tamanhos padronizados (w-4 h-4, w-5 h-5, etc.)
- [ ] Aplicar cores semânticas (verde=sucesso, vermelho=erro, etc.)
- [ ] Adicionar aria-labels para acessibilidade
- [ ] Testar em mobile, tablet e desktop
- [ ] Validar contraste de cores
- [ ] Documentar novos ícones neste arquivo

---

## 📚 Recursos

- **Lucide React:** https://lucide.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Acessibilidade:** https://www.w3.org/WAI/ARIA/

---

**Mantido por:** Equipe de Desenvolvimento COMAES  
**Última Revisão:** 21 de Maio de 2026
