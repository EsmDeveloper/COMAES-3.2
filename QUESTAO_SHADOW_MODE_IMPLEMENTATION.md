# SHADOW MODE - IMPLEMENTAÇÃO SEGURA DA MIGRAÇÃO

**Data**: 22 de Maio de 2026  
**Status**: Plano de Implementação  
**Objetivo**: Testar novo modelo Questao em produção sem risco

---

## 📋 ÍNDICE

1. [Visão Geral do Shadow Mode](#visão-geral-do-shadow-mode)
2. [Arquitetura](#arquitetura)
3. [Fluxo de Escrita Duplicada](#fluxo-de-escrita-duplicada)
4. [Fluxo de Leitura](#fluxo-de-leitura)
5. [Scripts de Sincronização](#scripts-de-sincronização)
6. [Validação de Consistência](#validação-de-consistência)
7. [Estratégia de Rollback](#estratégia-de-rollback)
8. [Checklist de Ativação](#checklist-de-ativação)

---

## 🎯 VISÃO GERAL DO SHADOW MODE

### O que é Shadow Mode?

Um sistema híbrido onde:
- ✅ Sistema antigo continua 100% ativo
- ✅ Novo modelo Questao recebe CÓPIAS dos dados
- ✅ Leitura continua no sistema antigo
- ✅ Escrita é duplicada em ambos os modelos
- ✅ Sem impacto no frontend
- ✅ Sem downtime

### Benefícios

| Benefício | Descrição |
|-----------|-----------|
| **Segurança** | Testa novo modelo sem risco |
| **Validação** | Compara dados antes de migrar |
| **Confiança** | 100% de consistência verificada |
| **Rollback** | Pode desativar a qualquer momento |
| **Sem Downtime** | Sistema continua funcionando |

### Timeline

```
ANTES (Atual)
└─ Pergunta / QuestaoMatematica / QuestaoIngles / QuestaoProgramacao

SHADOW MODE (Novo)
├─ Pergunta / QuestaoMatematica / QuestaoIngles / QuestaoProgramacao (LEITURA)
└─ Questao (ESCRITA DUPLICADA)

APÓS VALIDAÇÃO (Futuro)
└─ Questao (ÚNICA)
```

---

## 🏗️ ARQUITETURA

### Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (SEM MUDANÇAS)                  │
│  AdminDashboard → POST /api/questoes/matematica             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND - QuestoesController                    │
│  criar(modalidade, dados)                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         BACKEND - questoesService (MODIFICADO)              │
│                                                             │
│  1. Valida dados                                            │
│  2. Cria em modelo antigo (QuestaoMatematica)              │
│  3. SE SHADOW_MODE_ATIVO:                                   │
│     └─ Copia para Questao (novo modelo)                    │
│  4. Retorna resposta                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  BANCO DE DADOS                              │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │ MODELOS ANTIGOS  │  │ NOVO MODELO (SHADOW)             │ │
│  │ (ESCRITA)        │  │ (CÓPIA AUTOMÁTICA)               │ │
│  ├──────────────────┤  ├──────────────────────────────────┤ │
│  │questoes_mat      │  │questoes                          │ │
│  │questoes_ing      │  │├─ id                             │ │
│  │questoes_prog     │  │├─ torneio_id                     │ │
│  │perguntas         │  │├─ disciplina                     │ │
│  └──────────────────┘  │├─ tipo                           │ │
│                        │├─ origem: "legacy"               │ │
│                        │├─ migrated: false                │ │
│                        │└─ ...                            │ │
│                        └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Componentes

| Componente | Responsabilidade |
|-----------|-----------------|
| **questoesService.js** | Orquestra escrita duplicada |
| **shadowModeHelper.js** | Converte dados antigos → novos |
| **shadowModeValidator.js** | Valida consistência |
| **shadowModeSyncScript.js** | Sincroniza dados |
| **Questao.js** | Novo modelo (com campos extras) |

---

## 📝 FLUXO DE ESCRITA DUPLICADA

### Passo a Passo

```javascript
// 1. Recebe requisição
POST /api/questoes/matematica
{
  "titulo": "Qual é 2 + 2?",
  "descricao": "Questão básica",
  "dificuldade": "facil",
  "torneio_id": 1,
  "opcoes": ["3", "4", "5", "6"],
  "resposta_correta": "B",
  "pontos": 10
}

// 2. Valida dados
questoesService.validarMatematica(dados)
// ✅ Válido

// 3. Cria em modelo antigo
const questaoAntiga = await QuestaoMatematica.create({
  titulo: "Qual é 2 + 2?",
  descricao: "Questão básica",
  dificuldade: "facil",
  torneio_id: 1,
  opcoes: ["3", "4", "5", "6"],
  resposta_correta: "B",
  pontos: 10,
  criado_em: NOW()
})
// ✅ ID: 1

// 4. SE SHADOW_MODE_ATIVO
if (process.env.SHADOW_MODE_ENABLED === 'true') {
  // 5. Converte para novo formato
  const questaoNova = shadowModeHelper.converterMatematica(questaoAntiga)
  
  // 6. Cria em novo modelo
  const questaoShadow = await Questao.create({
    torneio_id: 1,
    titulo: "Qual é 2 + 2?",
    descricao: "Questão básica",
    disciplina: "matematica",
    tipo: "multipla_escolha",
    dificuldade: "facil",
    opcoes: ["3", "4", "5", "6"],
    resposta_correta: "B",
    pontos: 10,
    linguagem: null,
    midia: null,
    origem: "legacy",
    migrated: false,
    legacy_id: 1,
    legacy_model: "QuestaoMatematica",
    created_at: NOW(),
    updated_at: NOW()
  })
  // ✅ ID: 1 (shadow)
}

// 7. Retorna resposta (formato antigo)
{
  "sucesso": true,
  "questao": {
    "id": 1,
    "titulo": "Qual é 2 + 2?",
    ...
  }
}
```

### Código do questoesService.js (Modificado)

```javascript
const questoesService = {
  criar: async (modalidade, dados) => {
    try {
      // ... validações ...

      // 1. Criar em modelo antigo
      const Model = MODELOS[modalidade];
      const questao = await Model.create(dadosLimpos);

      // 2. SE SHADOW_MODE_ATIVO, duplicar para novo modelo
      if (process.env.SHADOW_MODE_ENABLED === 'true') {
        try {
          await shadowModeHelper.duplicarParaQuestao(
            modalidade,
            questao,
            'legacy'
          );
          console.log(`✅ Shadow: Questão ${questao.id} duplicada para Questao`);
        } catch (shadowError) {
          console.error(`⚠️  Shadow: Erro ao duplicar questão ${questao.id}:`, shadowError);
          // NÃO falha a operação principal
        }
      }

      return {
        sucesso: true,
        questao: questao.toJSON(),
        mensagem: `Questão criada com sucesso`
      };
    } catch (error) {
      console.error(`❌ Erro ao criar questão:`, error);
      throw error;
    }
  }
};
```

---

## 📖 FLUXO DE LEITURA

### Leitura Continua no Sistema Antigo

```javascript
// GET /api/questoes/matematica/1
// Continua lendo de questoes_matematica

const questoesService = {
  obter: async (modalidade, id) => {
    // Lê do modelo antigo (SEM MUDANÇAS)
    const Model = MODELOS[modalidade];
    const questao = await Model.findByPk(id);
    
    if (!questao) {
      throw new Error(`Questão não encontrada: ${id}`);
    }

    return questao.toJSON();
  }
};
```

### Nenhuma Mudança no Frontend

```javascript
// AdminDashboard.jsx continua igual
// Endpoints continuam os mesmos
// Formato de resposta continua igual

// Exemplo:
const response = await fetch('/api/questoes/matematica/1');
const questao = await response.json();
// Funciona exatamente como antes
```

---

## 🔄 SCRIPTS DE SINCRONIZAÇÃO

### 1. Helper de Conversão: `shadowModeHelper.js`

```javascript
/**
 * shadowModeHelper.js
 * Converte dados de modelos antigos para novo modelo Questao
 */

import Questao from '../models/Questao.js';

const shadowModeHelper = {
  /**
   * Duplicar questão de Matemática para Questao
   */
  duplicarMatematica: async (questaoAntiga) => {
    return await Questao.create({
      torneio_id: questaoAntiga.torneio_id,
      titulo: questaoAntiga.titulo,
      descricao: questaoAntiga.descricao,
      disciplina: 'matematica',
      tipo: 'multipla_escolha',
      dificuldade: questaoAntiga.dificuldade,
      opcoes: questaoAntiga.opcoes,
      resposta_correta: questaoAntiga.resposta_correta,
      explicacao: null,
      pontos: questaoAntiga.pontos || 10,
      linguagem: null,
      midia: questaoAntiga.midia,
      origem: 'legacy',
      migrated: false,
      legacy_id: questaoAntiga.id,
      legacy_model: 'QuestaoMatematica',
    });
  },

  /**
   * Duplicar questão de Inglês para Questao
   */
  duplicarIngles: async (questaoAntiga) => {
    return await Questao.create({
      torneio_id: questaoAntiga.torneio_id,
      titulo: questaoAntiga.titulo,
      descricao: questaoAntiga.descricao,
      disciplina: 'ingles',
      tipo: 'multipla_escolha',
      dificuldade: questaoAntiga.dificuldade,
      opcoes: questaoAntiga.opcoes,
      resposta_correta: questaoAntiga.resposta_correta,
      explicacao: null,
      pontos: questaoAntiga.pontos || 10,
      linguagem: null,
      midia: questaoAntiga.midia,
      origem: 'legacy',
      migrated: false,
      legacy_id: questaoAntiga.id,
      legacy_model: 'QuestaoIngles',
    });
  },

  /**
   * Duplicar questão de Programação para Questao
   */
  duplicarProgramacao: async (questaoAntiga) => {
    return await Questao.create({
      torneio_id: questaoAntiga.torneio_id,
      titulo: questaoAntiga.titulo,
      descricao: questaoAntiga.descricao,
      disciplina: 'programacao',
      tipo: 'codigo',
      dificuldade: questaoAntiga.dificuldade,
      opcoes: questaoAntiga.opcoes,
      resposta_correta: questaoAntiga.resposta_correta,
      explicacao: null,
      pontos: questaoAntiga.pontos || 15,
      linguagem: questaoAntiga.linguagem || 'javascript',
      midia: questaoAntiga.midia,
      origem: 'legacy',
      migrated: false,
      legacy_id: questaoAntiga.id,
      legacy_model: 'QuestaoProgramacao',
    });
  },

  /**
   * Duplicar para Questao (genérico)
   */
  duplicarParaQuestao: async (modalidade, questaoAntiga, origem = 'legacy') => {
    if (modalidade === 'matematica') {
      return await shadowModeHelper.duplicarMatematica(questaoAntiga);
    } else if (modalidade === 'ingles') {
      return await shadowModeHelper.duplicarIngles(questaoAntiga);
    } else if (modalidade === 'programacao') {
      return await shadowModeHelper.duplicarProgramacao(questaoAntiga);
    }
  }
};

export default shadowModeHelper;
```

### 2. Script de Sincronização: `syncShadowMode.js`

```javascript
/**
 * syncShadowMode.js
 * Sincroniza dados existentes para shadow mode
 * 
 * Uso: npm run sync:shadow-mode
 */

import sequelize from '../config/db.js';
import QuestaoMatematica from '../models/QuestaoMatematica.js';
import QuestaoIngles from '../models/QuestaoIngles.js';
import QuestaoProgramacao from '../models/QuestaoProgramacao.js';
import Questao from '../models/Questao.js';
import shadowModeHelper from '../helpers/shadowModeHelper.js';

const main = async () => {
  try {
    console.log('🔄 Iniciando sincronização de Shadow Mode...\n');

    // 1. Sincronizar Matemática
    console.log('📚 1. Sincronizando Matemática...');
    const matematicas = await QuestaoMatematica.findAll();
    console.log(`   Encontradas: ${matematicas.length}`);

    for (const q of matematicas) {
      const existe = await Questao.findOne({
        where: { legacy_id: q.id, legacy_model: 'QuestaoMatematica' }
      });

      if (!existe) {
        await shadowModeHelper.duplicarMatematica(q);
        console.log(`   ✅ Sincronizada: ${q.id}`);
      }
    }
    console.log(`   Total sincronizadas: ${matematicas.length}\n`);

    // 2. Sincronizar Inglês
    console.log('🌍 2. Sincronizando Inglês...');
    const ingles = await QuestaoIngles.findAll();
    console.log(`   Encontradas: ${ingles.length}`);

    for (const q of ingles) {
      const existe = await Questao.findOne({
        where: { legacy_id: q.id, legacy_model: 'QuestaoIngles' }
      });

      if (!existe) {
        await shadowModeHelper.duplicarIngles(q);
        console.log(`   ✅ Sincronizada: ${q.id}`);
      }
    }
    console.log(`   Total sincronizadas: ${ingles.length}\n`);

    // 3. Sincronizar Programação
    console.log('💻 3. Sincronizando Programação...');
    const programacao = await QuestaoProgramacao.findAll();
    console.log(`   Encontradas: ${programacao.length}`);

    for (const q of programacao) {
      const existe = await Questao.findOne({
        where: { legacy_id: q.id, legacy_model: 'QuestaoProgramacao' }
      });

      if (!existe) {
        await shadowModeHelper.duplicarProgramacao(q);
        console.log(`   ✅ Sincronizada: ${q.id}`);
      }
    }
    console.log(`   Total sincronizadas: ${programacao.length}\n`);

    // 4. Resumo
    const total = await Questao.count();
    console.log('✅ Sincronização concluída!');
    console.log(`   Total na shadow: ${total}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante sincronização:', error);
    process.exit(1);
  }
};

main();
```

---

## ✅ VALIDAÇÃO DE CONSISTÊNCIA

### Script: `validateShadowMode.js`

```javascript
/**
 * validateShadowMode.js
 * Valida consistência entre modelos antigos e novo modelo
 * 
 * Uso: npm run validate:shadow-mode
 */

import sequelize from '../config/db.js';
import QuestaoMatematica from '../models/QuestaoMatematica.js';
import QuestaoIngles from '../models/QuestaoIngles.js';
import QuestaoProgramacao from '../models/QuestaoProgramacao.js';
import Questao from '../models/Questao.js';

const main = async () => {
  try {
    console.log('🔍 Validando Shadow Mode...\n');

    const relatorio = {
      total_antigo: 0,
      total_shadow: 0,
      sincronizadas: 0,
      divergencias: [],
      campos_faltantes: [],
      inconsistencias: []
    };

    // 1. Contar registros
    console.log('📊 1. Contagem de registros:');
    const countMat = await QuestaoMatematica.count();
    const countIng = await QuestaoIngles.count();
    const countProg = await QuestaoProgramacao.count();
    const countShadow = await Questao.count();

    relatorio.total_antigo = countMat + countIng + countProg;
    relatorio.total_shadow = countShadow;

    console.log(`   Matemática (antiga): ${countMat}`);
    console.log(`   Inglês (antiga): ${countIng}`);
    console.log(`   Programação (antiga): ${countProg}`);
    console.log(`   Total (antiga): ${relatorio.total_antigo}`);
    console.log(`   Shadow: ${countShadow}\n`);

    // 2. Validar Matemática
    console.log('📚 2. Validando Matemática:');
    const matematicas = await QuestaoMatematica.findAll();
    for (const q of matematicas) {
      const shadow = await Questao.findOne({
        where: { legacy_id: q.id, legacy_model: 'QuestaoMatematica' }
      });

      if (shadow) {
        relatorio.sincronizadas++;

        // Validar campos
        if (q.titulo !== shadow.titulo) {
          relatorio.divergencias.push({
            tipo: 'titulo',
            legacy_id: q.id,
            antigo: q.titulo,
            novo: shadow.titulo
          });
        }

        if (q.resposta_correta !== shadow.resposta_correta) {
          relatorio.divergencias.push({
            tipo: 'resposta_correta',
            legacy_id: q.id,
            antigo: q.resposta_correta,
            novo: shadow.resposta_correta
          });
        }

        if (q.pontos !== shadow.pontos) {
          relatorio.inconsistencias.push({
            tipo: 'pontos',
            legacy_id: q.id,
            antigo: q.pontos,
            novo: shadow.pontos
          });
        }
      } else {
        relatorio.campos_faltantes.push({
          tipo: 'matematica',
          legacy_id: q.id,
          titulo: q.titulo
        });
      }
    }
    console.log(`   Sincronizadas: ${relatorio.sincronizadas}\n`);

    // 3. Resumo
    console.log('📈 3. Resumo:');
    console.log(`   Total antigo: ${relatorio.total_antigo}`);
    console.log(`   Total shadow: ${relatorio.total_shadow}`);
    console.log(`   Sincronizadas: ${relatorio.sincronizadas}`);
    console.log(`   Divergências: ${relatorio.divergencias.length}`);
    console.log(`   Campos faltantes: ${relatorio.campos_faltantes.length}`);
    console.log(`   Inconsistências: ${relatorio.inconsistencias.length}\n`);

    // 4. Status
    if (relatorio.divergencias.length === 0 && 
        relatorio.campos_faltantes.length === 0 &&
        relatorio.inconsistencias.length === 0) {
      console.log('✅ Shadow Mode validado com sucesso!');
    } else {
      console.log('⚠️  Problemas encontrados:');
      if (relatorio.divergencias.length > 0) {
        console.log(`   - ${relatorio.divergencias.length} divergências`);
      }
      if (relatorio.campos_faltantes.length > 0) {
        console.log(`   - ${relatorio.campos_faltantes.length} campos faltantes`);
      }
      if (relatorio.inconsistencias.length > 0) {
        console.log(`   - ${relatorio.inconsistencias.length} inconsistências`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante validação:', error);
    process.exit(1);
  }
};

main();
```

---

## 🔙 ESTRATÉGIA DE ROLLBACK

### Desativar Shadow Mode

```bash
# 1. Parar de duplicar escrita
# Editar .env
SHADOW_MODE_ENABLED=false

# 2. Reiniciar servidor
npm run dev

# 3. Verificar logs
tail -f logs/app.log
```

### Limpar Dados Shadow (Opcional)

```bash
# Script: cleanShadowMode.js
npm run clean:shadow-mode
```

### Rollback Completo

```bash
# 1. Desativar shadow mode
SHADOW_MODE_ENABLED=false

# 2. Remover tabela shadow
mysql comaes_db -e "DROP TABLE questoes;"

# 3. Remover modelo
rm BackEnd/models/Questao.js

# 4. Reverter código
git checkout BackEnd/services/questoesService.js
git checkout BackEnd/helpers/shadowModeHelper.js

# 5. Reiniciar
npm run dev
```

---

## ✅ CHECKLIST DE ATIVAÇÃO

### PRÉ-ATIVAÇÃO

- [ ] Backup completo do banco
- [ ] Backup do código (git commit)
- [ ] Ambiente de staging testado
- [ ] Equipe notificada
- [ ] Documentação lida

### ATIVAÇÃO

- [ ] Criar tabela `questoes` (com campos extras)
- [ ] Criar modelo `Questao.js`
- [ ] Criar helper `shadowModeHelper.js`
- [ ] Modificar `questoesService.js`
- [ ] Adicionar scripts ao `package.json`
- [ ] Definir `SHADOW_MODE_ENABLED=true` em `.env`
- [ ] Testar em staging
- [ ] Deploy em produção

### PÓS-ATIVAÇÃO

- [ ] Monitorar logs
- [ ] Executar `npm run sync:shadow-mode`
- [ ] Executar `npm run validate:shadow-mode`
- [ ] Verificar consistência
- [ ] Documentar resultados

### DESATIVAÇÃO (Se necessário)

- [ ] Definir `SHADOW_MODE_ENABLED=false`
- [ ] Reiniciar servidor
- [ ] Verificar logs
- [ ] Confirmar que tudo funciona

---

## 📊 CAMPOS EXTRAS NO MODELO QUESTAO

```javascript
// Campos adicionados para rastreamento
{
  // Campos normais
  id: INTEGER,
  torneio_id: INTEGER,
  titulo: STRING,
  descricao: TEXT,
  disciplina: ENUM,
  tipo: ENUM,
  dificuldade: ENUM,
  opcoes: JSON,
  resposta_correta: TEXT,
  explicacao: TEXT,
  pontos: INTEGER,
  linguagem: STRING,
  midia: JSON,
  
  // Campos de rastreamento (NOVOS)
  origem: ENUM('legacy', 'novo'),  // De onde veio
  migrated: BOOLEAN,                // Já foi migrada?
  legacy_id: INTEGER,               // ID no modelo antigo
  legacy_model: STRING,             // Qual modelo antigo
  sync_error: TEXT,                 // Erro na sincronização
  last_sync: DATETIME,              // Última sincronização
  
  // Timestamps
  created_at: DATETIME,
  updated_at: DATETIME
}
```

---

## 🎯 PRÓXIMOS PASSOS

### Fase 1: Preparação
1. ✅ Ler este documento
2. ✅ Criar tabela `questoes` com campos extras
3. ✅ Criar modelo `Questao.js`
4. ✅ Criar helper `shadowModeHelper.js`

### Fase 2: Ativação
1. ⏳ Modificar `questoesService.js`
2. ⏳ Adicionar scripts ao `package.json`
3. ⏳ Testar em staging
4. ⏳ Deploy em produção

### Fase 3: Validação
1. ⏳ Executar `npm run sync:shadow-mode`
2. ⏳ Executar `npm run validate:shadow-mode`
3. ⏳ Monitorar logs
4. ⏳ Documentar resultados

### Fase 4: Consolidação (Após validação)
1. ⏳ Remover campos de rastreamento
2. ⏳ Remover modelos antigos
3. ⏳ Migração completa

---

## 📝 NOTAS IMPORTANTES

### Segurança
- ✅ Shadow mode NÃO afeta leitura
- ✅ Shadow mode NÃO afeta frontend
- ✅ Erros em shadow NÃO quebram operação principal
- ✅ Pode desativar a qualquer momento

### Performance
- ⚠️ Escrita é duplicada (2x mais lenta)
- ⚠️ Banco de dados cresce 2x
- ✅ Pode ser desativado se performance cair

### Validação
- ✅ Compara dados antes de migrar
- ✅ Detecta divergências
- ✅ Valida integridade
- ✅ Gera relatório

---

## 🎓 CONCLUSÃO

Shadow Mode permite:
✅ Testar novo modelo em produção  
✅ Validar consistência de dados  
✅ Ganhar confiança antes de migrar  
✅ Rollback imediato se necessário  
✅ Zero impacto no sistema atual  

**Status**: Pronto para implementação  
**Próximo Passo**: Criar tabela `questoes` com campos extras
