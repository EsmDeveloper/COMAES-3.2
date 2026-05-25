/**
 * auditarQuestoes.js
 * Script para auditar integridade de questões
 * 
 * Uso:
 * node scripts/auditarQuestoes.js
 */

import sequelize from '../config/db.js';
import questoesService from '../services/questoesService.js';

const main = async () => {
  try {
    console.log('🔍 Iniciando auditoria de questões...\n');

    // 1. Validar integridade
    console.log('📊 1. Validando integridade de questões...');
    const integridade = await questoesService.validarIntegridade();
    console.log(`   Total: ${integridade.relatorio.total}`);
    console.log(`   Válidas: ${integridade.relatorio.validas}`);
    console.log(`   Inválidas: ${integridade.relatorio.invalidas}`);

    if (integridade.relatorio.invalidas > 0) {
      console.log('\n   ⚠️ Problemas encontrados:');
      integridade.relatorio.problemas.forEach(p => {
        console.log(`   - ${p.modalidade} ID ${p.id}: ${p.titulo}`);
        p.problemas.forEach(prob => console.log(`     • ${prob}`));
      });
    }

    // 2. Buscar questões órfãs
    console.log('\n🔍 2. Buscando questões órfãs...');
    const orfas = await questoesService.buscarOrfas();
    console.log(`   Total de órfãs: ${orfas.totalOrfas}`);

    if (orfas.totalOrfas > 0) {
      console.log('\n   ⚠️ Questões órfãs encontradas:');
      Object.entries(orfas.orfas).forEach(([mod, questoes]) => {
        console.log(`   ${mod}: ${questoes.length}`);
        questoes.forEach(q => {
          console.log(`     - ID ${q.id}: ${q.titulo} (torneio_id: ${q.torneio_id})`);
        });
      });
    }

    // 3. Contar questões por torneio
    console.log('\n📋 3. Contando questões por torneio...');
    const Torneio = (await import('../models/Torneio.js')).default;
    const torneios = await Torneio.findAll({ attributes: ['id', 'titulo'] });

    for (const torneio of torneios) {
      const contagem = await questoesService.contarPorTorneio(torneio.id);
      const total = contagem.contagem.total;
      if (total > 0) {
        console.log(`   Torneio "${torneio.titulo}" (ID ${torneio.id}): ${total} questões`);
        Object.entries(contagem.contagem).forEach(([mod, count]) => {
          if (mod !== 'total') {
            console.log(`     - ${mod}: ${count}`);
          }
        });
      }
    }

    // 4. Resumo
    console.log('\n✅ Auditoria concluída!');
    console.log(`   Total de questões: ${integridade.relatorio.total}`);
    console.log(`   Questões válidas: ${integridade.relatorio.validas}`);
    console.log(`   Questões inválidas: ${integridade.relatorio.invalidas}`);
    console.log(`   Questões órfãs: ${orfas.totalOrfas}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na auditoria:', error);
    process.exit(1);
  }
};

main();
