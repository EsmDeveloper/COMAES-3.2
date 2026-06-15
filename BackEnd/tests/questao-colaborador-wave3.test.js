/**
 * questao-colaborador-wave3.test.js
 * Unit tests for Wave 3 Questao Colaborador operations
 * Tests for tasks 4.1, 4.2, 4.3, 4.4
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import Questao from '../models/Questao.js';
import Usuario from '../models/User.js';
import sequelize from '../config/db.js';

describe('Wave 3: QuestaoController Colaborador Operations', () => {
  let colaborador;
  let admin;
  let estudante;
  let tokenColaborador;
  let tokenAdmin;
  let tokenEstudante;
  let questaoId;

  beforeAll(async () => {
    // Setup database
    await sequelize.sync({ force: false });
  });

  afterAll(async () => {
    // Cleanup
    await sequelize.close();
  });

  beforeEach(async () => {
    // Create test users
    colaborador = await Usuario.create({
      nome: 'Professor Teste',
      telefone: '123456789',
      email: 'professor@teste.com',
      nascimento: '1990-01-01',
      sexo: 'Masculino',
      password: 'SenhaForte123!',
      role: 'colaborador',
      disciplina_colaborador: 'matematica'
    });

    estudante = await Usuario.create({
      nome: 'Estudante Teste',
      telefone: '987654321',
      email: 'estudante@teste.com',
      nascimento: '2005-01-01',
      sexo: 'Feminino',
      password: 'SenhaForte123!',
      role: 'estudante'
    });

    admin = await Usuario.create({
      nome: 'Admin Teste',
      telefone: '555555555',
      email: 'admin@teste.com',
      nascimento: '1980-01-01',
      sexo: 'Masculino',
      password: 'SenhaForte123!',
      role: 'admin',
      isAdmin: true
    });

    // Login to get tokens
    const loginColaborador = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'professor@teste.com',
        password: 'SenhaForte123!'
      });
    tokenColaborador = loginColaborador.body.data.token;

    const loginEstudante = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'estudante@teste.com',
        password: 'SenhaForte123!'
      });
    tokenEstudante = loginEstudante.body.data.token;

    const loginAdmin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@teste.com',
        password: 'SenhaForte123!'
      });
    tokenAdmin = loginAdmin.body.data.token;
  });

  describe('Task 4.1: createQuestao', () => {
    it('should create a question as collaborator', async () => {
      const response = await request(app)
        .post('/api/questoes/colaborador/criar')
        .set('Authorization', `Bearer ${tokenColaborador}`)
        .send({
          titulo: 'Calcule o valor de x',
          descricao: 'Se 2x + 5 = 15, qual é o valor de x?',
          disciplina: 'matematica',
          tipo: 'multipla_escolha',
          dificuldade: 'facil',
          opcoes: ['5', '7', '10', '12'],
          resposta_correta: '5',
          explicacao: '2x + 5 = 15 → 2x = 10 → x = 5',
          pontos: 10
        });

      expect(response.status).toBe(201);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.dados.status_aprovacao).toBe('pendente');
      expect(response.body.dados.autor_id).toBe(colaborador.id);
      questaoId = response.body.dados.id;
    });

    it('should reject question with wrong discipline (Requisito 2.2)', async () => {
      const response = await request(app)
        .post('/api/questoes/colaborador/criar')
        .set('Authorization', `Bearer ${tokenColaborador}`)
        .send({
          titulo: 'Wrong Discipline Question',
          descricao: 'This is in English',
          disciplina: 'ingles',  // Wrong discipline
          tipo: 'multipla_escolha',
          dificuldade: 'facil',
          opcoes: ['A', 'B', 'C', 'D'],
          resposta_correta: 'A',
          pontos: 10
        });

      expect(response.status).toBe(403);
      expect(response.body.mensagem).toContain('sua disciplina');
    });

    it('should reject non-collaborator from creating questions', async () => {
      const response = await request(app)
        .post('/api/questoes/colaborador/criar')
        .set('Authorization', `Bearer ${tokenEstudante}`)
        .send({
          titulo: 'Test Question',
          descricao: 'Test',
          disciplina: 'matematica',
          tipo: 'texto',
          dificuldade: 'facil',
          resposta_correta: 'test'
        });

      expect(response.status).toBe(403);
      expect(response.body.mensagem).toContain('colaboradores');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/questoes/colaborador/criar')
        .set('Authorization', `Bearer ${tokenColaborador}`)
        .send({
          titulo: 'Incomplete Question'
          // Missing other required fields
        });

      expect(response.status).toBe(422);
      expect(response.body.sucesso).toBe(false);
    });
  });

  describe('Task 4.2: getMinhasQuestoes', () => {
    beforeEach(async () => {
      // Create some questions for collaborador
      for (let i = 0; i < 3; i++) {
        await Questao.create({
          titulo: `Questão ${i}`,
          descricao: `Descrição ${i}`,
          disciplina: 'matematica',
          tipo: 'multipla_escolha',
          dificuldade: i === 0 ? 'facil' : i === 1 ? 'medio' : 'dificil',
          opcoes: ['A', 'B', 'C'],
          resposta_correta: 'A',
          pontos: 10,
          autor_id: colaborador.id,
          status_aprovacao: i === 0 ? 'pendente' : i === 1 ? 'aprovada' : 'rejeitada'
        });
      }
    });

    it('should list collaborator own questions (Requisito 3.1, 3.2)', async () => {
      const response = await request(app)
        .get('/api/questoes/colaborador/minhas')
        .set('Authorization', `Bearer ${tokenColaborador}`);

      expect(response.status).toBe(200);
      expect(response.body.dados.questoes.length).toBeGreaterThan(0);
      response.body.dados.questoes.forEach(q => {
        expect(q.autor_id).toBe(colaborador.id);
        expect(q.disciplina).toBe('matematica');
      });
    });

    it('should filter by difficulty (Requisito 3.4)', async () => {
      const response = await request(app)
        .get('/api/questoes/colaborador/minhas?dificuldade=facil')
        .set('Authorization', `Bearer ${tokenColaborador}`);

      expect(response.status).toBe(200);
      response.body.dados.questoes.forEach(q => {
        expect(q.dificuldade).toBe('facil');
      });
    });

    it('should filter by status_aprovacao (Requisito 3.4)', async () => {
      const response = await request(app)
        .get('/api/questoes/colaborador/minhas?status_aprovacao=pendente')
        .set('Authorization', `Bearer ${tokenColaborador}`);

      expect(response.status).toBe(200);
      response.body.dados.questoes.forEach(q => {
        expect(q.status_aprovacao).toBe('pendente');
      });
    });

    it('should reject wrong discipline filter (Requisito 3.3)', async () => {
      const response = await request(app)
        .get('/api/questoes/colaborador/minhas?disciplina=ingles')
        .set('Authorization', `Bearer ${tokenColaborador}`);

      expect(response.status).toBe(403);
      expect(response.body.mensagem).toContain('sua disciplina');
    });

    it('should return empty array if no questions (Requisito 3.5)', async () => {
      // Create another collaborator with no questions
      const outroColaborador = await Usuario.create({
        nome: 'Outro Professor',
        telefone: '111111111',
        email: 'outro@teste.com',
        nascimento: '1990-01-01',
        sexo: 'Masculino',
        password: 'SenhaForte123!',
        role: 'colaborador',
        disciplina_colaborador: 'ingles'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'outro@teste.com',
          password: 'SenhaForte123!'
        });

      const response = await request(app)
        .get('/api/questoes/colaborador/minhas')
        .set('Authorization', `Bearer ${loginResponse.body.data.token}`);

      expect(response.status).toBe(200);
      expect(response.body.dados.questoes).toEqual([]);
      expect(response.body.dados.total).toBe(0);
    });
  });

  describe('Task 4.3: updateQuestao', () => {
    beforeEach(async () => {
      const questao = await Questao.create({
        titulo: 'Original Question',
        descricao: 'Original description',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'facil',
        opcoes: ['A', 'B', 'C'],
        resposta_correta: 'A',
        pontos: 10,
        autor_id: colaborador.id,
        status_aprovacao: 'pendente'
      });
      questaoId = questao.id;
    });

    it('should update own question (Requisito 4.4)', async () => {
      const response = await request(app)
        .put(`/api/questoes/colaborador/${questaoId}`)
        .set('Authorization', `Bearer ${tokenColaborador}`)
        .send({
          titulo: 'Updated Question',
          resposta_correta: 'B'
        });

      expect(response.status).toBe(200);
      expect(response.body.dados.titulo).toBe('Updated Question');
      expect(response.body.dados.resposta_correta).toBe('B');
    });

    it('should reset approved question to pending when edited (Requisito 4.3)', async () => {
      // First approve the question
      const questao = await Questao.findByPk(questaoId);
      questao.status_aprovacao = 'aprovada';
      questao.revisado_por = admin.id;
      questao.revisado_em = new Date();
      await questao.save();

      const response = await request(app)
        .put(`/api/questoes/colaborador/${questaoId}`)
        .set('Authorization', `Bearer ${tokenColaborador}`)
        .send({
          titulo: 'Modified Approved Question'
        });

      expect(response.status).toBe(200);
      expect(response.body.dados.status_aprovacao).toBe('pendente');
      expect(response.body.dados.revisado_por).toBeNull();
      expect(response.body.dados.revisado_em).toBeNull();
    });

    it('should prevent updating others questions (Requisito 4.1, 4.2)', async () => {
      const response = await request(app)
        .put(`/api/questoes/colaborador/${questaoId}`)
        .set('Authorization', `Bearer ${tokenEstudante}`)
        .send({
          titulo: 'Hacked Question'
        });

      expect(response.status).toBe(403);
    });

    it('should prevent non-collaborators from updating (Requisito 4.1)', async () => {
      const response = await request(app)
        .put(`/api/questoes/colaborador/${questaoId}`)
        .set('Authorization', `Bearer ${tokenEstudante}`)
        .send({
          titulo: 'Test'
        });

      expect(response.status).toBe(403);
    });

    it('should not allow changing discipline', async () => {
      const response = await request(app)
        .put(`/api/questoes/colaborador/${questaoId}`)
        .set('Authorization', `Bearer ${tokenColaborador}`)
        .send({
          disciplina: 'ingles'  // Try to change
        });

      expect(response.status).toBe(200);
      const updated = await Questao.findByPk(questaoId);
      expect(updated.disciplina).toBe('matematica'); // Should remain unchanged
    });
  });

  describe('Task 4.4: deleteQuestao', () => {
    beforeEach(async () => {
      const questao = await Questao.create({
        titulo: 'Question to Delete',
        descricao: 'This will be deleted',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'facil',
        opcoes: ['A', 'B', 'C'],
        resposta_correta: 'A',
        pontos: 10,
        autor_id: colaborador.id,
        status_aprovacao: 'pendente'
      });
      questaoId = questao.id;
    });

    it('should delete own question (Requisito 5.3)', async () => {
      const response = await request(app)
        .delete(`/api/questoes/colaborador/${questaoId}`)
        .set('Authorization', `Bearer ${tokenColaborador}`);

      expect(response.status).toBe(200);
      expect(response.body.sucesso).toBe(true);

      const deleted = await Questao.findByPk(questaoId);
      expect(deleted).toBeNull();
    });

    it('should prevent deleting others questions (Requisito 5.1, 5.2)', async () => {
      const response = await request(app)
        .delete(`/api/questoes/colaborador/${questaoId}`)
        .set('Authorization', `Bearer ${tokenEstudante}`);

      expect(response.status).toBe(403);
      expect(response.body.mensagem).toContain('negado');

      // Verify question still exists
      const questao = await Questao.findByPk(questaoId);
      expect(questao).not.toBeNull();
    });

    it('should prevent non-collaborators from deleting', async () => {
      const response = await request(app)
        .delete(`/api/questoes/colaborador/${questaoId}`)
        .set('Authorization', `Bearer ${tokenEstudante}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent question', async () => {
      const response = await request(app)
        .delete('/api/questoes/colaborador/99999')
        .set('Authorization', `Bearer ${tokenColaborador}`);

      expect(response.status).toBe(404);
    });
  });
});
