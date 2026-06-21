#!/usr/bin/env node

/**
 * Test Admin Approval Flow - Task 16.3
 * 
 * This script tests the complete admin approval workflow programmatically:
 * 1. Create test users (admin and collaborator)
 * 2. Create pending questions
 * 3. Test getting pending questions list
 * 4. Test approving a question
 * 5. Verify status change
 * 6. Test rejection flow
 * 
 * Usage: node test_admin_approval_flow.js
 */

import Questao from './models/Questao.js';
import User from './models/User.js';
import { QuestoesController } from './controllers/QuestoesController.js';
import { sequelize } from './config/sequelize.js';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan} ${msg} ${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.bright}📋 ${msg}${colors.reset}`),
  result: (msg) => console.log(`${colors.bright}${colors.green}   ✓ ${msg}${colors.reset}`),
  detail: (msg) => console.log(`   ${msg}`)
};

// Mock request and response
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

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

const recordTest = (name, passed, details = '') => {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    log.success(name);
    if (details) log.detail(details);
  } else {
    results.failed++;
    log.error(name);
    if (details) log.detail(details);
  }
};

// Main test function
async function runTests() {
  log.header('TASK 16.3: Admin Approval Flow Integration Tests');
  
  try {
    // Connect to database
    await sequelize.authenticate();
    log.success('Database connection established');

    // Setup test data
    log.header('1. Setting Up Test Data');
    
    let adminUser, colaboradorUser;
    
    try {
      // Create admin user
      adminUser = await User.create({
        nome: 'Admin Test Flow',
        email: `admin.flow.${Date.now()}@test.com`,
        password: 'hashedPassword123',
        role: 'admin',
        isAdmin: true,
        telefone: '999999999'
      });
      recordTest('Create admin user', !!adminUser, `Admin ID: ${adminUser.id}`);
    } catch (e) {
      recordTest('Create admin user', false, e.message);
      return;
    }

    try {
      // Create collaborator user
      colaboradorUser = await User.create({
        nome: 'Colaborador Flow Test',
        email: `colab.flow.${Date.now()}@test.com`,
        password: 'hashedPassword456',
        role: 'colaborador',
        disciplina_colaborador: 'matematica',
        telefone: '888888888'
      });
      recordTest('Create collaborator user', !!colaboradorUser, `Collaborator ID: ${colaboradorUser.id}`);
    } catch (e) {
      recordTest('Create collaborator user', false, e.message);
      return;
    }

    // Create test questions
    let pendingQ1, pendingQ2, rejectQ;
    
    try {
      pendingQ1 = await Questao.create({
        titulo: 'Question for Approval - Flow Test',
        descricao: 'This question will be approved',
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'facil',
        opcoes: ['Option A', 'Option B', 'Option C', 'Option D'],
        resposta_correta: 'Option A',
        pontos: 10,
        autor_id: colaboradorUser.id,
        status_aprovacao: 'pendente'
      });
      recordTest('Create pending question 1', !!pendingQ1, `Question ID: ${pendingQ1.id}`);
    } catch (e) {
      recordTest('Create pending question 1', false, e.message);
    }

    try {
      pendingQ2 = await Questao.create({
        titulo: 'Another Pending Question',
        descricao: 'For testing list display',
        disciplina: 'ingles',
        tipo: 'texto',
        dificuldade: 'medio',
        resposta_correta: 'correct answer',
        pontos: 15,
        autor_id: colaboradorUser.id,
        status_aprovacao: 'pendente'
      });
      recordTest('Create pending question 2', !!pendingQ2, `Question ID: ${pendingQ2.id}`);
    } catch (e) {
      recordTest('Create pending question 2', false, e.message);
    }

    try {
      rejectQ = await Questao.create({
        titulo: 'Question for Rejection',
        descricao: 'This will be rejected',
        disciplina: 'programacao',
        tipo: 'codigo',
        dificuldade: 'dificil',
        resposta_correta: 'code here',
        pontos: 20,
        autor_id: colaboradorUser.id,
        status_aprovacao: 'pendente'
      });
      recordTest('Create question for rejection', !!rejectQ, `Question ID: ${rejectQ.id}`);
    } catch (e) {
      recordTest('Create question for rejection', false, e.message);
    }

    // Test 1: Get Pending Questions
    log.header('2. Testing: Get Pending Questions');
    
    const reqGetPending = createMockReq(
      { id: adminUser.id, isAdmin: true, role: 'admin' },
      {},
      { pagina: 1, limite: 20 }
    );
    const resGetPending = createMockRes();

    try {
      await QuestoesController.getPendingQuestoes(reqGetPending, resGetPending);
      
      const passed = resGetPending.statusCode === 200 && 
                     resGetPending.jsonData.sucesso === true &&
                     Array.isArray(resGetPending.jsonData.dados.questoes);
      
      recordTest(
        'Retrieve pending questions list',
        passed,
        passed ? `Found ${resGetPending.jsonData.dados.questoes.length} questions` : 'Failed to retrieve'
      );

      if (passed) {
        const foundQ1 = resGetPending.jsonData.dados.questoes.find(q => q.id === pendingQ1.id);
        const hasAuthorInfo = foundQ1 && foundQ1.autor_nome && foundQ1.autor_email;
        recordTest('Questions include author info', hasAuthorInfo);
      }
    } catch (e) {
      recordTest('Retrieve pending questions list', false, e.message);
    }

    // Test 2: Approve Question
    log.header('3. Testing: Approve Question');
    
    const reqApprove = createMockReq(
      { id: adminUser.id, isAdmin: true, role: 'admin' },
      { id: pendingQ1.id }
    );
    const resApprove = createMockRes();

    try {
      await QuestoesController.approveQuestao(reqApprove, resApprove);
      
      const passed = resApprove.statusCode === 200 &&
                     resApprove.jsonData.sucesso === true &&
                     resApprove.jsonData.dados.status_aprovacao === 'aprovada';
      
      recordTest('Approve question', passed);
      
      if (passed) {
        const hasReviewedBy = resApprove.jsonData.dados.revisado_por === adminUser.id;
        recordTest('Admin ID recorded in revisado_por', hasReviewedBy);
        
        const hasTimestamp = !!resApprove.jsonData.dados.revisado_em;
        recordTest('Timestamp recorded in revisado_em', hasTimestamp);
      }
    } catch (e) {
      recordTest('Approve question', false, e.message);
    }

    // Test 3: Verify Removal from Pending List
    log.header('4. Testing: Verify Removal from Pending List');
    
    const reqVerifyRemoval = createMockReq(
      { id: adminUser.id, isAdmin: true, role: 'admin' },
      {},
      { pagina: 1, limite: 20 }
    );
    const resVerifyRemoval = createMockRes();

    try {
      await QuestoesController.getPendingQuestoes(reqVerifyRemoval, resVerifyRemoval);
      
      const foundApprovedQ = resVerifyRemoval.jsonData.dados.questoes.find(q => q.id === pendingQ1.id);
      const passed = !foundApprovedQ; // Should NOT be found
      
      recordTest('Approved question removed from pending list', passed);
    } catch (e) {
      recordTest('Approved question removed from pending list', false, e.message);
    }

    // Test 4: Prevent Double Approval
    log.header('5. Testing: Prevent Double Approval');
    
    const reqDoubleApprove = createMockReq(
      { id: adminUser.id, isAdmin: true, role: 'admin' },
      { id: pendingQ1.id }
    );
    const resDoubleApprove = createMockRes();

    try {
      await QuestoesController.approveQuestao(reqDoubleApprove, resDoubleApprove);
      
      const passed = resDoubleApprove.statusCode === 400 &&
                     resDoubleApprove.jsonData.sucesso === false;
      
      recordTest('Prevent double approval', passed, resDoubleApprove.jsonData.mensagem);
    } catch (e) {
      recordTest('Prevent double approval', false, e.message);
    }

    // Test 5: Reject Question
    log.header('6. Testing: Reject Question');
    
    const rejectionReason = 'Question content is incomplete';
    const reqReject = createMockReq(
      { id: adminUser.id, isAdmin: true, role: 'admin' },
      { id: rejectQ.id },
      {},
      { motivo_rejeicao: rejectionReason }
    );
    const resReject = createMockRes();

    try {
      await QuestoesController.rejectQuestao(reqReject, resReject);
      
      const passed = resReject.statusCode === 200 &&
                     resReject.jsonData.sucesso === true &&
                     resReject.jsonData.dados.status_aprovacao === 'rejeitada' &&
                     resReject.jsonData.dados.motivo_rejeicao === rejectionReason;
      
      recordTest('Reject question with reason', passed);
      
      if (passed) {
        const hasAdminId = resReject.jsonData.dados.revisado_por === adminUser.id;
        recordTest('Admin ID recorded in rejection', hasAdminId);
      }
    } catch (e) {
      recordTest('Reject question with reason', false, e.message);
    }

    // Test 6: Require Rejection Reason
    log.header('7. Testing: Security & Validation');
    
    const reqRejectNoReason = createMockReq(
      { id: adminUser.id, isAdmin: true, role: 'admin' },
      { id: pendingQ2.id },
      {},
      { motivo_rejeicao: '' }
    );
    const resRejectNoReason = createMockRes();

    try {
      await QuestoesController.rejectQuestao(reqRejectNoReason, resRejectNoReason);
      
      const passed = resRejectNoReason.statusCode === 400 &&
                     resRejectNoReason.jsonData.sucesso === false;
      
      recordTest('Reject requires motivo_rejeicao', passed);
    } catch (e) {
      recordTest('Reject requires motivo_rejeicao', false, e.message);
    }

    // Test 7: Non-Admin Cannot Approve
    log.header('8. Testing: Access Control');
    
    const reqNonAdminApprove = createMockReq(
      { id: colaboradorUser.id, role: 'colaborador' },
      { id: pendingQ2.id }
    );
    const resNonAdminApprove = createMockRes();

    try {
      await QuestoesController.approveQuestao(reqNonAdminApprove, resNonAdminApprove);
      
      const passed = resNonAdminApprove.statusCode === 403;
      recordTest('Non-admin cannot approve', passed);
    } catch (e) {
      recordTest('Non-admin cannot approve', false, e.message);
    }

    // Cleanup
    log.header('9. Cleaning Up Test Data');
    
    try {
      await Questao.destroy({ where: { autor_id: colaboradorUser.id } });
      recordTest('Delete test questions', true);
    } catch (e) {
      recordTest('Delete test questions', false, e.message);
    }

    try {
      await User.destroy({ where: { id: [adminUser.id, colaboradorUser.id] } });
      recordTest('Delete test users', true);
    } catch (e) {
      recordTest('Delete test users', false, e.message);
    }

    // Print results
    log.header('Test Results Summary');
    
    console.log(`\n${colors.bright}Total Tests: ${results.passed + results.failed}${colors.reset}`);
    console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
    
    const passPercentage = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
    console.log(`${colors.bright}Success Rate: ${passPercentage}%${colors.reset}\n`);

    if (results.failed === 0) {
      log.success('ALL TESTS PASSED! ✨');
    } else {
      log.warn(`${results.failed} test(s) failed. Please review.`);
    }

    process.exit(results.failed === 0 ? 0 : 1);

  } catch (error) {
    log.error('Fatal error during test execution:');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();
