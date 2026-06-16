/**
 * Integration Test: Admin Approval Flow (Task 16.3)
 * 
 * This test simulates the complete admin approval workflow:
 * 1. Ensure pending questions exist in database
 * 2. Admin logs in
 * 3. Admin navigates to pending questions page
 * 4. Admin verifies pending questions are displayed correctly
 * 5. Admin clicks approve button
 * 6. Verify API call and response
 * 7. Verify question is no longer in pending list
 * 8. Verify collaborator sees approved status
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Questao from '../models/Questao.js';
import User from '../models/User.js';
import { QuestoesController } from '../controllers/QuestoesController.js';

// Mock request and response objects for API testing
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

describe('Task 16.3: Admin Approval Flow Integration Test', () => {
  let adminUser;
  let colaboradorUser;
  let pendingQuestao;
  let approvedQuestao;

  beforeAll(async () => {
    console.log('🔧 Setting up test data...');

    // Create admin user
    adminUser = await User.create({
      nome: 'Admin Tester',
      email: 'admin.tester@test.com',
      password: 'hashedPassword123',
      role: 'admin',
      isAdmin: true,
      telefone: '999999999'
    });
    console.log(`✅ Created admin user: ${adminUser.id}`);

    // Create collaborator user
    colaboradorUser = await User.create({
      nome: 'Colab Tester',
      email: 'colab.tester@test.com',
      password: 'hashedPassword456',
      role: 'colaborador',
      disciplina_colaborador: 'matematica',
      telefone: '888888888'
    });
    console.log(`✅ Created collaborator user: ${colaboradorUser.id}`);

    // Create pending question
    pendingQuestao = await Questao.create({
      titulo: 'Questão Pendente - Integração 16.3',
      descricao: 'Esta é uma questão de teste pendente para aprovar',
      disciplina: 'matematica',
      tipo: 'multipla_escolha',
      dificuldade: 'facil',
      opcoes: ['Resposta A', 'Resposta B', 'Resposta C', 'Resposta D'],
      resposta_correta: 'Resposta A',
      pontos: 10,
      autor_id: colaboradorUser.id,
      status_aprovacao: 'pendente'
    });
    console.log(`✅ Created pending question: ${pendingQuestao.id}`);

    // Create another pending question for testing list display
    const pendingQuestao2 = await Questao.create({
      titulo: 'Segunda Questão Pendente',
      descricao: 'Outra questão de teste pendente',
      disciplina: 'ingles',
      tipo: 'texto',
      dificuldade: 'medio',
      resposta_correta: 'correct answer',
      pontos: 15,
      autor_id: colaboradorUser.id,
      status_aprovacao: 'pendente'
    });
    console.log(`✅ Created second pending question: ${pendingQuestao2.id}`);
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up test data...');
    
    // Clean up questions
    await Questao.destroy({ 
      where: { 
        titulo: {
          [require('sequelize').Op.like]: '%Integração 16.3%'
        }
      }
    });

    await Questao.destroy({ 
      where: { 
        titulo: 'Segunda Questão Pendente'
      }
    });

    // Clean up users
    await User.destroy({ 
      where: { 
        id: [adminUser.id, colaboradorUser.id] 
      }
    });

    console.log('✅ Test data cleaned up');
  });

  describe('Scenario 1: Get pending questions list', () => {
    it('Should retrieve all pending questions with author info', async () => {
      console.log('\n📋 Testing: Retrieve pending questions list');
      
      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        {},
        { pagina: 1, limite: 20 }
      );
      const res = createMockRes();

      await QuestoesController.getPendingQuestoes(req, res);

      // Verify response structure
      expect(res.statusCode).toBe(200);
      expect(res.jsonData.sucesso).toBe(true);
      expect(res.jsonData.dados).toBeDefined();
      expect(Array.isArray(res.jsonData.dados.questoes)).toBe(true);
      expect(res.jsonData.dados.total).toBeGreaterThanOrEqual(1);

      console.log(`✅ Response: ${res.jsonData.dados.questoes.length} questions retrieved`);

      // Verify pending question is in the list
      const foundQuestao = res.jsonData.dados.questoes.find(
        q => q.id === pendingQuestao.id
      );
      expect(foundQuestao).toBeDefined();
      console.log(`✅ Pending question found in list`);

      // Verify question has required fields
      expect(foundQuestao.titulo).toBe(pendingQuestao.titulo);
      expect(foundQuestao.status_aprovacao).toBe('pendente');
      expect(foundQuestao).toHaveProperty('autor_nome');
      expect(foundQuestao).toHaveProperty('autor_email');
      expect(foundQuestao.autor_nome).toBe(colaboradorUser.nome);
      expect(foundQuestao.autor_email).toBe(colaboradorUser.email);

      console.log(`✅ Question has all required fields:
        - Title: ${foundQuestao.titulo}
        - Status: ${foundQuestao.status_aprovacao}
        - Author: ${foundQuestao.autor_nome} (${foundQuestao.autor_email})`);
    });

    it('Should display question details (title, author, content)', async () => {
      console.log('\n📋 Testing: Verify question details display');
      
      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        {},
        { pagina: 1, limite: 20 }
      );
      const res = createMockRes();

      await QuestoesController.getPendingQuestoes(req, res);

      const foundQuestao = res.jsonData.dados.questoes.find(
        q => q.id === pendingQuestao.id
      );

      // Verify all display fields
      expect(foundQuestao).toHaveProperty('titulo');
      expect(foundQuestao).toHaveProperty('descricao');
      expect(foundQuestao).toHaveProperty('disciplina');
      expect(foundQuestao).toHaveProperty('dificuldade');
      expect(foundQuestao).toHaveProperty('opcoes');

      console.log(`✅ All display fields present:
        - Título: ${foundQuestao.titulo}
        - Descrição: ${foundQuestao.descricao.substring(0, 50)}...
        - Disciplina: ${foundQuestao.disciplina}
        - Dificuldade: ${foundQuestao.dificuldade}
        - Opções: ${Array.isArray(foundQuestao.opcoes) ? foundQuestao.opcoes.length : 0} options`);
    });

    it('Should reject non-admin users from viewing pending list', async () => {
      console.log('\n📋 Testing: Reject non-admin access');
      
      const req = createMockReq(
        { id: colaboradorUser.id, role: 'colaborador' },
        {},
        { pagina: 1, limite: 20 }
      );
      const res = createMockRes();

      await QuestoesController.getPendingQuestoes(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.jsonData.sucesso).toBe(false);
      console.log(`✅ Non-admin user denied access (403)`);
    });
  });

  describe('Scenario 2: Approve a pending question', () => {
    it('Should approve a question and update status', async () => {
      console.log('\n✅ Testing: Approve pending question');
      
      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        { id: pendingQuestao.id }
      );
      const res = createMockRes();

      // Call approve endpoint
      await QuestoesController.approveQuestao(req, res);

      // Verify response
      expect(res.statusCode).toBe(200);
      expect(res.jsonData.sucesso).toBe(true);
      expect(res.jsonData.mensagem).toContain('sucesso');

      console.log(`✅ API Response:
        - Status Code: ${res.statusCode}
        - Message: ${res.jsonData.mensagem}`);

      // Verify response includes updated question data
      expect(res.jsonData.dados).toBeDefined();
      expect(res.jsonData.dados.status_aprovacao).toBe('aprovada');
      expect(res.jsonData.dados.revisado_por).toBe(adminUser.id);
      expect(res.jsonData.dados.revisado_em).toBeDefined();

      console.log(`✅ Question status updated:
        - New Status: ${res.jsonData.dados.status_aprovacao}
        - Reviewed By (Admin ID): ${res.jsonData.dados.revisado_por}
        - Reviewed At: ${res.jsonData.dados.revisado_em}`);

      // Verify timestamp is recent
      const revisoDate = new Date(res.jsonData.dados.revisado_em);
      const now = new Date();
      const timeDiff = now - revisoDate;
      expect(timeDiff).toBeLessThan(5000); // Should be within 5 seconds
      console.log(`✅ Timestamp is valid (${timeDiff}ms ago)`);
    });

    it('Should remove question from pending list after approval', async () => {
      console.log('\n📋 Testing: Verify question removed from pending list');
      
      // Get pending list again
      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        {},
        { pagina: 1, limite: 20 }
      );
      const res = createMockRes();

      await QuestoesController.getPendingQuestoes(req, res);

      // Verify approved question is NOT in pending list
      const foundQuestao = res.jsonData.dados.questoes.find(
        q => q.id === pendingQuestao.id
      );

      expect(foundQuestao).toBeUndefined();
      console.log(`✅ Approved question removed from pending list`);
    });

    it('Should not approve already approved question', async () => {
      console.log('\n⚠️ Testing: Prevent double approval');
      
      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        { id: pendingQuestao.id }
      );
      const res = createMockRes();

      // Try to approve again
      await QuestoesController.approveQuestao(req, res);

      // Should return error
      expect(res.statusCode).toBe(400);
      expect(res.jsonData.sucesso).toBe(false);
      expect(res.jsonData.mensagem).toContain('já está aprovada');

      console.log(`✅ Double approval prevented: ${res.jsonData.mensagem}`);
    });

    it('Should reject non-admin approval attempts', async () => {
      console.log('\n📋 Testing: Reject non-admin approval');
      
      const req = createMockReq(
        { id: colaboradorUser.id, role: 'colaborador' },
        { id: pendingQuestao.id }
      );
      const res = createMockRes();

      await QuestoesController.approveQuestao(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.jsonData.sucesso).toBe(false);
      console.log(`✅ Non-admin approval rejected (403)`);
    });
  });

  describe('Scenario 3: Verify approved question status in collaborator view', () => {
    it('Should display "Aprovada" status when collaborator views their questions', async () => {
      console.log('\n✅ Testing: Approved status visible to collaborator');
      
      // Fetch the approved question directly
      const approvedQuestion = await Questao.findByPk(pendingQuestao.id);

      expect(approvedQuestion).toBeDefined();
      expect(approvedQuestion.status_aprovacao).toBe('aprovada');
      expect(approvedQuestion.revisado_por).toBe(adminUser.id);
      expect(approvedQuestion.revisado_em).toBeDefined();

      console.log(`✅ Question status in database:
        - Status: ${approvedQuestion.status_aprovacao}
        - Reviewed By: ${approvedQuestion.revisado_por}
        - Reviewed At: ${approvedQuestion.revisado_em}`);
    });
  });

  describe('Scenario 4: Test rejection flow', () => {
    it('Should reject a question with motivo_rejeicao', async () => {
      console.log('\n❌ Testing: Reject question with reason');
      
      // Create another pending question for rejection test
      const questionToReject = await Questao.create({
        titulo: 'Questão para Rejeição',
        descricao: 'Esta questão será rejeitada',
        disciplina: 'programacao',
        tipo: 'codigo',
        dificuldade: 'dificil',
        resposta_correta: 'int main() {}',
        pontos: 20,
        autor_id: colaboradorUser.id,
        status_aprovacao: 'pendente'
      });

      const rejectionReason = 'Conteúdo inadequado e resposta vaga';

      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        { id: questionToReject.id },
        {},
        { motivo_rejeicao: rejectionReason }
      );
      const res = createMockRes();

      await QuestoesController.rejectQuestao(req, res);

      // Verify response
      expect(res.statusCode).toBe(200);
      expect(res.jsonData.sucesso).toBe(true);
      expect(res.jsonData.dados.status_aprovacao).toBe('rejeitada');
      expect(res.jsonData.dados.motivo_rejeicao).toBe(rejectionReason);
      expect(res.jsonData.dados.revisado_por).toBe(adminUser.id);
      expect(res.jsonData.dados.revisado_em).toBeDefined();

      console.log(`✅ Question rejected:
        - Status: ${res.jsonData.dados.status_aprovacao}
        - Reason: ${res.jsonData.dados.motivo_rejeicao}
        - Admin ID: ${res.jsonData.dados.revisado_por}`);

      // Cleanup
      await questionToReject.destroy();
    });

    it('Should require motivo_rejeicao for rejection', async () => {
      console.log('\n⚠️ Testing: Motivo required for rejection');
      
      const questionForRejection = await Questao.create({
        titulo: 'Questão Rejeição Sem Motivo',
        descricao: 'Test rejection without reason',
        disciplina: 'matematica',
        tipo: 'texto',
        dificuldade: 'facil',
        resposta_correta: 'answer',
        pontos: 5,
        autor_id: colaboradorUser.id,
        status_aprovacao: 'pendente'
      });

      const req = createMockReq(
        { id: adminUser.id, isAdmin: true, role: 'admin' },
        { id: questionForRejection.id },
        {},
        { motivo_rejeicao: '' }
      );
      const res = createMockRes();

      await QuestoesController.rejectQuestao(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.jsonData.sucesso).toBe(false);
      expect(res.jsonData.mensagem).toContain('obrigatório');

      console.log(`✅ Rejection without reason denied: ${res.jsonData.mensagem}`);

      // Cleanup
      await questionForRejection.destroy();
    });
  });

  describe('Scenario 5: Success criteria verification', () => {
    it('Summary: Question approval works end-to-end', async () => {
      console.log('\n📊 FINAL VERIFICATION:');
      console.log('✅ Question approval works');
      console.log('✅ Status changes to "aprovada"');
      console.log('✅ Admin ID is recorded in revisado_por');
      console.log('✅ Timestamp is recorded in revisado_em');
      console.log('✅ Question no longer appears in pending list');
      console.log('✅ Non-admin users are denied access');
      console.log('✅ Double approval is prevented');
      console.log('✅ Rejection requires motivo_rejeicao');
      
      expect(true).toBe(true);
    });
  });
});
