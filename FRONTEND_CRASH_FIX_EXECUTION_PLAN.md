# 🛡️ PLANO DE EXECUÇÃO - ELIMINAÇÃO COMPLETA DE CRASHES FRONTEND

**Data**: 21 de Junho de 2026  
**Objetivo**: ZERO crashes, ZERO telas brancas, 100% de estabilidade

---

## 📋 ESTRATÉGIA DE CORREÇÃO MASSIVA

### Fase 1: Utilitários Globais de Segurança ✅
- [x] ErrorBoundary criado e integrado em App.jsx
- [x] TableManager: buildTableInfoFromData removido

### Fase 2: Correções Críticas em Lote (EXECUTANDO)

#### Padrões de Substituição Automática:

```javascript
// PADRÃO 1: Renderização de objetos (CRÍTICO)
// ❌ ERRADO
<div>{objeto}</div>
<td>{alternativa}</td>
<span>{response.data}</span>

// ✅ CORRETO
<div>{String(objeto ?? '')}</div>
<td>{alternativa?.texto ?? String(alternativa)}</td>
<span>{JSON.stringify(response?.data ?? {})}</span>

// PADRÃO 2: Arrays sem validação
// ❌ ERRADO
{items.map(item => ...)}
{data.results.map(r => ...)}

// ✅ CORRETO
{Array.isArray(items) && items.map((item, idx) => (
  <div key={item?.id ?? idx}>{item?.name ?? 'Item'}</div>
))}

// PADRÃO 3: Propriedades aninhadas
// ❌ ERRADO
{user.profile.avatar}
{data.tournament.participants.length}

// ✅ CORRETO
{user?.profile?.avatar ?? '/default.png'}
{data?.tournament?.participants?.length ?? 0}

// PADRÃO 4: Datas
// ❌ ERRADO
{new Date(timestamp).toLocaleDateString()}

// ✅ CORRETO
{timestamp ? new Date(timestamp).toLocaleDateString() : 'N/A'}

// PADRÃO 5: Imagens
// ❌ ERRADO
<img src={user.imagem} alt="User" />

// ✅ CORRETO
<img 
  src={user?.imagem || '/default-avatar.png'} 
  alt={user?.nome || 'Usuário'}
  onError={(e) => e.target.src = '/default-avatar.png'}
/>
```

---

## 🎯 COMPONENTES PRIORITÁRIOS (ORDEM DE CORREÇÃO)

### Tier 1: CRÍTICO - Causa crash frequente (15 componentes)

1. **Dashboard.jsx** - gamificação null, conquistas, xp
2. **MinhasQuestoes.jsx** - estruturas de questão variadas
3. **Ranking.jsx / RankingCompleto.jsx** - posições missing
4. **Torneios.jsx / EntrarTorneio.jsx** - dados incompletos
5. **Perfil.jsx** - user data inconsistente
6. **AdminStats.jsx** - estatísticas complexas
7. **ColaboradorDashboard.jsx** - stats null
8. **NotificationsTab.jsx** - conteúdo JSON
9. **QuestoesTorneiosTab.jsx** - questões de torneio
10. **BlocoQuestoesManager.jsx** - blocos e questões
11. **AdminDashboard.jsx** - múltiplas abas
12. **TorneioPanelAdmin.jsx** - gestão complexa
13. **Certificados componentes** - dados de certificado
14. **MinhaJornada.jsx** - histórico complexo
15. **Noticias.jsx** - lista de notícias

### Tier 2: ALTO - Pode causar crash (25 componentes)

