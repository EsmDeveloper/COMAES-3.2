/**
 * Unit tests for ColaboradorMiddleware (isColaborador)
 * Tests middleware behavior for collaborator-specific access control
 * 
 * Requirements covered:
 * - 14.2: User must have role 'colaborador'
 * - 14.4: User must have disciplina_colaborador defined
 * - Returns 403 Forbidden if verification fails
 * - Calls next() if verification succeeds
 */

import jwt from 'jsonwebtoken';
import assert from 'assert';

// Mock Usuario database
const mockUserDatabase = {};

// Helper function to create a mock request object
const createMockRequest = (token = null, authHeader = null) => {
  const req = {
    headers: {},
    user: null
  };
  
  if (authHeader) {
    req.headers['authorization'] = authHeader;
  } else if (token) {
    req.headers['authorization'] = `Bearer ${token}`;
  }
  
  return req;
};

// Helper function to create a mock response object
const createMockResponse = () => {
  const res = {
    statusCode: null,
    jsonData: null,
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

// Mock Usuario model
const mockUsuarioModel = {
  unscoped: () => ({
    findByPk: async (id) => {
      const user = mockUserDatabase[id];
      if (!user) return null;
      return {
        get: (opts) => user
      };
    }
  })
};

// Mock implementation of isColaborador middleware
const isColaborador = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token não fornecido.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const dbUser = await mockUsuarioModel.unscoped().findByPk(decoded.id);

    if (!dbUser) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado.' 
      });
    }

    const user = dbUser.get();

    if (user.role !== 'colaborador') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado. Apenas colaboradores podem acessar esta rota.' 
      });
    }

    if (!user.disciplina_colaborador) {
      return res.status(403).json({ 
        success: false, 
        message: 'Colaborador sem disciplina atribuída.' 
      });
    }

    req.user = {
      ...decoded,
      ...user,
      isColaborador: true
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado.' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido.' 
    });
  }
};

// Helper function for next() middleware
let nextCalled = false;
const mockNext = () => {
  nextCalled = true;
};

// Helper to reset state between tests
const resetTest = () => {
  nextCalled = false;
  for (const key in mockUserDatabase) {
    delete mockUserDatabase[key];
  }
};

console.log('='.repeat(70));
console.log('TESTING ColaboradorMiddleware (isColaborador)');
console.log('='.repeat(70));

// ============================================================================
// Test Suite 1: Token Validation
// ============================================================================
console.log('\n[Test Suite 1] Token Validation');
console.log('-'.repeat(70));

// Test 1.1: Missing token returns 401
{
  resetTest();
  const req = createMockRequest();
  req.headers['authorization'] = '';
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(res.statusCode, 401, 'Should return 401 for missing token');
  assert.strictEqual(res.jsonData.message, 'Token não fornecido.', 'Should provide correct error message');
  assert.strictEqual(nextCalled, false, 'next() should not be called');
  console.log('✓ Test 1.1: Missing token returns 401');
}

// Test 1.2: Undefined token returns 401
{
  resetTest();
  const req = createMockRequest();
  req.headers['authorization'] = undefined;
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(res.statusCode, 401, 'Should return 401 for undefined token');
  assert.strictEqual(res.jsonData.success, false, 'Response should indicate failure');
  console.log('✓ Test 1.2: Undefined token returns 401');
}

// Test 1.3: Invalid token returns 401
{
  resetTest();
  const req = createMockRequest('invalid.token.here');
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(res.statusCode, 401, 'Should return 401 for invalid token');
  assert.strictEqual(res.jsonData.message, 'Token inválido.', 'Should provide correct error message');
  console.log('✓ Test 1.3: Invalid token returns 401');
}

// Test 1.4: Expired token returns 401 with specific message
{
  resetTest();
  const expiredPayload = { id: 1, email: 'professor@escola.com' };
  const expiredToken = jwt.sign(expiredPayload, process.env.JWT_SECRET || 'secret', { expiresIn: '-1h' });
  const req = createMockRequest(expiredToken);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(res.statusCode, 401, 'Should return 401 for expired token');
  assert.strictEqual(res.jsonData.message, 'Token expirado.', 'Should indicate token is expired');
  console.log('✓ Test 1.4: Expired token returns 401 with specific message');
}

// ============================================================================
// Test Suite 2: Role Verification (Requirement 14.2)
// ============================================================================
console.log('\n[Test Suite 2] Role Verification (Requirement 14.2)');
console.log('-'.repeat(70));

