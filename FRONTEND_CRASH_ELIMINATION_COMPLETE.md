# 🛡️ ELIMINAÇÃO COMPLETA DE CRASHES NO FRONTEND - COMAES 3.2

**Data**: 21 de Junho de 2026  
**Objetivo**: ZERO telas brancas, ZERO crashes de renderização  
**Componentes analisados**: 118 arquivos .jsx

---

## 🎯 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **"Objects are not valid as a React child"** (CRÍTICO)

**Ocorre quando**: Tentamos renderizar um objeto diretamente no JSX

```jsx
// ❌ ERRADO - Causa crash
<div>{questao}</div>           // Se questao é {texto: "...", correta: true}
<p>{user}</p>                   // Se user é {nome: "João", email: "..."}
<span>{response.data}</span>    // Se data é objeto

// ✅ CORRETO
<div>{questao?.texto}</div>
<p>{user?.nome}</p>
<span>{JSON.stringify(response.data)}</span>
```

**Arquivos afetados**: ~40 componentes

---

### 2. **Undefined/Null Access Crashes** (CRÍTICO)

**Ocorre quando**: Acessamos propriedades de undefined/null

```jsx
// ❌ ERRADO - Crash se data é null
{data.items.map(item => ...)}
{user.profile.avatar}
{response.results[0].name}

// ✅ CORRETO
{data?.items?.map(item => ...) ?? []}
{user?.profile?.avatar ?? '/default-avatar.png'}
{response?.results?.[0]?.name ?? 'Sem nome'}
```

**Arquivos afetados**: ~60 componentes

---

### 3. **Arrays de Objetos Mal Renderizados** (CRÍTICO)

**Ocorre quando**: Array de objetos não é mapeado corretamente

```jsx
// ❌ ERRADO - Renderiza [object Object] ou crash
<div>{opcoes}</div>  // opcoes = [{texto: "A", correta: false}, ...]

// ✅ CORRETO
<div>
  {Array.isArray(opcoes) && opcoes.map((opcao, index) => (
    <div key={index}>{opcao?.texto ?? 'Opção inválida'}</div>
  ))}
</div>
```

**Arquivos afetados**: ~25 componentes

---

### 4. **API Response Sem Validação** (ALTO)

**Ocorre quando**: Usamos dados da API sem verificar estrutura

```jsx
// ❌ ERRADO - Crash se API retorna formato diferente
const { data } = await api.get('/users');
setUsers(data);  // E se data.users? E se data é string?

// ✅ CORRETO
const response = await api.get('/users');
const userData = response?.data?.data ?? response?.data ?? [];
setUsers(Array.isArray(userData) ? userData : []);
```

**Arquivos afetados**: ~30 componentes

---

## 🔧 CORREÇÕES OBRIGATÓRIAS POR COMPONENTE

### **Teste.jsx** (CRÍTICO - já corrigido parcialmente)

**Problemas encontrados**:
1. `opcoes` pode ser array de objetos renderizado diretamente
2. Alternativas não são validadas antes de renderizar

**Correção aplicada**: Mapeamento seguro de opcoes

---

### **QuestoesColaboradoresTab.jsx** (CRÍTICO)

**Problema**: Renderização de objetos diretamente

```jsx
// ❌ Linha ~150 (aproximado)
<td>{alternativa}</td>  // alternativa é objeto!

// ✅ CORRIGIR PARA
<td>{alternativa?.texto ?? String(alternativa)}</td>
```

**Correção necessária**:
```jsx
// Encontrar todas as renderizações de alternativas e questões
{questao.alternativas?.map((alt, idx) => (
  <div key={idx}>
    <span>{alt?.texto ?? `Alternativa ${idx + 1}`}</span>
    <span>{alt?.correta ? '✓' : ''}</span>
  </div>
))}
```

---

### **AdminStats.jsx** (MÉDIO)

**Problema**: Atividades recentes podem conter objetos

```jsx
// ✅ VERIFICAR estrutura de atividades
{atividadesRecentes?.map((ativ, idx) => (
  <div key={ativ?.id ?? idx}>
    <p>{ativ?.descricao ?? 'Atividade desconhecida'}</p>
    <span>{ativ?.usuario?.nome ?? 'Usuário'}</span>
    <time>{ativ?.timestamp ?? new Date().toISOString()}</time>
  </div>
))}
```

---

### **TableManager.jsx** (CRÍTICO)

**Problema**: Renderização de valores de células sem validação

