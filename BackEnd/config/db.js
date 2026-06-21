import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

console.log('[TOOL] Iniciando configuração do banco de dados...');
console.log('[LIST] Configuração carregada do .env:');
console.log(`   Database: ${process.env.DB_NAME || 'comaes_db'}`);
console.log(`   Usuário: ${process.env.DB_USER || 'root'}`);
console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`   Porta: ${process.env.DB_PORT || 3306}`);

const sequelize = new Sequelize(
  process.env.DB_NAME || "comaes_db",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      waitForConnections: true,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 30000
    },
    retry: {
      max: 5,
      timeout: 5000
    }
  }
);

async function testConnection({ createIfMissing = true } = {}) {
  try {
    console.log('\n[REFRESH] Tentando conectar ao banco de dados...');
    console.log(`📍 Endpoint: ${sequelize.config.host}:${sequelize.config.port}`);
    console.log(`👤 Com usuário: ${sequelize.config.username}`);

    await sequelize.authenticate();
    console.log('[SUCCESS] Conexão estabelecida com sucesso!');

    if (createIfMissing) {
      const [results] = await sequelize.query(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${sequelize.config.database}'`
      );

      if (results.length > 0) {
        console.log(`📁 Banco "${sequelize.config.database}" encontrado`);
      } else {
        console.log(`[WARNING] Banco "${sequelize.config.database}" não existe`);
        console.log('🔨 Criando banco de dados...');
        await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${sequelize.config.database}`);
        console.log(`[SUCCESS] Banco "${sequelize.config.database}" criado`);
      }
    }

    return true;
  } catch (error) {
    console.error('[ERROR] ERRO ao conectar ao banco de dados:');
    console.error(`   Mensagem: ${error.message}`);

    if (error.original) {
      console.error(`   Código: ${error.original.code}`);
      console.error(`   Erro SQL: ${error.original.sqlMessage}`);
    }

    console.log('\n[TOOL] SOLUÇÕES RECOMENDADAS:');
    console.log('1. Verifique se o MySQL/XAMPP está rodando');
    console.log('2. Confirme as credenciais no arquivo .env:');
    console.log('   DB_USER=root');
    console.log('   DB_PASS=123456');
    console.log('3. Teste manualmente no terminal:');
    console.log('   mysql -u root -p123456');
    console.log('4. Se não funcionar, tente senha vazia:');
    console.log('   mysql -u root');

    return false;
  }
}

export { Sequelize, sequelize, testConnection };
export default sequelize;