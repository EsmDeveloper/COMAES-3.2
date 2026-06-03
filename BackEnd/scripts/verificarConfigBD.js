import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import sequelize from '../config/db.js';

async function main() {
  await sequelize.authenticate();

  // Verificar se tabela existe
  const [tables] = await sequelize.query("SHOW TABLES LIKE '%configurac%'");
  console.log('Tabelas encontradas:', JSON.stringify(tables));

  if (tables.length > 0) {
    const [cols] = await sequelize.query('DESCRIBE configuracoes_usuario');
    console.log('Colunas:', JSON.stringify(cols, null, 2));

    const [data] = await sequelize.query('SELECT * FROM configuracoes_usuario LIMIT 3');
    console.log('Dados existentes:', JSON.stringify(data, null, 2));
  } else {
    console.log('Tabela configuracoes_usuario NAO existe - precisa ser criada');
  }

  await sequelize.close();
}

main().catch(e => console.error('Erro:', e.message));