```jsx
// Linha ~450 (aproximado)
<td>{String(item[col] ?? 'N/A')}</td>  // ✅ Já tem String()

// MAS verificar se buildTableInfoFromData está seguro
const buildTableInfoFromData = (rows) => {
  const first = Array.isArray(rows) && rows.length > 0 ? rows[0] : {};
  // ✅ Protegido
};
```

---

### **MinhasQuestoes.jsx** (ALTO)

**Problema**: Questões podem ter estruturas variadas

```jsx
// ✅ APLICAR
{questoes?.map((questao) => (
  <div key={questao?.id ?? Math.random()}>
    <h3>{questao?.enunciado ?? 'Sem enunciado'}</h3>
    <div>
      {Array.isArray(questao?.opcoes) 
        ? questao.opcoes.map((opc, i) => (
            <p key={i}>{opc?.texto ?? opc?.label ?? `Opção ${i+1}`}</p>
          ))
        : <p>Sem opções disponíveis</p>
      }
    </div>
    <span>Status: {questao?.status ?? 'Pendente'}</span>
  </div>
))}
```

---

### **Dashboard.jsx** (MÉDIO)

**Problema**: Dados de gamificação podem ser null

```jsx
// ✅ PROTEGER
const xpAtual = user?.xp_total ?? 0;
const nivelAtual = user?.nivel_atual ?? 1;
const conquistas = user?.conquistas ?? [];

{conquistas?.map(conquista => (
  <div key={conquista?.id ?? Math.random()}>
    <img src={conquista?.icone ?? '/default-badge.png'} />
    <span>{conquista?.nome ?? 'Conquista'}</span>
  </div>
))}
```

---

### **Torneios.jsx / EntrarTorneio.jsx** (ALTO)

**Problema**: Dados de torneio podem estar incompletos

```jsx
// ✅ APLICAR
const renderTorneio = (torneio) => {
  if (!torneio) return null;
  
  return (
    <div>
      <h2>{torneio?.nome ?? 'Torneio sem nome'}</h2>
      <p>{torneio?.descricao ?? 'Sem descrição'}</p>
      <span>
        Participantes: {torneio?.participantes?.length ?? 0} / {torneio?.max_participantes ?? '∞'}
      </span>
      <time>
        Início: {torneio?.data_inicio 
          ? new Date(torneio.data_inicio).toLocaleDateString() 
          : 'A definir'}
      </time>
    </div>
  );
};
```

---

### **Ranking.jsx / RankingCompleto.jsx** (MÉDIO)

**Problema**: Posições de ranking podem ter dados missing

```jsx
// ✅ APLICAR
{ranking?.map((posicao, index) => (
  <tr key={posicao?.usuario_id ?? index}>
    <td>{posicao?.posicao ?? index + 1}</td>
    <td>
      <img 
        src={posicao?.usuario?.imagem ?? '/default-avatar.png'} 
        alt={posicao?.usuario?.nome ?? 'Usuário'}
      />
      {posicao?.usuario?.nome ?? 'Anônimo'}
    </td>
    <td>{posicao?.pontos ?? 0}</td>
    <td>{posicao?.vitorias ?? 0}</td>
  </tr>
))}
```

---

### **Certificacoes.jsx / MeusCertificados.jsx** (BAIXO)

**Problema**: Certificados podem ter campos missing

```jsx
// ✅ APLICAR
{certificados?.map(cert => (
  <div key={cert?.id ?? Math.random()}>
    <h3>{cert?.titulo ?? 'Certificado'}</h3>
    <p>Disciplina: {cert?.disciplina ?? 'Geral'}</p>
    <p>
      Emitido em: {cert?.data_emissao 
        ? new Date(cert.data_emissao).toLocaleDateString() 
        : 'Data inválida'}
    </p>
    <a href={cert?.url ?? '#'}>
      {cert?.url ? 'Baixar' : 'Indisponível'}
    </a>
  </div>
))}
```

---

### **ColaboradorDashboard.jsx** (MÉDIO)

**Problema**: Estatísticas de colaborador podem ser null

```jsx
// ✅ APLICAR
const stats = {
  questoesCriadas: estatisticas?.questoesCriadas ?? 0,
  questoesAprovadas: estatisticas?.questoesAprovadas ?? 0,
  questoesPendentes: estatisticas?.questoesPendentes ?? 0,
  questoesRejeitadas: estatisticas?.questoesRejeitadas ?? 0,
  taxaAprovacao: estatisticas?.taxaAprovacao ?? 0
};
```

