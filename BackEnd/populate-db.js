import sequelize from './config/db.js';
import Usuario from './models/User.js';
import Disciplina from './models/Disciplina.js';
import BlocoQuestoes from './models/BlocoQuestoes.js';
import Questao from './models/Questao.js';
import Torneio from './models/Torneio.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Sincronizar todos os modelos
    console.log('🔄 Sincronizando tabelas...');
    await Usuario.sync({ alter: true });
    await Disciplina.sync({ alter: true });
    await BlocoQuestoes.sync({ alter: true });
    await Questao.sync({ alter: true });
    await Torneio.sync({ alter: true });
    console.log('✅ Tabelas sincronizadas\n');

    // Verificar se disciplinas já existem
    const discCount = await Disciplina.count();
    
    if (discCount === 0) {
      console.log('📚 Populando disciplinas...');
      const disciplinas = [
        {
          nome: 'Matemática',
          descricao: 'Disciplina de Matemática - Álgebra, Geometria, Cálculo',
          cor: '#FF6B6B',
          ativo: true
        },
        {
          nome: 'Inglês',
          descricao: 'Disciplina de Inglês - Grammar, Vocabulary, Comprehension',
          cor: '#4ECDC4',
          ativo: true
        },
        {
          nome: 'Programação',
          descricao: 'Disciplina de Programação - JavaScript, Python, Web Development',
          cor: '#FFE66D',
          ativo: true
        },
        {
          nome: 'Português',
          descricao: 'Disciplina de Português - Literatura, Gramática, Redação',
          cor: '#95E1D3',
          ativo: true
        },
        {
          nome: 'Física',
          descricao: 'Disciplina de Física - Mecânica, Termodinâmica, Ondas',
          cor: '#F38181',
          ativo: true
        },
        {
          nome: 'Química',
          descricao: 'Disciplina de Química - Elementos, Reações, Orgânica',
          cor: '#AA96DA',
          ativo: true
        }
      ];

      await Disciplina.bulkCreate(disciplinas.map(d => ({
        ...d,
        slug: d.nome.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      })));
      console.log(`✅ ${disciplinas.length} disciplinas criadas\n`);
    } else {
      console.log(`✅ Disciplinas já existem (${discCount} registos)\n`);
    }

    // Listar disciplinas
    const disciplinas = await Disciplina.findAll();
    console.log('📋 Disciplinas na base de dados:');
    disciplinas.forEach(d => {
      console.log(`   - ${d.nome} (ID: ${d.id})`);
    });

    // Contar blocos
    const blocoCount = await BlocoQuestoes.count();
    console.log(`\n📦 Total de Blocos: ${blocoCount}`);

    // Contar questões
    const questaoCount = await Questao.count();
    console.log(`❓ Total de Questões: ${questaoCount}`);

    // Contar torneios
    const torneoCount = await Torneio.count();
    console.log(`🏆 Total de Torneios: ${torneoCount}`);

    console.log('\n✅ Base de dados populada e sincronizada!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();
