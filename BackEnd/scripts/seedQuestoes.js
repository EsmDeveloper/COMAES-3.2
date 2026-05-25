import sequelize from '../config/db.js';
import bcrypt from 'bcryptjs';
import Usuario from '../models/User.js';
import Torneio from '../models/Torneio.js';
import Questao from '../models/Questao.js';

async function seed() {
  try {
    console.log('🔄 Iniciando seeding do banco de dados para questões...');

    await sequelize.authenticate();
    console.log('✅ Conexão com DB OK');

    // Usuário criador do torneio (1 admin de seed)
    let admin = await Usuario.findOne({ where: { email: 'admin@comaes.test' } });
    if (!admin) {
      const existingByPhone = await Usuario.findOne({ where: { telefone: '999999999' } });
      if (existingByPhone) {
        const newPhone = `9999${Date.now().toString().slice(-7)}`;
        admin = await Usuario.create({
          nome: 'Admin COMAES',
          telefone: newPhone,
          email: 'admin@comaes.test',
          nascimento: '2000-01-01',
          sexo: 'Masculino',
          password: await bcrypt.hash('admin123', 8),
          isAdmin: true
        });
      } else {
        admin = await Usuario.create({
          nome: 'Admin COMAES',
          telefone: '999999999',
          email: 'admin@comaes.test',
          nascimento: '2000-01-01',
          sexo: 'Masculino',
          password: await bcrypt.hash('admin123', 8),
          isAdmin: true
        });
      }
    }

    const [torneio] = await Torneio.findOrCreate({
      where: { slug: 'torneio-comaes-2026' },
      defaults: {
        titulo: 'Torneio COMAES 2026',
        descricao: 'Torneio unificado de Matemática, Programação e Inglês.',
        inicia_em: new Date(),
        termina_em: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
        criado_por: admin.id,
        status: 'ativo'
      }
    });

    const mathQuest = [
      {
        titulo: 'Equação Linear',
        descricao: 'Resolva: 3x - 7 = 11',
        dificuldade: 'facil',
        resposta_correta: 'x = 6',
        pontos: 10,
        opcoes: ['x = 5', 'x = 6', 'x = 7', 'x = 8']
      },
      {
        titulo: 'Sistema de Equações',
        descricao: 'Resolva o sistema: x + y = 5 e 2x - y = 4',
        dificuldade: 'medio',
        resposta_correta: 'x = 3, y = 2',
        pontos: 15,
        opcoes: ['x = 2, y = 3', 'x = 3, y = 2', 'x = 1, y = 4', 'x = 4, y = 1']
      },
      {
        titulo: 'Geometria Básica',
        descricao: 'Área de um círculo de raio 3. Use π = 3.14',
        dificuldade: 'dificil',
        resposta_correta: '28.26',
        pontos: 20,
        opcoes: ['18.84', '28.26', '30.16', '33.18']
      }
    ];

    const progQuest = [
      {
        titulo: 'Estrutura de Repetição',
        descricao: 'Escreva código em JavaScript que soma todos os números de 1 a 10.',
        dificuldade: 'facil',
        resposta_correta: 'let soma = 0; for (let i=1; i<=10; i++){ soma += i; }',
        pontos: 12,
        opcoes: null,
        linguagem: 'JavaScript'
      },
      {
        titulo: 'Função Recursiva',
        descricao: 'Escreva a função recursiva para calcular factorial (n!).',
        dificuldade: 'medio',
        resposta_correta: 'function fatorial(n){ return n<=1?1:n*fatorial(n-1); }',
        pontos: 18,
        opcoes: null,
        linguagem: 'JavaScript'
      },
      {
        titulo: 'Filtro de Lista',
        descricao: 'Dados um array de números, filtre apenas pares.',
        dificuldade: 'dificil',
        resposta_correta: 'const pares = numeros.filter(n => n % 2 === 0);',
        pontos: 25,
        opcoes: null,
        linguagem: 'JavaScript'
      }
    ];

    const engQuest = [
      {
        titulo: 'Preposição',
        descricao: 'Escolha a preposição correta: "He is good ___ math."',
        dificuldade: 'facil',
        resposta_correta: 'at',
        pontos: 10,
        opcoes: ['in', 'at', 'on', 'for']
      },
      {
        titulo: 'Tempo Verbal',
        descricao: 'Qual é o passado de "go"?',
        dificuldade: 'medio',
        resposta_correta: 'went',
        pontos: 15,
        opcoes: ['goed', 'went', 'gone', 'goes']
      },
      {
        titulo: 'Compreensão',
        descricao: 'Complete: "She has been studying English _____ two years."',
        dificuldade: 'dificil',
        resposta_correta: 'for',
        pontos: 20,
        opcoes: ['since', 'at', 'for', 'from']
      }
    ];

    for (const q of mathQuest) {
      await Questao.findOrCreate({
        where: { torneio_id: torneio.id, titulo: q.titulo },
        defaults: { ...q, torneio_id: torneio.id, disciplina: 'matematica', tipo: 'multipla_escolha' }
      });
    }

    for (const q of progQuest) {
      await Questao.findOrCreate({
        where: { torneio_id: torneio.id, titulo: q.titulo },
        defaults: { ...q, torneio_id: torneio.id, disciplina: 'programacao', tipo: 'codigo', linguagem: 'javascript' }
      });
    }

    for (const q of engQuest) {
      await Questao.findOrCreate({
        where: { torneio_id: torneio.id, titulo: q.titulo },
        defaults: { ...q, torneio_id: torneio.id, disciplina: 'ingles', tipo: 'multipla_escolha' }
      });
    }

    console.log('✅ Seed finalizado com sucesso!');
    console.log('Torneio:', torneio.titulo, 'ID:', torneio.id);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();