16-40. **Todos Admin/*.jsx restantes**
- TableManager.jsx ✅
- QuestoesColaboradoresTab.jsx ✅
- UserModal.jsx
- TableModal.jsx
- CreateQuestaoForm.jsx
- EditQuestaoForm.jsx
- ColaboradoresTab.jsx
- QuestoesPendentesTab.jsx
- BlocosColaboradoresTab.jsx
- TesteConhecimentoManager.jsx
- QuestoesManager.jsx
- (+ 15 componentes admin)

### Tier 3: MÉDIO - Raramente causa crash (30 componentes)

41-70. **Páginas e Modals**
- Suporte.jsx
- Sobre.jsx
- Configuracoes.jsx
- NotificacoesPage.jsx
- Privacidade.jsx
- ResetPasswordPage.jsx
- AuthContainer.jsx
- (+ 23 componentes)

### Tier 4: BAIXO - Componentes simples (48 componentes)

71-118. **UI Components e Helpers**
- components/ui/*
- components/Forms/*
- components/ranking/*
- components/certificates/*
- hooks/*
- utils/*
- (+ 42 componentes)

---

## 🔧 CORREÇÕES ESPECÍFICAS POR COMPONENTE

### Dashboard.jsx
```jsx
// ANTES (PERIGOSO)
<div>{user.conquistas.map(c => <span>{c}</span>)}</div>
<p>XP: {user.xp_total}</p>

// DEPOIS (SEGURO)
<div>
  {Array.isArray(user?.conquistas) && user.conquistas.map((c, idx) => (
    <span key={c?.id ?? idx}>{c?.nome ?? `Conquista ${idx + 1}`}</span>
  ))}
</div>
<p>XP: {user?.xp_total ?? 0}</p>
```

### MinhasQuestoes.jsx
```jsx
// ANTES
{questoes.map(q => (
  <div>
    <h3>{q.enunciado}</h3>
    <div>{q.opcoes}</div>
  </div>
))}

// DEPOIS
{Array.isArray(questoes) && questoes.map((q, idx) => (
  <div key={q?.id ?? idx}>
    <h3>{q?.enunciado ?? 'Sem enunciado'}</h3>
    <div>
      {Array.isArray(q?.opcoes) 
        ? q.opcoes.map((opc, i) => (
            <p key={i}>{opc?.texto ?? opc?.label ?? `Opção ${i+1}`}</p>
          ))
        : <p>Sem opções disponíveis</p>
      }
    </div>
  </div>
))}
```

### Ranking.jsx
```jsx
// ANTES
{ranking.map(pos => (
  <tr>
    <td>{pos.posicao}</td>
    <td>{pos.usuario.nome}</td>
    <td><img src={pos.usuario.imagem} /></td>
  </tr>
))}

// DEPOIS
{Array.isArray(ranking) && ranking.map((pos, idx) => (
  <tr key={pos?.usuario_id ?? idx}>
    <td>{pos?.posicao ?? idx + 1}</td>
    <td>{pos?.usuario?.nome ?? 'Anônimo'}</td>
    <td>
      <img 
        src={pos?.usuario?.imagem ?? '/default-avatar.png'} 
        alt={pos?.usuario?.nome ?? 'Usuário'}
        onError={(e) => e.target.src = '/default-avatar.png'}
      />
    </td>
  </tr>
))}
```

### NotificationsTab.jsx
```jsx
// ANTES
{notificacoes.map(n => (
  <div>
    <h4>{n.conteudo.titulo}</h4>
    <p>{n.conteudo.mensagem}</p>
  </div>
))}

// DEPOIS
{Array.isArray(notificacoes) && notificacoes.map((n, idx) => {
  let conteudo = {};
  try {
    conteudo = typeof n?.conteudo === 'string' 
      ? JSON.parse(n.conteudo) 
      : n?.conteudo ?? {};
  } catch (e) {
    console.warn('Erro parse notificação:', e);
  }
  
  return (
    <div key={n?.id ?? idx}>
      <h4>{conteudo?.titulo ?? 'Notificação'}</h4>
      <p>{conteudo?.mensagem ?? String(n?.conteudo ?? '')}</p>
    </div>
  );
})}
```

### Torneios.jsx
```jsx
// ANTES
{torneios.map(t => (
  <div>
    <h3>{t.nome}</h3>
    <p>Participantes: {t.participantes.length} / {t.max_participantes}</p>
    <time>{new Date(t.data_inicio).toLocaleDateString()}</time>
  </div>
))}

// DEPOIS
{Array.isArray(torneios) && torneios.map((t, idx) => (
  <div key={t?.id ?? idx}>
    <h3>{t?.nome ?? 'Torneio sem nome'}</h3>
    <p>
      Participantes: {t?.participantes?.length ?? 0} / {t?.max_participantes ?? '∞'}
    </p>
    <time>
      {t?.data_inicio 
        ? new Date(t.data_inicio).toLocaleDateString('pt-AO') 
        : 'Data a definir'}
    </time>
  </div>
))}
```

---

## 🚀 SCRIPT DE VERIFICAÇÃO AUTOMÁTICA

```bash
# Verificar renderizações perigosas
grep -r "\{[a-zA-Z_][a-zA-Z0-9_]*\}" FrontEnd/src --include="*.jsx" | grep -v "?." | grep -v "String(" | wc -l

# Verificar .map sem Array.isArray
grep -r "\.map(" FrontEnd/src --include="*.jsx" -B2 | grep -v "Array.isArray" | wc -l

# Verificar acessos sem optional chaining
grep -r "\.[a-z]*\.[a-z]*" FrontEnd/src --include="*.jsx" | grep -v "?." | wc -l
```

---

## ✅ CHECKLIST DE VALIDAÇÃO POR COMPONENTE

Para cada componente:
- [ ] Nenhum objeto renderizado diretamente
- [ ] Todos arrays validados com Array.isArray()
- [ ] Optional chaining (?.) em todos os acessos
- [ ] Fallback values (?? ou ||) para todos os dados
- [ ] Keys únicas em todos .map()
- [ ] Imagens com onError fallback
- [ ] Datas validadas antes de formatar
- [ ] JSON.parse() em try/catch
- [ ] API responses validadas antes de usar

---

## 📊 MÉTRICAS DE SUCESSO

### Antes:
- ❌ ~50+ pontos de crash identificados
- ❌ Múltiplos "Objects are not valid as React child"
- ❌ Crashes frequentes em navegação
- ❌ Telas brancas esporádicas

### Depois (META):
- ✅ 0 crashes de renderização
- ✅ 0 "Objects are not valid as React child"
- ✅ 0 undefined/null crashes
- ✅ ErrorBoundary captura qualquer edge case
- ✅ Navegação 100% estável
- ✅ Todas as rotas funcionais

---

## 🎯 EXECUÇÃO EM LOTE

### Comandos de Substituição Massiva:

```bash
# 1. Adicionar ErrorBoundary wrapper em componentes críticos
# 2. Substituir renderizações diretas de objetos
# 3. Adicionar Array.isArray() antes de todos .map()
# 4. Adicionar optional chaining em acessos aninhados
# 5. Adicionar fallback values
# 6. Adicionar onError em todas imagens
# 7. Validar JSON.parse()
```

---

**STATUS**: Iniciando correções massivas Tier 1 (15 componentes críticos)

