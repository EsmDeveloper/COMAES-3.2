/**
 * debug-login.js
 * Script para debugar problema de login
 * 
 * Uso: node debug-login.js <email_ou_telefone>
 */

import sequelize from './config/db.js';
import Usuario from './models/User.js';

async function debugLogin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    const entrada = process.argv[2];
    if (!entrada) {
      console.log('❌ Uso: node debug-login.js <email_ou_telefone>');
      process.exit(1);
    }

    console.log(`🔍 Procurando por: "${entrada}"\n`);

    // 1. Query SQL direta (como no login)
    console.log('1️⃣ Buscando com query SQL direta:');
    const [sqlResults] = await sequelize.query(
      `SELECT id, nome, telefone, email, nascimento, sexo, password, escola, imagem, biografia, isAdmin, role, disciplina_colaborador, status_colaborador, createdAt, updatedAt
       FROM usuarios 
       WHERE email = :email OR telefone = :telefone 
       LIMIT 1`,
      {
        replacements: {
          email: entrada.toLowerCase(),
          telefone: entrada
        },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (sqlResults) {
      console.log('   ✅ Encontrado via SQL:');
      console.log(`      ID: ${sqlResults.id}`);
      console.log(`      Nome: ${sqlResults.nome}`);
      console.log(`      Email: ${sqlResults.email}`);
      console.log(`      Telefone: ${sqlResults.telefone}`);
      console.log(`      Role: ${sqlResults.role}`);
      console.log(`      Status Colaborador: ${sqlResults.status_colaborador}`);
      console.log(`      Password (hash): ${sqlResults.password ? sqlResults.password.substring(0, 20) + '...' : 'NULL'}`);
    } else {
      console.log('   ❌ NÃO encontrado via SQL\n');
    }

    // 2. Usar modelo Sequelize com unscoped
    console.log('\n2️⃣ Buscando com Sequelize.findOne (unscoped):');
    const dbUser = await Usuario.unscoped().findOne({
      where: { email: entrada.toLowerCase() }
    });

    if (dbUser) {
      console.log('   ✅ Encontrado via Sequelize:');
      console.log(`      ID: ${dbUser.id}`);
      console.log(`      Nome: ${dbUser.nome}`);
      console.log(`      Email: ${dbUser.email}`);
      console.log(`      Telefone: ${dbUser.telefone}`);
      console.log(`      Role: ${dbUser.role}`);
      console.log(`      Status: ${dbUser.status_colaborador}`);
      console.log(`      Password (hash): ${dbUser.password ? dbUser.password.substring(0, 20) + '...' : 'NULL'}`);
    } else {
      console.log('   ❌ NÃO encontrado via Sequelize\n');
    }

    // 3. Listar todos os usuários para comparação
    console.log('\n3️⃣ Todos os usuários no banco:');
    const [allUsers] = await sequelize.query(
      `SELECT id, nome, email, telefone, role, status_colaborador FROM usuarios LIMIT 20`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (allUsers.length > 0) {
      console.log(`   Total: ${allUsers.length} usuários`);
      allUsers.forEach(u => {
        console.log(`   - [${u.id}] ${u.nome} | ${u.email} | ${u.telefone} | ${u.role}`);
      });
    } else {
      console.log('   ❌ Nenhum usuário encontrado!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

debugLogin();
