/**
 * user-assign-colaborador.test.js
 * Unit tests for UserController.assignColaborador method
 * Tests for task 7.1
 * 
 * Requirements:
 * - Task 7.1: assignColaborador (Requirements 11.1-11.6)
 */

import jwt from 'jsonwebtoken';
import UserController from '../controllers/UserController.js';
import Usuario from '../models/User.js';
import Disciplina from '../models/Disciplina.js';
import bcrypt from 'bcryptjs';

// Helper function to create mock request and response objects
const createMockReq = (user = null, body = {}, params = {}, query = {}) => {
  return {
    user,
    body,
    params,
    query,
  };
};

const createMockRes = () => {
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
};

// Test suite
console.log('🧪 Starting UserController.assignColaborador Tests (Task 7.1)\n');

let testsPassed = 0;
let testsFailed = 0;

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    testsFailed++;
    throw new Error(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
    testsPassed++;
  }
};

// ============================================
// TASK 7.1: assignColaborador Tests
// ============================================
console.log('\n📋 TASK 7.1: assignColaborador Method Tests');
console.log('═'.repeat(50));

try {
  // Test 7.1.1: Require admin role (Requirement 11.3)
  console.log('\n🔐 Test 7.1.1: Admin role required');
  const reqNoAdmin = createMockReq(
    { role: 'estudante', isAdmin: false },
    { disciplina: 'matematica' },
    { id: 5 },
    {}
  );
  const resNoAdmin = createMockRes();
  
  // Mock Usuario.unscoped to avoid DB call
  const originalUnscoped = Usuario.unscoped;
  Usuario.unscoped = () => ({
    findByPk: async () => null,
  });
  
  await UserController.assignColaborador(reqNoAdmin, resNoAdmin);
  assert(resNoAdmin.statusCode === 403, 'Non-admin user should be rejected with 403');
  assert(
    resNoAdmin.jsonData.message.includes('administrador'),
    'Response should mention admin requirement'
  );

  // Test 7.1.2: Require disciplina parameter
  console.log('\n📝 Test 7.1.2: Require disciplina parameter');
  const reqNoDisciplina = createMockReq(
    { role: 'admin', isAdmin: true, id: 1 },
    { disciplina: '' },  // Empty disciplina
    { id: 5 },
    {}
  );
  const resNoDisciplina = createMockRes();
  
  await UserController.assignColaborador(reqNoDisciplina, resNoDisciplina);
  assert(resNoDisciplina.statusCode === 400, 'Missing disciplina should return 400');
  assert(
    resNoDisciplina.jsonData.message.includes('obrigatória'),
    'Response should indicate disciplina is required'
  );

  // Test 7.1.3: Validate disciplina is valid (Requirement 11.4)
  console.log('\n🎯 Test 7.1.3: Validate disciplina value');
  const reqInvalidDisciplina = createMockReq(
    { role: 'admin', isAdmin: true, id: 1 },
    { disciplina: 'invalid_disciplina' },
    { id: 5 },
    {}
  );
  const resInvalidDisciplina = createMockRes();
  
  await UserController.assignColaborador(reqInvalidDisciplina, resInvalidDisciplina);
  assert(resInvalidDisciplina.statusCode === 400, 'Invalid disciplina should return 400');
  assert(
    resInvalidDisciplina.jsonData.message.includes('Disciplina inválida'),
    'Response should indicate invalid disciplina'
  );

  // Test 7.1.4: User not found (Requirement 11.5)
  console.log('\n🔍 Test 7.1.4: Handle non-existent user');
  const reqUserNotFound = createMockReq(
    { role: 'admin', isAdmin: true, id: 1 },
    { disciplina: 'matematica' },
    { id: 999 },  // Non-existent user ID
    {}
  );
  const resUserNotFound = createMockRes();
  
  // Mock Usuario.unscoped.findByPk to return null
  Usuario.unscoped = () => ({
    findByPk: async () => null,
  });
  
  await UserController.assignColaborador(reqUserNotFound, resUserNotFound);
  assert(resUserNotFound.statusCode === 404, 'Non-existent user should return 404');
  assert(
    resUserNotFound.jsonData.message.includes('não encontrado'),
    'Response should indicate user not found'
  );

  // Test 7.1.5: Cannot assign disciplina to admin (Requirement 11.3)
  console.log('\n🚫 Test 7.1.5: Cannot assign disciplina to admin user');
  const mockAdminUser = {
    id: 2,
    nome: 'Admin User',
    email: 'admin@example.com',
    isAdmin: true,
    role: 'admin',
    disciplina_colaborador: null,
    get: () => ({
      plain: () => ({
        id: 2,
        nome: 'Admin User',
        email: 'admin@example.com',
        isAdmin: true,
        role: 'admin',
        disciplina_colaborador: null,
      }),
    }),
    update: async () => null,
  };
  
  const reqAdminTarget = createMockReq(
    { role: 'admin', isAdmin: true, id: 1 },
    { disciplina: 'matematica' },
    { id: 2 },
    {}
  );
  const resAdminTarget = createMockRes();
  
  Usuario.unscoped = () => ({
    findByPk: async () => mockAdminUser,
  });
  
  await UserController.assignColaborador(reqAdminTarget, resAdminTarget);
  assert(resAdminTarget.statusCode === 403, 'Cannot assign disciplina to admin, should return 403');
  assert(
    resAdminTarget.jsonData.message.includes('admin'),
    'Response should mention cannot assign to admin'
  );

  // Test 7.1.6: Disciplina must exist in database
  console.log('\n🗂️  Test 7.1.6: Validate disciplina exists in database');
  const mockStudentUser = {
    id: 5,
    nome: 'Student User',
    email: 'student@example.com',
    isAdmin: false,
    role: 'estudante',
    disciplina_colaborador: null,
    update: async () => null,
  };
  
  const reqValidDisciplina = createMockReq(
    { role: 'admin', isAdmin: true, id: 1 },
    { disciplina: 'matematica' },
    { id: 5 },
    {}
  );
  const resValidDisciplina = createMockRes();
  
  Usuario.unscoped = () => ({
    findByPk: async () => mockStudentUser,
  });
  
  // Mock Disciplina.findOne to return null (disciplina not found)
  const originalFindOne = Disciplina.findOne;
  Disciplina.findOne = async () => null;
  
  await UserController.assignColaborador(reqValidDisciplina, resValidDisciplina);
  assert(resValidDisciplina.statusCode === 404, 'Non-existent disciplina should return 404');
  assert(
    resValidDisciplina.jsonData.message.includes('não encontrada'),
    'Response should indicate disciplina not found'
  );

  // Test 7.1.7: Successfully assign disciplina to user (Requirements 11.1, 11.2, 11.6)
  console.log('\n✅ Test 7.1.7: Successfully assign disciplina to user');
  
  let updateCalled = false;
  let updateParams = {};
  let mockUserToAssignData = {
    id: 5,
    nome: 'Student User',
    email: 'student@example.com',
    isAdmin: false,
    role: 'estudante',
    disciplina_colaborador: null,
  };
  
  const mockUserToAssign = {
    ...mockUserToAssignData,
    update: async (params) => {
      updateCalled = true;
      updateParams = params;
      mockUserToAssignData.role = params.role;
      mockUserToAssignData.disciplina_colaborador = params.disciplina_colaborador;
      return mockUserToAssign;
    },
    get: (options) => {
      if (options && options.plain) {
        return mockUserToAssignData;
      }
      return {
        plain: () => mockUserToAssignData,
      };
    },
  };
  
  const reqAssign = createMockReq(
    { role: 'admin', isAdmin: true, id: 1 },
    { disciplina: 'matematica' },
    { id: 5 },
    {}
  );
  const resAssign = createMockRes();
  
  Usuario.unscoped = () => ({
    findByPk: async () => mockUserToAssign,
  });
  
  Disciplina.findOne = async () => ({ 
    nome: 'Matemática',
    slug: 'matematica',
    id: 1
  });
  
  await UserController.assignColaborador(reqAssign, resAssign);
  
  assert(resAssign.statusCode === 200, 'Successful assignment should return 200');
  assert(updateCalled, 'User update should be called');
  assert(
    updateParams.role === 'colaborador',
    'User role should be updated to colaborador'
  );
  assert(
    updateParams.disciplina_colaborador === 'matematica',
    'User disciplina_colaborador should be set to matematica'
  );
  assert(
    resAssign.jsonData.data.role === 'colaborador',
    'Response should include updated role'
  );
  assert(
    resAssign.jsonData.data.disciplina_colaborador === 'matematica',
    'Response should include updated disciplina_colaborador'
  );
  assert(
    !resAssign.jsonData.data.password,
    'Response should not include password'
  );

  // Test 7.1.8: Case-insensitive disciplina matching
  console.log('\n📝 Test 7.1.8: Case-insensitive disciplina matching');
  
  let mockUserForCaseData = {
    id: 6,
    nome: 'Another User',
    email: 'another@example.com',
    isAdmin: false,
    role: 'estudante',
    disciplina_colaborador: null,
  };
  
  const mockUserForCase = {
    ...mockUserForCaseData,
    update: async (params) => {
      mockUserForCaseData.role = params.role;
      mockUserForCaseData.disciplina_colaborador = params.disciplina_colaborador;
      return mockUserForCase;
    },
    get: (options) => {
      if (options && options.plain) {
        return mockUserForCaseData;
      }
      return {
        plain: () => mockUserForCaseData,
      };
    },
  };
  
  const reqCaseInsensitive = createMockReq(
    { role: 'admin', isAdmin: true, id: 1 },
    { disciplina: 'MATEMATICA' },  // Uppercase
    { id: 6 },
    {}
  );
  const resCaseInsensitive = createMockRes();
  
  Usuario.unscoped = () => ({
    findByPk: async () => mockUserForCase,
  });
  
  Disciplina.findOne = async () => ({
    slug: 'matematica'
  });
  
  await UserController.assignColaborador(reqCaseInsensitive, resCaseInsensitive);
  assert(resCaseInsensitive.statusCode === 200, 'Case-insensitive disciplina should work');
  assert(
    resCaseInsensitive.jsonData.data.disciplina_colaborador === 'matematica',
    'Disciplina should be normalized to lowercase'
  );

  // Test 7.1.9: Test all valid disciplinas
  console.log('\n🎓 Test 7.1.9: Test all valid disciplinas');
  const validDisciplinas = ['matematica', 'ingles', 'programacao'];
  
  for (const disciplina of validDisciplinas) {
    let mockUserDisciplinaData = {
      id: 10,
      isAdmin: false,
      role: 'estudante',
      disciplina_colaborador: null,
    };
    
    const mockUserDisciplina = {
      ...mockUserDisciplinaData,
      update: async (params) => {
        mockUserDisciplinaData.role = params.role;
        mockUserDisciplinaData.disciplina_colaborador = params.disciplina_colaborador;
        return mockUserDisciplina;
      },
      get: (options) => {
        if (options && options.plain) {
          return mockUserDisciplinaData;
        }
        return {
          plain: () => mockUserDisciplinaData,
        };
      },
    };
    
    const reqDisciplina = createMockReq(
      { role: 'admin', isAdmin: true, id: 1 },
      { disciplina },
      { id: 10 },
      {}
    );
    const resDisciplina = createMockRes();
    
    Usuario.unscoped = () => ({
      findByPk: async () => mockUserDisciplina,
    });
    
    Disciplina.findOne = async () => ({ slug: disciplina });
    
    await UserController.assignColaborador(reqDisciplina, resDisciplina);
    assert(
      resDisciplina.statusCode === 200 && 
      resDisciplina.jsonData.data.disciplina_colaborador === disciplina,
      `Should successfully assign ${disciplina}`
    );
  }

  // Restore original
  Usuario.unscoped = originalUnscoped;
  Disciplina.findOne = originalFindOne;

  console.log('\n✅ Task 7.1 Tests: PASSED\n');
} catch (error) {
  console.error('\n❌ Task 7.1 Tests: FAILED', error.message);
  console.error(error.stack);
  testsFailed++;
}

// ============================================
// TEST SUMMARY
// ============================================
console.log('\n' + '═'.repeat(50));
console.log('📊 TEST SUMMARY');
console.log('═'.repeat(50));
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📈 Total Tests: ${testsPassed + testsFailed}`);
console.log('═'.repeat(50));

if (testsFailed === 0) {
  console.log('\n🎉 ALL TESTS PASSED!\n');
  process.exit(0);
} else {
  console.log('\n❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
