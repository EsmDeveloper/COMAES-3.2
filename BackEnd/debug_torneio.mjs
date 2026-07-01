import dotenv from 'dotenv';
dotenv.config();
import Torneio from './models/Torneio.js';
import TorneioBloco from './models/TorneioBloco.js';
import BlocoQuestoes from './models/BlocoQuestoes.js';
import BlocoQuestaoItem from './models/BlocoQuestaoItem.js';
import QuestaoTesteConhecimento from './models/QuestaoTesteConhecimento.js';
import './models/associations.js';

// 1. Encontrar torneio activo
const torneio = await Torneio.findOne({ where: { status: 'ativo' } });
if (!torneio) {
  console.log('❌ Nenhum torneio ativo encontrado!');
  console.log('Torneios existentes:');
  const todos = await Torneio.findAll({ attributes: ['id','titulo','status','tipo_torneio','disciplina_especifica'] });
  todos.forEach(t => console.log(`  ID ${t.id} | ${t.titulo} | ${t.status} | ${t.tipo_torneio} | ${t.disciplina_especifica}`));
  process.exit(0);
}
console.log(`✅ Torneio ativo: ID ${torneio.id} | "${torneio.titulo}" | tipo=${torneio.tipo_torneio} | disciplina=${torneio.disciplina_especifica}`);

// 2. Verificar blocos associados
const assocs = await TorneioBloco.findAll({
  where: { torneio_id: torneio.id },
  include: [{ model: BlocoQuestoes, as: 'bloco' }]
});
console.log(`\nBlocos associados: ${assocs.length}`);
assocs.forEach(a => {
  console.log(`  Bloco ID ${a.bloco_id} | "${a.bloco?.titulo}" | disciplina=${a.bloco?.disciplina} | status=${a.bloco?.status}`);
});

if (assocs.length === 0) {
  console.log('\n❌ PROBLEMA: Nenhum bloco está associado a este torneio!');
  console.log('Blocos disponíveis com status=aprovado e contexto=torneio:');
  const blocos = await BlocoQuestoes.findAll({ where: { status: 'aprovado', contexto: 'torneio' }, attributes: ['id','titulo','disciplina','status'] });
  blocos.forEach(b => console.log(`  ID ${b.id} | ${b.titulo} | ${b.disciplina}`));
  process.exit(0);
}

// 3. Verificar questões em cada bloco
for (const a of assocs) {
  const items = await BlocoQuestaoItem.findAll({ where: { bloco_id: a.bloco_id } });
  console.log(`\n  Bloco ${a.bloco_id}: ${items.length} items em BlocoQuestaoItem`);
  
  for (const item of items.slice(0, 3)) {
    const q = await QuestaoTesteConhecimento.findByPk(item.questao_id);
    if (q) {
      console.log(`    QuestaoTesteConhecimento ID ${q.id} | cat=${q.categoria} | dif=${q.dificuldade} | ativo=${q.ativo}`);
    } else {
      console.log(`    questao_id=${item.questao_id} -> NÃO ENCONTRADA em questoes_teste_conhecimento`);
    }
  }
}

process.exit(0);
