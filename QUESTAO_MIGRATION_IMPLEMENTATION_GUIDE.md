# GUIA DE IMPLEMENTAÇÃO - MIGRAÇÃO DO MODELO QUESTÃO

**Data**: 22 de Maio de 2026  
**Referência**: QUESTAO_FINAL_MODEL_AND_MIGRATION_PLAN.md

---

## 📋 ARQUIVOS A CRIAR/MODIFICAR

### FASE 1: Criação da Tabela

#### 1. Migration: `BackEnd/migrations/20260522000000-create-questoes-table.js`

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
        comment: 'Array de opções para múltipla escolha',
      },
      resposta_correta: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Resposta esperada (string comparável)',
      },
      explicacao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Explicação da resposta',
      },
      pontos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      linguagem: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Linguagem de programação (javascript, python, etc)',
      },
      midia: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'URLs de imagens, vídeos, etc',
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
    await queryInterface.addIndex('questoes', ['torneio_id'], {
      name: 'idx_questoes_torneio_id',
    });
    await queryInterface.addIndex('questoes', ['disciplina'], {
      name: 'idx_questoes_disciplina',
    });
    await queryInterface.addIndex('questoes', ['tipo'], {
      name: 'idx_questoes_tipo',
    });
    await queryInterface.addIndex('questoes', ['dificuldade'], {
      name: 'idx_questoes_dificuldade',
    });
    await queryInterface.addIndex('questoes', ['torneio_id', 'disciplina'], {
      name: 'idx_questoes_torneio_disciplina',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('questoes');
  },
};
```

#### 2. Modelo: `BackEnd/models/Questao.js`

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
    { fields: ['torneio_id', 'disciplina'] },
  ]
});

export default Questao;
```

#### 3. Atualizar `BackEnd/index.js`

Adicionar import do novo modelo:

```javascript
// Adicionar após outros imports de modelos
import Questao from './models/Questao.js';
```

---

### FASE 2: Migração de Dados

#### Script: `BackEnd/scripts/migrateQuestoes.js`

```javascript
/**
 * migrateQuestoes.js
 * Script para migrar dados de questoes_* para questoes
 * 
 * Uso: npm run migrate:questoes
 */

import sequelize from '../config/db.js';
import QuestaoMatematica from '../models/QuestaoMatematica.js';
import QuestaoIngles from '../models/QuestaoIngles.js';
import QuestaoProgramacao from '../models/QuestaoProgramacao.js';
import Pergunta from '../models/Pergunta.js';
import Questao from '../models/Questao.js';

const main = async () => {
  try {
    console.log('🚀 Iniciando migração de questões...\n');

    // 1. Migrar Questões de Matemática
    console.log('📚 1. Migrando questões de Matemática...');
    const matematicas = await QuestaoMatematica.findAll();
    console.log(`   Encontradas: ${matematicas.length}`);

    for (const q of matematicas) {
      await Questao.create({
        torneio_id: q.torneio_id,
        titulo: q.titulo,
        descricao: q.descricao,
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: q.dificuldade,
        opcoes: q.opcoes,
        resposta_correta: q.resposta_correta,
        explicacao: null,
        pontos: q.pontos || 10,
        linguagem: null,
        midia: q.midia,
      });
    }
    console.log(`   ✅ Migradas: ${matematicas.length}\n`);

    // 2. Migrar Questões de Inglês
    console.log('🌍 2. Migrando questões de Inglês...');
    const ingles = await QuestaoIngles.findAll();
    console.log(`   Encontradas: ${ingles.length}`);

    for (const q of ingles) {
      await Questao.create({
        torneio_id: q.torneio_id,
        titulo: q.titulo,
        descricao: q.descricao,
        disciplina: 'ingles',
        tipo: 'multipla_escolha',
        dificuldade: q.dificuldade,
        opcoes: q.opcoes,
        resposta_correta: q.resposta_correta,
        explicacao: null,
        pontos: q.pontos || 10,
        linguagem: null,
        midia: q.midia,
      });
    }
    console.log(`   ✅ Migradas: ${ingles.length}\n`);

    // 3. Migrar Questões de Programação
    console.log('💻 3. Migrando questões de Programação...');
    const programacao = await QuestaoProgramacao.findAll();
    console.log(`   Encontradas: ${programacao.length}`);

    for (const q of programacao) {
      await Questao.create({
        torneio_id: q.torneio_id,
        titulo: q.titulo,
        descricao: q.descricao,
        disciplina: 'programacao',
        tipo: 'codigo',
        dificuldade: q.dificuldade,
        opcoes: q.opcoes,
        resposta_correta: q.resposta_correta,
        explicacao: null,
        pontos: q.pontos || 15,
        linguagem: q.linguagem || 'javascript',
        midia: q.midia,
      });
    }
    console.log(`   ✅ Migradas: ${programacao.length}\n`);

    // 4. Resumo
    const total = await Questao.count();
    console.log('✅ Migração concluída com sucesso!');
    console.log(`   Total de questões na nova tabela: ${total}`);
    console.log(`   Matemática: ${matematicas.length}`);
    console.log(`   Inglês: ${ingles.length}`);
    console.log(`   Programação: ${programacao.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    process.exit(1);
  }
};

