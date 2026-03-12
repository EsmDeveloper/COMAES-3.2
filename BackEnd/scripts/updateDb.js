import sequelize from '../config/db.js';

async function updateDb() {
  try {
    console.log('🔄 Iniciando atualização manual do banco de dados...');

    // Desabilitar checks de FK
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Remover tabelas desnecessárias
    const tablesToDrop = ['testes', 'sessoes', 'midia', 'logs_atividade', 'comentarios'];
    for (const table of tablesToDrop) {
      console.log(`🗑️ Removendo tabela: ${table}`);
      await sequelize.query(`DROP TABLE IF EXISTS ${table}`);
    }

    // 2. Modificar tabela perguntas
    console.log('🛠️ Modificando tabela "perguntas"...');
    
    // Remover colunas se existirem
    try {
        await sequelize.query('ALTER TABLE perguntas DROP COLUMN IF EXISTS teste_id');
        console.log('✅ Coluna "teste_id" removida de "perguntas"');
    } catch (e) { console.log(`ℹ️ Coluna "teste_id" erro: ${e.message}`); }

    try {
        await sequelize.query('ALTER TABLE perguntas DROP COLUMN IF EXISTS opcoes');
        console.log('✅ Coluna "opcoes" removida de "perguntas"');
    } catch (e) { console.log(`ℹ️ Coluna "opcoes" erro: ${e.message}`); }

    // Adicionar novas colunas se não existirem
    // MySQL 8.0.19+ suporta ADD COLUMN IF NOT EXISTS, mas versões anteriores não.
    // Vamos tentar adicionar e capturar o erro se já existirem.
    const newColumns = [
        'ALTER TABLE perguntas ADD COLUMN opcao_a VARCHAR(255)',
        'ALTER TABLE perguntas ADD COLUMN opcao_b VARCHAR(255)',
        'ALTER TABLE perguntas ADD COLUMN opcao_c VARCHAR(255)',
        'ALTER TABLE perguntas ADD COLUMN opcao_d VARCHAR(255)'
    ];

    for (const query of newColumns) {
        try {
            await sequelize.query(query);
            console.log(`✅ Executado: ${query}`);
        } catch (e) {
            console.log(`ℹ️ Coluna já existe ou erro: ${e.message}`);
        }
    }

    // Reabilitar checks de FK
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Atualização concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a atualização:', error);
    process.exit(1);
  }
}

updateDb();
