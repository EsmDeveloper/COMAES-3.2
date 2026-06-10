import Torneio from './models/Torneio.js';
import BlocoQuestoes from './models/BlocoQuestoes.js';
import TorneioBloco from './models/TorneioBloco.js';
import Questao from './models/Questao.js';
import sequelize from './config/db.js';

async function criarTorneioTesteMatematica() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('\n🚀 CRIANDO TORNEIO ESPECÍFICO DE MATEMÁTICA COM QUESTÕES...\n');
    
    // 1. Criar torneio específico
    const torneio = await Torneio.create({
      titulo: 'Torneio de Matemática - Teste Interativo 2026',
      slug: 'torneio-matematica-teste-interativo-2026',
      descricao: 'Torneio específico apenas para Matemática com questões de teste - Sessão 3',
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
    
    // 2. Criar Bloco 1 - Álgebra (BlocoQuestoes)
    const blocoQuestoes1 = await BlocoQuestoes.create({
      titulo: 'Bloco 1 - Álgebra Básica',
      descricao: 'Questões sobre operações algébricas fundamentais',
      disciplina: 'matematica',
      dificuldade: 'medio',
      status: 'aprovado',
      contexto: 'torneio',
      criado_por: 1
    }, { transaction });
    
    console.log(`✅ Bloco 1 (BlocoQuestoes) criado:`);
    console.log(`   ID: ${blocoQuestoes1.id}`);
    console.log(`   Título: ${blocoQuestoes1.titulo}\n`);
    
    // 3. Criar Bloco 2 - Geometria (BlocoQuestoes)
    const blocoQuestoes2 = await BlocoQuestoes.create({
      titulo: 'Bloco 2 - Geometria',
      descricao: 'Questões sobre formas, ângulos e áreas',
      disciplina: 'matematica',
      dificuldade: 'medio',
      status: 'aprovado',
      contexto: 'torneio',
      criado_por: 1
    }, { transaction });
    
    console.log(`✅ Bloco 2 (BlocoQuestoes) criado:`);
    console.log(`   ID: ${blocoQuestoes2.id}`);
    console.log(`   Título: ${blocoQuestoes2.titulo}\n`);
    
    // 4. Associar blocos ao torneio (TorneioBloco)
    const torneioBloco1 = await TorneioBloco.create({
      torneio_id: torneio.id,
      bloco_id: blocoQuestoes1.id,
      ordem: 1
    }, { transaction });
    
    const torneioBloco2 = await TorneioBloco.create({
      torneio_id: torneio.id,
      bloco_id: blocoQuestoes2.id,
      ordem: 2
    }, { transaction });
    
    console.log(`✅ Blocos associados ao torneio (TorneioBloco):\n`);
    
    // 5. Criar questões para Bloco 1
    const questoesBloco1 = [
      {
        torneio_id: torneio.id,
        bloco_id: blocoQuestoes1.id,
        titulo: 'Q1 - Álgebra',
        descricao: 'Resolva a equação: 2x + 5 = 13',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'facil',
        resposta_correta: 'B',
        pontos: 10,
        status_aprovacao: 'aprovada'
      },
      {
        torneio_id: torneio.id,
        bloco_id: blocoQuestoes1.id,
        titulo: 'Q2 - Álgebra',
        descricao: 'Simplificar: (3x² + 2x) - (x² - x)',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'medio',
        resposta_correta: 'A',
        pontos: 15,
        status_aprovacao: 'aprovada'
      },
      {
        torneio_id: torneio.id,
        bloco_id: blocoQuestoes1.id,
        titulo: 'Q3 - Álgebra',
        descricao: 'Se a = 3 e b = -2, calcule 2a² - 3b',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'medio',
        resposta_correta: 'D',
        pontos: 15,
        status_aprovacao: 'aprovada'
      },
      {
        torneio_id: torneio.id,
        bloco_id: blocoQuestoes1.id,
        titulo: 'Q4 - Álgebra',
        descricao: 'Resolva: x/2 + 3 = 7',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'facil',
        resposta_correta: 'C',
        pontos: 10,
        status_aprovacao: 'aprovada'
      },
      {
        torneio_id: torneio.id,
        bloco_id: blocoQuestoes1.id,
        titulo: 'Q5 - Álgebra',
        descricao: 'Fatore: x² - 9',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'dificil',
        resposta_correta: 'A',
        pontos: 20,
        status_aprovacao: 'aprovada'
      }
    ];
    
    const questoes1Criadas = await Questao.bulkCreate(questoesBloco1, { transaction });
    console.log(`✅ ${questoes1Criadas.length} questões criadas para Bloco 1\n`);
    
    // 6. Criar questões para Bloco 2
    const questoesBloco2 = [
      {
        torneio_id: torneio.id,
        bloco_id: blocoQuestoes2.id,
        titulo: 'Q1 - Geometria',
        descricao: 'Qual é a área de um retângulo com base 5 e altura 3?',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'facil',
        resposta_correta: 'B',
        pontos: 10,
        status_aprovacao: 'aprovada'
      },
      {
        torneio_id: torneio.id,
        bloco_id: blocoQuestoes2.id,
        titulo: 'Q2 - Geometria',
        descricao: 'Qual é a área de um círculo com raio 2? (use π ≈ 3.14)',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'medio',
        resposta_correta: 'B',
        pontos: 15,
        status_aprovacao: 'aprovada'
      },
      {
        torneio_id: torneio.id,
        bloco_id: blocoQuestoes2.id,
        titulo: 'Q3 - Geometria',
        descricao: 'Qual é o perímetro de um triângulo com lados 3, 4 e 5?',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'facil',
        resposta_correta: 'A',
        pontos: 10,
        status_aprovacao: 'aprovada'
      },
      {
        torneio_id: torneio.id,
        bloco_id: blocoQuestoes2.id,
        titulo: 'Q4 - Geometria',
        descricao: 'Qual é a área de um triângulo com base 6 e altura 4?',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'medio',
        resposta_correta: 'B',
        pontos: 15,
        status_aprovacao: 'aprovada'
      },
      {
        torneio_id: torneio.id,
        bloco_id: blocoQuestoes2.id,
        titulo: 'Q5 - Geometria',
        descricao: 'Um quadrado tem lado 5. Qual é sua diagonal? (aproxime)',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'dificil',
        resposta_correta: 'A',
        pontos: 20,
        status_aprovacao: 'aprovada'
      }
    ];
    
    const questoes2Criadas = await Questao.bulkCreate(questoesBloco2, { transaction });
    console.log(`✅ ${questoes2Criadas.length} questões criadas para Bloco 2\n`);
    
    await transaction.commit();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ TORNEIO CRIADO COM SUCESSO!\n');
    console.log('📊 RESUMO:');
    console.log(`   Torneio ID: ${torneio.id}`);
    console.log(`   Tipo: ESPECÍFICO ✓`);
    console.log(`   Disciplina: Matemática ✓`);
    console.log(`   Status: ATIVO ✓`);
    console.log(`   Blocos: 2`);
    console.log(`   Questões: ${questoes1Criadas.length + questoes2Criadas.length}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📝 INSTRUÇÕES PARA TESTAR:');
    console.log('   1. Acesse: http://localhost:5173/entrar-torneio');
    console.log('   2. Você DEVE VER (e NÃO vai ver diferente):');
    console.log('      ✅ MATEMÁTICA: VERDE (botão ativo, 100% opacidade)');
    console.log('         - Pode clicar e entrar no torneio');
    console.log('         - Badge "✓ Ativa" em cima');
    console.log('');
    console.log('      ❌ INGLÊS: CINZENTO (overlay "Disciplina Indisponível", 70% opacidade)');
    console.log('         - Botão DESABILITADO');
    console.log('         - Não pode clicar');
    console.log('');
    console.log('      ❌ PROGRAMAÇÃO: CINZENTO (overlay "Disciplina Indisponível", 70% opacidade)');
    console.log('         - Botão DESABILITADO');
    console.log('         - Não pode clicar');
    console.log('');
    console.log('   3. TESTES:');
    console.log('      ✅ Clique em Matemática → deve abrir modal');
    console.log('      ✅ Clique em "Entrar no Torneio" → redireciona para /matematica-original/...');
    console.log('      ✅ Clique em Inglês → NADA acontece (botão está desabilitado)');
    console.log('      ✅ Clique em Programação → NADA acontece (botão está desabilitado)');
    console.log('\n═══════════════════════════════════════════════════════════\n');
    
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

criarTorneioTesteMatematica();
