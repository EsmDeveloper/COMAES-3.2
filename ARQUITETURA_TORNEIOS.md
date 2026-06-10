# 🏗️ ARQUITETURA DO SISTEMA DE TORNEIOS

## 📊 DIAGRAMA DE FLUXO

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUÁRIO ACESSA                             │
│                      EntrarTorneio.jsx                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
          ┌──────────────────────────────────────┐
          │  GET /api/tournaments/ativo          │
          │  (Busca torneio ativo)              │
          └────────────┬─────────────────────────┘
                       │
         ┌─────────────┴──────────────────┐
         ▼                                ▼
    GENÉRICO                        ESPECÍFICO
    tipo: 'generico'               tipo: 'especifico'
    disciplina_especifica: null    disciplina_especifica: 'Matemática'
         │                                │
         ▼                                ▼
  Mostra 3 disciplinas             Mostra 3 disciplinas
  todas ATIVAS (100%)              1 ATIVA, 2 INATIVAS (70%)
         │                                │
         └─────────────┬──────────────────┘
                       ▼
         ┌──────────────────────────────────────┐
         │ GET /api/tournaments/usuario/:id/   │
         │     participacao-ativa              │
         │ (Verifica se user já participa)    │
         └────────────┬─────────────────────────┘
                       │
         ┌─────────────┴──────────────────┐
         ▼                                ▼
    SEM PARTICIPAÇÃO              PARTICIPA EM INGLÊS
    disciplinaUsuarioAtual: null  disciplinaUsuarioAtual: 'Inglês'
         │                                │
         ▼                                ▼
    Todas 3 ativas                 Inglês ativo
    (genérico)                     Outras 2 inativas
         │                                │
         └─────────────┬──────────────────┘
                       ▼
         ┌──────────────────────────────────────┐
         │ RENDERIZAÇÃO (isEspecifico)          │
         └────────────┬─────────────────────────┘
                       │
         ┌─────────────┴──────────────────┐
         ▼                                ▼
    SIM (ESPECÍFICO)              NÃO (GENÉRICO)
         │                                │
    isDisciplinaEspecificaAtiva    isDisciplinaDisponipelParaUsuario
    = disc.nome === 'Matemática'  = (sem user) OR
                                    (disc.nome === disciplinaUsuarioAtual)
         │                                │
         └─────────────┬──────────────────┘
                       ▼
         ┌──────────────────────────────────────┐
         │ isDisciplinaAtiva =                 │
         │ isDisciplinaEspecificaAtiva &&      │
         │ isDisciplinaDisponipelParaUsuario   │
         └────────────┬─────────────────────────┘
                       │
         ┌─────────────┴──────────────────┐
         ▼                                ▼
    ATIVA                          INATIVA
    100% opacidade                 70% opacidade
    Botão verde "Ver Torneio"      Overlay "Indisponível"
    Hover scale effects            Botão desabilitado
    Click abre modal               Click bloqueado
         │                                │
         └─────────────┬──────────────────┘
                       ▼
         ┌──────────────────────────────────────┐
         │ USUÁRIO CLICA EM DISCIPLINA ATIVA   │
         │ abrirModal(disciplina)              │
         └────────────┬─────────────────────────┘
                       │
    ┌──────────────────┴──────────────────┐
    ▼                                      ▼
VÁLIDA ESPECÍFICO?                 VÁLIDA GENÉRICO?
if (tipo=específico AND                if (tipo=genérico AND
    disc.nome === disciplina_especifica)  user participando AND
              │                           disc !== disciplinaUsuarioAtual)
              │                                      │
    SIM: Modal abre ✓              SIM: Alert ✗
    NÃO: Alert ✗                   NÃO: Modal abre ✓
              │                                      │
              └──────────────────┬──────────────────┘
                                 ▼
                  ┌──────────────────────────────────────┐
                  │ USUÁRIO CLICA "ENTRAR NO TORNEIO"   │
                  │ entrarNoTorneio()                   │
                  └────────────┬─────────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
    1. GET /api/tournaments/        2. POST /api/participantes/
       usuario/:id/participacao-ativa   registrar
                                       {
    Verifica se user em outro            id_usuario,
    torneio (diferente)                 disciplina_competida
                                       }
              │
    ┌─────────┴──────────┐
    ▼                    ▼
SIM (ERROR)          NÃO (OK)
❌ "Já está em          │
   outro torneio"       ├─ 3. VALIDAÇÕES BACKEND:
                        │   ✓ Torneio existe?
                        │   ✓ Ativo?
                        │   ✓ Data válida?
                        │   ✓ tipo=especifico?
                        │     → disciplina corrета?
                        │   ✓ User não em outro torneio?
                        │
              ┌─────────┴──────────┐
              ▼                    ▼
           ERRO                  SUCESSO
        ❌ Retorna erro        ✓ Inscreve user
           message              ✓ Retorna sucesso
                                     │
                              ┌──────┴─────────┐
                              ▼                ▼
                      4. REDIRECT         5. ATUALIZAR UI
                    /matematica-         - Limpar modal
                    original/[name]    - Mensagem sucesso
                                       - Atualizar status
                                          participacao
