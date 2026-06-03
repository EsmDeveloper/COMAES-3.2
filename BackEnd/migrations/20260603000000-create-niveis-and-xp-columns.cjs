'use strict';

/**
 * Migration: Sistema de Níveis COMAES
 *
 * 1. Cria a tabela `niveis` com os 10 níveis temáticos da coruja
 * 2. Adiciona `xp_total` e `nivel_atual` à tabela `usuarios`
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // ── 1. Criar tabela niveis ────────────────────────────────────────
    await queryInterface.createTable('niveis', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      numero: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'Número do nível (1, 2, 3...)',
      },
      titulo: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Título temático (ex: Filhote de Coruja)',
      },
      xp_minimo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'XP mínimo acumulado para atingir este nível',
      },
      icone: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: 'Emoji ou código de ícone do nível',
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição motivacional do nível',
      },
      cor: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Cor hex do nível para UI (ex: #4F6EF7)',
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // ── 2. Adicionar colunas XP e nível à tabela usuarios ────────────
    // Verificar se xp_total já existe (pode ter sido criada manualmente)
    const tableDesc = await queryInterface.describeTable('usuarios');

    if (!tableDesc.xp_total) {
      await queryInterface.addColumn('usuarios', 'xp_total', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'XP acumulado do utilizador (baseado em desempenho real)',
        after: 'isAdmin',
      });
    }

    if (!tableDesc.nivel_atual) {
      await queryInterface.addColumn('usuarios', 'nivel_atual', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Número do nível atual (FK conceptual → niveis.numero)',
        after: 'xp_total',
      });
    }

    // ── 3. Popular tabela niveis com os 10 níveis temáticos ──────────
    await queryInterface.bulkInsert('niveis', [
      {
        numero: 1,
        titulo: 'Filhote de Coruja',
        xp_minimo: 0,
        icone: '🐣',
        descricao: 'Cada grande jornada começa com um primeiro passo. Bem-vindo à COMAES!',
        cor: '#94A3B8',
        criado_em: new Date(),
      },
      {
        numero: 2,
        titulo: 'Coruja Curiosa',
        xp_minimo: 200,
        icone: '🦉',
        descricao: 'A curiosidade é o motor do conhecimento. Continue explorando!',
        cor: '#64748B',
        criado_em: new Date(),
      },
      {
        numero: 3,
        titulo: 'Coruja Aprendiz',
        xp_minimo: 500,
        icone: '📚',
        descricao: 'O aprendizado consistente está a moldar a tua mente académica.',
        cor: '#3B82F6',
        criado_em: new Date(),
      },
      {
        numero: 4,
        titulo: 'Coruja Estudiosa',
        xp_minimo: 1000,
        icone: '✏️',
        descricao: 'A disciplina e o esforço estão a produzir resultados visíveis.',
        cor: '#6366F1',
        criado_em: new Date(),
      },
      {
        numero: 5,
        titulo: 'Coruja Estrategista',
        xp_minimo: 2000,
        icone: '🎯',
        descricao: 'Resolves problemas com método e raciocínio estratégico.',
        cor: '#8B5CF6',
        criado_em: new Date(),
      },
      {
        numero: 6,
        titulo: 'Coruja Competidora',
        xp_minimo: 3500,
        icone: '🏅',
        descricao: 'O espírito competitivo eleva o teu desempenho a novos patamares.',
        cor: '#EC4899',
        criado_em: new Date(),
      },
      {
        numero: 7,
        titulo: 'Coruja Especialista',
        xp_minimo: 5500,
        icone: '🔬',
        descricao: 'O domínio técnico distingue-te no campo académico.',
        cor: '#14B8A6',
        criado_em: new Date(),
      },
      {
        numero: 8,
        titulo: 'Coruja Sábia',
        xp_minimo: 8000,
        icone: '🌟',
        descricao: 'A sabedoria acumulada transforma conhecimento em excelência.',
        cor: '#F59E0B',
        criado_em: new Date(),
      },
      {
        numero: 9,
        titulo: 'Coruja Mestre',
        xp_minimo: 12000,
        icone: '👑',
        descricao: 'Atingiste um domínio raro que poucos alcançam. És uma referência.',
        cor: '#EF4444',
        criado_em: new Date(),
      },
      {
        numero: 10,
        titulo: 'Coruja Lendária',
        xp_minimo: 18000,
        icone: '🔥',
        descricao: 'O topo da excelência académica COMAES. A tua jornada inspira outros.',
        cor: '#7C3AED',
        criado_em: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remover colunas de usuarios
    const tableDesc = await queryInterface.describeTable('usuarios');
    if (tableDesc.nivel_atual) {
      await queryInterface.removeColumn('usuarios', 'nivel_atual');
    }
    if (tableDesc.xp_total) {
      await queryInterface.removeColumn('usuarios', 'xp_total');
    }
    // Remover tabela niveis
    await queryInterface.dropTable('niveis');
  },
};
