/**
 * seed_dados_teste.js
 * Script para popular banco de dados com dados de teste realistas
 * 
 * Execução: node seed_dados_teste.js
 * 
 * Cria:
 * - 15 questões de teste de conhecimento
 * - 1 torneio com blocos e questões
 * - 2 colaboradores (1 pendente, 1 aprovado)
 * - Questões pendentes e aprovadas do colaborador
 */

import sequelize from './config/db.js';
import Usuario from './models/User.js';
import QuestaoTesteConhecimento from './models/QuestaoTesteConhecimento.js';
import Torneio from './models/Torneio.js';
import BlocoQuestoes from './models/BlocoQuestoes.js';
import Questao from './models/Questao.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
  try {
    console.log('🌱 Iniciando seed de dados de teste...\n');

    // Gerar hash de senha que será usado em todo o script
    const senhaHash = await bcrypt.hash('Senha123!', 10);

    // 
    // 1️⃣ CRIAR QUESTÕES DE TESTE DE CONHECIMENTO
    // 

    console.log('📚 Criando questões de teste de conhecimento...');

    const questoesTeste = [
      // MATEMÁTICA - FÁCIL
      {
        categoria: 'matematica',
        dificuldade: 'facil',
        enunciado: 'Qual é o resultado de 2 + 3?',
        opcoes: JSON.stringify(['4', '5', '6', '7']),
        resposta_correta: '5',
        pontos: 10,
        ativo: true
      },
      {
        categoria: 'matematica',
        dificuldade: 'facil',
        enunciado: 'Quanto é 10 ÷ 2?',
        opcoes: JSON.stringify(['3', '4', '5', '6']),
        resposta_correta: '5',
        pontos: 10,
        ativo: true
      },
      // MATEMÁTICA - MÉDIO
      {
        categoria: 'matematica',
        dificuldade: 'medio',
        enunciado: 'Se x + 5 = 12, qual é o valor de x?',
        opcoes: JSON.stringify(['5', '6', '7', '8']),
        resposta_correta: '7',
        pontos: 20,
        ativo: true
      },
      {
        categoria: 'matematica',
        dificuldade: 'medio',
        enunciado: 'Qual é a área de um quadrado com lado de 5cm?',
        opcoes: JSON.stringify(['20cm²', '25cm²', '30cm²', '35cm²']),
        resposta_correta: '25cm²',
        pontos: 20,
        ativo: true
      },
      // MATEMÁTICA - DIFÍCIL
      {
        categoria: 'matematica',
        dificuldade: 'dificil',
        enunciado: 'Qual é o resultado de (2³ × 3²) ÷ 6?',
        opcoes: JSON.stringify(['6', '10', '12', '18']),
        resposta_correta: '12',
        pontos: 30,
        ativo: true
      },
      // INGLÊS - FÁCIL
      {
        categoria: 'ingles',
        dificuldade: 'facil',
        enunciado: 'Como se diz "olá" em inglês?',
        opcoes: JSON.stringify(['Goodbye', 'Hello', 'Thank you', 'Please']),
        resposta_correta: 'Hello',
        pontos: 10,
        ativo: true
      },
      {
        categoria: 'ingles',
        dificuldade: 'facil',
        enunciado: 'Qual é a tradução de "gato"?',
        opcoes: JSON.stringify(['Dog', 'Cat', 'Bird', 'Fish']),
        resposta_correta: 'Cat',
        pontos: 10,
        ativo: true
      },
      // INGLÊS - MÉDIO
      {
        categoria: 'ingles',
        dificuldade: 'medio',
        enunciado: 'Complete: "I _____ to school every day"',
        opcoes: JSON.stringify(['go', 'goes', 'going', 'went']),
        resposta_correta: 'go',
        pontos: 20,
        ativo: true
      },
      {
        categoria: 'ingles',
        dificuldade: 'medio',
        enunciado: 'What is the past tense of "eat"?',
        opcoes: JSON.stringify(['Eated', 'Ate', 'Eating', 'Eaten']),
        resposta_correta: 'Ate',
        pontos: 20,
        ativo: true
      },
      // PROGRAMAÇÃO - FÁCIL
      {
        categoria: 'programacao',
        dificuldade: 'facil',
        enunciado: 'Em JavaScript, como se declara uma variável?',
        opcoes: JSON.stringify(['var x;', 'let x;', 'const x;', 'Todas as anteriores']),
        resposta_correta: 'Todas as anteriores',
        pontos: 10,
        ativo: true
      },
      {
        categoria: 'programacao',
        dificuldade: 'facil',
        enunciado: 'O que é uma função?',
        opcoes: JSON.stringify(['Um tipo de dado', 'Um bloco de código reutilizável', 'Uma variável', 'Um operador']),
        resposta_correta: 'Um bloco de código reutilizável',
        pontos: 10,
        ativo: true
      },
      // PROGRAMAÇÃO - MÉDIO
      {
        categoria: 'programacao',
        dificuldade: 'medio',
        enunciado: 'Qual é a saída de: console.log(typeof [])?',
        opcoes: JSON.stringify(['array', 'object', 'list', 'collection']),
        resposta_correta: 'object',
        pontos: 20,
        ativo: true
      },
      {
        categoria: 'programacao',
        dificuldade: 'medio',
        enunciado: 'O que é um callback?',
        opcoes: JSON.stringify(['Uma função passada como argumento', 'Uma variável global', 'Um tipo de dado', 'Uma constante']),
        resposta_correta: 'Uma função passada como argumento',
        pontos: 20,
        ativo: true
      },
      // PROGRAMAÇÃO - DIFÍCIL
      {
        categoria: 'programacao',
        dificuldade: 'dificil',
        enunciado: 'O que é closure em JavaScript?',
        opcoes: JSON.stringify(['Uma função que encerra o programa', 'Uma função que acessa variáveis de escopo externo', 'Um tipo de erro', 'Um tipo de loop']),
        resposta_correta: 'Uma função que acessa variáveis de escopo externo',
        pontos: 30,
        ativo: true
      }
    ];

    await QuestaoTesteConhecimento.bulkCreate(questoesTeste);
    console.log(`✅ ${questoesTeste.length} questões de teste criadas\n`);

    // 
    // 2️⃣ CRIAR TORNEIO E BLOCOS
    // 

    console.log('🏆 Criando torneio e blocos de questões...');

    // Criar um admin para associar ao torneio
    let admin = await Usuario.findOne({ where: { email: 'admin@comaes.com' } });
    if (!admin) {
      admin = await Usuario.create({
        nome: 'Administrador COMAES',
        email: 'admin@comaes.com',
        telefone: '920000000',
        password: senhaHash,
        role: 'admin',
        isAdmin: true,
        escola: 'COMAES',
        nascimento: '1980-01-01',
        sexo: 'M'
      });
    }

    const buildSlug = (value = '') => value
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120);

    // Verificar se torneio já existe
    let torneio = await Torneio.findOne({ where: { slug: buildSlug('Torneio de Conhecimento Geral 2026') } });
    
    if (!torneio) {
      torneio = await Torneio.create({
        titulo: 'Torneio de Conhecimento Geral 2026',
        slug: buildSlug('Torneio de Conhecimento Geral 2026'),
        descricao: 'Torneio com questões de múltiplas disciplinas para testar conhecimento geral',
        inicia_em: new Date('2026-06-15'),
        termina_em: new Date('2026-06-30'),
        status: 'ativo',
        criado_por: admin.id
      });
      console.log(`✅ Torneio criado: ${torneio.titulo} (ID: ${torneio.id})\n`);
    } else {
      console.log(`✅ Torneio já existente: ${torneio.titulo} (ID: ${torneio.id})\n`);
    }

    // Criar blocos de questões
    const blocos = await Promise.all([
      BlocoQuestoes.create({
        titulo: 'Bloco Matemática - Básico',
        descricao: 'Questões básicas de matemática para aquecimento',
        disciplina: 'matematica',
        dificuldade: 'facil',
        status: 'publicado',
        criado_por: admin.id
      }),
      BlocoQuestoes.create({
        titulo: 'Bloco Inglês - Intermediário',
        descricao: 'Questões de inglês para nível intermediário',
        disciplina: 'ingles',
        dificuldade: 'medio',
        status: 'publicado',
        criado_por: admin.id
      }),
      BlocoQuestoes.create({
        titulo: 'Bloco Programação - Avançado',
        descricao: 'Questões desafiadoras de programação',
        disciplina: 'programacao',
        dificuldade: 'dificil',
        status: 'publicado',
        criado_por: admin.id
      })
    ]);

    console.log(`✅ ${blocos.length} blocos de questões criados\n`);

    // 
    // 3️⃣ CRIAR 2 COLABORADORES
    // 

    console.log('👥 Criando colaboradores...');

    // Colaborador 1: PENDENTE
    const colab1 = await Usuario.create({
      nome: 'João Silva',
      email: 'joao.prof.mat@example.com',
      telefone: '923456101',
      password: senhaHash,
      role: 'colaborador',
      disciplina_colaborador: 'matematica',
      status_colaborador: 'pendente',
      escola: 'Escola Secundária Central',
      isAdmin: false,
      nascimento: '1985-03-15',
      sexo: 'M'
    });

    console.log(`✅ Colaborador PENDENTE criado:`);
    console.log(`   📧 Email: ${colab1.email}`);
    console.log(`   🔑 Senha: Senha123!`);
    console.log(`   📱 Telefone: ${colab1.telefone}`);
    console.log(`   ⏳ Status: ${colab1.status_colaborador}\n`);

    // Colaborador 2: APROVADO
    const colab2 = await Usuario.create({
      nome: 'Maria Santos',
      email: 'maria.prof.ing@example.com',
      telefone: '924567102',
      password: senhaHash,
      role: 'colaborador',
      disciplina_colaborador: 'ingles',
      status_colaborador: 'aprovado',
      escola: 'Instituto de Línguas Modernas',
      isAdmin: false,
      nascimento: '1988-07-22',
      sexo: 'F'
    });

    console.log(`✅ Colaborador APROVADO criado:`);
    console.log(`   📧 Email: ${colab2.email}`);
    console.log(`   🔑 Senha: Senha123!`);
    console.log(`   📱 Telefone: ${colab2.telefone}`);
    console.log(`   ✅ Status: ${colab2.status_colaborador}\n`);

    // 
    // 4️⃣ CRIAR QUESTÕES PARA COLABORADOR 2
    // 

    console.log('📝 Criando questões para Maria Santos (Colaborador 2)...\n');

    // CENÁRIO 1: Questões Pendentes (aguardando aprovação)
    const questoesPendentes = await Promise.all([
      Questao.create({
        titulo: 'Present Perfect - Exercício 1',
        descricao: 'Complete: "I _____ here for 5 years"',
        disciplina: 'ingles',
        tipo: 'multipla_escolha',
        dificuldade: 'medio',
        opcoes: JSON.stringify(['am', 'have been', 'had been', 'will be']),
        resposta_correta: 'have been',
        pontos: 15,
        autor_id: colab2.id,
        status_aprovacao: 'pendente'
      }),
      Questao.create({
        titulo: 'Conditional - Exercício 2',
        descricao: 'Se eu ganhasse na loteria, eu _____ uma casa grande',
        disciplina: 'ingles',
        tipo: 'multipla_escolha',
        dificuldade: 'dificil',
        opcoes: JSON.stringify(['buy', 'would buy', 'will buy', 'would have bought']),
        resposta_correta: 'would buy',
        pontos: 20,
        autor_id: colab2.id,
        status_aprovacao: 'pendente'
      }),
      Questao.create({
        titulo: 'Phrasal Verbs - Exercício 3',
        descricao: 'O que significa "look up to"?',
        disciplina: 'ingles',
        tipo: 'multipla_escolha',
        dificuldade: 'medio',
        opcoes: JSON.stringify(['Olhar para cima', 'Admirar/respeitar', 'Procurar', 'Investigar']),
        resposta_correta: 'Admirar/respeitar',
        pontos: 15,
        autor_id: colab2.id,
        status_aprovacao: 'pendente'
      })
    ]);

    console.log(`✅ ${questoesPendentes.length} questões PENDENTES criadas (aguardando revisão)\n`);

    // CENÁRIO 2: Questões Aprovadas (já revisadas e aceitas pelo admin)
    const questoesAprovadas = await Promise.all([
      Questao.create({
        titulo: 'Vocabulary - Colors',
        descricao: 'Qual é a cor oposta ao preto?',
        disciplina: 'ingles',
        tipo: 'multipla_escolha',
        dificuldade: 'facil',
        opcoes: JSON.stringify(['Vermelho', 'Azul', 'Branco', 'Verde']),
        resposta_correta: 'Branco',
        pontos: 10,
        autor_id: colab2.id,
        status_aprovacao: 'aprovada',
        revisado_por: 1, // Admin ID (será criado se não existir)
        revisado_em: new Date()
      }),
      Questao.create({
        titulo: 'Listening Comprehension - Question 1',
        descricao: 'Que hora era quando o meeting começou?',
        disciplina: 'ingles',
        tipo: 'multipla_escolha',
        dificuldade: 'medio',
        opcoes: JSON.stringify(['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM']),
        resposta_correta: '10:00 AM',
        pontos: 15,
        autor_id: colab2.id,
        status_aprovacao: 'aprovada',
        revisado_por: 1,
        revisado_em: new Date()
      }),
      Questao.create({
        titulo: 'Grammar - Tenses',
        descricao: 'Escolha a sentença com o tempo verbal correto:',
        disciplina: 'ingles',
        tipo: 'multipla_escolha',
        dificuldade: 'dificil',
        opcoes: JSON.stringify([
          '"He goes to the store yesterday"',
          '"He went to the store yesterday"',
          '"He goes to the store tomorrow"',
          '"He is going to the store yesterday"'
        ]),
        resposta_correta: '"He went to the store yesterday"',
        pontos: 20,
        autor_id: colab2.id,
        status_aprovacao: 'aprovada',
        revisado_por: 1,
        revisado_em: new Date()
      })
    ]);

    console.log(`✅ ${questoesAprovadas.length} questões APROVADAS criadas (já revisadas)\n`);

    console.log(' Usuário administrador já foi criado acima\n');

    // 
    // 6️⃣ RESUMO FINAL
    // 

    console.log('');
    console.log('✅ SEED DE DADOS CONCLUÍDO COM SUCESSO!');
    console.log('\n');

    console.log('📊 RESUMO DO QUE FOI CRIADO:');
    console.log('');
    console.log(`📚 Questões de Teste: ${questoesTeste.length}`);
    console.log(`   - Matemática: 5 questões`);
    console.log(`   - Inglês: 4 questões`);
    console.log(`   - Programação: 5 questões`);
    console.log(`\n🏆 Torneios: 1`);
    console.log(`   📅 Título: ${torneio.titulo}`);
    console.log(`    Blocos: ${blocos.length} (Matemática, Inglês, Programação)`);
    console.log(`\n👥 Colaboradores: 2`);
    console.log(`   1. João Silva (Matemática) - STATUS: ⏳ PENDENTE`);
    console.log(`   2. Maria Santos (Inglês) - STATUS: ✅ APROVADO`);
    console.log(`      📝 Questões Pendentes: ${questoesPendentes.length}`);
    console.log(`      ✅ Questões Aprovadas: ${questoesAprovadas.length}`);
    console.log(`\n Admin: 1`);
    console.log('\n');

    console.log('🔐 CREDENCIAIS DE ACESSO:');
    console.log('\n');

    console.log('👤 COLABORADOR 1 (PENDENTE - Não pode acessar ainda):');
    console.log('');
    console.log(`│ Email: joao.silva@example.com                              │`);
    console.log(`│ Senha: Senha123!                                           │`);
    console.log(`│ Disciplina: Matemática                                     │`);
    console.log(`│ Status: ⏳ PENDENTE (aguardando aprovação do admin)          │`);
    console.log('\n');

    console.log('👤 COLABORADOR 2 (APROVADO - Pode acessar):');
    console.log('');
    console.log(`│ Email: maria.santos@example.com                            │`);
    console.log(`│ Senha: Senha123!                                           │`);
    console.log(`│ Disciplina: Inglês                                         │`);
    console.log(`│ Status: ✅ APROVADO (pode acessar a plataforma)             │`);
    console.log(`│                                                             │`);
    console.log(`│ CENÁRIOS DE TESTE:                                         │`);
    console.log(`│ • 3 questões em status PENDENTE (aguardando revisão)       │`);
    console.log(`│ • 3 questões em status APROVADO (já revisadas)             │`);
    console.log('\n');

    console.log(' ADMINISTRADOR:');
    console.log('');
    console.log(`│ Email: admin@comaes.com                                    │`);
    console.log(`│ Senha: Senha123!                                           │`);
    console.log('\n');

    console.log('🎯 TESTES RECOMENDADOS:');
    console.log('');
    console.log('1. Login como ADMIN → Revisar colaboradores pendentes');
    console.log('2. Login como Maria (Colaborador aprovado):');
    console.log('   - Ver questões pendentes (aguardando revisão)');
    console.log('   - Ver questões aprovadas (já validadas)');
    console.log('   - Criar nova questão e submeter');
    console.log('3. Como ADMIN → Revisar questões pendentes de Maria');
    console.log('4. Testar fluxo de aprovação/rejeição');
    console.log('5. Verificar notificações (quando implementadas)');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    process.exit(1);
  }
};

seed();
