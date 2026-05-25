# ARQUIVOS PARA SHADOW MODE - CÓDIGO PRONTO

**Data**: 22 de Maio de 2026  
**Status**: Código pronto para implementação

---

## 📁 ARQUIVOS A CRIAR

### 1. Migration: `BackEnd/migrations/20260522000001-create-questoes-shadow.js`

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('questoes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      torneio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'torneios',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      titulo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      disciplina: {
        type: Sequelize.ENUM('matematica', 'ingles', 'programacao'),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM('multipla_escolha', 'texto', 'codigo'),
        allowNull: false,
      },
      dificuldade: {
        type: Sequelize.ENUM('facil', 'medio', 'dificil'),
        allowNull: false,
      },
      opcoes: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      resposta_correta: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      explicacao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      pontos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      linguagem: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      midia: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      // Campos de rastreamento (SHADOW MODE)
      origem: {
        type: Sequelize.ENUM('legacy', 'novo'),
        allowNull: false,
        defaultValue: 'legacy',
        comment: 'De onde veio o registro',
      },
      migrated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Já foi migrada para produção?',
      },
      legacy_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID no modelo antigo',
      },
      legacy_model: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Qual modelo antigo (QuestaoMatematica, etc)',
      },
      sync_error: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Erro na sincronização',
      },
      last_sync: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Última sincronização',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Criar índices
    await queryInterface.addIndex('questoes', ['torneio_id']);
    await queryInterface.addIndex('questoes', ['disciplina']);
    await queryInterface.addIndex('questoes', ['tipo']);
    await queryInterface.addIndex('questoes', ['dificuldade']);
    await queryInterface.addIndex('questoes', ['origem']);
    await queryInterface.addIndex('questoes', ['migrated']);
    await queryInterface.addIndex('questoes', ['legacy_id', 'legacy_model']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('questoes');
  },
};
```

---

### 2. Modelo: `BackEnd/models/Questao.js`

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Questao = sequelize.define('Questao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  torneio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'torneios', key: 'id' },
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  disciplina: {
    type: DataTypes.ENUM('matematica', 'ingles', 'programacao'),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('multipla_escolha', 'texto', 'codigo'),
    allowNull: false,
  },
  dificuldade: {
    type: DataTypes.ENUM('facil', 'medio', 'dificil'),
    allowNull: false,
  },
  opcoes: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  resposta_correta: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  explicacao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pontos: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  linguagem: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  midia: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  // Campos de rastreamento
  origem: {
    type: DataTypes.ENUM('legacy', 'novo'),
    allowNull: false,
    defaultValue: 'legacy',
  },
  migrated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  legacy_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  legacy_model: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  sync_error: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  last_sync: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'questoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['torneio_id'] },
    { fields: ['disciplina'] },
    { fields: ['tipo'] },
    { fields: ['dificuldade'] },
    { fields: ['origem'] },
    { fields: ['migrated'] },
    { fields: ['legacy_id', 'legacy_model'] },
  ]
});

export default Questao;
```

---

### 3. Helper: `BackEnd/helpers/shadowModeHelper.js`

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
    try {
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
        last_sync: new Date(),
      });
    } catch (error) {
      console.error('❌ Erro ao duplicar Matemática:', error);
      throw error;
    }
  },

  /**
   * Duplicar questão de Inglês para Questao
   */
  duplicarIngles: async (questaoAntiga) => {
    try {
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
        last_sync: new Date(),
      });
    } catch (error) {
      console.error('❌ Erro ao duplicar Inglês:', error);
      throw error;
    }
  },

  /**
   * Duplicar questão de Programação para Questao
   */
  duplicarProgramacao: async (questaoAntiga) => {
    try {
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
        last_sync: new Date(),
      });
    } catch (error) {
      console.error('❌ Erro ao duplicar Programação:', error);
      throw error;
    }
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
    } else {
      throw new Error(`Modalidade desconhecida: ${modalidade}`);
    }
  }
};

export default shadowModeHelper;
```

---

### 4. Modificação: `BackEnd/services/questoesService.js`

Adicionar no início do arquivo:

```javascript
import shadowModeHelper from '../helpers/shadowModeHelper.js';

