# 🚀 FASE 3: CONTROLLERS - PRONTO PARA COMEÇAR

**Status**: ✅ Modelos prontos e validados  
**Próxima Ação**: Implementar lógica de negócio nos Controllers  
**Tempo Estimado**: 1.5 horas

---

## 📋 Visão Geral

As **Fases 1 e 2** foram concluídas com sucesso:
- ✅ Fase 1: Migrações de banco (parcialmente - 11+ aplicadas)
- ✅ Fase 2: Modelos atualizados com validações

Agora vamos implementar a lógica de negócio nos **Controllers**.

---

## 🎯 Requisitos Funcionais (do Plano Original)

### 1. Tipos de Torneio
```
✅ Modelo preparado: tipo_torneio (generico/especifico)
⏳ Controller: Validar durante criação
⏳ Controller: Impedir estado inválido
```

### 2. Controle de Participação (1 torneio por vez)
```
✅ Modelo preparado: índice idx_participacao_ativa
⏳ Controller: Verificar participação ativa antes de inscrever
⏳ Controller: Impedir inscrição em múltiplos torneios
```

### 3. Gestão de Torneios Ativos (máx 1)
```
✅ Modelo preparado: status enum
⏳ Controller: Contar torneios ativos antes de ativar novo
⏳ Controller: Retornar erro se já existe ativo
```

### 4. Encerramento Automático por Tempo
```
✅ Modelo preparado: campos de encerramento_operacional
⏳ Controller/Scheduler: Job que roda a cada minuto
⏳ Controller: Marcar torneio como encerrado para estudantes
⏳ Controller: Manter status='ativo' no admin (não finalizar)
```

### 5. Sistema de Ranking
```
✅ Modelo preparado: método calcularRanking()
✅ Modelo preparado: método congelarRanking()
✅ Modelo preparado: método obterRankingPersistido()
⏳ Controller: Expor endpoints de ranking
```

### 6. Certificação Automática (Top 3)
```
✅ Modelo preparado: Certificate.gerarAutomaticamente()
✅ Modelo preparado: Validação de posição
⏳ Controller: Chamar ao finalizar torneio
⏳ Controller: Gerar apenas para top 3
```

### 7. Compatibilidade com Sistema Atual
```
✅ Zero breaking changes
✅ Backward compatibility total
⏳ Validar rotas existentes ainda funcionam
```

---

## 🔧 Controllers a Implementar / Modificar

### TorneioController (Modificar - adicionar métodos)

**Arquivo**: `BackEnd/controllers/TorneioController.js`

**Métodos a Adicionar**:

```javascript
// ✨ 1. Validar tipo de torneio durante criação
async validarTipoTorneio(tipoTorneio, disciplinaEspecifica) {
  // Se 'especifico', disciplina é obrigatória
  // Se 'generico', disciplina deve ser null
  // Retornar erro se inválido
}

// ✨ 2. Verificar participação ativa do usuário
async verificarParticipacaoAtiva(usuarioId) {
  // SELECT * FROM participantes_torneios 
  // WHERE usuario_id = ? AND status='confirmado' AND posicao_congelada=false
  // Se existir, impedir inscrição em outro
  // Se não, permitir
}

// ✨ 3. Verificar torneios ativos (máximo 1)
async verificarTorneiosAtivos() {
  // SELECT COUNT(*) FROM torneios WHERE status='ativo'
  // Se >= 1, impedir ativação de novo
  // Se 0, permitir
}

// ✨ 4. Encerramento automático por tempo (SCHEDULER)
async verificarEncerramentos() {
  // SELECT * FROM torneios WHERE status='ativo' AND termina_em <= NOW()
  // Para cada um encontrado:
  //   - UPDATE participantes_torneios SET encerrado_operacionalmente=true, data_encerramento_operacional=NOW()
  //   - NÃO marcar torneio como finalizado (esperar admin fazer isso)
}

// ✨ 5. Finalizar torneio (admin - lógica + certificados)
async finalizarTorneio(torneioId) {
  // 1. Congelar ranking de todos os participantes
  // 2. Gerar certificados automáticos para top 3
  // 3. Marcar torneio como status='finalizado'
  // 4. Retornar resumo
}

// ✨ 6. Ranking de torneio
async obterRanking(torneioId, disciplina) {
  // Retornar ranking persistido com posições
  // Incluir: posição, nome, pontuação, medalha (se top 3)
}
```

### CertificateController (Novo - criar)

**Arquivo**: `BackEnd/controllers/CertificateController.js`

```javascript
export class CertificateController {
  
  // ✨ 1. Gerar automáticos para top 3 de um torneio
  async gerarAutomaticosParaTorneio(torneioId) {
    // 1. Obter top 3 participantes de cada disciplina
    // 2. Para cada um:
    //    - Certificate.gerarAutomaticamente(usuarioId, torneioId, posicao, pontuacao, disciplina)
    //    - Marcar como elegivel_certificado=true
    // 3. Retornar resumo (quantos gerados)
  }

  // ✨ 2. Listar certificados de um torneio
  async listarTorneio(torneioId) {
    // Certificate.listarPorTorneio(torneioId)
    // Retornar com dados de usuário, posição, medalha
  }

  // ✨ 3. Validar certificado por código
  async validarCertificado(codigo) {
    // Buscar por codigo_verificacao
    // Se encontrou: retornar dados do certificado + usuário
    // Se não: retornar erro
  }

  // ✨ 4. Contar certificados automáticos
  async countAutomaticos(torneioId) {
    // Certificate.countAutomaticosEmTorneio(torneioId)
  }
}
```