```

---

## 🗄️ BANCO DE DADOS

```
┌──────────────────────────────────────┐
│         TABELA: torneios            │
├──────────────────────────────────────┤
│ id (PK)                             │
│ titulo                              │
│ descricao                           │
│ inicia_em                           │
│ termina_em                          │
│ status: 'ativo'|'rascunho'|...     │
│ criado_por (FK → usuarios)          │
│ tipo_torneio ✨ NEW                 │
│   ENUM: 'generico' | 'especifico'  │
│ disciplina_especifica ✨ NEW         │
│   STRING(100), nullable             │
└──────────────────────────────────────┘
         │
         ├── INDEX (tipo_torneio)
         ├── INDEX (disciplina_especifica)
         └── CONSTRAINT: Se tipo='especifico'
                         THEN disciplina_especifica NOT NULL
```

---

## 🔗 RELACIONAMENTOS

```
Torneios (1) ─────────────── (N) ParticipantesTorneios
│                                    │
│ id                                 │ torneio_id (FK)
│ tipo_torneio                        │ usuario_id (FK)
│ disciplina_especifica               │ disciplina_competida
│                                     │ status
└─────────────────────────────────────┘
      │
      │ VALIDAÇÃO: Se tipo='especifico'
      │           THEN disciplina_competida
      │                === disciplina_especifica
      │
      ▼
ParticipantesTorneios (N) ────────────── (1) Usuarios
                                        │
                                        │ id
                                        │ nome
                                        │ email
                                        │
                                        └─────────────────
```

---

## 🎯 FLUXO GENÉRICO

```
ADMIN                  BACKEND               DATABASE            FRONTEND
 │                        │                     │                   │
 ├─ Cria torneio ────────→ │                     │                   │
 │  (tipo: generico)       │                     │                   │
 │                         ├─ Validar ──────────→ │                   │
 │                         │ (tipo existe?)      │                   │
 │                         ├─ INSERT ────────────→ │                   │
 │                         │                     ├─ torneios         │
 │                         │                     │  (id=1, tipo=G)   │
 │                         │◄─ Confirma ─────────┤                   │
 │                         │                     │                   │
 │◄─ Sucesso ──────────────┤                     │                   │
 │                         │                     │                   │
 │                         │                     │                   │
 USER                      │                     │                   │
 │                         │                     │                   │
 ├─ Acessa EntrarTorneio ──────────────────────────────────────────→ │
 │                         │                     │                   │
 │                         │◄──── GET /ativo ──────────────────────┤ │
 │                         │                     │                   │
 │                         ├─ SELECT ────────────→ │                   │
 │                         │ (torneio ativo)     │                   │
 │                         │◄─ Retorna ──────────┤ (id=1, tipo=G)   │
 │                         │                     │                   │
 │◄─ Mostra 3 disciplinas ────────────────────────────────────────┤ │
 │  (todas verdes, ativas)  │                     │                   │
 │                         │                     │                   │
 │ Clica em Inglês ────────→ │                     │                   │
 │                         │                     │                   │
 │◄─ Modal abre ──────────────────────────────────────────────────┤ │
 │                         │                     │                   │
 │ Clica Entrar ──────────→ │                     │                   │
 │                         ├─ POST /registrar ───→ │                   │
 │                         │ (usuario, Inglês)  │                   │
 │                         │                     │                   │
 │                         ├─ Validar ──────────→ │                   │
 │                         │ (tipo OK, disc OK?) │                   │
 │                         ├─ INSERT ────────────→ │                   │
 │                         │                     ├─ participantes   │
 │                         │◄─ Sucesso ──────────┤ (user, Inglês)   │
 │                         │                     │                   │
 │◄─ Redireciona para ────────────────────────────────────────────┤ │
 │  /ingles-original/      │                     │                   │
