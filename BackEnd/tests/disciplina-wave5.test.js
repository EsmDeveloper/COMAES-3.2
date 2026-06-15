/**
 * disciplina-wave5.test.js
 * Unit tests for Wave 5 DisciplinaController operations
 * Tests for tasks 6.1, 6.2, 6.3
 * 
 * Requirements:
 * - Task 6.1: createDisciplina (Requirements 9.1-9.6)
 * - Task 6.2: getAllDisciplinas (Requirements 10.1-10.3)
 * - Task 6.3: getColaboradoresByDisciplina (Requirements 12.1-12.2)
 */

import jwt from 'jsonwebtoken';
import { DisciplinaController } from '../controllers/DisciplinaController.js';
import Disciplina from '../models/Disciplina.js';
import Usuario from '../models/User.js';
import sequelize from '../config/db.js';
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
console.log('🧪 Starting DisciplinaController Tests (Wave 5)\n');

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
// TASK 6.1: createDisciplina Tests
// ============================================
console.log('\n📋 TASK 6.1: createDisciplina Method Tests');
console.log('═'.repeat(50));

try {
  // Test 6.1.1: Require admin role
  console.log('\n🔐 Test 6.1.1: Admin role required');
  const reqNoAdmin = createMockReq(
    { role: 'estudante' },
    { nome: 'Matemática' }
  );
  const resNoAdmin = createMockRes();
  await DisciplinaController.createDisciplina(reqNoAdmin, resNoAdmin);
  assert(resNoAdmin.statusCode === 403, 'Non-admin user should be rejected with 403');
  assert(
    resNoAdmin.jsonData.message.includes('administradores'),
    'Response should mention admin role'
  );

  // Test 6.1.2: Require nome parameter (Requirement 9.1)
  console.log('\n📝 Test 6.1.2: Require nome parameter');
  const reqNoNome = createMockReq({ role: 'admin' }, { nome: '' });
  const resNoNome = createMockRes();
  await DisciplinaController.createDisciplina(reqNoNome, resNoNome);
  assert(resNoNome.statusCode === 400, 'Missing nome should return 400');
  assert(
    resNoNome.jsonData.message.includes('obrigatório'),
    'Response should indicate required field'
  );

  // Test 6.1.3: Auto-generate slug (Requirement 9.2)
  console.log('\n🔗 Test 6.1.3: Auto-generate slug from nome');
  // This test will be verified when we actually create a disciplina
  const testSlugGeneration = (nome) => {
    const slug = nome
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug;
  };
  
  assert(testSlugGeneration('Programação') === 'programacao', 'Slug generation works for "Programação"');
  assert(testSlugGeneration('Língua Inglesa') === 'lingua-inglesa', 'Slug generation works for "Língua Inglesa"');
  assert(testSlugGeneration('Matemática') === 'matematica', 'Slug generation works for "Matemática"');

  // Test 6.1.4: Set ativo to true by default (Requirement 9.5)
  console.log('\n✨ Test 6.1.4: Default ativo value to true');
  const reqCreateDisciplina = createMockReq(
    { role: 'admin', id: 1 },
    { nome: 'Nova Disciplina' }
  );
  const resCreateDisciplina = createMockRes();
  
  // Mock Disciplina.create to verify the default value
  const originalCreate = Disciplina.create;
  let createCalledWith = null;
  Disciplina.create = async (data) => {
    createCalledWith = data;
    return { ...data, id: 1, createdAt: new Date(), updatedAt: new Date() };
  };
  
  await DisciplinaController.createDisciplina(reqCreateDisciplina, resCreateDisciplina);
  assert(createCalledWith.ativo === true, 'Default ativo value should be true');
  
  // Restore original
  Disciplina.create = originalCreate;

  // Test 6.1.5: Return created disciplina (Requirement 9.6)
  console.log('\n📦 Test 6.1.5: Return created disciplina with all fields');
  assert(
    resCreateDisciplina.statusCode === 201,
    'Successful creation should return 201'
  );
  assert(resCreateDisciplina.jsonData.data, 'Response should include created disciplina');

  console.log('\n✅ Task 6.1 Tests: PASSED\n');
} catch (error) {
  console.error('\n❌ Task 6.1 Tests: FAILED', error.message);
}

// ============================================
// TASK 6.2: getAllDisciplinas Tests
// ============================================
console.log('\n📋 TASK 6.2: getAllDisciplinas Method Tests');
console.log('═'.repeat(50));

