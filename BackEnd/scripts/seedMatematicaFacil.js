/**
 * Script para popular o banco com 30 questões de Matemática - Nível Fácil
 * Para torneios
 * 
 * Executar: node BackEnd/scripts/seedMatematicaFacil.js
 */

import sequelize from '../config/db.js';
import Questao from '../models/Questao.js';

const questoesMatematicaFacil = [
  // ========== ARITMÉTICA BÁSICA (10 questões) ==========
  {
    titulo: "Soma Simples",
    enunciado: "Quanto é 15 + 27?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "32", correta: false },
      { id: "b", texto: "42", correta: true },
      { id: "c", texto: "52", correta: false },
      { id: "d", texto: "62", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Subtração Simples",
    enunciado: "Quanto é 50 - 23?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "27", correta: true },
      { id: "b", texto: "37", correta: false },
      { id: "c", texto: "17", correta: false },
      { id: "d", texto: "33", correta: false }
    ]),
    resposta_correta: "a"
  },
  {
    titulo: "Multiplicação Básica",
    enunciado: "Quanto é 8 × 7?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "54", correta: false },
      { id: "b", texto: "56", correta: true },
      { id: "c", texto: "64", correta: false },
      { id: "d", texto: "48", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Divisão Simples",
    enunciado: "Quanto é 36 ÷ 4?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "8", correta: false },
      { id: "b", texto: "9", correta: true },
      { id: "c", texto: "7", correta: false },
      { id: "d", texto: "6", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Dobro de um Número",
    enunciado: "Qual é o dobro de 25?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "40", correta: false },
      { id: "b", texto: "50", correta: true },
      { id: "c", texto: "60", correta: false },
      { id: "d", texto: "45", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Metade de um Número",
    enunciado: "Qual é a metade de 80?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "30", correta: false },
      { id: "b", texto: "35", correta: false },
      { id: "c", texto: "40", correta: true },
      { id: "d", texto: "45", correta: false }
    ]),
    resposta_correta: "c"
  },
  {
    titulo: "Soma com Três Números",
    enunciado: "Quanto é 12 + 8 + 5?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "23", correta: false },
      { id: "b", texto: "24", correta: false },
      { id: "c", texto: "25", correta: true },
      { id: "d", texto: "26", correta: false }
    ]),
    resposta_correta: "c"
  },
  {
    titulo: "Multiplicação por 10",
    enunciado: "Quanto é 13 × 10?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "103", correta: false },
      { id: "b", texto: "130", correta: true },
      { id: "c", texto: "1300", correta: false },
      { id: "d", texto: "13", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Ordem das Operações",
    enunciado: "Quanto é 5 + 3 × 2?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "16", correta: false },
      { id: "b", texto: "11", correta: true },
      { id: "c", texto: "13", correta: false },
      { id: "d", texto: "10", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Resto da Divisão",
    enunciado: "Qual é o resto da divisão de 17 por 5?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "1", correta: false },
      { id: "b", texto: "2", correta: true },
      { id: "c", texto: "3", correta: false },
      { id: "d", texto: "4", correta: false }
    ]),
    resposta_correta: "b"
  },

  // ========== FRAÇÕES E DECIMAIS (10 questões) ==========
  {
    titulo: "Fração Simples",
    enunciado: "Quanto é 1/2 + 1/4?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "1/4", correta: false },
      { id: "b", texto: "2/6", correta: false },
      { id: "c", texto: "3/4", correta: true },
      { id: "d", texto: "1/3", correta: false }
    ]),
    resposta_correta: "c"
  },
  {
    titulo: "Decimal para Fração",
    enunciado: "Qual fração representa 0,5?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "1/4", correta: false },
      { id: "b", texto: "1/2", correta: true },
      { id: "c", texto: "1/3", correta: false },
      { id: "d", texto: "2/3", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Soma de Decimais",
    enunciado: "Quanto é 2,5 + 1,3?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "3,8", correta: true },
      { id: "b", texto: "3,7", correta: false },
      { id: "c", texto: "4,8", correta: false },
      { id: "d", texto: "2,8", correta: false }
    ]),
    resposta_correta: "a"
  },
  {
    titulo: "Fração de um Número",
    enunciado: "Quanto é 1/4 de 20?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "4", correta: false },
      { id: "b", texto: "5", correta: true },
      { id: "c", texto: "6", correta: false },
      { id: "d", texto: "10", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Comparação de Frações",
    enunciado: "Qual é maior: 1/2 ou 1/3?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "1/2", correta: true },
      { id: "b", texto: "1/3", correta: false },
      { id: "c", texto: "São iguais", correta: false },
      { id: "d", texto: "Não é possível comparar", correta: false }
    ]),
    resposta_correta: "a"
  },
  {
    titulo: "Multiplicação de Decimal",
    enunciado: "Quanto é 0,5 × 10?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "0,5", correta: false },
      { id: "b", texto: "5", correta: true },
      { id: "c", texto: "50", correta: false },
      { id: "d", texto: "0,05", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Fração Equivalente",
    enunciado: "Qual fração é equivalente a 2/4?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "1/2", correta: true },
      { id: "b", texto: "1/4", correta: false },
      { id: "c", texto: "3/4", correta: false },
      { id: "d", texto: "2/3", correta: false }
    ]),
    resposta_correta: "a"
  },
  {
    titulo: "Porcentagem Simples",
    enunciado: "Quanto é 50% de 100?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "25", correta: false },
      { id: "b", texto: "50", correta: true },
      { id: "c", texto: "75", correta: false },
      { id: "d", texto: "100", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Subtração de Decimais",
    enunciado: "Quanto é 5,0 - 2,3?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "2,7", correta: true },
      { id: "b", texto: "3,7", correta: false },
      { id: "c", texto: "2,3", correta: false },
      { id: "d", texto: "3,3", correta: false }
    ]),
    resposta_correta: "a"
  },
  {
    titulo: "Fração Própria",
    enunciado: "Qual destas é uma fração própria?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "5/3", correta: false },
      { id: "b", texto: "3/5", correta: true },
      { id: "c", texto: "7/7", correta: false },
      { id: "d", texto: "8/4", correta: false }
    ]),
    resposta_correta: "b"
  },

  // ========== GEOMETRIA BÁSICA (10 questões) ==========
  {
    titulo: "Perímetro do Quadrado",
    enunciado: "Qual é o perímetro de um quadrado com lado de 5 cm?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "15 cm", correta: false },
      { id: "b", texto: "20 cm", correta: true },
      { id: "c", texto: "25 cm", correta: false },
      { id: "d", texto: "10 cm", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Área do Retângulo",
    enunciado: "Qual é a área de um retângulo com base 6 cm e altura 4 cm?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "10 cm²", correta: false },
      { id: "b", texto: "20 cm²", correta: false },
      { id: "c", texto: "24 cm²", correta: true },
      { id: "d", texto: "12 cm²", correta: false }
    ]),
    resposta_correta: "c"
  },
  {
    titulo: "ngulo Reto",
    enunciado: "Quantos graus tem um ângulo reto?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "45°", correta: false },
      { id: "b", texto: "90°", correta: true },
      { id: "c", texto: "180°", correta: false },
      { id: "d", texto: "360°", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Lados do Triângulo",
    enunciado: "Quantos lados tem um triângulo?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "2", correta: false },
      { id: "b", texto: "3", correta: true },
      { id: "c", texto: "4", correta: false },
      { id: "d", texto: "5", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Círculo - Diâmetro",
    enunciado: "Se o raio de um círculo é 5 cm, qual é o diâmetro?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "5 cm", correta: false },
      { id: "b", texto: "10 cm", correta: true },
      { id: "c", texto: "15 cm", correta: false },
      { id: "d", texto: "2,5 cm", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Soma dos ngulos Internos",
    enunciado: "Qual é a soma dos ângulos internos de um triângulo?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "90°", correta: false },
      { id: "b", texto: "180°", correta: true },
      { id: "c", texto: "270°", correta: false },
      { id: "d", texto: "360°", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Área do Quadrado",
    enunciado: "Qual é a área de um quadrado com lado de 4 cm?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "8 cm²", correta: false },
      { id: "b", texto: "12 cm²", correta: false },
      { id: "c", texto: "16 cm²", correta: true },
      { id: "d", texto: "20 cm²", correta: false }
    ]),
    resposta_correta: "c"
  },
  {
    titulo: "Lados do Pentágono",
    enunciado: "Quantos lados tem um pentágono?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "4", correta: false },
      { id: "b", texto: "5", correta: true },
      { id: "c", texto: "6", correta: false },
      { id: "d", texto: "7", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "Perímetro do Retângulo",
    enunciado: "Qual é o perímetro de um retângulo com base 8 cm e altura 3 cm?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "11 cm", correta: false },
      { id: "b", texto: "22 cm", correta: true },
      { id: "c", texto: "24 cm", correta: false },
      { id: "d", texto: "16 cm", correta: false }
    ]),
    resposta_correta: "b"
  },
  {
    titulo: "ngulo Completo",
    enunciado: "Quantos graus tem um ângulo completo (volta completa)?",
    disciplina: "Matemática",
    dificuldade: "facil",
    tipo: "multipla_escolha",
    pontos: 10,
    opcoes: JSON.stringify([
      { id: "a", texto: "90°", correta: false },
      { id: "b", texto: "180°", correta: false },
      { id: "c", texto: "270°", correta: false },
      { id: "d", texto: "360°", correta: true }
    ]),
    resposta_correta: "d"
  }
];

