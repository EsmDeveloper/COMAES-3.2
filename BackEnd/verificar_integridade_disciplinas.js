/**
 * verificar_integridade_disciplinas.js
 * 
 * Verifica a integridade dos dados de disciplina dos colaboradores
 * Mostra quais estão corretos e quais precisam de correção
 */

import sequelize from './config/db.js';

async function verificar() {
  try {
    console.log('🔍 Verificando integridade de disciplinas...\n');

    // Query todos colaboradores
    const colaboradores = await sequelize.query(
      `SELECT id, nome, email, role, disciplina_colaborador, status_colaborador, createdAt FROM usuarios WHERE role = 'colaborador' ORDER BY createdAt DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log(`📊 Total de colaboradores: ${colaboradores.length}\n`);

    if (colaboradores.length === 0) {
      console.log('ℹ️  Nenhum colaborador encontrado ainda.\n');
      console.log('✅ Novo colaborador será criado com disciplina preenchida.');
      return;
    }

    // Separar em grupos
    const comDisciplina = colaboradores.filter(c => c.disciplina_colaborador);
    const semDisciplina = colaboradores.filter(c => !c.disciplina_colaborador);

    // Tabela com dados
    console.log('📋 COLABORADORES COM DISCIPLINA (✅):');
    console.log('─'.repeat(80));
    comDisciplina.forEach(c => {
      console.log(`✅ ${c.nome.padEnd(20)} | ${c.email.padEnd(25)} | ${c.disciplina_colaborador.padEnd(12)} | ${c.status_colaborador}`);
    });

    console.log('\n');

    if (semDisciplina.length > 0) {
      console.log('❌ COLABORADORES SEM DISCIPLINA:');
      console.log('─'.repeat(80));
      semDisciplina.forEach(c => {
        console.log(`❌ ${c.nome.padEnd(20)} | ${c.email.padEnd(25)} | NULL                | ${c.status_colaborador}`);
      });
    }

    // Resumo
    console.log('\n');
    console.log('📊 RESUMO:');
    console.log(`   ✅ Com disciplina: ${comDisciplina.length}`);
    console.log(`   ❌ Sem disciplina: ${semDisciplina.length}`);
    console.log(`   📈 Taxa de sucesso: ${((comDisciplina.length / colaboradores.length) * 100).toFixed(1)}%\n`);

    // Verificar se novos registos têm disciplina
    const últimos5 = colaboradores.slice(0, 5);
    const últimos5ComDisciplina = últimos5.filter(c => c.disciplina_colaborador).length;

    console.log('🔬 VERIFICAÇÃO ÚLTIMOS 5 REGISTOS:');
    if (últimos5ComDisciplina === últimos5.length) {
      console.log(`   ✅ PERFEITO! Todos os últimos 5 têm disciplina preenchida!`);
      console.log(`   ✅ Código está funcionando corretamente!`);
    } else if (últimos5ComDisciplina > 0) {
      console.log(`   ⚠️  Parcialmente OK - ${últimos5ComDisciplina}/5 últimos têm disciplina`);
      console.log(`   💡 Alguns registos antigos podem estar sem disciplina`);
    } else {
      console.log(`   ❌ Problema! Últimos 5 registos todos sem disciplina!`);
      console.log(`   🔧 Verificar o backend - código pode não estar salvando!`);
    }

    // Recomendações
    console.log('\n');
    if (semDisciplina.length > 0) {
      console.log('💡 RECOMENDAÇÕES:');
      console.log(`   1. Rejeitar os ${semDisciplina.length} colaboradores sem disciplina`);
      console.log(`   2. Pedir para registar novamente`);
      console.log(`   3. Novos registos virão com disciplina preenchida ✅`);
    } else {
      console.log('✅ TUDO PERFEITO!');
      console.log('   Todos os colaboradores têm disciplina preenchida corretamente!');
    }

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

verificar();
