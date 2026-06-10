# ⚡ GUIA RÁPIDO - SISTEMA DE TORNEIOS

## 🎯 O QUE É?

Sistema que permite criar **dois tipos de torneios**:

1. **GENÉRICO** 🌍
   - Usuários escolhem entre 3 disciplinas
   - Podem participar de UMA disciplina por vez
   - Quando terminam, podem entrar em outra

2. **ESPECÍFICO** 📚
   - Pré-definido para UMA disciplina
   - Todas 3 disciplinas aparecem, mas só a selecionada funciona
   - Outras 2 ficam cinzentas e desabilitadas

---

## 🔧 COMO USAR?

### Criar Torneio ESPECÍFICO (Admin)

```
1. Painel Admin → Torneios
2. Criar Novo Torneio
3. Preencher:
   - Título: "Torneio de Matemática"
   - Tipo: ☐ Genérico  ☑ Específico
   - Disciplina: [Matemática ▼]
   - Datas: válidas
4. Salvar
5. Badge mostra: "📚 Específico (Matemática)" ✓
```

### Criar Torneio GENÉRICO (Admin)

```
1. Painel Admin → Torneios
2. Criar Novo Torneio
3. Preencher:
   - Título: "Torneio Geral"
   - Tipo: ☑ Genérico  ☐ Específico
   - Datas: válidas
4. Salvar
5. Badge mostra: "🌍 Genérico" ✓
```

---

## 👤 DO LADO DO USUÁRIO

### Torneio ESPECÍFICO

**O que vê:**
- Matemática: Verde, botão "Ver Torneio" ativo
- Inglês: Cinzento 70%, overlay "Disciplina Indisponível", botão desabilitado
- Programação: Cinzento 70%, overlay "Disciplina Indisponível", botão desabilitado

**O que pode fazer:**
- Clicar em Matemática ✓
- Clicar em Inglês ✗ (bloqueado)
- Clicar em Programação ✗ (bloqueado)

---

### Torneio GENÉRICO - Primeiro Acesso

**O que vê:**
- Matemática: Verde, botão "Ver Torneio" ativo
- Inglês: Verde, botão "Ver Torneio" ativo
- Programação: Verde, botão "Ver Torneio" ativo

**O que pode fazer:**
- Clicar em qualquer uma das 3 disciplinas ✓

---

### Torneio GENÉRICO - Já Participando em Inglês

**O que vê:**
- Inglês: Verde, botão "Ver Torneio" ativo
- Matemática: Cinzento 70%, overlay "Já está participando em outra", botão desabilitado
- Programação: Cinzento 70%, overlay "Já está participando em outra", botão desabilitado

**O que pode fazer:**
- Clicar em Inglês ✓ (continuar participando)
- Clicar em Matemática ✗ (bloqueado, erro: "já está participando de Inglês")
- Clicar em Programação ✗ (bloqueado)

**Como desbloquear outras disciplinas:**
- Terminar o torneio de Inglês
- Esperar até a data de término do torneio
- Então poderá se inscrever em outra disciplina

---

## 🔍 VERIFICAÇÕES TÉCNICAS

### Endpoint: Verificar Torneio Ativo

```bash
GET /api/tournaments/ativo

Resposta (Específico):
{
  "success": true,
  "ativo": true,
  "torneio": {
    "id": 1,
    "titulo": "Torneio X",
    "tipo_torneio": "especifico",           ← ESPECÍFICO
    "disciplina_especifica": "Matemática",  ← DISCIPLINA
    ...
  }
}

Resposta (Genérico):
{
  "success": true,
  "ativo": true,
  "torneio": {
    "id": 2,
    "titulo": "Torneio Y",
    "tipo_torneio": "generico",             ← GENÉRICO
    "disciplina_especifica": null,          ← SEM DISCIPLINA
    ...
  }
}
```

### Endpoint: Verificar Participação do Usuário

```bash
GET /api/tournaments/usuario/123/participacao-ativa
Authorization: Bearer TOKEN

Resposta (Ativo em Inglês):
{
  "ativo": true,
  "torneio": {
    "id": 2,
    "titulo": "Torneio Geral",
    "tipo_torneio": "generico"
  },
  "disciplina": "Inglês"              ← DISCIPLINA ATUAL
}

Resposta (Sem Participação):
{
  "ativo": false,
  "torneio": null,
  "disciplina": null
}
```

---

## 🚫 ERROS COMUNS

### Erro: "Esta disciplina não está disponível"
```
Causa: Tentou clicar em disciplina não-específica em torneio específico
Solução: Apenas a disciplina selecionada está disponível
```

### Erro: "Você já está participando de outro torneio"
```
Causa: Está em um torneio DIFERENTE (ex: outro torneio completamente)
Solução: Termine o torneio atual primeiro
```

### Erro: "Você já está participando de [Disciplina] neste torneio"
```
Causa: Está em outra disciplina do MESMO torneio genérico
Solução: Termine essa disciplina (espere o torneio terminar)
```

---

## 📊 COMPARAÇÃO

| Aspecto | GENÉRICO | ESPECÍFICO |
|---------|----------|-----------|
| Disciplinas disponíveis | 3 (todas) | 1 (pré-definida) |
| Como aparecem | Todas verdes se não participando | 1 verde, 2 cinzentas |
| Pode escolher qual? | SIM, mas uma por vez | NÃO, apenas 1 fixa |
| Badge no Admin | 🌍 Genérico | 📚 Específico (Matemática) |
| Caso de uso | Torneios abertos a todas | Torneios especializados |

---

## ✅ CHECKLIST DE FUNCIONAMENTO

- [ ] Torneio específico mostra 1 disciplina verde, 2 cinzentas
- [ ] Torneio genérico mostra 3 disciplinas verdes (se não participando)
- [ ] Clique em disciplina cinzenta não abre modal
- [ ] User em disciplina vê outras cinzentas
- [ ] Badge do admin mostra tipo correto
- [ ] Error message ao tentar clicar em inativa
- [ ] Usuário consegue entrar no torneio
- [ ] Redireciona para disciplina correta

---

## 📞 SUPORTE

Se algo não funcionar:

1. **Verificar torneio ativo**: `/api/tournaments/ativo`
2. **Verificar participação**: `/api/tournaments/usuario/{id}/participacao-ativa`
3. **Verificar logs frontend**: Console do navegador (F12)
4. **Verificar logs backend**: Terminal do servidor Node

---

**Última atualização**: June 10, 2026  
**Status**: ✅ PRONTO PARA USO
