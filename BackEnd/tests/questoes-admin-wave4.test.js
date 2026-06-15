/**
 * Wave 4 Tests - Admin Questao Operations
 * Tests for getPendingQuestoes, approveQuestao, and rejectQuestao
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Questao from '../models/Questao.js';
import User from '../models/User.js';
import { QuestoesController } from '../controllers/QuestoesController.js';

// Mock request and response objects
const createMockReq = (user = null, params = {}, query = {}, body = {}) => ({
  user,
  params,
  query,
  body
});

const createMockRes = () => {
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.jsonData = data;
      return this;
    }
  };
  return res;
};

describe('Wave 4 - Admin Questao Operations', () => {
  let adminUser;
  let colaboradorUser;
  let testQuestao;

  beforeAll(async () => {
    // Create test users
    adminUser = await User.create({
      nome: 'Admin Test',
      email: 'admin@test.com',
      password: 'hash',
      role: 'admin',
      isAdmin: true,
      telefone: '999999999'
    });

    colaboradorUser = await User.create({
      nome: 'Colaborador Test',
      email: 'colab@test.com',
      password: 'hash',
      role: 'colaborador',
      disciplina_colaborador: 'matematica',
      telefone: '888888888'
    });

    // Create pending questao
    testQuestao = await Questao.create({
      titulo: 'Teste Questão Pendente',
      descricao: 'Esta é uma questão de teste pendente',
      disciplina: 'matematica',
      tipo: 'multipla_escolha',
      dificuldade: 'facil',
      opcoes: ['A', 'B', 'C', 'D'],
      resposta_correta: 'A',
      autor_id: colaboradorUser.id,
      status_aprovacao: 'pendente'
    });
  });

  afterAll(async () => {
    await User.destroy({ where: { id: [adminUser.id, colaboradorUser.id] } });
    await Questao.destroy({ where: { id: testQuestao.id } });
  });

  describe('5.1 getPendingQuestoes', () => {
    it('should list all pending questions (admin access)', async () => {
      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        {},
        { pagina: 1, limite: 20 }
      );
      const res = createMockRes();

      await QuestoesController.getPendingQuestoes(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.jsonData.sucesso).toBe(true);
      expect(Array.isArray(res.jsonData.dados.questoes)).toBe(true);
      expect(res.jsonData.dados.total).toBeGreaterThanOrEqual(1);
    });

    it('should reject non-admin users', async () => {
      const req = createMockReq(
        { id: colaboradorUser.id, role: 'colaborador' },
        {},
        { pagina: 1, limite: 20 }
      );
      const res = createMockRes();

      await QuestoesController.getPendingQuestoes(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.jsonData.sucesso).toBe(false);
    });

    it('should include author info (nome, email)', async () => {
      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        {},
        { pagina: 1, limite: 20 }
      );
      const res = createMockRes();

      await QuestoesController.getPendingQuestoes(req, res);

      expect(res.statusCode).toBe(200);
      const questoes = res.jsonData.dados.questoes;
      if (questoes.length > 0) {
        expect(questoes[0]).toHaveProperty('autor_nome');
        expect(questoes[0]).toHaveProperty('autor_email');
      }
    });

    it('should return questions ordered by createdAt DESC', async () => {
      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        {},
        { pagina: 1, limite: 20 }
      );
      const res = createMockRes();

      await QuestoesController.getPendingQuestoes(req, res);

      expect(res.statusCode).toBe(200);
      const questoes = res.jsonData.dados.questoes;
      if (questoes.length > 1) {
        const date1 = new Date(questoes[0].created_at || questoes[0].createdAt);
        const date2 = new Date(questoes[1].created_at || questoes[1].createdAt);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    });
  });

  describe('5.2 approveQuestao', () => {
    it('should approve a pending question (admin)', async () => {
      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        { id: testQuestao.id }
      );
      const res = createMockRes();

      await QuestoesController.approveQuestao(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.jsonData.sucesso).toBe(true);
      expect(res.jsonData.dados.status_aprovacao).toBe('aprovada');
      expect(res.jsonData.dados.revisado_por).toBe(adminUser.id);
      expect(res.jsonData.dados.revisado_em).toBeDefined();
    });

    it('should not approve non-existent question', async () => {
      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        { id: 99999 }
      );
      const res = createMockRes();

      await QuestoesController.approveQuestao(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.jsonData.sucesso).toBe(false);
    });

    it('should reject non-admin users', async () => {
      const req = createMockReq(
        { id: colaboradorUser.id, role: 'colaborador' },
        { id: testQuestao.id }
      );
      const res = createMockRes();

      await QuestoesController.approveQuestao(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.jsonData.sucesso).toBe(false);
    });

    it('should not approve already approved question', async () => {
      // First approve
      const req1 = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        { id: testQuestao.id }
      );
      const res1 = createMockRes();
      await QuestoesController.approveQuestao(req1, res1);

      // Try to approve again
      const req2 = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        { id: testQuestao.id }
      );
      const res2 = createMockRes();
      await QuestoesController.approveQuestao(req2, res2);

      expect(res2.statusCode).toBe(400);
      expect(res2.jsonData.sucesso).toBe(false);
      expect(res2.jsonData.mensagem).toContain('já está aprovada');
    });
  });

  describe('5.3 rejectQuestao', () => {
    it('should reject a pending question with motivo', async () => {
      // Create another pending question
      const testQuestao2 = await Questao.create({
        titulo: 'Teste Rejeição',
        descricao: 'Questão para teste de rejeição',
        disciplina: 'matematica',
        tipo: 'texto',
        dificuldade: 'medio',
        resposta_correta: 'resposta',
        autor_id: colaboradorUser.id,
        status_aprovacao: 'pendente'
      });

      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        { id: testQuestao2.id },
        {},
        { motivo_rejeicao: 'Questão com conteúdo inadequado' }
      );
      const res = createMockRes();

      await QuestoesController.rejectQuestao(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.jsonData.sucesso).toBe(true);
      expect(res.jsonData.dados.status_aprovacao).toBe('rejeitada');
      expect(res.jsonData.dados.motivo_rejeicao).toBe('Questão com conteúdo inadequado');
      expect(res.jsonData.dados.revisado_por).toBe(adminUser.id);
      expect(res.jsonData.dados.revisado_em).toBeDefined();

      // Cleanup
      await testQuestao2.destroy();
    });

    it('should require motivo_rejeicao', async () => {
      const testQuestao3 = await Questao.create({
        titulo: 'Teste Rejeição Sem Motivo',
        descricao: 'Questão para teste de rejeição sem motivo',
        disciplina: 'programacao',
        tipo: 'codigo',
        dificuldade: 'dificil',
        resposta_correta: 'código',
        autor_id: colaboradorUser.id,
        status_aprovacao: 'pendente'
      });

      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        { id: testQuestao3.id },
        {},
        { motivo_rejeicao: '' }
      );
      const res = createMockRes();

      await QuestoesController.rejectQuestao(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.jsonData.sucesso).toBe(false);
      expect(res.jsonData.mensagem).toContain('obrigatório');

      // Cleanup
      await testQuestao3.destroy();
    });

    it('should reject non-admin users', async () => {
      const req = createMockReq(
        { id: colaboradorUser.id, role: 'colaborador' },
        { id: testQuestao.id },
        {},
        { motivo_rejeicao: 'Motivo qualquer' }
      );
      const res = createMockRes();

      await QuestoesController.rejectQuestao(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.jsonData.sucesso).toBe(false);
    });
  });
});
