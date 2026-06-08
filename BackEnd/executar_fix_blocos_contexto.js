import { sequelize } from './config/db.js';
import BlocoQuestoes from './models/BlocoQuestoes.js';

async function executeFix() {
  try {
    console.log('\n🔧 INICIANDO CORREÇÃO: Adicionar coluna contexto à tabela blocos_questoes\n');

    // 1. Verificar se a coluna já existe
    console.log('1️⃣  Verificando se a coluna contexto já existe...');
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'blocos_questoes' AND COLUMN_NAME = 'contexto'
      AND TABLE_SCHEMA = DATABASE()
    `);

    if (columns.length > 0) {
      console.log('✅ Coluna contexto já existe na tabela blocos_questoes');
      console.log(`   Tipo: ${columns[0].COLUMN_TYPE}`);
      console.log(`   Nullable: ${columns[0].IS_NULLABLE}`);
      console.log(`   Default: ${columns[0].COLUMN_DEFAULT}`);
    } else {
      console.log('❌ Coluna contexto não existe. Adicionando...\n');

      // 2. Executar a migração SQL
      console.log('2️⃣  Executando ALTER TABLE...');
      await sequelize.query(`
        ALTER TABLE blocos_questoes 
        ADD COLUMN contexto ENUM('torneio', 'teste') DEFAULT 'torneio' NULL AFTER observacoes_admin
      `);
      console.log('✅ Coluna contexto adicionada com sucesso!\n');

      // 3. Verificar novamente
      console.log('3️⃣  Verificando nova coluna...');
      const [newColumns] = await sequelize.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'blocos_questoes' AND COLUMN_NAME = 'contexto'
        AND TABLE_SCHEMA = DATABASE()
      `);

      if (newColumns.length > 0) {
        console.log('✅ Verificação bem-sucedida!');
        console.log(`   Tipo: ${newColumns[0].COLUMN_TYPE}`);
        console.log(`   Nullable: ${newColumns[0].IS_NULLABLE}`);
        console.log(`   Default: ${newColumns[0].COLUMN_DEFAULT}`);
      }
    }

    // 4. Testar se Sequelize consegue se comunicar com a tabela
    console.log('\n4️⃣  Testando conectividade com Sequelize...');
    const testBloco = await BlocoQuestoes.findOne({ 
      limit: 1,
      raw: true 
    });
    
    if (testBloco) {
      console.log(`✅ Sequelize conseguiu consultar a tabela`);
      console.log(`   Exemplo de bloco encontrado: ${testBloco.titulo}`);
      if (testBloco.contexto !== undefined) {
        console.log(`   Campo contexto presente: ${testBloco.contexto || '(null)'}`);
      }
    } else {
      console.log('⚠️  Nenhum bloco encontrado na tabela (normal se vazia)');
    }

    console.log('\n✅ ✅ ✅ CORREÇÃO COMPLETADA COM SUCESSO!\n');
    console.log('📝 PRÓXIMOS PASSOS:');
    console.log('1. Restart o backend (Node.js)');
    console.log('2. Atualize o navegador (Ctrl+F5 para hard refresh)');
    console.log('3. Teste a criação de blocos na aba Testes');
    console.log('4. Verifique se os erros 500 desapareceram\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO ao executar correção:');
    console.error(error.message);
    
    if (error.original) {
      console.error(`Erro SQL: ${error.original.sqlMessage}`);
      console.error(`Código: ${error.original.code}`);
    }

    console.error('\n💡 DICAS:');
    console.error('- Se "ER_DUP_FIELDNAME": a coluna já existe');
    console.error('- Se "ER_NO_REFERENCED_TABLE": banco não conectou');
    console.error('- Verifique MySQL/XAMPP está rodando\n');

    process.exit(1);
  }
}

executeFix();