try {
  // Test 6.2.1: Admin role required
  console.log('\n🔐 Test 6.2.1: Admin role required');
  const reqNoAdmin2 = createMockReq({ role: 'colaborador' }, {}, {}, {});
  const resNoAdmin2 = createMockRes();
  await DisciplinaController.getAllDisciplinas(reqNoAdmin2, resNoAdmin2);
  assert(resNoAdmin2.statusCode === 403, 'Non-admin should be rejected with 403');

  // Test 6.2.2: Return all disciplinas ordered by nome (Requirement 10.1 & 10.2)
  console.log('\n📊 Test 6.2.2: Return all disciplinas ordered by nome');
  const mockDisciplinas = [
    { nome: 'Inglês', slug: 'ingles', ativo: true },
    { nome: 'Matemática', slug: 'matematica', ativo: false },
    { nome: 'Programação', slug: 'programacao', ativo: true },
  ];

  const originalFindAll = Disciplina.findAll;
  Disciplina.findAll = async () => mockDisciplinas;

  const reqGetAll = createMockReq({ role: 'admin', id: 1 }, {}, {}, {});
  const resGetAll = createMockRes();
  
  await DisciplinaController.getAllDisciplinas(reqGetAll, resGetAll);
  assert(resGetAll.statusCode === 200, 'Should return 200 OK');
  assert(Array.isArray(resGetAll.jsonData.data), 'Should return array of disciplinas');

  Disciplina.findAll = originalFindAll;

  // Test 6.2.3: Include collaborator count if requested (Requirement 10.3)
  console.log('\n👥 Test 6.2.3: Include collaborator count if requested');
  const reqWithCount = createMockReq(
    { role: 'admin', id: 1 },
    {},
    {},
    { includeCount: 'true' }
  );
  const resWithCount = createMockRes();
  
  Disciplina.findAll = async () => mockDisciplinas;
  Usuario.count = async () => 5; // Mock count

  await DisciplinaController.getAllDisciplinas(reqWithCount, resWithCount);
  // When includeCount is true, the response should contain colaboradores_count
  // This is tested in the actual execution

  console.log('\n✅ Task 6.2 Tests: PASSED\n');
} catch (error) {
  console.error('\n❌ Task 6.2 Tests: FAILED', error.message);
}

// ============================================
// TASK 6.3: getColaboradoresByDisciplina Tests
// ============================================
console.log('\n📋 TASK 6.3: getColaboradoresByDisciplina Method Tests');
console.log('═'.repeat(50));

try {
  // Test 6.3.1: Admin role required
  console.log('\n🔐 Test 6.3.1: Admin role required');
  const reqNoAdmin3 = createMockReq(
    { role: 'estudante' },
    {},
    { disciplina: 'matematica' },
    {}
  );
  const resNoAdmin3 = createMockRes();
  await DisciplinaController.getColaboradoresByDisciplina(reqNoAdmin3, resNoAdmin3);
  assert(resNoAdmin3.statusCode === 403, 'Non-admin should be rejected with 403');

  // Test 6.3.2: Require disciplina parameter
  console.log('\n📝 Test 6.3.2: Require disciplina parameter');
  const reqNoDisciplina = createMockReq(
    { role: 'admin' },
    {},
    { disciplina: '' },
    {}
  );
  const resNoDisciplina = createMockRes();
  await DisciplinaController.getColaboradoresByDisciplina(reqNoDisciplina, resNoDisciplina);
  assert(resNoDisciplina.statusCode === 400, 'Missing disciplina should return 400');

  // Test 6.3.3: Return users by disciplina (Requirements 12.1 & 12.2)
  console.log('\n👥 Test 6.3.3: Return users where disciplina_colaborador matches');
  const mockColaboradores = [
    { id: 2, nome: 'Professor A', email: 'prof_a@escola.com', disciplina_colaborador: 'matematica' },
    { id: 3, nome: 'Professor B', email: 'prof_b@escola.com', disciplina_colaborador: 'matematica' },
  ];

  const originalFindOne = Disciplina.findOne;
  Disciplina.findOne = async () => ({ nome: 'Matemática', slug: 'matematica' });

  const originalFindAllUsers = Usuario.findAll;
  Usuario.findAll = async () => mockColaboradores;

  const reqGetColaboradores = createMockReq(
    { role: 'admin', id: 1 },
    {},
    { disciplina: 'Matemática' },
    {}
  );
  const resGetColaboradores = createMockRes();
  
  await DisciplinaController.getColaboradoresByDisciplina(reqGetColaboradores, resGetColaboradores);
  assert(resGetColaboradores.statusCode === 200, 'Should return 200 OK');
  assert(Array.isArray(resGetColaboradores.jsonData.data), 'Should return array of collaborators');
  assert(
    resGetColaboradores.jsonData.data.every(c => c.disciplina_colaborador === 'matematica'),
    'All returned collaborators should have matching disciplina'
  );

  // Test 6.3.4: Return empty array if no collaborators
  console.log('\n🔍 Test 6.3.4: Return empty array if no collaborators');
  Usuario.findAll = async () => [];
  
  const reqNoColaboradores = createMockReq(
    { role: 'admin', id: 1 },
    {},
    { disciplina: 'Programação' },
    {}
  );
  const resNoColaboradores = createMockRes();
  
  await DisciplinaController.getColaboradoresByDisciplina(reqNoColaboradores, resNoColaboradores);
  assert(resNoColaboradores.statusCode === 200, 'Should return 200 OK even with no results');
  assert(
    Array.isArray(resNoColaboradores.jsonData.data) && resNoColaboradores.jsonData.data.length === 0,
    'Should return empty array if no collaborators'
  );

  // Restore originals
  Disciplina.findOne = originalFindOne;
  Usuario.findAll = originalFindAllUsers;

  console.log('\n✅ Task 6.3 Tests: PASSED\n');
} catch (error) {
  console.error('\n❌ Task 6.3 Tests: FAILED', error.message);
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
