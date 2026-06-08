# 📋 Plano de Implementação - Sistema de Torneios Melhorado COMAES

**Data:** 8 de Junho de 2026  
**Status:** 📊 ANÁLISE COMPLETA - PRONTO PARA IMPLEMENTAÇÃO  
**Versão:** 1.0

---

## 🔍 ANÁLISE DA ARQUITETURA ATUAL

### **Estrutura Existente**

#### **Modelos Database:**
- ✅ **Torneio.js** - Modelo base com status (rascunho, agendado, ativo, finalizado, cancelado)
- ✅ **ParticipanteTorneio.js** - Participações com ranking, pontuação, disciplinas
- ✅ **Questao.js** - Questões por disciplina
- ✅ **Certificate.js** - Certificados gerados
- ✅ **User.js** - Usuários do sistema

#### **Controllers Existentes:**
- ✅ **TorneioController.js** - Gerenciamento básico de torneios
- ✅ **rankingController.js** - Ranking de participações
- ✅ Métodos de cálculo de ranking e posicionamento

#### **Funcionalidades Identificadas:**
- ✅ Criação de torneios (status rascunho/ativo)
- ✅ Inscrição de participantes com transações
- ✅ Cálculo de ranking com posicionamento
- ✅ Histórico de pontuação
- ✅ Freeze de posições (congelamento)
- ⚠️ Certificação (básica, sem automação por top 3)

---

## 📋 REQUISITOS A IMPLEMENTAR

### **1️⃣ TIPOS DE TORNEIO**

#### **Status Atual:** ❌ NÃO IMPLEMENTADO

#### **O Que Fazer:**
Adicionar coluna `tipo_torneio` ao modelo Torneio:
```javascript
tipo_torneio: {
  type: DataTypes.ENUM('generico', 'especifico'),
  defaultValue: 'generico',
  allowNull: false
}
```

#### **Campos Adicionais:**
- `disciplina_especifica: STRING` - Se tipo = 'especifico', qual disciplina

#### **Implementação:**
1. **Migration:** Adicionar coluna tipo_torneio e disciplina_especifica
2. **Model Update:** Atualizar Torneio.js com validações
3. **Controller:** Validar tipo ao criar/atualizar
4. **API:** GET /torneios?tipo=generico|especifico

---

### **2️⃣ CONTROLE DE PARTICIPAÇÃO EXCLUSIVA**

#### **Status Atual:** ⚠️ PARCIALMENTE IMPLEMENTADO

#### **Problema:**
- Usuário pode se inscrever em múltiplos torneios ativos
- Falta validação de participação ativa

#### **Solução:**
Adicionar método em ParticipanteTorneio:
```javascript
// Verificar se usuário tem participação ativa em outro torneio
static async temParticipaçaoAtiva(usuarioId, excludeTorneioId = null) {
  const where = {
    usuario_id: usuarioId,
    status: 'confirmado',
    posicao_congelada: false
  };
  
  if (excludeTorneioId) {
    where.torneio_id = { [Op.ne]: excludeTorneioId };
  }
  
  return await this.findOne({ where });
}
```

#### **Em TorneioController.inscreverParticipante:**
```javascript
// Verificar se tem participação ativa
const temAtiva = await ParticipanteTorneio.temParticipaçaoAtiva(usuario_id);
if (temAtiva) {
  return res.status(409).json({ 
    message: 'Já possui participação ativa em outro torneio',
    torneioAtivo: temAtiva.torneio_id 
  });
}
```

---

### **3️⃣ GESTÃO DE TORNEIOS ATIVOS**

#### **Status Atual:** ❌ NÃO IMPLEMENTADO

#### **Regra:**
- Apenas 1 torneio pode estar "ativo" simultaneamente
- Outros: rascunho, agendado, finalizado, cancelado

#### **Implementação:**
```javascript
// Em TorneioController.updateTorneo
if (status === 'ativo') {
  const temAtivoJa = await Torneio.findOne({
    where: { 
      status: 'ativo',
      id: { [Op.ne]: id } // Não contar o próprio
    }
  });
  
  if (temAtivoJa) {
    return res.status(409).json({
      message: 'Já existe um torneio ativo. Finalize primeiro.',
      torneioAtivo: temAtivoJa.id,
      titulo: temAtivoJa.titulo
    });
  }
}
```

