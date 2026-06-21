import Torneio from './models/Torneio.js';
import sequelize from './config/db.js';

async function testarAPIListarTorneios() {
  try {
    console.log('📋 TESTE: Listando todos os torneios via API...\n');

    // Simular o que a API faz
    const torneos = await Torneio.findAll({
      attributes: ['id', 'titulo', 'descricao', 'inicia_em', 'termina_em', 'status', 'criado_em', 'slug', 'tipo_torneio', 'disciplina_especifica'],
      order: [['criado_em', 'DESC']],
      limit: 100,
    });

    console.log(`✅ ${torneos.length} torneios encontrados:\n`);

    torneos.forEach((t, index) => {
      console.log(`[${index + 1}] ID: ${t.id}`);
      console.log(`    Título: ${t.titulo}`);
      console.log(`    tipo_torneio: ${t.tipo_torneio}`);
      console.log(`    disciplina_especifica: ${t.disciplina_especifica}`);
      console.log(`    status: ${t.status}\n`);
    });

    // Converter para JSON (como a API faz)
    console.log('\n');
    console.log('📤 Response JSON (como a API retorna):\n');
    const jsonResponse = torneos.map(t => {
      const json = typeof t.toJSON === 'function' ? t.toJSON() : { ...t };
      // Simular o que formatTorneioForFrontend faz
      if (json.inicia_em) json.inicia_em = new Date(json.inicia_em).toISOString();
      if (json.termina_em) json.termina_em = new Date(json.termina_em).toISOString();
      return json;
    });

    console.log(JSON.stringify(jsonResponse, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testarAPIListarTorneios();
