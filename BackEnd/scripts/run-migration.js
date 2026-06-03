import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../config/db.js';

async function runMigration() {
  try {
    console.log('🔧 Iniciando execução de migração...');
    
    // Importar e executar a migração de blocos
    const migrationPath = resolve(process.cwd(), 'migrations', '20260601100000-create-blocos-questoes.js');
    const migrationUrl = new URL(`file://${migrationPath}`).href;
    
    console.log(`📄 Carregando migração: ${migrationPath}`);
    
    // Usar import dinâmico para ES module com file:// URL
    const migration = await import(migrationUrl);
    
    console.log('🚀 Executando migração up...');
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('✅ Migração executada com sucesso!');
    
    // Verificar se as tabelas foram criadas
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'blocos_questoes'");
    if (tables.length > 0) {
      console.log('✅ Tabela blocos_questoes criada com sucesso');
    }
    
    const [itemsTables] = await sequelize.query("SHOW TABLES LIKE 'bloco_questoes_items'");
    if (itemsTables.length > 0) {
      console.log('✅ Tabela bloco_questoes_items criada com sucesso');
    }
    
    const [torneioBlocosTables] = await sequelize.query("SHOW TABLES LIKE 'torneio_blocos'");
    if (torneioBlocosTables.length > 0) {
      console.log('✅ Tabela torneio_blocos criada com sucesso');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error);
    process.exit(1);
  }
}

runMigration();