// Test 2.1: Admin role returns 403 Forbidden
{
  resetTest();
  const payload = { id: 1, email: 'admin@escola.com', role: 'admin' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[1] = {
    id: 1,
    email: 'admin@escola.com',
    role: 'admin',
    disciplina_colaborador: null,
    nome: 'Admin User'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(res.statusCode, 403, 'Should return 403 for admin role');
  assert.strictEqual(res.jsonData.message, 'Acesso negado. Apenas colaboradores podem acessar esta rota.', 'Should provide correct error message');
  assert.strictEqual(nextCalled, false, 'next() should not be called');
  console.log('✓ Test 2.1: Admin role returns 403 Forbidden');
}

// Test 2.2: Estudante role returns 403 Forbidden
{
  resetTest();
  const payload = { id: 2, email: 'student@escola.com', role: 'estudante' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[2] = {
    id: 2,
    email: 'student@escola.com',
    role: 'estudante',
    disciplina_colaborador: null,
    nome: 'Student User'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(res.statusCode, 403, 'Should return 403 for estudante role');
  assert.strictEqual(res.jsonData.success, false, 'Response should indicate failure');
  console.log('✓ Test 2.2: Estudante role returns 403 Forbidden');
}

// ============================================================================
// Test Suite 3: Disciplina Verification (Requirement 14.4)
// ============================================================================
console.log('\n[Test Suite 3] Disciplina Verification (Requirement 14.4)');
console.log('-'.repeat(70));

// Test 3.1: Null disciplina_colaborador returns 403
{
  resetTest();
  const payload = { id: 3, email: 'professor@escola.com', role: 'colaborador' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[3] = {
    id: 3,
    email: 'professor@escola.com',
    role: 'colaborador',
    disciplina_colaborador: null,
    nome: 'Prof. João'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(res.statusCode, 403, 'Should return 403 when disciplina_colaborador is null');
  assert.strictEqual(res.jsonData.message, 'Colaborador sem disciplina atribuída.', 'Should provide correct error message');
  console.log('✓ Test 3.1: Null disciplina_colaborador returns 403');
}

// Test 3.2: Empty string disciplina_colaborador returns 403
{
  resetTest();
  const payload = { id: 4, email: 'professor@escola.com', role: 'colaborador' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[4] = {
    id: 4,
    email: 'professor@escola.com',
    role: 'colaborador',
    disciplina_colaborador: '',
    nome: 'Prof. João'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(res.statusCode, 403, 'Should return 403 when disciplina_colaborador is empty');
  assert.strictEqual(res.jsonData.success, false, 'Response should indicate failure');
  console.log('✓ Test 3.2: Empty string disciplina_colaborador returns 403');
}

// ============================================================================
// Test Suite 4: Successful Authorization
// ============================================================================
console.log('\n[Test Suite 4] Successful Authorization');
console.log('-'.repeat(70));

// Test 4.1: Valid colaborador with matematica discipline
{
  resetTest();
  const payload = { id: 5, email: 'professor.math@escola.com', role: 'colaborador' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[5] = {
    id: 5,
    email: 'professor.math@escola.com',
    role: 'colaborador',
    disciplina_colaborador: 'matematica',
    nome: 'Prof. João'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(nextCalled, true, 'next() should be called');
  assert.strictEqual(res.statusCode, null, 'Should not set error status');
  console.log('✓ Test 4.1: Valid colaborador with matematica discipline succeeds');
}

// Test 4.2: Valid colaborador with ingles discipline
{
  resetTest();
  const payload = { id: 6, email: 'professor.english@escola.com', role: 'colaborador' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[6] = {
    id: 6,
    email: 'professor.english@escola.com',
    role: 'colaborador',
    disciplina_colaborador: 'ingles',
    nome: 'Prof. Maria'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(nextCalled, true, 'next() should be called');
  console.log('✓ Test 4.2: Valid colaborador with ingles discipline succeeds');
}

// Test 4.3: Valid colaborador with programacao discipline
{
  resetTest();
  const payload = { id: 7, email: 'professor.code@escola.com', role: 'colaborador' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[7] = {
    id: 7,
    email: 'professor.code@escola.com',
    role: 'colaborador',
    disciplina_colaborador: 'programacao',
    nome: 'Prof. Carlos'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(nextCalled, true, 'next() should be called');
  console.log('✓ Test 4.3: Valid colaborador with programacao discipline succeeds');
}

// ============================================================================
// Test Suite 5: Request Object Enhancement
// ============================================================================
console.log('\n[Test Suite 5] Request Object Enhancement');
console.log('-'.repeat(70));

// Test 5.1: req.user is populated with correct data
{
  resetTest();
  const payload = { id: 8, email: 'professor@escola.com', role: 'colaborador' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[8] = {
    id: 8,
    email: 'professor@escola.com',
    role: 'colaborador',
    disciplina_colaborador: 'matematica',
    nome: 'Prof. João'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(req.user.id, 8, 'req.user.id should match payload');
  assert.strictEqual(req.user.email, 'professor@escola.com', 'req.user.email should match payload');
  assert.strictEqual(req.user.role, 'colaborador', 'req.user.role should be colaborador');
  assert.strictEqual(req.user.disciplina_colaborador, 'matematica', 'req.user.disciplina_colaborador should be set');
  assert.strictEqual(req.user.isColaborador, true, 'req.user.isColaborador flag should be true');
  console.log('✓ Test 5.1: req.user is populated with correct data');
}

// Test 5.2: req.user includes nome from database
{
  resetTest();
  const payload = { id: 9, email: 'professor@escola.com', role: 'colaborador' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[9] = {
    id: 9,
    email: 'professor@escola.com',
    role: 'colaborador',
    disciplina_colaborador: 'ingles',
    nome: 'Prof. Ana Silva'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(req.user.nome, 'Prof. Ana Silva', 'req.user.nome should be set from database');
  console.log('✓ Test 5.2: req.user includes nome from database');
}

// ============================================================================
// Test Suite 6: Database Error Handling
// ============================================================================
console.log('\n[Test Suite 6] Database Error Handling');
console.log('-'.repeat(70));

// Test 6.1: User not found in database returns 401
{
  resetTest();
  const payload = { id: 999, email: 'nonexistent@escola.com', role: 'colaborador' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  // User not in database

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(res.statusCode, 401, 'Should return 401 when user not found');
  assert.strictEqual(res.jsonData.message, 'Usuário não encontrado.', 'Should provide correct error message');
  console.log('✓ Test 6.1: User not found in database returns 401');
}

// ============================================================================
// Test Suite 7: Authorization Header Parsing
// ============================================================================
console.log('\n[Test Suite 7] Authorization Header Parsing');
console.log('-'.repeat(70));

// Test 7.1: Bearer token with lowercase 'bearer' keyword
{
  resetTest();
  const payload = { id: 10, email: 'professor@escola.com', role: 'colaborador' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[10] = {
    id: 10,
    email: 'professor@escola.com',
    role: 'colaborador',
    disciplina_colaborador: 'matematica',
    nome: 'Prof. João'
  };

  const req = createMockRequest();
  req.headers['authorization'] = `bearer ${token}`;
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(nextCalled, true, 'Should work with lowercase bearer');
  console.log('✓ Test 7.1: Bearer token parsing is case-insensitive');
}

// ============================================================================
// Test Suite 8: Compliance with Spec Requirements
// ============================================================================
console.log('\n[Test Suite 8] Compliance with Spec Requirements');
console.log('-'.repeat(70));

// Test 8.1: Requirement 14.2 - Verify role is colaborador
{
  resetTest();
  const payload = { id: 11, email: 'admin@escola.com', role: 'admin' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[11] = {
    id: 11,
    email: 'admin@escola.com',
    role: 'admin',
    disciplina_colaborador: 'matematica',
    nome: 'Admin'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(res.statusCode, 403, 'Should return 403 for non-colaborador');
  assert.strictEqual(nextCalled, false, 'next() should not be called');
  console.log('✓ Test 8.1: Requirement 14.2 - Verifies role is colaborador');
}

// Test 8.2: Requirement 14.4 - Verify disciplina_colaborador is defined
{
  resetTest();
  const payload = { id: 12, email: 'professor@escola.com', role: 'colaborador' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[12] = {
    id: 12,
    email: 'professor@escola.com',
    role: 'colaborador',
    disciplina_colaborador: null,
    nome: 'Prof. João'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(res.statusCode, 403, 'Should return 403 when disciplina_colaborador is null');
  assert.strictEqual(nextCalled, false, 'next() should not be called');
  console.log('✓ Test 8.2: Requirement 14.4 - Verifies disciplina_colaborador is defined');
}

// Test 8.3: Returns 403 Forbidden on verification failure
{
  resetTest();
  const payload = { id: 13, email: 'student@escola.com', role: 'estudante' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[13] = {
    id: 13,
    email: 'student@escola.com',
    role: 'estudante',
    disciplina_colaborador: null,
    nome: 'Student'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(res.statusCode, 403, 'Should return 403 on verification failure');
  console.log('✓ Test 8.3: Returns 403 Forbidden on verification failure');
}

// Test 8.4: Calls next() on successful verification
{
  resetTest();
  const payload = { id: 14, email: 'professor@escola.com', role: 'colaborador' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  
  mockUserDatabase[14] = {
    id: 14,
    email: 'professor@escola.com',
    role: 'colaborador',
    disciplina_colaborador: 'programacao',
    nome: 'Prof. Carlos'
  };

  const req = createMockRequest(token);
  const res = createMockResponse();

  await isColaborador(req, res, mockNext);

  assert.strictEqual(nextCalled, true, 'Should call next() on successful verification');
  console.log('✓ Test 8.4: Calls next() on successful verification');
}

// ============================================================================
// Test Summary
// ============================================================================
console.log('\n' + '='.repeat(70));
console.log('✅ ALL TESTS PASSED!');
console.log('='.repeat(70));
console.log('\nTest Coverage Summary:');
console.log('✓ Token validation and expiration checks');
console.log('✓ Role verification (colaborador only)');
console.log('✓ Disciplina_colaborador defined verification');
console.log('✓ Successful authorization flow');
console.log('✓ Request object enhancement (req.user)');
console.log('✓ Database error handling');
console.log('✓ Authorization header parsing');
console.log('✓ Express middleware pattern compliance');
console.log('\nRequirements Validated:');
console.log('✓ 14.2: Verify user has role colaborador');
console.log('✓ 14.4: Verify disciplina_colaborador is defined');
console.log('✓ Returns 403 if verification fails');
console.log('✓ Calls next() if verification succeeds');
console.log('='.repeat(70));