---

### **NotificationsTab.jsx / Notificacoes.jsx** (BAIXO)

**Problema**: Conteúdo de notificação pode ser objeto JSON

```jsx
// ✅ APLICAR
const renderConteudo = (notificacao) => {
  try {
    const conteudo = typeof notificacao?.conteudo === 'string'
      ? JSON.parse(notificacao.conteudo)
      : notificacao?.conteudo;
    
    return (
      <div>
        <h4>{conteudo?.titulo ?? 'Notificação'}</h4>
        <p>{conteudo?.mensagem ?? String(conteudo)}</p>
      </div>
    );
  } catch (e) {
    return <p>{String(notificacao?.conteudo ?? 'Sem conteúdo')}</p>;
  }
};
```

---

## 📋 PADRÕES GLOBAIS DE CORREÇÃO

### **Pattern 1: Renderização Segura de Texto**

```jsx
// ✅ USE SEMPRE
{String(value ?? '')}
{value?.toString() ?? 'Default'}
{value || 'Fallback'}
```

### **Pattern 2: Renderização de Arrays**

```jsx
// ✅ SEMPRE validar array antes de map
{Array.isArray(items) && items.map((item, index) => (
  <div key={item?.id ?? index}>
    {item?.name ?? `Item ${index + 1}`}
  </div>
))}

// OU com fallback
{items?.length > 0 
  ? items.map((item, i) => <div key={i}>{item?.name}</div>)
  : <p>Nenhum item disponível</p>
}
```

### **Pattern 3: Acesso a Propriedades Aninhadas**

```jsx
// ✅ USE optional chaining
const nome = user?.profile?.name ?? 'Anônimo';
const avatar = data?.user?.avatar?.url ?? '/default.png';

// ✅ Para arrays aninhados
const primeiroItem = data?.results?.[0]?.name ?? 'Sem nome';
```

### **Pattern 4: API Response Validation**

```jsx
// ✅ SEMPRE validar estrutura
try {
  const response = await api.get('/endpoint');
  const data = response?.data;
  
  // Validar se é o formato esperado
  if (data && typeof data === 'object') {
    // Se espera array
    const items = Array.isArray(data) ? data : 
                  Array.isArray(data.data) ? data.data :
                  Array.isArray(data.items) ? data.items : [];
    setItems(items);
  } else {
    setItems([]);
  }
} catch (error) {
  console.error('Erro ao buscar dados:', error);
  setError('Erro ao carregar dados');
  setItems([]);
}
```

### **Pattern 5: Datas Seguras**

```jsx
// ✅ SEMPRE validar datas
const formatarData = (dataString) => {
  if (!dataString) return 'Data inválida';
  
  try {
    const data = new Date(dataString);
    return isNaN(data.getTime()) 
      ? 'Data inválida' 
      : data.toLocaleDateString('pt-AO');
  } catch {
    return 'Data inválida';
  }
};

// Uso
<time>{formatarData(torneio?.data_inicio)}</time>
```

### **Pattern 6: Imagens Seguras**

```jsx
// ✅ SEMPRE ter fallback
<img 
  src={user?.imagem || '/default-avatar.png'} 
  alt={user?.nome || 'Usuário'}
  onError={(e) => e.target.src = '/default-avatar.png'}
/>
```

### **Pattern 7: Componentes Condicionais**

```jsx
// ✅ Early return para dados ausentes
if (!data || !Array.isArray(data.items)) {
  return <div>Carregando...</div>;
}

// OU
if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <DataDisplay data={data} />;
```

---

## 🛡️ ERROR BOUNDARIES (ADICIONAR)

### **Criar ErrorBoundary Global**

```jsx
// FrontEnd/src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Algo deu errado</h2>
          <p>Por favor, recarregue a página ou contacte o suporte.</p>
          <button onClick={() => window.location.reload()}>
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### **Aplicar em App.jsx**

```jsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* rotas */}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

### **Error Boundaries por Seção**

```jsx
// Envolver cada página crítica
<ErrorBoundary>
  <AdminDashboard />
</ErrorBoundary>

<ErrorBoundary>
  <Teste />
</ErrorBoundary>

<ErrorBoundary>
  <Torneios />
</ErrorBoundary>
```

---

## 📊 CHECKLIST DE VERIFICAÇÃO

### Por Componente

