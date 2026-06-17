# ✅ Guia de Teste - Notificações do Colaborador

## Pré-requisitos

1. ✅ Sistema COMAES-3.2 está rodando (Frontend + Backend)
2. ✅ Existe um usuário colaborador cadastrado
3. ✅ Existe um usuário administrador cadastrado
4. ✅ O subsistema de notificações está funcional no backend

## Cenários de Teste

### Cenário 1: Verificar Ícone no Dashboard
**Objetivo**: Confirmar que o ícone aparece no local correto

**Passos**:
1. Login como colaborador
2. Acesse o dashboard (`/colaborador`)
3. Procure pelo ícone 🔔 no canto superior direito

**Resultado Esperado**: ✅ Ícone visível e clicável no header

---

### Cenário 2: Abrir Modal de Notificações (Sem Notificações)
**Objetivo**: Testar comportamento com lista vazia

**Passos**:
1. Garantir que o colaborador não tem notificações
2. Click no ícone 🔔
3. Observe o modal que abre

**Resultado Esperado**: ✅ 
- Modal abre com animação suave
- Exibe "Sem notificações"
- Badge não aparece no ícone
- Botão "Marcar todas como lidas" não fica visível

---

### Cenário 3: Receber Notificação (Admin Envia)
**Objetivo**: Testar recebimento de notificação

**Passos**:
1. Em outra aba, acesse como administrador
2. Vá para o painel de notificações
3. Envie uma notificação para o colaborador (tipo: "Geral")
4. Volte à aba do colaborador
5. Clique no ícone 🔔

**Resultado Esperado**: ✅ 
- Badge aparece no ícone com número 1 (ou mais)
- Modal exibe a notificação
- Notificação está com background azul (não lida)
- Há um ponto azul à direita da notificação

---

### Cenário 4: Marcar Notificação como Lida
**Objetivo**: Testar funcionalidade de marcar como lida

**Passos**:
1. Com o modal aberto e notificação visível
2. Clique na notificação
3. Observe a mudança

**Resultado Esperado**: ✅ 
- Background muda para cinzento/claro
- Ponto azul desaparece
- Contador no badge diminui em 1
- Notificação fica com menos contraste (opacidade ~70%)

---

### Cenário 5: Marcar Todas Como Lidas
**Objetivo**: Testar botão de marcar tudo

**Passos**:
1. Envie 3+ notificações via admin
2. Abra o modal do colaborador
3. Clique em "Marcar todas como lidas"

**Resultado Esperado**: ✅ 
- Todas as notificações mudam de aparência
- Contador no badge vai para 0
- Badge desaparece do ícone
- Todas têm background claro

---

### Cenário 6: Fechar e Reabrir Modal
**Objetivo**: Testar persistência de dados

**Passos**:
1. Com notificações marcadas como lidas
2. Clique fora do modal para fechar
3. Clique novamente no ícone 🔔

**Resultado Esperado**: ✅ 
- Modal reabre
- Notificações permanecem com estado "lido"
- Badge não reaparece (está em 0)

---

### Cenário 7: Polling Automático (60 segundos)
**Objetivo**: Testar atualização de contagem automática

**Passos**:
1. Feche o modal
2. Badge está em 0
3. Via admin, envie uma notificação
4. Espere 60 segundos (ou menos para teste rápido)
5. Observe o ícone

**Resultado Esperado**: ✅ 
- Badge aparece/atualiza automaticamente
- Sem necessidade de recarregar página
- Sem necessidade de clicar no ícone

---

### Cenário 8: Tipos Diferentes de Notificações
**Objetivo**: Testar exibição correta de diferentes tipos

**Passos**:
1. Admin envia notificações de tipos diferentes:
   - Torneio
   - Resultado
   - Conquista
   - Sistema
   - Lembrete
   - Ranking
2. Colaborador abre o modal

**Resultado Esperado**: ✅ 
- Cada tipo tem uma cor diferente
- Labels exibem corretamente: "[Torneio]", "[Resultado]", etc.
- Cores estão corretas conforme especificação

---

### Cenário 9: Conteúdo de Notificação
**Objetivo**: Testar exibição de título e mensagem

**Passos**:
1. Admin envia notificação com:
   - Título: "Seu Bloco Foi Aprovado"
   - Mensagem: "Parabéns! Seu bloco de questões foi aprovado pelo administrador e está pronto para uso."
2. Colaborador abre o modal

**Resultado Esperado**: ✅ 
- Título aparece em negrito
- Mensagem aparece abaixo em texto menor
- Data/hora relativa aparece em cinzento no final
- Mensagem é truncada se for muito longa (máximo 2 linhas)

