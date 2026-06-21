/**
 * Apply Tournament Types Migration
 * Força a aplicação da migration de tipos de torneio se ainda não foi feita
 */
import sequelize from './config/db.js';

async function applyMigration() {
  try {
    console.log('[ROCKET] Aplicando migration de tipos de torneio...\n');

    const queryInterface = sequelize.getQueryInterface();

    // Verificar se coluna já existe
    const tableInfo = await queryInterface.describeTable('torneios');
    
    if (tableInfo.tipo_torneio && tableInfo.disciplina_especifica) {
      console.log('[SUCCESS] Colunas já existem! Migration já foi aplicada.');
      process.exit(0);
      return;
    }

    // PASSO 1: Adicionar tipo_torneio
    if (!tableInfo.tipo_torneio) {
      console.log('📝 Adicionando coluna tipo_torneio...');
      
      try {
        await sequelize.query(`
          ALTER TABLE torneios
          ADD COLUMN tipo_torneio ENUM('generico', 'especifico')
          NOT NULL DEFAULT 'generico'
          COMMENT 'Tipo de torneio: generico (multidisciplinar) ou especifico (uma disciplina)'
        `);
        console.log('[SUCCESS] Coluna tipo_torneio adicionada com sucesso!');
      } catch (error) {
        console.error('[ERROR] Erro ao adicionar tipo_torneio:', error.message);
        if (!error.message.includes('already exists')) throw error;
      }
    } else {
      console.log('✓ Coluna tipo_torneio já existe');
    }

    // PASSO 2: Adicionar disciplina_especifica
    if (!tableInfo.disciplina_especifica) {
      console.log('📝 Adicionando coluna disciplina_especifica...');
      
      try {
        await sequelize.query(`
          ALTER TABLE torneios
          ADD COLUMN disciplina_especifica VARCHAR(100)
          COMMENT 'Disciplina específica quando tipo_torneio = especifico'
        `);
        console.log('[SUCCESS] Coluna disciplina_especifica adicionada com sucesso!');
      } catch (error) {
        console.error('[ERROR] Erro ao adicionar disciplina_especifica:', error.message);
        if (!error.message.includes('already exists')) throw error;
      }
    } else {
      console.log('✓ Coluna disciplina_especifica já existe');
    }

    // PASSO 3: Adicionar índices
    console.log('📝 Adicionando índices...');
    
    try {
      await sequelize.query(`
        ALTER TABLE torneios
        ADD INDEX idx_tipo_torneio (tipo_torneio)
      `);
      console.log('[SUCCESS] Índice idx_tipo_torneio criado');
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.warn('[WARNING]  Erro ao criar índice tipo_torneio:', error.message);
      } else {
        console.log('✓ Índice idx_tipo_torneio já existe');
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE torneios
        ADD INDEX idx_disciplina_especifica (disciplina_especifica)
      `);
      console.log('[SUCCESS] Índice idx_disciplina_especifica criado');
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.warn('[WARNING]  Erro ao criar índice disciplina_especifica:', error.message);
      } else {
        console.log('✓ Índice idx_disciplina_especifica já existe');
      }
    }

    console.log('\n');
    console.log('[SUCCESS] Migration aplicada com sucesso!');
    console.log('\n');

    // Verificar resultado final
    console.log('🔍 Verificando resultado final...\n');
    const finalTableInfo = await queryInterface.describeTable('torneios');
    console.log('Colunas adicionadas:');
    console.log('  - tipo_torneio:', finalTableInfo.tipo_torneio ? '[SUCCESS] SIM' : '[ERROR] NÃO');
    console.log('  - disciplina_especifica:', finalTableInfo.disciplina_especifica ? '[SUCCESS] SIM' : '[ERROR] NÃO');

    process.exit(0);
  } catch (error) {
    console.error('\n[ERROR] ERRO FATAL:', error.message);
    console.error(error);
    process.exit(1);
  }
}

applyMigration();
