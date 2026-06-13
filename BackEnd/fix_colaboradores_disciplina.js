/**
 * fix_colaboradores_disciplina.js
 * 
 * Verifica quais colaboradores têm disciplina_colaborador vazia
 * e exibe os dados para debug
 */

import sequelize from './config/db.js';
import Usuario from './models/User.js';

async function fixDisciplina() {
  try {
    console.log('🔍 Verificando colaboradores...\n');

    // Listar TODOS os colaboradores
    const colaboradores = await sequelize.query(
      `SELECT id, nome, email, role, username, disciplina_colaborador, status_colaborador FROM usuarios WHERE role = 'colaborador'`,
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log(`📊 Total de colaboradores: ${colaboradores.length}\n`);

    if (colaboradores.length === 0) {
      console.log('ℹ️  Nenhum colaborador encontrado ainda.');
      console.log('   Novo colaborador será criado com disciplina_colaborador preenchida.');
    } else {
      console.log('📋 Colaboradores encontrados:\n');
      colaboradores.forEach(c => {
        console.log(`ID: ${c.id}`);
        console.log(`  Nome: ${c.nome}`);
        console.log(`  Email: ${c.email}`);
        console.log(`  Username: ${c.username}`);
        console.log(`  Disciplina: ${c.disciplina_colaborador || '⚠️  VAZIO'}`);
        console.log(`  Status: ${c.status_colaborador}\n`);
      });

      // Contar vazios
      const comVazio = colaboradores.filter(c => !c.disciplina_colaborador).length;
      const comPreenchido = colaboradores.filter(c => c.disciplina_colaborador).length;

      console.log(`\n📊 RESUMO:`);
      console.log(`  ✅ Com disciplina: ${comPreenchido}`);
      console.log(`  ❌ Sem disciplina: ${comVazio}`);

      if (comVazio > 0) {
        console.log(`\n⚠️  ${comVazio} colaborador(es) sem disciplina preenchida!`);
        console.log('   Estes não poderão ser aprovados até preencher o cadastro.');
      }
    }

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixDisciplina();