---

### Cenário 10: Responsividade Mobile
**Objetivo**: Testar funcionamento em dispositivos móveis

**Passos**:
1. Abra DevTools (F12)
2. Ative modo mobile/responsivo
3. Acesse o dashboard como colaborador
4. Clique no ícone 🔔

**Resultado Esperado**: ✅ 
- Ícone é visível no topo
- Modal se adapta à largura da tela
- Não há scroll horizontal indesejado
- Tudo continua funcional

---

### Cenário 11: Performance - Modal Rápido
**Objetivo**: Testar velocidade de abertura

**Passos**:
1. Tenha 50+ notificações
2. Clique no ícone 🔔
3. Mede tempo para modal aparecer

**Resultado Esperado**: ✅ 
- Modal abre em < 500ms
- Notificações começam a aparecer
- Scroll funciona suavemente

---

### Cenário 12: Badge Mostra "99+"
**Objetivo**: Testar comportamento com muitas notificações

**Passos**:
1. Admin envia 150+ notificações para o colaborador
2. Aguarde polling atualizar
3. Observe o badge

**Resultado Esperado**: ✅ 
- Badge exibe "99+" (não "150")
- Ícone fica visível mas não fica grande demais

---

### Cenário 13: Sair da Sessão e Voltar
**Objetivo**: Testar persistência entre sessões

**Passos**:
1. Notificações marcadas como lidas (badge = 0)
2. Logout do usuário
3. Login novamente
4. Clique no ícone 🔔

**Resultado Esperado**: ✅ 
- Notificações anteriormente lidas aparecem com status "lido"
- Não há duplicação de notificações
- Contagem é precisa

---

### Cenário 14: Compatibilidade de Navegadores
**Objetivo**: Testar em diferentes browsers

**Passos**:
1. Teste em Chrome/Edge
2. Teste em Firefox
3. Teste em Safari (se disponível)
4. Executar todos os cenários acima

**Resultado Esperado**: ✅ 
- Tudo funciona igual em todos os browsers
- Animações são suaves
- Sem erros no console

---

## Checklist Final

- [ ] Ícone aparece no header superior direito
- [ ] Badge mostra contagem correta
- [ ] Modal abre/fecha com animação
- [ ] Notificações carregam da API
- [ ] Diferentes tipos exibem com cores corretas
- [ ] Marcar como lida funciona
- [ ] Marcar todas como lidas funciona
- [ ] Polling atualiza a contagem a cada 60s
- [ ] Funciona em desktop
- [ ] Funciona em mobile
- [ ] Sem erros no console
- [ ] Sem warnings de React
- [ ] Performance é aceitável

## Possíveis Problemas e Soluções

### Problema 1: Badge não aparece
**Causa**: Dados não carregaram da API
**Solução**: 
1. Verificar se a API está rodando
2. Abrir DevTools → Network → filtrar por `/api/notificacoes`
3. Verificar se retorna status 200

### Problema 2: Modal não abre
**Causa**: Erro JavaScript
**Solução**: 
1. DevTools → Console
2. Procurar por erros em vermelho
3. Verificar se Framer Motion está importado

### Problema 3: Notificações não marcam como lidas
**Causa**: Erro no endpoint PATCH
**Solução**: 
1. DevTools → Network → filtrar por `/lido`
2. Verificar status (deve ser 200)
3. Verificar response da API

### Problema 4: Polling não funciona
**Causa**: Interval não está configurado corretamente
**Solução**: 
1. DevTools → Console → digitar `console.log('test')`
2. Mandar admin enviar notificação
3. Aguardar 60s e verificar se atualizou

## Como Debugar

### Ver Logs no Console
```javascript
// No console do navegador, pode-se ver:
// - Carregamento de notificações
// - Errors da API
// - Estados sendo atualizados
```

### Usar React DevTools
```
1. Install React DevTools (extensão)
2. Abra DevTools
3. Procure por ColaboradorDashboard
4. Veja states: notifications, unreadCount, etc.
```

### Monitorar Network
```
1. DevTools → Network tab
2. Filtrar por "notificacoes"
3. Verificar requisições GET e PATCH
4. Ver payloads e responses
```

---

## Resultado Esperado Final

✅ Sistema de notificações totalmente funcional com:
- Ícone visível e responsivo
- Contagem automática de não lidas
- Modal de fácil uso
- Tipos coloridos e identificáveis
- Marcar como lida com feedback visual
- Polling automático
- Zero erros e warnings
- Performance excelente
- Compatível com todos os dispositivos

---

**Versão**: 1.0
**Data**: Junho 2026
**Status**: Pronto para Teste