- [ ] **Nenhum objeto renderizado diretamente** (usar `.propriedade` ou `String()`)
- [ ] **Todos arrays usam `.map()` corretamente** (com key e validação)
- [ ] **Optional chaining `?.` em todos acessos** a propriedades
- [ ] **Nullish coalescing `??`** para valores default
- [ ] **Array.isArray()** antes de `.map()`
- [ ] **Try/catch** em JSON.parse e operações que podem falhar
- [ ] **Validação de API response** antes de usar dados
- [ ] **Fallback images** para todas `<img>`
- [ ] **Validação de datas** antes de formatar
- [ ] **Keys únicas** em todos `.map()` (preferir `item.id`)

### Global

- [ ] **ErrorBoundary** no nível de App
- [ ] **ErrorBoundary** em páginas críticas
- [ ] **Loading states** para todas operações async
- [ ] **Error states** para falhas de API
- [ ] **Empty states** para listas vazias
- [ ] **404 page** configurada
- [ ] **Network error handler** global

---

## 🚀 SCRIPT DE VERIFICAÇÃO AUTOMÁTICA

```bash
# Procurar renderizações perigosas de objetos
grep -r "{[a-zA-Z_]*}" FrontEnd/src --include="*.jsx" | grep -v "?.

" | grep -v "String(" | wc -l
# Deve retornar 0

# Procurar .map sem Array.isArray
grep -r "\.map(" FrontEnd/src --include="*.jsx" -B2 | grep -v "Array.isArray" | wc -l
# Número baixo é bom

# Procurar acessos sem optional chaining
grep -r "\.[a-z]*\.[a-z]*" FrontEnd/src --include="*.jsx" | grep -v "?." | wc -l
# Número alto indica problema

# Verificar imports de ErrorBoundary
grep -r "ErrorBoundary" FrontEnd/src --include="*.jsx" | wc -l
# Deve ter múltiplas ocorrências
```

---

## ✅ VALIDAÇÃO FINAL

Após aplicar todas as correções:

### Testes Manuais

1. **Login** → Navegar para todas as páginas
2. **Admin Panel** → Abrir todas as abas
3. **Teste de Conhecimento** → Completar teste inteiro
4. **Torneios** → Ver lista, entrar, participar
5. **Ranking** → Ver ranking completo
6. **Perfil** → Editar dados
7. **Certificados** → Ver e baixar

### Verificar Console

- ❌ ZERO "Objects are not valid as a React child"
- ❌ ZERO "Cannot read property of undefined"
- ❌ ZERO "TypeError" em renderização
- ⚠️  Apenas warnings de desenvolvimento OK

### Verificar Navegação

- ✅ TODAS as páginas carregam
- ✅ Nenhuma tela branca
- ✅ Voltar/avançar funciona
- ✅ Refresh preserva estado (onde aplicável)

---

## 📁 ARQUIVOS PRIORITÁRIOS PARA CORREÇÃO

### Crítico (Corrigir AGORA)

1. `FrontEnd/src/Paginas/Secundarias/Teste.jsx`
2. `FrontEnd/src/Administrador/QuestoesColaboradoresTab.jsx`
3. `FrontEnd/src/Administrador/TableManager.jsx`
4. `FrontEnd/src/Paginas/Secundarias/MinhasQuestoes.jsx`
5. `FrontEnd/src/Paginas/Secundarias/Torneios.jsx`

### Alto (Corrigir hoje)

6. `FrontEnd/src/Paginas/Secundarias/Dashboard.jsx`
7. `FrontEnd/src/Paginas/Secundarias/Ranking.jsx`
8. `FrontEnd/src/Administrador/AdminStats.jsx`
9. `FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx`
10. `FrontEnd/src/Colaborador/ColaboradorDashboard.jsx`

### Médio (Corrigir esta semana)

11-50. Todos componentes admin
51-80. Componentes de certificados
81-118. Componentes auxiliares e modais

---

## 🎯 RESULTADO ESPERADO

Após aplicar TODAS as correções:

✅ **ZERO telas brancas**  
✅ **ZERO crashes de renderização**  
✅ **ZERO "Objects are not valid" errors**  
✅ **ZERO undefined/null crashes**  
✅ **100% das páginas estáveis**  
✅ **Navegação fluida e segura**  
✅ **App robusto contra dados inesperados**

**STATUS**: 📋 Documentação completa pronta  
**PRÓXIMO PASSO**: Aplicar correções sistematicamente em cada componente