---

## 📦 Scheduler Job (Novo - criar)

**Arquivo**: `BackEnd/jobs/verificarEncerramentosScheduler.js`

```javascript
// Executar a cada 1 minuto
// Verificar torneios que atingiram data de término
// Marcar participantes como encerrados operacionalmente
// Permitir que admin finalize posteriormente
```

---

## 🛣️ Rotas (Adicionar)

**Arquivo**: `BackEnd/routes/torneiosRoutes.js`

```
POST   /api/torneios            - Criar (existente - melhorar validação)
GET    /api/torneios/:id        - Ver (existente)
PUT    /api/torneios/:id        - Editar (existente)

✨ POST   /api/torneios/:id/ativar        - Ativar (novo - com validação)
✨ POST   /api/torneios/:id/finalizar     - Finalizar (novo - com certificados)
✨ GET    /api/torneios/:id/ranking/:disc - Ver ranking (novo)
✨ GET    /api/torneios/:id/participacao-ativa - Verificar (novo)

POST   /api/certificados/validar/:codigo - Validar cert (novo)
GET    /api/certificados/torneio/:id      - Listar por torneio (novo)
```

---

## 🎯 Passos Implementação

### Passo 1: Modificar TorneioController
1. Adicionar validação de tipo de torneio
2. Adicionar verificação de participação ativa
3. Adicionar verificação de torneios ativos
4. Adicionar método de finalização

**Tempo**: ~30 min

### Passo 2: Criar CertificateController
1. Implementar geração automática
2. Implementar listagem
3. Implementar validação

**Tempo**: ~20 min

### Passo 3: Criar Scheduler Job
1. Verificar encerramentos
2. Marcar participantes como encerrados
3. Configurar para rodar a cada minuto

**Tempo**: ~15 min

### Passo 4: Adicionar Rotas
1. Integrar novos endpoints
2. Testar fluxo completo

**Tempo**: ~15 min

### Passo 5: Testes Manuais
1. Criar torneio genérico
2. Criar torneio específico
3. Inscrever participantes
4. Marcar como ativo
5. Aguardar encerramento
6. Finalizar e gerar certificados

**Tempo**: ~15 min

**Total**: ~1h 35min

---

## 🧪 Teste de Fluxo Completo

```javascript
// 1. Admin cria torneio específico
POST /api/torneios
{
  titulo: "Torneio de Matemática 2026",
  tipo_torneio: "especifico",
  disciplina_especifica: "Matemática",
  inicia_em: "2026-06-10 10:00:00",
  termina_em: "2026-06-10 12:00:00"
}
// Resposta: { id: 1, status: 'rascunho' }

// 2. Estudante 1 se inscreve
POST /api/torneios/1/inscrever
{ usuario_id: 10, disciplina_competida: "Matemática" }
// Resposta: { id: 1, status: 'confirmado' }

// 3. Estudante 2 tenta se inscrever em outro torneio
POST /api/torneios/2/inscrever
{ usuario_id: 10 }
// Resposta: ERROR "Usuário já está em um torneio ativo"

// 4. Admin ativa torneio
POST /api/torneios/1/ativar
// Verifica: nenhum torneio ativo? SIM - permite
// Resposta: { id: 1, status: 'ativo' }

// 5. Scheduler job roda (passam 2+ minutos)
// Verifica: termina_em <= NOW()? SIM
// UPDATE: participantes_torneios SET encerrado_operacionalmente=true
// Estudante vê: "Torneio encerrado - Ver Ranking"

// 6. Admin finaliza torneio
POST /api/torneios/1/finalizar
// 1. Congela ranking (posição_congelada=true)
// 2. Gera certificados (top 3)
// 3. Marca torneio como finalizado
// Resposta: { status: 'finalizado', certificados_gerados: 3 }

// 7. Estudante 2 pode se inscrever em novo torneio
POST /api/torneios/3/inscrever
{ usuario_id: 10, disciplina_competida: "Inglês" }
// Resposta: { id: 2, status: 'confirmado' }
// ✅ Permitido (torneio anterior finalizou)
```

---

## ✅ Checklist Fase 3

- [ ] TorneioController modificado com validações
- [ ] CertificateController criado
- [ ] Scheduler job criado e configurado
- [ ] Rotas adicionadas
- [ ] Testes manuais executados
- [ ] Fluxo completo validado
- [ ] Sem breaking changes
- [ ] Documentation atualizada

---

## 🎬 Começar Fase 3

**Status**: Pronto para começar  
**Modelos**: ✅ Validados e compilam  
**Banco**: ✅ Estrutura pronta  
**Documentação**: ✅ Completa  

**Próxima Ação**: Modificar TorneioController

---

**Data**: 08/06/2026 - 18:35  
**Tempo Total Investido**: ~3.5 horas  
**Progresso**: Dashboard ✅ | About ✅ | Torneios P1 ✅ | Torneios P2 ✅ | **Torneios P3 🚀**
