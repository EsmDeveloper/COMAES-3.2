/**
 * fixDadosBD.js
 * Corrige os dados da BD:
 * 1. role = 'admin'  onde isAdmin = 1
 * 2. status_colaborador = 'aprovado'  para estudantes e admins (não colaboradores)
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import sequelize from '../config/db.js';

async function main() {
  await sequelize.authenticate();
  console.log('Ligado à BD.\n');

  // 1. Admins devem ter role = 'admin'
  const [, meta1] = await sequelize.query(
    "UPDATE usuarios SET role = 'admin' WHERE isAdmin = 1"
  );
  console.log(`Admins corrigidos (role=admin): ${meta1.affectedRows}`);

  // 2. Estudantes e admins não devem ter status_colaborador = 'pendente'
  const [, meta2] = await sequelize.query(
    "UPDATE usuarios SET status_colaborador = 'aprovado' WHERE role != 'colaborador'"
  );
  console.log(`Status corrigido (aprovado) para não-colaboradores: ${meta2.affectedRows}`);

  // 3. Colaboradores de teste criados pelo script já têm status correcto — não tocar

  // Verificar resultado final
  console.log('\n--- Estado final dos utilizadores ---');
  const [rows] = await sequelize.query(
    'SELECT id, nome, email, isAdmin, role, status_colaborador, disciplina_colaborador FROM usuarios ORDER BY id LIMIT 20'
  );
  rows.forEach(r => {
    const tag = r.isAdmin ? '[ADMIN]' : r.role === 'colaborador' ? '[COLAB]' : '[ESTUD]';
    console.log(`${tag} id=${r.id} | ${r.nome} | ${r.email} | role=${r.role} | status=${r.status_colaborador}`);
  });

  await sequelize.close();
}

main().catch(e => {
  console.error('Erro:', e.message);
  process.exit(1);
});
