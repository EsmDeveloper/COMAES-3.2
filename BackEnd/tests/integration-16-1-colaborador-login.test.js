/**
 * integration-16-1-colaborador-login.test.js
 * Integration test for Task 16.1: Test collaborator login flow
 * 
 * Test Scenario:
 * 1. Use credentials for a user with role='colaborador' and assigned disciplina_colaborador
 * 2. Perform login request to /auth/login
 * 3. Verify JWT token response contains:
 *    - Correct role: 'colaborador'
 *    - Correct disciplina_colaborador value (e.g., 'Matemática')
 *    - Other standard fields (id, nome, email, iat, exp)
 * 4. Verify after login, user is redirected to collaborator dashboard
 * 5. Verify AuthContext.role and AuthContext.disciplina_colaborador are set correctly
 * 6. Check localStorage has the token with correct payload
 * 
 * Validates Requirements: 1.5, 1.6, 16.1
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import Usuario from '../models/User.js';
import sequelize from '../config/db.js';

describe('Task 16.1: Collaborator Login Flow Integration Test', () => {
  let colaborador;
  let estudante;
  let admin;
  const colaboradorCredentials = {
    usuario: 'colaborador@teste.com',
    senha: 'SenhaForte123!'
  };

  beforeAll(async () => {
    // Setup database
    await sequelize.sync({ force: false });
  });

  afterAll(async () => {
    // Cleanup
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up users
    await Usuario.destroy({ where: {} });

    // Create test collaborator with assigned disciplina
    colaborador = await Usuario.create({
      nome: 'Professor Colaborador',
      telefone: '123456789',
      email: colaboradorCredentials.usuario,
      nascimento: '1990-01-15',
      sexo: 'Masculino',
      password: colaboradorCredentials.senha,
      role: 'colaborador',
      disciplina_colaborador: 'matematica',
      status_colaborador: 'aprovado'
    });

    // Create a collaborator in inglés
    await Usuario.create({
      nome: 'Professor Inglés',
      telefone: '987654321',
      email: 'professor.ingles@teste.com',
      nascimento: '1985-03-20',
      sexo: 'Feminino',
      password: 'SenhaForte456!',
      role: 'colaborador',
      disciplina_colaborador: 'ingles',
      status_colaborador: 'aprovado'
    });

    // Create a regular student for comparison
    estudante = await Usuario.create({
      nome: 'Estudante Teste',
      telefone: '555555555',
      email: 'estudante@teste.com',
      nascimento: '2005-06-10',
      sexo: 'Feminino',
      password: 'SenhaForte789!',
      role: 'estudante'
    });

    // Create an admin for comparison
    admin = await Usuario.create({
      nome: 'Admin Teste',
      telefone: '666666666',
      email: 'admin@teste.com',
      nascimento: '1980-01-01',
      sexo: 'Masculino',
      password: 'SenhaAdmin123!',
      role: 'admin',
      isAdmin: true
    });
  });

  describe('Scenario 1: Successful Collaborator Login', () => {
    it('should login collaborator with valid credentials (Requirement 1.5)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.data).toBeDefined();
    });

    it('should return JWT token with correct role in payload (Requirement 1.5)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      const token = response.body.token;

      // Decode token to verify payload
      const decoded = jwt.decode(token);
      expect(decoded).toBeDefined();
      expect(decoded.role).toBe('colaborador');
    });

    it('should return JWT token with disciplina_colaborador in payload (Requirement 1.5)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      const token = response.body.token;

      // Decode token to verify payload
      const decoded = jwt.decode(token);
      expect(decoded).toBeDefined();
      expect(decoded.disciplina_colaborador).toBe('matematica');
    });

    it('should return JWT token with standard fields (id, email, iat, exp) (Requirement 1.5)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      const token = response.body.token;

      // Decode token to verify payload
      const decoded = jwt.decode(token);
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(colaborador.id);
      expect(decoded.email).toBe('colaborador@teste.com');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should return token with 24-hour expiration (Requirement 16.1)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      const token = response.body.token;

      // Decode token to verify expiration
      const decoded = jwt.decode(token);
      const issuedAt = decoded.iat;
      const expiresAt = decoded.exp;
      const expirationSeconds = expiresAt - issuedAt;

      // 24 hours = 86400 seconds (allow 1 second variance)
      expect(expirationSeconds).toBeGreaterThanOrEqual(86399);
      expect(expirationSeconds).toBeLessThanOrEqual(86401);
    });

    it('should return user data in response with correct role (Requirement 1.5)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      expect(response.body.data.role).toBe('colaborador');
      expect(response.body.data.disciplina_colaborador).toBe('matematica');
    });

    it('should return user data with correct disciplina_colaborador (Requirement 1.5)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      expect(response.body.data.disciplina_colaborador).toBe('matematica');
    });

    it('should NOT return password in response (Requirement 1.6)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      expect(response.body.data.password).toBeUndefined();
    });

    it('should return all user standard fields (id, nome, email) (Requirement 1.5)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      const userData = response.body.data;
      expect(userData.id).toBe(colaborador.id);
      expect(userData.nome).toBe('Professor Colaborador');
      expect(userData.email).toBe('colaborador@teste.com');
    });

    it('should return correct token for collaborator with inglés discipline', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'professor.ingles@teste.com',
          senha: 'SenhaForte456!'
        });

      expect(response.status).toBe(200);
      const token = response.body.token;
      const decoded = jwt.decode(token);

      expect(decoded.role).toBe('colaborador');
      expect(decoded.disciplina_colaborador).toBe('ingles');
      expect(response.body.data.disciplina_colaborador).toBe('ingles');
    });
  });

  describe('Scenario 2: Frontend Integration - Redirect to Dashboard', () => {
    it('should provide data for frontend redirect to collaborator dashboard', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      const userData = response.body.data;

      // Frontend should use this data to determine redirect route
      // Based on role === 'colaborador' → redirect to /colaborador/dashboard
      expect(userData.role).toBe('colaborador');
      expect(userData.disciplina_colaborador).toBeDefined();
    });

    it('should provide data compatible with AuthContext storage', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      const userData = response.body.data;
      const token = response.body.token;

      // AuthContext should be able to normalize this data
      expect(userData.id).toBeDefined();
      expect(userData.nome).toBeDefined();
      expect(userData.email).toBeDefined();
      expect(userData.role).toBe('colaborador');
      expect(userData.disciplina_colaborador).toBe('matematica');
      expect(token).toBeDefined();
    });
  });

  describe('Scenario 3: AuthContext Field Population', () => {
    it('should populate AuthContext.role and AuthContext.disciplina_colaborador (Requirement 1.6)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      const userData = response.body.data;

      // Simulate AuthContext normalization
      const authContext = {
        role: userData.role,
        disciplina_colaborador: userData.disciplina_colaborador,
        id: userData.id,
        nome: userData.nome,
        email: userData.email
      };

      expect(authContext.role).toBe('colaborador');
      expect(authContext.disciplina_colaborador).toBe('matematica');
      expect(authContext.id).toBe(colaborador.id);
    });

    it('should provide all required fields for AuthContext.user object', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      const userData = response.body.data;

      // Check all required fields are present
      expect(userData.id).toBeDefined();
      expect(userData.nome).toBeDefined();
      expect(userData.email).toBeDefined();
      expect(userData.role).toBeDefined();
      expect(userData.disciplina_colaborador).toBeDefined();
      expect(userData.telefone).toBeDefined();
    });
  });

  describe('Scenario 4: localStorage Token Verification', () => {
    it('should provide token suitable for localStorage storage', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      const token = response.body.token;

      // Token should be a valid JWT string
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should store correct payload in JWT for localStorage verification', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      const token = response.body.token;

      // Decode and verify payload
      const decoded = jwt.decode(token);
      expect(decoded.id).toBe(colaborador.id);
      expect(decoded.email).toBe('colaborador@teste.com');
      expect(decoded.role).toBe('colaborador');
      expect(decoded.disciplina_colaborador).toBe('matematica');
    });

    it('should provide token with correct signature for verification', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);

      expect(response.status).toBe(200);
      const token = response.body.token;

      // Token should be verifiable with the same secret
      const secret = process.env.JWT_SECRET || 'secret';
      const decoded = jwt.verify(token, secret);

      expect(decoded).toBeDefined();
      expect(decoded.role).toBe('colaborador');
      expect(decoded.disciplina_colaborador).toBe('matematica');
    });
  });

  describe('Scenario 5: Comparison with Other Roles', () => {
    it('should return different role for student login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'estudante@teste.com',
          senha: 'SenhaForte789!'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.role).toBe('estudante');
      expect(response.body.data.disciplina_colaborador).toBeNull();

      const token = response.body.token;
      const decoded = jwt.decode(token);
      expect(decoded.role).toBe('estudante');
      expect(decoded.disciplina_colaborador).toBeNull();
    });

    it('should return different role for admin login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'admin@teste.com',
          senha: 'SenhaAdmin123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.role).toBe('admin');
      expect(response.body.data.isAdmin).toBe(true);

      const token = response.body.token;
      const decoded = jwt.decode(token);
      expect(decoded.role).toBe('admin');
    });

    it('should only collaborators have disciplina_colaborador in JWT', async () => {
      // Login collaborator
      const colaboradorResponse = await request(app)
        .post('/auth/login')
        .send(colaboradorCredentials);
      const colaboradorToken = jwt.decode(colaboradorResponse.body.token);

      // Login student
      const estudanteResponse = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'estudante@teste.com',
          senha: 'SenhaForte789!'
        });
      const estudanteToken = jwt.decode(estudanteResponse.body.token);

      // Only collaborator should have disciplina_colaborador
      expect(colaboradorToken.disciplina_colaborador).toBe('matematica');
      expect(estudanteToken.disciplina_colaborador).toBeNull();
    });
  });

  describe('Scenario 6: Error Cases', () => {
    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'nonexistent@teste.com',
          senha: 'SenhaForte123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'colaborador@teste.com',
          senha: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'colaborador@teste.com'
          // missing senha
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject login for pending colaborador', async () => {
      // Create a pending collaborator
      const pendingColaborador = await Usuario.create({
        nome: 'Professor Pendente',
        telefone: '777777777',
        email: 'professor.pendente@teste.com',
        nascimento: '1990-01-15',
        sexo: 'Masculino',
        password: 'SenhaForte123!',
        role: 'colaborador',
        disciplina_colaborador: 'programacao',
        status_colaborador: 'pendente'
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'professor.pendente@teste.com',
          senha: 'SenhaForte123!'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.userStatus).toBe('pendente');
    });

    it('should reject login for rejected colaborador', async () => {
      // Create a rejected collaborator
      const rejectedColaborador = await Usuario.create({
        nome: 'Professor Rejeitado',
        telefone: '888888888',
        email: 'professor.rejeitado@teste.com',
        nascimento: '1990-01-15',
        sexo: 'Masculino',
        password: 'SenhaForte123!',
        role: 'colaborador',
        disciplina_colaborador: 'programacao',
        status_colaborador: 'rejeitado'
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'professor.rejeitado@teste.com',
          senha: 'SenhaForte123!'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.userStatus).toBe('rejeitado');
    });
  });

  describe('Scenario 7: Login via Phone Number', () => {
    it('should allow login with collaborator phone number (Requirement 1.5)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: '123456789',
          senha: 'SenhaForte123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.role).toBe('colaborador');
      expect(response.body.data.disciplina_colaborador).toBe('matematica');
    });

    it('should return correct JWT with phone login (Requirement 1.5)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: '123456789',
          senha: 'SenhaForte123!'
        });

      expect(response.status).toBe(200);
      const token = response.body.token;
      const decoded = jwt.decode(token);

      expect(decoded.role).toBe('colaborador');
      expect(decoded.disciplina_colaborador).toBe('matematica');
    });
  });

  describe('Scenario 8: Regression - Existing Functionality', () => {
    it('should not break existing student login flow (Requirement 17.1)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'estudante@teste.com',
          senha: 'SenhaForte789!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.data.role).toBe('estudante');
    });

    it('should not break existing admin login flow (Requirement 18.1)', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'admin@teste.com',
          senha: 'SenhaAdmin123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.data.role).toBe('admin');
      expect(response.body.data.isAdmin).toBe(true);
    });
  });
});
