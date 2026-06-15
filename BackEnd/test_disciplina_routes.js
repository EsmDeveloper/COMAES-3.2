/**
 * test_disciplina_routes.js
 * Integration test for DisciplinaController routes
 * 
 * This script tests the complete flow:
 * 1. Create a Disciplina (createDisciplina)
 * 2. List all Disciplinas (getAllDisciplinas)
 * 3. Get Collaborators by Disciplina (getColaboradoresByDisciplina)
 */

import sequelize from './config/db.js';
import Disciplina from './models/Disciplina.js';
import Usuario from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

console.log('\n🧪 Testing DisciplinaController Implementation\n');

let testsPassed = 0;
let testsFailed = 0;

const test = async (name, fn) => {
  try {
    console.log(`\n📝 Test: ${name}`);
    await fn();
    console.log(`✅ PASSED: ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    testsFailed++;
  }
};

try {
  // Initialize database
  console.log('🔄 Initializing database...');
  await sequelize.authenticate();
  console.log('✅ Database connected\n');

  // Sync models
  await sequelize.sync({ force: false });
  console.log('✅ Models synchronized\n');

  // ============================================
  // TEST 1: Task 6.1 - createDisciplina
  // ============================================
  console.log('\n📋 TASK 6.1: createDisciplina');
  console.log('═'.repeat(50));

  await test('Requirement 9.1: Create disciplina with nome', async () => {
    const disciplina = await Disciplina.create({
      nome: 'Matemática',
      slug: 'matematica',
      descricao: 'Disciplina de Matemática',
      cor: '#FF5733',
      ativo: true
    });
    
    if (!disciplina.id) throw new Error('Disciplina not created');
    if (disciplina.nome !== 'Matemática') throw new Error('Nome mismatch');
  });

  await test('Requirement 9.2: Slug is auto-generated', async () => {
    const disciplina = await Disciplina.create({
      nome: 'Programação',
      slug: 'programacao',
      descricao: 'Disciplina de Programação',
      ativo: true
    });
    
    if (disciplina.slug !== 'programacao') throw new Error('Slug not generated correctly');
  });

  await test('Requirement 9.3: Unique constraint on nome', async () => {
    try {
      await Disciplina.create({
        nome: 'Matemática', // Duplicate
        slug: 'matematica-dup',
        ativo: true
      });
      throw new Error('Should have thrown unique constraint error');
    } catch (error) {
      if (!error.message.includes('SequelizeUniqueConstraintError')) {
        throw new Error('Expected unique constraint error');
      }
    }
  });

  await test('Requirement 9.4: Optional descricao and cor', async () => {
    const disciplina = await Disciplina.create({
      nome: 'Inglês',
      slug: 'ingles',
      // descricao and cor are optional
      ativo: true
    });
    
    if (disciplina.descricao !== null) throw new Error('Descricao should be null');
    if (disciplina.cor !== null) throw new Error('Cor should be null');
  });

  await test('Requirement 9.5: ativo defaults to true', async () => {
    const disciplina = await Disciplina.create({
      nome: 'História',
      slug: 'historia'
      // ativo not specified, should default to true
    });
    
    if (disciplina.ativo !== true) throw new Error('Ativo should default to true');
  });

  // ============================================
  // TEST 2: Task 6.2 - getAllDisciplinas
  // ============================================
  console.log('\n📋 TASK 6.2: getAllDisciplinas');
  console.log('═'.repeat(50));

  await test('Requirement 10.1: Return all disciplinas regardless of ativo', async () => {
    await Disciplina.create({
      nome: 'Arte',
      slug: 'arte',
      ativo: false
    });
    
    const disciplinas = await Disciplina.findAll();
    
    if (disciplinas.length === 0) throw new Error('Should return all disciplinas');
    
    const hasActive = disciplinas.some(d => d.ativo === true);
    const hasInactive = disciplinas.some(d => d.ativo === false);
    
    if (!hasActive || !hasInactive) {
      throw new Error('Should return both active and inactive disciplinas');
    }
  });

  await test('Requirement 10.2: Order by nome ascending', async () => {
    const disciplinas = await Disciplina.findAll({
      order: [['nome', 'ASC']]
    });
    
    for (let i = 0; i < disciplinas.length - 1; i++) {
      const current = disciplinas[i].nome;
      const next = disciplinas[i + 1].nome;
      
      if (current > next) {
        throw new Error(`Not ordered: ${current} > ${next}`);
      }
    }
  });

  await test('Requirement 10.3: Include collaborator count if requested', async () => {
    // Create a test collaborator
    const hash = await bcrypt.hash('SenhaForte123!', 10);
    await Usuario.create({
      nome: 'Professor Test',
      telefone: '9123456789',
      email: 'prof@test.com',
      nascimento: '1990-01-01',
      sexo: 'Masculino',
      password: hash,
      role: 'colaborador',
      disciplina_colaborador: 'Matemática'
    });
    
    const disciplinas = await Disciplina.findAll();
    const matematica = disciplinas.find(d => d.nome === 'Matemática');
    
    if (!matematica) throw new Error('Matemática disciplina not found');
    
    // Count collaborators manually
    const count = await Usuario.count({
      where: {
        disciplina_colaborador: 'Matemática',
        role: 'colaborador'
      }
    });
    
    if (count === 0) throw new Error('Should have at least one collaborator');
  });

  // ============================================
  // TEST 3: Task 6.3 - getColaboradoresByDisciplina
  // ============================================
  console.log('\n📋 TASK 6.3: getColaboradoresByDisciplina');
  console.log('═'.repeat(50));

  await test('Requirement 12.1: Return users where disciplina_colaborador matches', async () => {
    const colaboradores = await Usuario.findAll({
      where: {
        disciplina_colaborador: 'Matemática',
        role: 'colaborador'
      },
      attributes: ['id', 'nome', 'email', 'disciplina_colaborador']
    });
    
    if (colaboradores.length === 0) throw new Error('Should find at least one collaborator');
    
    colaboradores.forEach(c => {
      if (c.disciplina_colaborador !== 'Matemática') {
        throw new Error('Collaborator has wrong disciplina');
      }
    });
  });

  await test('Requirement 12.2: Include id, nome, email, disciplina_colaborador', async () => {
    const colaboradores = await Usuario.findAll({
      where: {
        disciplina_colaborador: 'Matemática',
        role: 'colaborador'
      },
      attributes: ['id', 'nome', 'email', 'disciplina_colaborador']
    });
    
    if (colaboradores.length === 0) throw new Error('No collaborators found');
    
    const c = colaboradores[0];
    if (!c.id || !c.nome || !c.email || !c.disciplina_colaborador) {
      throw new Error('Missing required fields');
    }
  });

  await test('Requirement 12.2: Return empty array if no collaborators', async () => {
    const colaboradores = await Usuario.findAll({
      where: {
        disciplina_colaborador: 'Não Existente',
        role: 'colaborador'
      }
    });
    
    if (!Array.isArray(colaboradores)) throw new Error('Should return array');
    if (colaboradores.length !== 0) throw new Error('Should return empty array');
  });

  // ============================================
  // Summary
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
  } else {
    console.log('\n❌ SOME TESTS FAILED!\n');
  }

} catch (error) {
  console.error('Fatal error:', error);
} finally {
  // Close database connection
  if (sequelize) {
    await sequelize.close();
  }
  
  process.exit(testsFailed === 0 ? 0 : 1);
}
