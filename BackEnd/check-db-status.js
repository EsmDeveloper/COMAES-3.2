import sequelize from './config/db.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Tabelas principais
    const tables = [
      'usuarios',
      'disciplinas',
      'blocos',
      'questoes',
      'torneios',
      'notificacoes',
      'funcoes',
      'roles'
    ];

    console.log('📊 Status da Base de Dados:\n');

    for (const table of tables) {
      try {
        const [count] = await sequelize.query(
          `SELECT COUNT(*) as total FROM ${table}`
        );
        const total = count[0]?.total || 0;
        const status = total > 0 ? '✅' : '❌';
        console.log(`${status} ${table.padEnd(20)} → ${total} registos`);
      } catch (err) {
        console.log(`❌ ${table.padEnd(20)} → Tabela não existe`);
      }
    }

    console.log('\n📋 Detalhes específicos:\n');

    // Usuários
    const [users] = await sequelize.query('SELECT COUNT(*) as total FROM usuarios');
    console.log(`👥 Total de Usuários: ${users[0].total}`);

    // Disciplinas
    try {
      const [disc] = await sequelize.query('SELECT COUNT(*) as total FROM disciplinas');
      console.log(`📚 Total de Disciplinas: ${disc[0].total}`);
      
      if (disc[0].total > 0) {
        const [disciplinas] = await sequelize.query('SELECT id, nome FROM disciplinas');
        console.log('   Disciplinas:');
        disciplinas.forEach(d => {
          console.log(`     - ${d.nome} (ID: ${d.id})`);
        });
      }
    } catch (err) {
      console.log(`📚 Disciplinas: Tabela não existe`);
    }

    // Blocos
    try {
      const [blocos] = await sequelize.query('SELECT COUNT(*) as total FROM blocos');
      console.log(`\n📦 Total de Blocos: ${blocos[0].total}`);
      
      if (blocos[0].total > 0) {
        const [blocs] = await sequelize.query('SELECT id, titulo, disciplina_id FROM blocos LIMIT 5');
        console.log('   Primeiros 5 Blocos:');
        blocs.forEach(b => {
          console.log(`     - ${b.titulo} (Disciplina ID: ${b.disciplina_id})`);
        });
      }
    } catch (err) {
      console.log(`\n📦 Blocos: Tabela não existe`);
    }

    // Questões
    try {
      const [quest] = await sequelize.query('SELECT COUNT(*) as total FROM questoes');
      console.log(`\n❓ Total de Questões: ${quest[0].total}`);
    } catch (err) {
      console.log(`\n❓ Questões: Tabela não existe`);
    }

    // Torneios
    try {
      const [torn] = await sequelize.query('SELECT COUNT(*) as total FROM torneios');
      console.log(`🏆 Total de Torneios: ${torn[0].total}`);
      
      if (torn[0].total > 0) {
        const [torns] = await sequelize.query('SELECT id, nome, status FROM torneios LIMIT 3');
        console.log('   Torneios:');
        torns.forEach(t => {
          console.log(`     - ${t.nome} (Status: ${t.status})`);
        });
      }
    } catch (err) {
      console.log(`🏆 Torneios: Tabela não existe`);
    }

    // Notificações
    try {
      const [notif] = await sequelize.query('SELECT COUNT(*) as total FROM notificacoes');
      console.log(`🔔 Total de Notificações: ${notif[0].total}`);
    } catch (err) {
      console.log(`🔔 Notificações: Tabela não existe`);
    }

    console.log('\n✅ Verificação completa!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();