// Verificar se shadow mode está ativo
const SHADOW_MODE_ENABLED = process.env.SHADOW_MODE_ENABLED === 'true';
```

Modificar o método `criar`:

```javascript
criar: async (modalidade, dados) => {
  try {
    // ... validações existentes ...

    // Criar em modelo antigo
    const Model = MODELOS[modalidade];
    const questao = await Model.create(dadosLimpos);

    // SE SHADOW_MODE_ATIVO, duplicar para novo modelo
    if (SHADOW_MODE_ENABLED) {
      try {
        await shadowModeHelper.duplicarParaQuestao(modalidade, questao, 'legacy');
        console.log(`✅ Shadow: Questão ${questao.id} duplicada para Questao`);
      } catch (shadowError) {
        console.error(`⚠️  Shadow: Erro ao duplicar questão ${questao.id}:`, shadowError);
        // NÃO falha a operação principal
      }
    }

    return {
      sucesso: true,
      questao: questao.toJSON(),
      mensagem: `Questão de ${MODALIDADES[modalidade]} criada com sucesso`
    };
  } catch (error) {
    console.error(`❌ Erro ao criar questão de ${modalidade}:`, error);
    throw error;
  }
}
```

---

### 5. Script: `BackEnd/scripts/syncShadowMode.js`

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

    let totalSincronizadas = 0;

    // 1. Sincronizar Matemática
    console.log('📚 1. Sincronizando Matemática...');
    const matematicas = await QuestaoMatematica.findAll();
    console.log(`   Encontradas: ${matematicas.length}`);

    for (const q of matematicas) {
      const existe = await Questao.findOne({
        where: { legacy_id: q.id, legacy_model: 'QuestaoMatematica' }
      });

      if (!existe) {
        try {
          await shadowModeHelper.duplicarMatematica(q);
          totalSincronizadas++;
        } catch (error) {
          console.error(`   ❌ Erro ao sincronizar ${q.id}:`, error.message);
        }
      }
    }
    console.log(`   ✅ Sincronizadas: ${totalSincronizadas}\n`);

    // 2. Sincronizar Inglês
    console.log('🌍 2. Sincronizando Inglês...');
    const ingles = await QuestaoIngles.findAll();
    console.log(`   Encontradas: ${ingles.length}`);

    let countIng = 0;
    for (const q of ingles) {
      const existe = await Questao.findOne({
        where: { legacy_id: q.id, legacy_model: 'QuestaoIngles' }
      });

      if (!existe) {
        try {
          await shadowModeHelper.duplicarIngles(q);
          countIng++;
          totalSincronizadas++;
        } catch (error) {
          console.error(`   ❌ Erro ao sincronizar ${q.id}:`, error.message);
        }
      }
    }
    console.log(`   ✅ Sincronizadas: ${countIng}\n`);

    // 3. Sincronizar Programação
    console.log('💻 3. Sincronizando Programação...');
    const programacao = await QuestaoProgramacao.findAll();
    console.log(`   Encontradas: ${programacao.length}`);

    let countProg = 0;
    for (const q of programacao) {
      const existe = await Questao.findOne({
        where: { legacy_id: q.id, legacy_model: 'QuestaoProgramacao' }
      });

      if (!existe) {
        try {
          await shadowModeHelper.duplicarProgramacao(q);
          countProg++;
          totalSincronizadas++;
        } catch (error) {
          console.error(`   ❌ Erro ao sincronizar ${q.id}:`, error.message);
        }
      }
    }
    console.log(`   ✅ Sincronizadas: ${countProg}\n`);

    // 4. Resumo
    const total = await Questao.count();
    console.log('✅ Sincronização concluída!');
    console.log(`   Total sincronizadas nesta execução: ${totalSincronizadas}`);
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

### 6. Script: `BackEnd/scripts/validateShadowMode.js`

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

        // Validar campos críticos
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
            legacy_id: q.id
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

### 7. Atualizar: `BackEnd/package.json`

Adicionar scripts:

```json
{
  "scripts": {
    "sync:shadow-mode": "node BackEnd/scripts/syncShadowMode.js",
    "validate:shadow-mode": "node BackEnd/scripts/validateShadowMode.js"
  }
}
```

---

### 8. Atualizar: `BackEnd/.env`

Adicionar:

```
# Shadow Mode
SHADOW_MODE_ENABLED=false
```

---

## 🚀 COMO IMPLEMENTAR

### Passo 1: Criar Arquivos

```bash
# 1. Migration
touch BackEnd/migrations/20260522000001-create-questoes-shadow.js

# 2. Modelo
touch BackEnd/models/Questao.js

# 3. Helper
mkdir -p BackEnd/helpers
touch BackEnd/helpers/shadowModeHelper.js

# 4. Scripts
touch BackEnd/scripts/syncShadowMode.js
touch BackEnd/scripts/validateShadowMode.js
```

### Passo 2: Copiar Código

Copiar o código de cada arquivo acima para os arquivos criados.

### Passo 3: Executar Migration

```bash
npm run migrate
```

### Passo 4: Ativar Shadow Mode

```bash
# Editar .env
SHADOW_MODE_ENABLED=true

# Reiniciar
npm run dev
```

### Passo 5: Sincronizar Dados Existentes

```bash
npm run sync:shadow-mode
```

### Passo 6: Validar

```bash
npm run validate:shadow-mode
```

---

## ✅ VERIFICAÇÃO

Após implementar, verificar:

```bash
# 1. Criar uma questão
curl -X POST http://localhost:3000/api/questoes/matematica \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Teste Shadow Mode",
    "descricao": "Teste de shadow mode",
    "dificuldade": "facil",
    "torneio_id": 1,
    "opcoes": ["A", "B", "C", "D"],
    "resposta_correta": "B",
    "pontos": 10
  }'

# 2. Verificar se foi criada em ambas as tabelas
mysql comaes_db -e "SELECT COUNT(*) FROM questoes_matematica;"
mysql comaes_db -e "SELECT COUNT(*) FROM questoes;"

# 3. Validar
npm run validate:shadow-mode
```

---

**Código Pronto para Implementação**  
**Data**: 22 de Maio de 2026