```

---

## 🎯 FLUXO ESPECÍFICO

```
ADMIN                  BACKEND               DATABASE            FRONTEND
 │                        │                     │                   │
 ├─ Cria torneio ────────→ │                     │                   │
 │  (tipo: especifico)     │                     │                   │
 │  (disciplina: Matemática)
 │                         ├─ Validar ──────────→ │                   │
 │                         │ (disciplina NOT NULL│                   │
 │                         │  para especifico?)  │                   │
 │                         ├─ INSERT ────────────→ │                   │
 │                         │                     ├─ torneios         │
 │                         │                     │  (id=2,            │
 │                         │                     │   tipo=E,          │
 │                         │                     │   disc=Matemática) │
 │                         │◄─ Confirma ─────────┤                   │
 │◄─ Sucesso ──────────────┤                     │                   │
 │ Badge: 📚 Específico    │                     │                   │
 │        (Matemática)     │                     │                   │
 │                         │                     │                   │
 USER                      │                     │                   │
 │                         │                     │                   │
 ├─ Acessa EntrarTorneio ──────────────────────────────────────────→ │
 │                         │                     │                   │
 │                         │◄──── GET /ativo ──────────────────────┤ │
 │                         │                     │                   │
 │                         ├─ SELECT ────────────→ │                   │
 │                         │ (torneio ativo)     │                   │
 │                         │◄─ Retorna ──────────┤ (id=2, tipo=E,   │
 │                         │                     │  disc=Matemática) │
 │                         │                     │                   │
 │◄─ Mostra 3 disciplinas ────────────────────────────────────────┤ │
 │  (Matemática verde,     │                     │                   │
 │   Inglês cinzento,      │                     │                   │
 │   Programação cinzento) │                     │                   │
 │                         │                     │                   │
 │ Clica em Inglês ────────→ │ (bloqueado)        │                   │
 │ (click não faz nada)    │ Nenhuma ação       │                   │
 │                         │                     │                   │
 │ Clica em Matemática ──→ │                     │                   │
 │                         │                     │                   │
 │◄─ Modal abre ──────────────────────────────────────────────────┤ │
 │                         │                     │                   │
 │ Clica Entrar ──────────→ │                     │                   │
 │                         ├─ POST /registrar ───→ │                   │
 │                         │ (usuario, Matemática) │                   │
 │                         │                     │                   │
 │                         ├─ Validar ──────────→ │                   │
 │                         │ (tipo=especifico? ✓ │                   │
 │                         │  disc=Matemática?✓) │                   │
 │                         ├─ INSERT ────────────→ │                   │
 │                         │                     ├─ participantes   │
 │                         │◄─ Sucesso ──────────┤ (user, Matemática│
 │                         │                     │                   │
 │◄─ Redireciona para ────────────────────────────────────────────┤ │
 │  /matematica-original/  │                     │                   │
```

---

## 🔀 FLUXO GENÉRICO COM PARTICIPAÇÃO

```
USER (em Inglês)           BACKEND               DATABASE            FRONTEND
 │                            │                     │                   │
 ├─ Acessa EntrarTorneio ──────────────────────────────────────────→ │
 │                            │                     │                   │
 │                            │◄──── GET /ativo ──────────────────────┤ │
 │                            │ (retorna genérico)                    │
 │                            │                     │                   │
 │◄─ Mostra 3 disciplinas ────────────────────────────────────────┤ │
 │  (inicialmente todas     │                     │                   │
 │   verdes)                │                     │                   │
 │                            │                     │                   │
 │                            │◄─ GET /usuario/123/participacao-ativa  │
 │                            │                     │                   │
 │                            ├─ SELECT ────────────→ │                   │
 │                            │ (verificar         │                   │
 │                            │  participação)     │                   │
 │                            │◄─ Retorna ──────────┤ (ativo: true,    │
 │                            │                     │  disc: Inglês)   │
 │                            │                     │                   │
 │◄─ Atualiza renderização ──────────────────────────────────────┤ │
 │  (Inglês 100% opaco      │                     │                   │
 │   Matemática 70% opaco   │                     │                   │
 │   Programação 70% opaco) │                     │                   │
 │                            │                     │                   │
 │ Clica em Matemática ────→ │                     │                   │
 │ (bloqueado)              │ Nenhuma ação       │                   │
 │                            │                     │                   │
 │ Clica em Inglês ────────→ │                     │                   │
 │                            │                     │                   │
 │◄─ Modal abre ──────────────────────────────────────────────────┤ │
 │  (continuar em Inglês)   │                     │                   │
```

---

## 💾 ESTADO DO SISTEMA (Redux/Context)

```
EntrarTorneio State:
├─ torneioAtivo: {
│   id, titulo, tipo_torneio, disciplina_especifica, ...
│ }
├─ disciplinasDisponiveis: [
│   { id, nome, imagem, ... },
│   ...
│ ]
├─ disciplinaEspecificaTorneio: "Matemática" | null
│   └─ null = genérico
│   └─ "Matemática" = específico para Matemática
├─ disciplinaUsuarioAtual: "Inglês" | null
│   └─ null = não participando
│   └─ "Inglês" = participando em Inglês
├─ disciplinaSelecionada: { id, nome, ... } | null
│   └─ Disciplina escolhida para entrar
└─ estatisticasParticipantes: {
    "Matemática": 50,
    "Inglês": 45,
    "Programação": 40,
    total: 135
  }
```

---

## 📋 MATRIZ DE DECISÃO

```
┌───────────────────────────────────────────────────────────────────────┐
│                    DECISÃO: ESTÁ ATIVA?                              │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ isDisciplinaEspecificaAtiva:                                         │
│ ├─ Se genérico (disciplinaEspecificaTorneio = null)                 │
│ │  └─ SEMPRE true (não há restrição específica)                     │
│ └─ Se específico (disciplinaEspecificaTorneio = "Matemática")       │
│    └─ true se disc.nome === "Matemática"                            │
│    └─ false caso contrário                                          │
│                                                                       │
│ isDisciplinaDisponipelParaUsuario:                                  │
│ ├─ Se genérico E usuário logado E participando                      │
│ │  └─ true se disc.nome === disciplinaUsuarioAtual                 │
│ │  └─ false caso contrário                                          │
│ └─ Caso contrário                                                   │
│    └─ SEMPRE true (sem restrição)                                  │
│                                                                       │
│ isDisciplinaAtiva = AMBAS verdadeiras:                              │
│ ├─ ESPECÍFICO: isDisciplinaEspecificaAtiva = true                  │
│ │              isDisciplinaDisponipelParaUsuario = true             │
│ │              → Mostra 100%, botão ativo                           │
│ │                                                                   │
│ ├─ GENÉRICO (sem participação):                                     │
│ │  isDisciplinaEspecificaAtiva = true (N/A)                        │
│ │  isDisciplinaDisponipelParaUsuario = true                        │
│ │  → Mostra 100%, botão ativo                                       │
│ │                                                                   │
│ ├─ GENÉRICO (participando em outra):                               │
│ │  isDisciplinaEspecificaAtiva = true (N/A)                        │
│ │  isDisciplinaDisponipelParaUsuario = false                       │
│ │  → Mostra 70%, overlay, botão desabilitado                        │
│ │                                                                   │
│ └─ GENÉRICO (participando nesta):                                  │
│    isDisciplinaEspecificaAtiva = true (N/A)                        │
│    isDisciplinaDisponipelParaUsuario = true                        │
│    → Mostra 100%, botão ativo                                       │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 CAMADAS DE VALIDAÇÃO

```
┌─────────────────────────────────────────┐
│  CAMADA 1: DATABASE CONSTRAINTS          │
├─────────────────────────────────────────┤
│ IF tipo_torneio = 'especifico'         │
│ THEN disciplina_especifica NOT NULL    │
│                                         │
│ INDEX: (tipo_torneio)                 │
│ INDEX: (disciplina_especifica)        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  CAMADA 2: BACKEND VALIDAÇÕES           │
├─────────────────────────────────────────┤
│ createTorneo():                         │
│ ├─ tipo_torneio ∈ {'generico','esp'}  │
│ ├─ Se 'esp' → disciplina NOT null     │
│ └─ Se 'gen' → disciplina = null       │
│                                         │
│ inscreverParticipante():               │
│ ├─ Torneio existe?                    │
│ ├─ User em outro torneio? (rejeita)  │
│ ├─ Se 'esp' → disc === expected      │
│ └─ Se 'gen' → disc não em outro      │
│                                         │
│ verificarParticipacaoAtiva():          │
│ └─ Retorna status confirmado +         │
│    posição não congelada             │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  CAMADA 3: FRONTEND (UX)               │
├─────────────────────────────────────────┤
│ abrirModal():                           │
│ ├─ Se 'esp' → verifica disciplina     │
│ ├─ Rejeita com alert se inválida     │
│ └─ Abre modal se válida               │
│                                         │
│ renderização:                           │
│ ├─ isDisciplinaAtiva = botão ativo   │
│ ├─ !isDisciplinaAtiva = overlay      │
│ └─ onClick bloqueado se inativo      │
│                                         │
│ entrarNoTorneio():                     │
│ ├─ Verifica backend antes de submit  │
│ └─ Trata erros com mensagens claras  │
└─────────────────────────────────────────┘
```

---

## 🎯 RESUMO ARQUITETURAL

| Aspecto | Genérico | Específico |
|---------|----------|-----------|
| **Criação** | tipo = 'generico' | tipo = 'especifico' + disc_específica |
| **Disciplinas** | Múltiplas (até 3) | Uma fixa |
| **Participação** | Uma por vez | Uma (a específica) |
| **Visualização** | Todas verdes | Uma verde, 2 cinzentas |
| **Validação BD** | disc_específica = null | disc_específica NOT NULL |
| **Validação Backend** | Verifica user não em outro | Verifica disciplina correta |
| **Validação Frontend** | Desabilita se já participando | Desabilita se não for a escolhida |

---

**Status**: ✅ ARQUITETURA COMPLETA E FUNCIONÁVEL

Todo sistema foi projetado com camadas de validação para segurança e UX clara.
