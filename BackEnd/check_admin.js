/**
 * Script para verificar o administrador supremo da plataforma
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'comaes',
  port: process.env.DB_PORT || 3306
};

async function checkAdmin() {
  let connection;
  
  try {
    console.log('👑 VERIFICANDO ADMINISTRADOR SUPREMO\n');
    console.log('='.repeat(70));
    
    connection = await mysql.createConnection(dbConfig);

    // Buscar todos os administradores
    console.log('\n📋 Listando todos os administradores do sistema:\n');
    const [admins] = await connection.query(`
      SELECT 
        id,
        nome,
        email,
        role,
        createdAt,
        updatedAt
      FROM usuarios
      WHERE role = 'admin'
      ORDER BY id ASC
    `);

    if (admins.length === 0) {
      console.log('❌ Nenhum administrador encontrado no sistema!\n');
      return;
    }

    console.log(`✅ ${admins.length} administrador(es) encontrado(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.nome}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   🆔 ID: ${admin.id}`);
      console.log(`   👤 Role: ${admin.role}`);
      console.log(`   📅 Criado em: ${new Date(admin.createdAt).toLocaleString('pt-PT')}`);
      console.log(`   🔄 Atualizado em: ${new Date(admin.updatedAt).toLocaleString('pt-PT')}`);
      console.log('');
    });

    // Identificar o admin supremo (primeiro admin criado)
    const supremo = admins[0];
    
    console.log('='.repeat(70));
    console.log('\n👑 ADMINISTRADOR SUPREMO (primeiro admin criado):\n');
    console.log(`   Nome: ${supremo.nome}`);
    console.log(`   Email: ${supremo.email}`);
    console.log(`   ID: ${supremo.id}`);
    console.log(`   Criado em: ${new Date(supremo.createdAt).toLocaleString('pt-PT')}`);
    console.log('');

    // Estatísticas de atividade do admin supremo
    console.log('📊 Estatísticas de atividade do Admin Supremo:\n');
    
    // Torneios criados
    const [torneios] = await connection.query(`
      SELECT COUNT(*) as total FROM torneios WHERE criado_por = ?
    `, [supremo.id]);
    console.log(`   🏆 Torneios criados: ${torneios[0].total}`);

    // Questões criadas
    const [questoes] = await connection.query(`
      SELECT COUNT(*) as total FROM questoes WHERE autor_id = ?
    `, [supremo.id]);
    console.log(`   📝 Questões criadas: ${questoes[0].total}`);

    // Blocos criados
    const [blocos] = await connection.query(`
      SELECT COUNT(*) as total FROM blocos_questoes WHERE criado_por = ?
    `, [supremo.id]);
    console.log(`   📦 Blocos criados: ${blocos[0].total}`);

    // Notícias criadas
    const [noticias] = await connection.query(`
      SELECT COUNT(*) as total FROM noticias WHERE autor_id = ?
    `, [supremo.id]);
    console.log(`   📰 Notícias criadas: ${noticias[0].total}`);

    // Total de usuários no sistema
    const [usuarios] = await connection.query(`
      SELECT COUNT(*) as total FROM usuarios
    `);
    console.log(`\n👥 Total de usuários no sistema: ${usuarios[0].total}`);

    // Distribuição por role
    const [roles] = await connection.query(`
      SELECT 
        role,
        COUNT(*) as total
      FROM usuarios
      GROUP BY role
      ORDER BY total DESC
    `);
    
    console.log('\n📊 Distribuição de usuários por role:');
    roles.forEach(r => {
      console.log(`   • ${r.role}: ${r.total} usuários`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ Verificação concluída!\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
