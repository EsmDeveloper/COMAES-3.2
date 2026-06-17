import sequelize from '../config/db.js';
import QuestaoTesteConhecimento from '../models/QuestaoTesteConhecimento.js';

const main = async () => {
  try {
    const questoes = await QuestaoTesteConhecimento.findAll({
      attributes: ['id', 'enunciado', 'categoria'],
      raw: true
    });

    console.log('\n📊 QUESTÕES NA BASE DE DADOS:');
    console.log(`Total: ${questoes.length} questões\n`);

    questoes.forEach((q, idx) => {
      console.log(`[${idx + 1}] ID=${q.id}, Categoria="${q.categoria}", Enunciado="${q.enunciado?.substring(0, 40)}..."`);
    });

    // Agrupar por categoria
    console.log('\n📊 AGRUPADAS POR CATEGORIA:');
    const porCategoria = {};
    questoes.forEach(q => {
      if (!porCategoria[q.categoria]) porCategoria[q.categoria] = [];
      porCategoria[q.categoria].push(q);
    });

    Object.entries(porCategoria).forEach(([cat, qs]) => {
      console.log(`  ${cat}: ${qs.length} questões`);
      qs.forEach(q => console.log(`    - ID=${q.id}`));
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit(0);
  }
};

main();