async function seed() {
  try {
    console.log('🌱 Iniciando seed de questões de Matemática - Nível Fácil...');
    
    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');

    // Importar modelo de Torneio
    const { default: Torneio } = await import('../models/Torneio.js');

    // Buscar um torneio ativo ou criar um torneio padrão
    let torneio = await Torneio.findOne({
      where: { status: 'ativo' }
    });

    if (!torneio) {
      console.log('⚠️  Nenhum torneio ativo encontrado. Criando torneio padrão...');
      torneio = await Torneio.create({
        titulo: 'Torneio Padrão - Questões de Matemática',
        descricao: 'Torneio criado automaticamente para armazenar questões de matemática',
        inicia_em: new Date(),
        termina_em: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        status: 'ativo',
        público: true,
        slug: 'torneio-padrao-matematica',
        criado_por: 1 // Admin master
      });
      console.log(`✅ Torneio criado: ID ${torneio.id}`);
    } else {
      console.log(`✅ Usando torneio existente: ID ${torneio.id} - ${torneio.titulo}`);
    }

    // Verificar quantas questões já existem
    const existentes = await Questao.count({
      where: {
        disciplina: 'matematica',
        dificuldade: 'facil'
      }
    });

    console.log(`📊 Questões existentes: ${existentes}`);

    // Inserir questões
    let inseridas = 0;
    for (const questao of questoesMatematicaFacil) {
      try {
        await Questao.create({
          ...questao,
          torneio_id: torneio.id,
          descricao: questao.enunciado, // Usar enunciado como descrição
          disciplina: 'matematica' // Lowercase para o ENUM
        });
        inseridas++;
        console.log(`✅ [${inseridas}/${questoesMatematicaFacil.length}] ${questao.titulo}`);
      } catch (err) {
        console.error(`❌ Erro ao inserir "${questao.titulo}":`, err.message);
      }
    }

    console.log('\n🎉 Seed concluído!');
    console.log(`📈 Total inserido: ${inseridas} questões`);
    console.log(`📊 Total no banco: ${existentes + inseridas} questões de Matemática Fácil`);

  } catch (error) {
    console.error('❌ Erro no seed:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexão fechada');
  }
}

// Executar seed
seed();
