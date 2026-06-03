'use strict';

/**
 * Migration: Sistema de Missões COMAES
 *
 * Tabela `missoes`         — catálogo estático de missões (diárias e semanais)
 * Tabela `missoes_usuario` — progresso individual por ciclo
 */

module.exports = {
  async up(queryInterface, Sequelize) {

    // ── 1. Tabela missoes ─────────────────────────────────────────────
    await queryInterface.createTable('missoes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(120),
        allowNull: false,
        comment: 'Nome curto exibido no widget',
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição completa do objetivo',
      },
      ciclo: {
        type: Sequelize.ENUM('daily', 'weekly'),
        allowNull: false,
        defaultValue: 'daily',
        comment: 'Ciclo de renovação: diário ou semanal',
      },
      tipo_objetivo: {
        type: Sequelize.ENUM(
          'questoes_corretas',       // X questões respondidas corretamente
          'acerto_percentual',       // atingir X% de acertos num teste
          'questoes_dificeis',       // X questões de dificuldade "dificil" corretas
          'testes_completos',        // completar X testes de conhecimento
          'streak_dias',             // manter streak de X dias
          'disciplina_especifica',   // completar X testes numa disciplina
          'acertos_seguidos'         // X acertos consecutivos numa sessão
        ),
        allowNull: false,
      },
      objetivo_valor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Quantidade necessária para completar a missão',
      },
      disciplina: {
        type: Sequelize.ENUM('matematica', 'ingles', 'programacao'),
        allowNull: true,
        comment: 'Filtra a missão para uma disciplina específica (null = qualquer)',
      },
      dificuldade: {
        type: Sequelize.ENUM('facil', 'medio', 'dificil'),
        allowNull: true,
        comment: 'Filtra questões por dificuldade (null = qualquer)',
      },
      recompensa_xp: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 20,
        comment: 'XP concedido ao completar',
      },
      icone: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: 'Emoji representativo',
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Missão ativa no sistema',
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // ── 2. Tabela missoes_usuario ─────────────────────────────────────
    await queryInterface.createTable('missoes_usuario', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      missao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'missoes', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      ciclo_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Data UTC de início do ciclo (YYYY-MM-DD)',
      },
      progresso_atual: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Progresso acumulado no ciclo actual',
      },
      concluida: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      concluida_em: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      xp_concedido: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Garante que o XP só é concedido uma vez',
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Índices
    await queryInterface.addIndex('missoes_usuario', ['usuario_id', 'missao_id', 'ciclo_inicio'], {
      name: 'idx_missao_usuario_ciclo',
      unique: true,
    });
    await queryInterface.addIndex('missoes_usuario', ['usuario_id', 'ciclo_inicio'], {
      name: 'idx_missao_usuario_periodo',
    });

    // ── 3. Popular catálogo de missões ────────────────────────────────
    await queryInterface.bulkInsert('missoes', [
      // ── DIÁRIAS ──────────────────────────────────────────────────────
      {
        nome: 'Primeiros Passos',
        descricao: 'Responde corretamente a 5 questões no Teste de Conhecimento.',
        ciclo: 'daily', tipo_objetivo: 'questoes_corretas', objetivo_valor: 5,
        disciplina: null, dificuldade: null, recompensa_xp: 15, icone: '🎯', ativo: true,
        criado_em: new Date(),
      },
      {
        nome: 'Matemático do Dia',
        descricao: 'Acerta 5 questões de Matemática.',
        ciclo: 'daily', tipo_objetivo: 'questoes_corretas', objetivo_valor: 5,
        disciplina: 'matematica', dificuldade: null, recompensa_xp: 20, icone: '🔢', ativo: true,
        criado_em: new Date(),
      },
      {
        nome: 'Coder do Dia',
        descricao: 'Acerta 5 questões de Programação.',
        ciclo: 'daily', tipo_objetivo: 'questoes_corretas', objetivo_valor: 5,
        disciplina: 'programacao', dificuldade: null, recompensa_xp: 20, icone: '💻', ativo: true,
        criado_em: new Date(),
      },
      {
        nome: 'Inglês Fluente',
        descricao: 'Acerta 5 questões de Inglês.',
        ciclo: 'daily', tipo_objetivo: 'questoes_corretas', objetivo_valor: 5,
        disciplina: 'ingles', dificuldade: null, recompensa_xp: 20, icone: '🇬🇧', ativo: true,
        criado_em: new Date(),
      },
      {
        nome: 'Teste Completo',
        descricao: 'Completa 1 teste de conhecimento (qualquer área).',
        ciclo: 'daily', tipo_objetivo: 'testes_completos', objetivo_valor: 1,
        disciplina: null, dificuldade: null, recompensa_xp: 25, icone: '✅', ativo: true,
        criado_em: new Date(),
      },
      {
        nome: 'Desafio Difícil',
        descricao: 'Acerta 3 questões de dificuldade difícil.',
        ciclo: 'daily', tipo_objetivo: 'questoes_dificeis', objetivo_valor: 3,
        disciplina: null, dificuldade: 'dificil', recompensa_xp: 30, icone: '🔥', ativo: true,
        criado_em: new Date(),
      },
      {
        nome: 'Acertos em Sequência',
        descricao: 'Acerta 5 questões seguidas numa sessão sem errar.',
        ciclo: 'daily', tipo_objetivo: 'acertos_seguidos', objetivo_valor: 5,
        disciplina: null, dificuldade: null, recompensa_xp: 35, icone: '⚡', ativo: true,
        criado_em: new Date(),
      },
      {
        nome: 'Excelência Diária',
        descricao: 'Completa um teste com 80% ou mais de acertos.',
        ciclo: 'daily', tipo_objetivo: 'acerto_percentual', objetivo_valor: 80,
        disciplina: null, dificuldade: null, recompensa_xp: 40, icone: '🌟', ativo: true,
        criado_em: new Date(),
      },
      // ── SEMANAIS ─────────────────────────────────────────────────────
      {
        nome: 'Maratonista',
        descricao: 'Completa 10 testes de conhecimento esta semana.',
        ciclo: 'weekly', tipo_objetivo: 'testes_completos', objetivo_valor: 10,
        disciplina: null, dificuldade: null, recompensa_xp: 100, icone: '🏃', ativo: true,
        criado_em: new Date(),
      },
      {
        nome: 'Mestre das Três Áreas',
        descricao: 'Acerta 15 questões em cada uma das 3 disciplinas esta semana.',
        ciclo: 'weekly', tipo_objetivo: 'questoes_corretas', objetivo_valor: 45,
        disciplina: null, dificuldade: null, recompensa_xp: 150, icone: '🦉', ativo: true,
        criado_em: new Date(),
      },
      {
        nome: 'Streak Sólida',
        descricao: 'Mantém uma sequência de aprendizagem de 5 dias esta semana.',
        ciclo: 'weekly', tipo_objetivo: 'streak_dias', objetivo_valor: 5,
        disciplina: null, dificuldade: null, recompensa_xp: 80, icone: '🔥', ativo: true,
        criado_em: new Date(),
      },
      {
        nome: 'Elite do Difícil',
        descricao: 'Acerta 15 questões difíceis ao longo da semana.',
        ciclo: 'weekly', tipo_objetivo: 'questoes_dificeis', objetivo_valor: 15,
        disciplina: null, dificuldade: 'dificil', recompensa_xp: 120, icone: '💪', ativo: true,
        criado_em: new Date(),
      },
      {
        nome: 'Especialista em Programação',
        descricao: 'Completa 5 testes de Programação com 70% ou mais de acertos.',
        ciclo: 'weekly', tipo_objetivo: 'testes_completos', objetivo_valor: 5,
        disciplina: 'programacao', dificuldade: null, recompensa_xp: 130, icone: '🖥️', ativo: true,
        criado_em: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('missoes_usuario');
    await queryInterface.dropTable('missoes');
  },
};
