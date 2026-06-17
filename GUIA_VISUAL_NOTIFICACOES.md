# 📍 Guia Visual - Ícone de Notificações

## Localização do Ícone

```
┌──────────────────────────────────────────────────────────────────┐
│ ≡ Menu                                      🔔 <-- AQUI!  👤    │
│ Painel do Colaborador                       (99+)              │
│ Gerencie suas questões e conteúdo                              │
└──────────────────────────────────────────────────────────────────┘
```

O ícone está no **canto superior direito** do header, logo antes do avatar do usuário.

## Componentes Visuais

### 1️⃣ Ícone Padrão (sem notificações)
```
🔔
```
Ícone de sino cinzento, clicável.

### 2️⃣ Ícone com Badge (com notificações)
```
  🔔
   (5)
```
Badge vermelho mostrando o número de notificações não lidas.
- Máximo exibido: "99+"
- Atualiza automaticamente a cada 60 segundos

### 3️⃣ Modal Aberto
```
┌─────────────────────────────┐
│ 🔔 Notificações          ✕ │
├─────────────────────────────┤
│ [Torneio] Novo Torneio!     │
│ Participe da competição...  │
│ Há 5 min              • ●   │
├─────────────────────────────┤
│ [Sistema] Manutenção        │
│ Servidor em manutenção...   │
│ Há 30 min                   │
├─────────────────────────────┤
│ [Conquista] Parabéns!       │
│ Você ganhou uma medalha!    │
│ Ontem                       │
├─────────────────────────────┤
│   Marcar todas como lidas   │
└─────────────────────────────┘
```

## Estados Visuais

### Estado 1: Sem Notificações
```
🔔
(ícone cinzento)
```
- Usuário não tem notificações
- Modal mostra "Sem notificações"

### Estado 2: Com Notificações Não Lidas
```
🔔
(3)
(ícone com badge vermelho)
```
- 3 notificações não lidas
- Badge vermelho chamando atenção

### Estado 3: Notificação Lida
```
┌─────────────────────────────┐
│ [Geral] Atualização         │
│ Novo conteúdo disponível    │
│ Há 2h                       │
└─────────────────────────────┘
(sem ponto indicador)
```
- Background mais claro
- Sem ponto azul à direita
- Opacidade reduzida

### Estado 4: Notificação Não Lida
```
┌─────────────────────────────┐
│ [Resultado] Seu Score       │
│ Você marcou 85 pontos!      │
│ Há 1 min                 •  │
└─────────────────────────────┘
(com ponto azul)
```
- Background azul claro
- Ponto azul à direita (indicador de não lida)
- Mais contraste

## Cores por Tipo de Notificação

| Tipo | Cor | Exemplo |
|------|-----|---------|
| 🏆 Torneio | Amarelo | `[Torneio] Novo Torneio Iniciado` |
| 🥇 Ranking | Azul | `[Ranking] Subiu de Posição` |
| ⏰ Lembrete | Roxo | `[Lembrete] Limite se Aproxima` |
| ⭐ Conquista | Verde | `[Conquista] Novo Badge Ganho` |
| 📊 Resultado | Índigo | `[Resultado] Prova Corrigida` |
| 🔴 Sistema | Vermelho | `[Sistema] Atualização Importante` |
| 📢 Geral | Cinza | `[Geral] Mensagem Importante` |

## Interações

### Clicar no Ícone de Sino
1. Abre/fecha o modal de notificações
2. Carrega as notificações da API
3. Exibe contagem de não lidas

### Clicar em Uma Notificação
1. Marca como lida (API call)
2. Badge é removido da notificação
3. Contador geral diminui em 1

### Clicar em "Marcar Todas como Lidas"
1. Marca todas as notificações não lidas como lidas
2. Modal permanece aberto
3. Badge do ícone volta a 0
4. Notificações mostram com estilo "lido"

### Clicar Fora do Modal
1. Modal fecha suavemente
2. Notificações permanecem marcadas
3. Badge se mantém até próximo polling

## Responsividade

### Desktop (≥768px)
```
┌─────────────────────────────────────────────────────────────┐
│ ≡ Menu | Conteúdo Principal                  🔔  👤        │
└─────────────────────────────────────────────────────────────┘
```
- Sidebar visível à esquerda
- Ícone no canto superior direito

### Mobile (<768px)
```
┌──────────────────────────────────────────┐
│ ≡ | Painel do Colaborador    🔔 👤      │
└──────────────────────────────────────────┘
```
- Sidebar escondida (modal lateral)
- Ícone e avatar lado a lado
- Modal de notificações adapta largura

## Animações

### Entrada do Modal
- Duração: 150ms
- Tipo: Scale + Fade
- Começa pequeno (95%) e cresce para 100%
- Opacidade vai de 0 a 1

### Saída do Modal
- Duração: 150ms
- Tipo: Scale + Fade invertido
- Transição suave

### Atualização de Contagem
- Mudança de número no badge
- Sem animação adicional (muda instantaneamente)
- Highlight visual quando > 0

## Dicas para Usuários

1. **Verificar Regularmente**: O modal atualiza automaticamente a cada 60 segundos
2. **Abrir Modal**: Clique no ícone para ver todas as notificações
3. **Marcar Lidas**: Clique em uma notificação para marcá-la como lida
4. **Limpar Tudo**: Use "Marcar todas como lidas" quando tiver várias

## Padrões de Notificação Esperados

O administrador pode enviar notificações para:
- ✅ Avisos de aprovação/rejeição de blocos
- ✅ Notificações de torneios
- ✅ Lembretes de prazos
- ✅ Mensagens do sistema
- ✅ Reconhecimento de conquistas
- ✅ Resultados de correções

---

**Versão**: 1.0
**Data**: Junho 2026
