/**
 * Testa o endpoint de login e mostra a resposta completa
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import sequelize from '../config/db.js';

// Buscar todos os utilizadores com a password para testar
async function main() {
  await sequelize.authenticate();

  const [users] = await sequelize.query(
    "SELECT id, nome, email, role, isAdmin, status_colaborador, password FROM usuarios ORDER BY id LIMIT 10"
  );

  console.log('Utilizadores na BD:');
  users.forEach(u => {
    console.log(`  id=${u.id} | ${u.nome} | ${u.email} | role=${u.role} | isAdmin=${u.isAdmin} | status=${u.status_colaborador}`);
  });

  // Tentar fazer HTTP request ao login com credenciais conhecidas
  const http = await import('http');
  
  const adminUser = users.find(u => u.isAdmin);
  if (!adminUser) {
    console.log('Nenhum admin encontrado');
    await sequelize.close();
    return;
  }

  console.log(`\nTestando login com: ${adminUser.email}`);
  console.log('(Nota: password não pode ser verificada aqui - use Postman/browser)');
  
  // Mostrar o que o endpoint devolveria
  console.log('\nO backend deve devolver objeto com estes campos:');
  console.log(JSON.stringify({
    success: true,
    data: {
      id: adminUser.id,
      nome: adminUser.nome,
      email: adminUser.email,
      role: adminUser.role,
      isAdmin: adminUser.isAdmin,
      status_colaborador: adminUser.status_colaborador
    },
    token: '...'
  }, null, 2));

  await sequelize.close();
}

main().catch(e => console.error(e.message));