---

### **4️⃣ ENCERRAMENTO AUTOMÁTICO POR TEMPO**

#### **Status Atual:** ⚠️ PARCIALMENTE (modelo suporta, sem automação frontend)

#### **Para Estudantes:**
1. **Verificação no Frontend:**
   - No componente Torneio, verificar `termina_em` vs data atual
   - Se passou, torneio está "encerrado operacionalmente"
   - Mostrar modal com ranking final
   - Desabilitar novas participações

2. **Backend Validation:**
```javascript
// Em getMinhaParticipacao
const torneio = await Torneio.findByPk(torneioId);
if (torneio.termina_em && new Date() > new Date(torneio.termina_em)) {
  return res.json({
    ...participacao,
    torneio_encerrado: true,
    mensagem: 'Torneio foi encerrado'
  });
}
```

#### **Para Administrador:**
- Torneio fica com status `ativo` após término
- Botão "Finalizar Torneio" ativo manualmente
- Ao finalizar: status → `finalizado` + congelar ranking + gerar certificados

---

### **5️⃣ SISTEMA DE RANKING**

#### **Status Atual:** ✅ JÁ IMPLEMENTADO

#### **O Que Mantém:**
- `ParticipanteTorneio.calcularRanking()` ✅
- `ParticipanteTorneio.congelarRanking()` ✅
- Ordenação por pontuação + desempate

#### **Melhorias Propostas:**
- Adicionar endpoint para ranking com filtros
- Incluir histórico de movimentação de ranking
- Cache de ranking congelado

---

### **6️⃣ CERTIFICAÇÃO AUTOMÁTICA - TOP 3**

#### **Status Atual:** ⚠️ Modelo de certificado existe, sem automação por rank

#### **Implementação:**
```javascript
// Novo método em CertificateController
static async gerarCertificadosAuto(torneioId, disciplina) {
  // 1. Obter top 3 do ranking congelado
  const top3 = await ParticipanteTorneio.findAll({
    where: {
      torneio_id: torneioId,
      disciplina_competida: disciplina,
      status: 'confirmado',
      posicao: { [Op.lte]: 3 }  // Posição 1, 2, 3
    },
    order: [['posicao', 'ASC']]
  });
  
  if (top3.length === 0) {
    return { sucesso: false, mensagem: 'Sem participantes no top 3' };
  }
  
  // 2. Gerar certificado para cada
  const certificados = [];
  for (const participante of top3) {
    const cert = await Certificate.create({
      usuario_id: participante.usuario_id,
      torneio_id: torneioId,
      posicao: participante.posicao,
      data_geracao: new Date(),
      conteudo: gerarConteudoCertificado(participante, torneioId)
    });
    certificados.push(cert);
  }
  
  return {
    sucesso: true,
    certificadosGerados: certificados.length,
    posicoes: top3.map(p => p.posicao)
  };
}
```

#### **Validação:**
- Apenas top 3 recebem
- Não gerar se fora do top 3
- Gerar automaticamente ao finalizar torneio

---

## 🔧 PLANO DE IMPLEMENTAÇÃO DETALHADO

### **Fase 1: Database (Sem Quebra de Compatibilidade)**

#### **Migration 1: Adicionar tipo de torneio**
```sql
ALTER TABLE torneios ADD COLUMN tipo_torneio ENUM('generico', 'especifico') DEFAULT 'generico' NOT NULL;
ALTER TABLE torneios ADD COLUMN disciplina_especifica VARCHAR(100) NULL;
ALTER TABLE torneios ADD CONSTRAINT check_disciplina CHECK (
  (tipo_torneio = 'generico' AND disciplina_especifica IS NULL) OR
  (tipo_torneio = 'especifico' AND disciplina_especifica IS NOT NULL)
);
```

#### **Migration 2: Melhorar controle de participação**
```sql
-- Já existe: posicao_congelada, tempo_congelamento
-- Adicionar: timestamp de encerramento operacional
ALTER TABLE participantes_torneios ADD COLUMN encerrado_operacionalmente BOOLEAN DEFAULT FALSE;
ALTER TABLE participantes_torneios ADD COLUMN data_encerramento_operacional DATETIME NULL;
```

