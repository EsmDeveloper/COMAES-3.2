import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

async function update() {
  const sequelize = new Sequelize(process.env.DB_NAME || 'comaes_db', process.env.DB_USER || 'root', process.env.DB_PASS || '', {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql'
  });

  try {
    await sequelize.query('ALTER TABLE tickets_suporte ADD COLUMN respostas JSON');
    console.log('Coluna respostas adicionada com sucesso');
  } catch (err) {
    if (err.message.includes('Duplicate column name')) {
      console.log('Coluna já existe');
    } else {
      console.error('Erro ao adicionar coluna:', err.message);
    }
  } finally {
    await sequelize.close();
  }
}

update();
