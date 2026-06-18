import sequelize from './config/db.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Listar blocos com disciplinas
    const [blocos] = await sequelize.query(`
      SELECT 
        b.id,
        b.titulo,
        b.disciplina_id,
        d.nome as disciplina_nome,
        COUNT(DISTINCT q.id) as total_questoes
      FROM bloco_questoes b
      LEFT JOIN disciplinas d ON b.disciplina_id = d.id
      LEFT JOIN questoes q ON b.id = q.bloco_id
      GROUP BY b.id
      ORDER BY b.id
    `);

    console.log('📦 Blocos com Disciplinas:\n');
    
    if (blocos.length === 0) {
      console.log('❌ Nenhum bloco encontrado');
    } else {
      blocos.forEach((b, idx) => {
        const disc = b.disciplina_nome || '(sem disciplina)';
        console.log(`${idx + 1}. ${b.titulo}`);
        console.log(`   ID: ${b.id}`);
        console.log(`   Disciplina: ${disc}`);
        console.log(`   Questões: ${b.total_questoes}\n`);
      });
    }

    // Listar questões com blocos
    const [questoes] = await sequelize.query(`
      SELECT 
        q.id,
        q.titulo,
        q.bloco_id,
        b.titulo as bloco_titulo
      FROM questoes q
      LEFT JOIN bloco_questoes b ON q.bloco_id = b.id
      ORDER BY q.id
      LIMIT 5
    `);

    console.log('\n❓ Primeiras 5 Questões:\n');
    questoes.forEach((q, idx) => {
      const bloc = q.bloco_titulo || '(sem bloco)';
      console.log(`${idx + 1}. ${q.titulo}`);
      console.log(`   ID: ${q.id}`);
      console.log(`   Bloco: ${bloc}\n`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();
