import Torneio from './models/Torneio.js';
import TorneioBloco from './models/TorneioBloco.js';
import BlocoQuestoes from './models/BlocoQuestoes.js';
import Questao from './models/Questao.js';
import sequelize from './config/db.js';

async function criarTorneioTesteEspecifico() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🚀 CRIANDO TORNEIO ESPECÍFICO DE MATEMÁTICA COM QUESTÕES...\n');
    
    // 1. Criar torneio específico
    const torneio = await Torneio.create({
      titulo: 'Torneio de Matemática - Teste Específico v2',
      slug: 'torneio-matematica-teste-especifico-v2',
      descricao: 'Torneio específico apenas para Matemática com questões de teste',
      inicia_em: new Date(),
      termina_em: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24 horas
      criado_por: 1,
      status: 'ativo',
      tipo_torneio: 'especifico',
      disciplina_especifica: 'Matemática'
    }, { transaction });
    
    console.log(`✅ Torneio criado:`);
    console.log(`   ID: ${torneio.id}`);
    console.log(`   Título: ${torneio.titulo}`);
    console.log(`   Tipo: ${torneio.tipo_torneio}`);
    console.log(`   Disciplina: ${torneio.disciplina_especifica}\n`);
    
    // 2. Criar Bloco 1
    const bloco1 = await Bloco.create({
      torneio_id: torneio.id,
      numero: 1,
      nome: 'Bloco 1 - Álgebra Básica',
      descricao: 'Questões sobre operações algébricas fundamentais',
      total_questoes: 5,
      tempo_total_segundos: 600, // 10 minutos
      ativo: true
    }, { transaction });
    
    console.log(`✅ Bloco 1 criado:`);
    console.log(`   ID: ${bloco1.id}`);
    console.log(`   Nome: ${bloco1.nome}`);
    console.log(`   Total questões: ${bloco1.total_questoes}\n`);
    
    // 3. Criar Bloco 2
    const bloco2 = await Bloco.create({
      torneio_id: torneio.id,
      numero: 2,
      nome: 'Bloco 2 - Geometria',
      descricao: 'Questões sobre formas, ângulos e áreas',
      total_questoes: 5,
      tempo_total_segundos: 600, // 10 minutos
      ativo: true
    }, { transaction });
    
    console.log(`✅ Bloco 2 criado:`);
    console.log(`   ID: ${bloco2.id}`);
    console.log(`   Nome: ${bloco2.nome}`);
    console.log(`   Total questões: ${bloco2.total_questoes}\n`);
    
    // 4. Criar questões para Bloco 1
    const questoesBloco1 = [
      {
        bloco_id: bloco1.id,
        numero: 1,
        enunciado: 'Resolva a equação: 2x + 5 = 13',
        opcao_a: 'x = 2',
        opcao_b: 'x = 4',
        opcao_c: 'x = 6',
        opcao_d: 'x = 8',
        resposta_correta: 'B',
        disciplina: 'Matemática',
        dificuldade: 'Fácil',
        pontos: 10
      },
      {
        bloco_id: bloco1.id,
        numero: 2,
        enunciado: 'Simplificar: (3x² + 2x) - (x² - x)',
        opcao_a: '2x² + 3x',
        opcao_b: '2x² + x',
        opcao_c: '4x² + 3x',
        opcao_d: 'x² + 2x',
        resposta_correta: 'A',
        disciplina: 'Matemática',
        dificuldade: 'Médio',
        pontos: 15
      },
      {
        bloco_id: bloco1.id,
        numero: 3,
        enunciado: 'Se a = 3 e b = -2, calcule 2a² - 3b',
        opcao_a: '12',
        opcao_b: '6',
        opcao_c: '18',
        opcao_d: '24',
        resposta_correta: 'D',
        disciplina: 'Matemática',
        dificuldade: 'Médio',
        pontos: 15
      },
      {
        bloco_id: bloco1.id,
        numero: 4,
        enunciado: 'Resolva: x/2 + 3 = 7',
        opcao_a: 'x = 4',
        opcao_b: 'x = 6',
        opcao_c: 'x = 8',
        opcao_d: 'x = 10',
        resposta_correta: 'C',
        disciplina: 'Matemática',
        dificuldade: 'Fácil',
        pontos: 10
      },
      {
        bloco_id: bloco1.id,
        numero: 5,
        enunciado: 'Fatore: x² - 9',
        opcao_a: '(x - 3)(x + 3)',
        opcao_b: '(x - 3)²',
        opcao_c: '(x + 3)²',
        opcao_d: 'x(x - 9)',
        resposta_correta: 'A',
        disciplina: 'Matemática',
        dificuldade: 'Difícil',
        pontos: 20
      }
    ];
    
    const questoes1Criadas = await Questao.bulkCreate(questoesBloco1, { transaction });
    console.log(`✅ ${questoes1Criadas.length} questões criadas para Bloco 1\n`);
    
    // 5. Criar questões para Bloco 2
    const questoesBloco2 = [
      {
        bloco_id: bloco2.id,
        numero: 1,
        enunciado: 'Qual é a área de um retângulo com base 5 e altura 3?',
        opcao_a: '8',
        opcao_b: '15',
        opcao_c: '16',
        opcao_d: '20',
        resposta_correta: 'B',
        disciplina: 'Matemática',
        dificuldade: 'Fácil',
        pontos: 10
      },
      {
        bloco_id: bloco2.id,
        numero: 2,
        enunciado: 'Qual é a área de um círculo com raio 2? (use π ≈ 3.14)',
        opcao_a: '6.28',
        opcao_b: '12.56',
        opcao_c: '3.14',
        opcao_d: '25.12',
        resposta_correta: 'B',
        disciplina: 'Matemática',
        dificuldade: 'Médio',
        pontos: 15
      },
      {
        bloco_id: bloco2.id,
        numero: 3,
        enunciado: 'Qual é o perímetro de um triângulo com lados 3, 4 e 5?',
        opcao_a: '12',
        opcao_b: '15',
        opcao_c: '20',
        opcao_d: '60',
        resposta_correta: 'A',
        disciplina: 'Matemática',
        dificuldade: 'Fácil',
        pontos: 10
      },
      {
        bloco_id: bloco2.id,
        numero: 4,
        enunciado: 'Qual é a área de um triângulo com base 6 e altura 4?',
        opcao_a: '10',
        opcao_b: '12',
        opcao_c: '24',
        opcao_d: '48',
        resposta_correta: 'B',
        disciplina: 'Matemática',
        dificuldade: 'Médio',
        pontos: 15
      },
      {
        bloco_id: bloco2.id,
        numero: 5,
        enunciado: 'Um quadrado tem lado 5. Qual é sua diagonal? (aproxime)',
        opcao_a: '7.07',
        opcao_b: '5',
        opcao_c: '10',
        opcao_d: '25',
        resposta_correta: 'A',
        disciplina: 'Matemática',
        dificuldade: 'Difícil',
        pontos: 20
      }
    ];
    
    const questoes2Criadas = await Questao.bulkCreate(questoesBloco2, { transaction });
    console.log(`✅ ${questoes2Criadas.length} questões criadas para Bloco 2\n`);
    
    await transaction.commit();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ TORNEIO CRIADO COM SUCESSO!\n');
    console.log('📊 RESUMO:');
    console.log(`   Torneio ID: ${torneio.id}`);
    console.log(`   Tipo: ESPECÍFICO`);
    console.log(`   Disciplina: Matemática`);
    console.log(`   Status: ATIVO`);
    console.log(`   Blocos: 2`);
    console.log(`   Questões: ${questoes1Criadas.length + questoes2Criadas.length}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📝 INSTRUÇÕES PARA TESTAR:');
    console.log('   1. Acesse: http://localhost:5173/entrar-torneio');
    console.log('   2. Você deve ver:');
    console.log('      ✅ Matemática: VERDE (botão ativo, 100% opacidade)');
    console.log('      ❌ Inglês: CINZENTO (overlay "Indisponível", 70%, botão desabilitado)');
    console.log('      ❌ Programação: CINZENTO (overlay "Indisponível", 70%, botão desabilitado)');
    console.log('   3. Clique em Matemática → deve abrir modal');
    console.log('   4. Clique em Inglês ou Programação → deve estar bloqueado');
    console.log('   5. Entre no torneio → deve ir para /matematica-original/[seu-nome]\n');
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

criarTorneioTesteEspecifico();