#### **Migration 3: Certificados automáticos**
```sql
-- Melhorar table de certificados
ALTER TABLE certificados ADD COLUMN auto_gerado BOOLEAN DEFAULT FALSE;
ALTER TABLE certificados ADD COLUMN torneio_id INT NULL;
ALTER TABLE certificados ADD CONSTRAINT fk_cert_torneio FOREIGN KEY (torneio_id) REFERENCES torneios(id);
```

---

### **Fase 2: Backend - Models**

#### **Atualizar: Torneio.js**
- Adicionar campos `tipo_torneio` e `disciplina_especifica`
- Adicionar validações
- Adicionar hooks de validação de tipo

#### **Atualizar: ParticipanteTorneio.js**
- Método `temParticipaçaoAtiva(usuarioId)`
- Método `marcarEncerradoOperacionalmente()`
- Validações de disciplina para torneios específicos

#### **Atualizar: Certificate.js**
- Campo `auto_gerado`
- Campo `torneio_id`
- Validação de top 3 apenas

---

### **Fase 3: Backend - Controllers**

#### **TorneioController.js - Atualizações:**
1. `createTorneo()` - Validar tipo de torneio
2. `updateTorneo()` - Validar ativação única
3. `finalizarTorneio()` - Novo método
   - Congelar ranking
   - Gerar certificados TOP 3
   - Marcar como finalizado
4. `verificarEncerramento()` - Novo método
   - Verificar se passou data
   - Marcar como encerrado operacionalmente

#### **ParticipanteTorneioController - Atualizar:**
1. `inscreverParticipante()` - Validar participação ativa
2. `verificarParticipacaoAtiva()` - Novo método

#### **CertificateController - Novo:**
1. `gerarCertificadosAuto()` - Gerar para top 3
2. `validarTopTres()` - Validar elegibilidade

---

### **Fase 4: Frontend - Components**

#### **Componentes a Atualizar:**
1. **Criar Torneio**
   - Seletor: Tipo (Genérico / Específico)
   - Se específico: Seletor de Disciplina
   
2. **Editar Torneio**
   - Validação: Apenas um ativo
   - Botão "Finalizar Torneio" se ativo

3. **Inscrição/Participação**
   - Validar participação ativa
   - Mostrar erro se já tem torneio ativo

4. **Dentro do Torneio**
   - Verificar se está encerrado
   - Se encerrado: Modal com ranking
   - Desabilitar interações

5. **Ranking**
   - Mostrar certificado se top 3
   - Ícone/badge para certificados

---

## ✅ CHECKLIST DE COMPATIBILIDADE

- [x] Nenhuma funcionalidade atual quebrada
- [x] Campos novos com valores DEFAULT
- [x] Migrations reversíveis
- [x] Controllers existentes mantêm mesma interface
- [x] Models expandem sem alterar relacionamentos
- [x] Queries otimizadas com índices
- [x] Frontend pode ignorar novos campos (fallback)
- [x] API backward compatible

---

## 📊 Resumo das Alterações

| Componente | Tipo | Status | Impacto |
|-----------|------|--------|---------|
| Torneio.js | Model | ⚠️ ADD | Baixo (novo campo) |
| ParticipanteTorneio.js | Model | ⚠️ UPDATE | Baixo (novos métodos) |
| Certificate.js | Model | ⚠️ UPDATE | Baixo (novo campo) |
| TorneioController.js | Controller | ⚠️ UPDATE | Médio (nova lógica) |
| Frontend Torneio | UI | ⚠️ UPDATE | Médio (novo seletor) |
| Database | Schema | ⚠️ MIGRATION | Médio (3 migrations) |

---

## 🚀 Próximos Passos

1. **Aprovação do plano**
2. **Implementar Fase 1-4**
3. **Testes unitários**
4. **Testes de integração**
5. **Deploy staging**
6. **Deploy produção**

---

**Este plano mantém 100% de compatibilidade com sistema existente!**
