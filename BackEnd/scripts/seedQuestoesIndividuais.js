/**
 * Seed: Criar 6 questões individuais (sem bloco)
 * Disciplinas variadas: Programação, Inglês, Matemática
 */

import sequelize from '../config/db.js';
import Questao from '../models/Questao.js';

const questoes = [
  {
    titulo: 'Qual é a função do operador "map" em JavaScript?',
    descricao: 'Pergunta sobre a função map que itera sobre arrays em JavaScript',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: [
      { texto: 'Mapear um objeto para outro', correta: false },
      { texto: 'Transformar cada elemento de um array em um novo array', correta: true },
      { texto: 'Criar um mapa de dados', correta: false },
      { texto: 'Localizar um elemento no array', correta: false }
    ],
    resposta_correta: 'b',
    explicacao: 'A função map() retorna um novo array com o resultado da aplicação da função callback a cada elemento.',
    pontos: 10,
    status_aprovacao: 'aprovada'
  },
  {
    titulo: 'Como se diz "gato" em inglês?',
    descricao: 'Questão básica de vocabulário em inglês',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: [
      { texto: 'Dog', correta: false },
      { texto: 'Cat', correta: true },
      { texto: 'Bird', correta: false },
      { texto: 'Fish', correta: false }
    ],
    resposta_correta: 'b',
    explicacao: 'Cat é a palavra em inglês para gato.',
    pontos: 5,
    status_aprovacao: 'aprovada'
  },
  {
    titulo: 'Qual é a solução da equação: 2x + 5 = 13?',
    descricao: 'Equação linear simples',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: [
      { texto: 'x = 2', correta: false },
      { texto: 'x = 3', correta: false },
      { texto: 'x = 4', correta: true },
      { texto: 'x = 5', correta: false }
    ],
    resposta_correta: 'c',
    explicacao: '2x + 5 = 13 → 2x = 8 → x = 4',
    pontos: 8,
    status_aprovacao: 'aprovada'
  },
  {
    titulo: 'O que é uma classe em Programação Orientada a Objetos?',
    descricao: 'Conceito fundamental de POO em Python',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: [
      { texto: 'Um tipo de variável', correta: false },
      { texto: 'Um molde ou blueprint para criar objetos', correta: true },
      { texto: 'Uma função especial', correta: false },
      { texto: 'Um módulo importado', correta: false }
    ],
    resposta_correta: 'b',
    explicacao: 'Uma classe é um molde que define a estrutura e comportamento dos objetos que serão criados a partir dela.',
    pontos: 10,
    status_aprovacao: 'aprovada'
  },
  {
    titulo: 'Qual é o phrasal verb para "desistir"?',
    descricao: 'Phrasal verbs em inglês',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: [
      { texto: 'Give up', correta: true },
      { texto: 'Give in', correta: false },
      { texto: 'Give out', correta: false },
      { texto: 'Give away', correta: false }
    ],
    resposta_correta: 'a',
    explicacao: '"Give up" significa desistir ou abandonar algo.',
    pontos: 8,
    status_aprovacao: 'aprovada'
  },
  {
    titulo: 'Qual é a derivada de f(x) = 3x²?',
    descricao: 'Cálculo diferencial básico',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: [
      { texto: 'f\'(x) = 6x', correta: true },
      { texto: 'f\'(x) = 3x', correta: false },
      { texto: 'f\'(x) = 6x²', correta: false },
      { texto: 'f\'(x) = 3', correta: false }
    ],
    resposta_correta: 'a',
    explicacao: 'Usando a regra da potência: d/dx(3x²) = 3 × 2x = 6x',
    pontos: 12,
    status_aprovacao: 'aprovada'
  }
];

async function seed() {
  try {
    console.log('🌱 Iniciando seed de questões individuais...');
    
    // Sincronizar banco
    await sequelize.sync({ alter: false });
    
    // Criar questões
    for (let i = 0; i < questoes.length; i++) {
      const q = questoes[i];
      
      const questao = await Questao.create({
        titulo: q.titulo,
        descricao: q.descricao,
        disciplina: q.disciplina,
        tipo: q.tipo,
        dificuldade: q.dificuldade,
        opcoes: q.opcoes,
        resposta_correta: q.resposta_correta,
        explicacao: q.explicacao,
        pontos: q.pontos,
        status_aprovacao: q.status_aprovacao,
        torneio_id: null,  // Sem torneio
        bloco_id: null,    // Sem bloco (INDIVIDUAL)
        autor_id: null     // Sem autor específico
      });
      
      console.log(`✅ Questão ${i + 1}/6 criada: "${q.titulo.substring(0, 50)}..."`);
    }
    
    console.log('\n✅ Seed concluído! 6 questões individuais criadas.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
}

seed();
