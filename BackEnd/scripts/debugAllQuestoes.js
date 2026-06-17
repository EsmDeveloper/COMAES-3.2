import sequelize from '../config/db.js';
import QuestaoTesteConhecimento from '../models/QuestaoTesteConhecimento.js';
import Questao from '../models/Questao.js';

const main = async () => {
  try {
    console.log('\n📊 QUESTÕES TESTE CONHECIMENTO:');
    const questoesTeste = await QuestaoTesteConhecimento.findAll({
      attributes: ['id', 'enunciado', 'categoria'],
      raw: true
    });
    console.log(`Total: ${questoesTeste.length}`);
    questoesTeste.forEach((q) => {
      console.log(`  - ID=${q.id}, categoria="${q.categoria}"`);
    });

    console.log('\n📊 QUESTÕES (modelo novo):');
    const questoesNovo = await Questao.findAll({
      attributes: ['id', 'titulo', 'disciplina'],
      raw: true
    });
    console.log(`Total: ${questoesNovo.length}`);
    questoesNovo.forEach((q) => {
      console.log(`  - ID=${q.id}, disciplina="${q.disciplina}"`);
    });

    console.log('\n📋 VERIFICANDO SE HÁ CONFLITO DE IDs:');
    const idsTestee = new Set(questoesTeste.map(q => q.id));
    const idsNovo = new Set(questoesNovo.map(q => q.id));
    
    const conflitos = [...idsTestee].filter(id => idsNovo.has(id));
    if (conflitos.length > 0) {
      console.log(`⚠️ Encontrados ${conflitos.length} IDs em CONFLITO:`, conflitos);
    } else {
      console.log('✅ Sem conflitos de IDs');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit(0);
  }
};

main();
