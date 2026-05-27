import sequelize from './config/db.js';
import ResultadoTeste from './models/ResultadoTeste.js';
import Usuario from './models/User.js';

async function seedTestes() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida!');

    // Deletar registros antigos
    await ResultadoTeste.destroy({ where: {} });
    console.log('🗑️ Registros antigos deletados');

    // Buscar usuários existentes
    const usuarios = await Usuario.findAll({ limit: 5 });
    console.log(`📋 Usuários encontrados: ${usuarios.length}`);

    if (usuarios.length === 0) {
      console.log('❌ Nenhum usuário encontrado. Crie usuários primeiro.');
      process.exit(1);
    }

    // Criar registros de teste (MVP: Matemática, Programação, Inglês)
    const areas = ['Matemática', 'Programação', 'Inglês'];
    const resultados = [];

    for (let i = 0; i < 5; i++) {
      const usuario = usuarios[i % usuarios.length];
      const area = areas[i % areas.length];
      const percentual = Math.floor(Math.random() * 40) + 60; // 60-100%
      
      const resultado = await ResultadoTeste.create({
        usuario_id: usuario.id,
        area: area,
        percentual_acertos: percentual,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
      });
      
      resultados.push(resultado);
      console.log(`✅ Teste criado: ${area} - ${percentual}% para ${usuario.nome}`);
    }

    console.log(`\n🎉 ${resultados.length} registros de teste criados com sucesso!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
    process.exit(1);
  }
}

seedTestes();