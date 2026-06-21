/**
 * diagnostico_completo.js
 * 
 * Script para diagnosticar EXACTAMENTE o que está acontecendo com a disciplina
 * Execute: node diagnostico_completo.js
 */

import sequelize from './config/db.js';
import Usuario from './models/User.js';

async function diagnosticar() {
  console.log('\n');
  console.log('🔬 DIAGNÓSTICO COMPLETO - DISCIPLINA COLABORADOR');
  console.log('\n');

  try {
    // 1. Verificar estrutura da tabela
    console.log('📋 PASSO 1: Verificar estrutura da tabela "usuarios"');
    console.log('\n');

    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME IN (
        'id', 'email', 'disciplina_colaborador', 'area_especialidade',
        'nivel_academico', 'status_colaborador'
      )
      ORDER BY ORDINAL_POSITION;
    `);

    if (columns.length === 0) {
      console.log('❌ ERRO: Nenhuma coluna encontrada!');
      console.log('Talvez a tabela não exista ou tenha estrutura diferente.');
    } else {
      console.log('✅ Colunas encontradas:');
      columns.forEach(col => {
        console.log(`   ${col.COLUMN_NAME}`);
        console.log(`      Tipo: ${col.COLUMN_TYPE}`);
        console.log(`      Nullable: ${col.IS_NULLABLE}`);
        console.log(`      Default: ${col.COLUMN_DEFAULT || 'None'}`);
      });
    }

    // 2. Verificar dados de colaboradores recentes
    console.log('\n📋 PASSO 2: Verificar últimos 10 colaboradores');
    console.log('\n');

    const [colaboradores] = await sequelize.query(`
      SELECT 
        id, 
        nome, 
        email, 
        disciplina_colaborador,
        nivel_academico,
        status_colaborador,
        createdAt
      FROM usuarios
      WHERE role = 'colaborador'
      ORDER BY createdAt DESC
      LIMIT 10;
    `);

    console.log(`Total encontrados: ${colaboradores.length}`);
    console.log('\nÚltimos 10 (mais novos primeiro):');
    colaboradores.forEach((u, i) => {
      const disc = u.disciplina_colaborador || '❌ NULL';
      console.log(`  ${i + 1}. ${u.nome} (${u.email})`);
      console.log(`     Disciplina: ${disc}`);
      console.log(`     Status: ${u.status_colaborador}`);
      console.log(`     Criado em: ${u.createdAt}`);
    });

    // 3. Verificar se a coluna existe
    console.log('\n📋 PASSO 3: Verificar EXISTÊNCIA da coluna "disciplina_colaborador"');
    console.log('\n');

    const [existencia] = await sequelize.query(`
      SELECT COUNT(*) as existe
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'disciplina_colaborador';
    `);

    if (existencia[0].existe === 0) {
      console.log('❌ COLUNA NÃO EXISTE!');
      console.log('Isto é o BUG! A coluna "disciplina_colaborador" não foi criada.');
      console.log('Solução: Executar migration para criar a coluna.');
    } else {
      console.log('✅ Coluna "disciplina_colaborador" EXISTE');
    }

    // 4. Verificar valores ENUM permitidos
    console.log('\n📋 PASSO 4: Verificar valores ENUM permitidos');
    console.log('\n');

    const [enumInfo] = await sequelize.query(`
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'disciplina_colaborador';
    `);

    if (enumInfo.length > 0) {
      console.log(`Tipo da coluna: ${enumInfo[0].COLUMN_TYPE}`);
    } else {
      console.log('Coluna não encontrada (ver PASSO 3)');
    }

    // 5. Verificar Model Sequelize
    console.log('\n📋 PASSO 5: Verificar definição no Modelo Sequelize (User.js)');
    console.log('\n');

    const modelAtributos = Usuario.rawAttributes;
    if (modelAtributos.disciplina_colaborador) {
      console.log('✅ Atributo "disciplina_colaborador" EXISTE no modelo');
      console.log('   Tipo:', modelAtributos.disciplina_colaborador.type.toString());
      console.log('   Nullable:', modelAtributos.disciplina_colaborador.allowNull);
    } else {
      console.log('❌ Atributo "disciplina_colaborador" NÃO EXISTE no modelo!');
      console.log('   Atributos disponíveis:', Object.keys(modelAtributos).filter(k => k.includes('discipl') || k.includes('area')));
    }

    // 6. Resumo
    console.log('\n');
    console.log('📊 RESUMO');
    console.log('\n');

    const comDisciplina = colaboradores.filter(u => u.disciplina_colaborador).length;
    const semDisciplina = colaboradores.filter(u => !u.disciplina_colaborador).length;

    console.log(`✅ Com disciplina: ${comDisciplina}/${colaboradores.length}`);
    console.log(`❌ Sem disciplina: ${semDisciplina}/${colaboradores.length}`);

    if (semDisciplina > 0) {
      console.log('\n⚠️ PROBLEMA DETECTADO:');
      console.log('Colaboradores têm NULL em disciplina_colaborador');
      console.log('Possíveis causas:');
      console.log('  1. Campo não está sendo enviado do formulário');
      console.log('  2. Backend não está recebendo o campo');
      console.log('  3. Validação está passando mas valor é nulo');
      console.log('  4. Base de dados tem valor padrão NULL');
    }

    console.log('\n\n');

  } catch (err) {
    console.error('❌ ERRO:', err.message);
    console.error(err);
  } finally {
    process.exit(0);
  }
}

diagnosticar();