main();
```

#### Script: `BackEnd/scripts/validateQuestoes.js`

```javascript
/**
 * validateQuestoes.js
 * Script para validar integridade dos dados migrados
 * 
 * Uso: npm run validate:questoes
 */

import sequelize from '../config/db.js';
import QuestaoMatematica from '../models/QuestaoMatematica.js';
import QuestaoIngles from '../models/QuestaoIngles.js';
import QuestaoProgramacao from '../models/QuestaoProgramacao.js';
import Questao from '../models/Questao.js';

const main = async () => {
  try {
    console.log('🔍 Validando integridade dos dados...\n');

    // 1. Contar registros
    console.log('📊 1. Contagem de registros:');
    const countMat = await QuestaoMatematica.count();
    const countIng = await QuestaoIngles.count();
    const countProg = await QuestaoProgramacao.count();
    const countNew = await Questao.count();

    console.log(`   Matemática (antiga): ${countMat}`);
    console.log(`   Inglês (antiga): ${countIng}`);
    console.log(`   Programação (antiga): ${countProg}`);
    console.log(`   Total (antiga): ${countMat + countIng + countProg}`);
    console.log(`   Nova tabela: ${countNew}\n`);

    // 2. Validar disciplinas
    console.log('📋 2. Validação de disciplinas:');
    const byDisciplina = await Questao.findAll({
      attributes: ['disciplina', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['disciplina'],
      raw: true,
    });

    for (const row of byDisciplina) {
      console.log(`   ${row.disciplina}: ${row.count}`);
    }
    console.log();

    // 3. Validar tipos
    console.log('🎯 3. Validação de tipos:');
    const byTipo = await Questao.findAll({
      attributes: ['tipo', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['tipo'],
      raw: true,
    });

    for (const row of byTipo) {
      console.log(`   ${row.tipo}: ${row.count}`);
    }
    console.log();

    // 4. Validar campos obrigatórios
    console.log('✅ 4. Validação de campos obrigatórios:');
    const nullTitulo = await Questao.count({ where: { titulo: null } });
    const nullDescricao = await Questao.count({ where: { descricao: null } });
    const nullResposta = await Questao.count({ where: { resposta_correta: null } });
    const nullTorneio = await Questao.count({ where: { torneio_id: null } });

    console.log(`   Título nulo: ${nullTitulo}`);
    console.log(`   Descrição nula: ${nullDescricao}`);
    console.log(`   Resposta nula: ${nullResposta}`);
    console.log(`   Torneio nulo: ${nullTorneio}\n`);

    if (nullTitulo === 0 && nullDescricao === 0 && nullResposta === 0 && nullTorneio === 0) {
      console.log('✅ Todos os campos obrigatórios estão preenchidos!\n');
    } else {
      console.log('⚠️  Alguns campos obrigatórios estão nulos!\n');
    }

    // 5. Resumo
    console.log('📈 5. Resumo:');
    console.log(`   Total de questões: ${countNew}`);
    console.log(`   Disciplinas: ${byDisciplina.length}`);
    console.log(`   Tipos: ${byTipo.length}`);
    console.log(`   Campos nulos: ${nullTitulo + nullDescricao + nullResposta + nullTorneio}`);

    if (countNew === (countMat + countIng + countProg)) {
      console.log('\n✅ Validação concluída com sucesso!');
    } else {
      console.log('\n⚠️  Aviso: Contagem de registros não bate!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante validação:', error);
    process.exit(1);
  }
};

main();
```

#### Atualizar `package.json`

Adicionar scripts:

```json
{
  "scripts": {
    "migrate:questoes": "node BackEnd/scripts/migrateQuestoes.js",
    "validate:questoes": "node BackEnd/scripts/validateQuestoes.js"
  }
}
```

---

### FASE 3: Consolidação

#### Atualizar `BackEnd/services/questoesService.js`

Após FASE 2, simplificar o serviço para usar apenas a nova tabela:

```javascript
// Remover imports de modelos antigos
// import QuestaoMatematica from '../models/QuestaoMatematica.js';
// import QuestaoIngles from '../models/QuestaoIngles.js';
// import QuestaoProgramacao from '../models/QuestaoProgramacao.js';

// Adicionar import do novo modelo
import Questao from '../models/Questao.js';

// Remover MODELOS e MODALIDADES
// const MODELOS = { ... };
// const MODALIDADES = { ... };

// Simplificar validadores para usar novo modelo
// ...

// Atualizar métodos para usar Questao diretamente
const questoesService = {
  criar: async (modalidade, dados) => {
    // Validar dados
    const erros = validarCamposComuns(dados);
    if (Object.keys(erros).length > 0) {
      throw { name: 'ValidationError', errors: erros };
    }

    // Verificar torneio
    const torneio = await Torneio.findByPk(dados.torneio_id);
    if (!torneio) {
      throw new Error(`Torneio não encontrado: ${dados.torneio_id}`);
    }

    // Criar questão
    const questao = await Questao.create({
      torneio_id: dados.torneio_id,
      titulo: dados.titulo.trim(),
      descricao: dados.descricao.trim(),
      disciplina: modalidade,
      tipo: dados.tipo || 'multipla_escolha',
      dificuldade: dados.dificuldade,
      opcoes: dados.opcoes,
      resposta_correta: dados.resposta_correta.toString().trim(),
      explicacao: dados.explicacao || null,
      pontos: dados.pontos || 10,
      linguagem: dados.linguagem || null,
      midia: dados.midia || null,
    });

    return {
      questao,
      mensagem: `Questão de ${modalidade} criada com sucesso`,
    };
  },

  // ... outros métodos simplificados
};
```

---

## 🔧 COMANDOS DE EXECUÇÃO

### FASE 1: Criar Tabela

```bash
# 1. Criar migration
touch BackEnd/migrations/20260522000000-create-questoes-table.js

# 2. Criar modelo
touch BackEnd/models/Questao.js

# 3. Executar migration
npm run migrate

# 4. Testar
npm run dev
# Testar endpoints em http://localhost:3000/api/questoes/matematica
```

### FASE 2: Migrar Dados

```bash
# 1. Criar scripts
touch BackEnd/scripts/migrateQuestoes.js
touch BackEnd/scripts/validateQuestoes.js

# 2. Fazer backup
mysqldump comaes_db > backup_pre_migracao.sql

# 3. Executar migração
npm run migrate:questoes

# 4. Validar
npm run validate:questoes

# 5. Testar endpoints
npm run dev
```

### FASE 3: Consolidação

```bash
# 1. Remover tabelas antigas
mysql comaes_db -e "DROP TABLE questoes_matematica, questoes_ingles, questoes_programacao, perguntas;"

# 2. Remover modelos antigos
rm BackEnd/models/QuestaoMatematica.js
rm BackEnd/models/QuestaoIngles.js
rm BackEnd/models/QuestaoProgramacao.js
rm BackEnd/models/Pergunta.js

# 3. Simplificar questoesService.js
# (editar manualmente)

# 4. Testar
npm run dev

# 5. Deploy
git add .
git commit -m "Consolidação: modelo único de questões"
git push
```

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Compatibilidade de Resposta

O controller pode converter a resposta para formato antigo se necessário:

```javascript
// Converter para formato antigo (se necessário)
const converterParaFormatoAntigo = (questao) => {
  return {
    id: questao.id,
    titulo: questao.titulo,
    descricao: questao.descricao,
    dificuldade: questao.dificuldade,
    torneio_id: questao.torneio_id,
    resposta_correta: questao.resposta_correta,
    opcoes: questao.opcoes,
    pontos: questao.pontos,
    midia: questao.midia,
    criado_em: questao.created_at,
  };
};
```

### Validação de Linguagem

Linguagens suportadas para programação:

```javascript
const LINGUAGENS_SUPORTADAS = [
  'javascript',
  'python',
  'java',
  'cpp',
  'c',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
];
```

### Índices para Performance

Os índices criados garantem performance em:
- Busca por torneio
- Filtro por disciplina
- Filtro por tipo
- Filtro por dificuldade
- Combinações de torneio + disciplina

---

## ✅ VALIDAÇÃO FINAL

Após cada fase, verificar:

```bash
# Verificar tabela criada
mysql comaes_db -e "DESCRIBE questoes;"

# Verificar dados
mysql comaes_db -e "SELECT COUNT(*) FROM questoes;"

# Verificar índices
mysql comaes_db -e "SHOW INDEXES FROM questoes;"

# Testar endpoints
curl http://localhost:3000/api/questoes/matematica

# Verificar logs
tail -f logs/app.log
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Ler este documento
2. ✅ Ler QUESTAO_FINAL_MODEL_AND_MIGRATION_PLAN.md
3. ⏳ Criar arquivos da FASE 1
4. ⏳ Testar FASE 1 em staging
5. ⏳ Executar FASE 1 em produção
6. ⏳ Executar FASE 2 (migração de dados)
7. ⏳ Executar FASE 3 (consolidação)
8. ⏳ Documentar lições aprendidas
