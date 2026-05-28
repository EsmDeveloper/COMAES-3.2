// Script para verificar se a correção foi aplicada corretamente
import Certificate from './models/Certificate.js';
import sequelize from './config/db.js';

console.log('\n🔍 VERIFICANDO CORREÇÃO DO MODELO CERTIFICATE...\n');

try {
  // Conectar ao banco
  await sequelize.authenticate();
  console.log('✅ Conexão com banco de dados estabelecida\n');

  // Verificar atributos do modelo
  const attributes = Certificate.rawAttributes;
  
  console.log('📋 Atributos do modelo Certificate:');
  console.log('-----------------------------------');
  
  const expectedAttributes = [
    'id',
    'usuario_id',
    'torneio_id',
    'pontuacao',
    'posicao',
    'codigo_verificacao',
    'url_certificado',
    'disciplina',
    'deleted_at',
    'created_at',
    'updated_at'
  ];

  let allCorrect = true;

  for (const attr of expectedAttributes) {
    if (attributes[attr]) {
      console.log(`✅ ${attr.padEnd(25)} - OK`);
    } else {
      console.log(`❌ ${attr.padEnd(25)} - FALTANDO!`);
      allCorrect = false;
    }
  }

  // Verificar se há atributos em inglês (que não deveriam existir)
  const wrongAttributes = ['user_id', 'tournament_id', 'score', 'ranking_position', 'certificate_code', 'certificate_url'];
  
  console.log('\n🔍 Verificando atributos incorretos (inglês):');
  console.log('-----------------------------------');
  
  let hasWrongAttributes = false;
  for (const attr of wrongAttributes) {
    if (attributes[attr]) {
      console.log(`❌ ${attr.padEnd(25)} - ENCONTRADO (DEVE SER REMOVIDO!)`);
      hasWrongAttributes = true;
    } else {
      console.log(`✅ ${attr.padEnd(25)} - Não encontrado (correto)`);
    }
  }

  // Verificar associações
  console.log('\n🔗 Verificando associações:');
  console.log('-----------------------------------');
  
  const associations = Certificate.associations;
  
  if (associations.user) {
    const fk = associations.user.foreignKey;
    if (fk === 'usuario_id') {
      console.log(`✅ Associação com Usuario: foreignKey = '${fk}' (correto)`);
    } else {
      console.log(`❌ Associação com Usuario: foreignKey = '${fk}' (deveria ser 'usuario_id')`);
      allCorrect = false;
    }
  } else {
    console.log('⚠️  Associação com Usuario não encontrada');
  }

  if (associations.tournament) {
    const fk = associations.tournament.foreignKey;
    if (fk === 'torneio_id') {
      console.log(`✅ Associação com Torneio: foreignKey = '${fk}' (correto)`);
    } else {
      console.log(`❌ Associação com Torneio: foreignKey = '${fk}' (deveria ser 'torneio_id')`);
      allCorrect = false;
    }
  } else {
    console.log('⚠️  Associação com Torneio não encontrada');
  }

  // Verificar tabela no banco
  console.log('\n🗄️  Verificando estrutura da tabela no banco:');
  console.log('-----------------------------------');
  
  const [columns] = await sequelize.query(`
    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'certificados'
    ORDER BY ORDINAL_POSITION
  `);

  if (columns.length === 0) {
    console.log('❌ Tabela "certificados" não encontrada no banco de dados!');
    console.log('💡 A tabela deve ser criada pela migration');
    allCorrect = false;
  } else {
    console.log(`✅ Tabela "certificados" encontrada com ${columns.length} colunas:\n`);
    
    for (const col of columns) {
      const key = col.COLUMN_KEY ? ` [${col.COLUMN_KEY}]` : '';
      console.log(`   ${col.COLUMN_NAME.padEnd(25)} ${col.DATA_TYPE.padEnd(15)} ${key}`);
    }

    // Verificar se tem as colunas corretas
    const columnNames = columns.map(c => c.COLUMN_NAME);
    const missingColumns = expectedAttributes.filter(attr => !columnNames.includes(attr));
    
    if (missingColumns.length > 0) {
      console.log('\n❌ Colunas faltando na tabela:');
      missingColumns.forEach(col => console.log(`   - ${col}`));
      allCorrect = false;
    }
  }

  // Resultado final
  console.log('\n' + '='.repeat(50));
  if (allCorrect && !hasWrongAttributes) {
    console.log('✅ ✅ ✅ TUDO CORRETO! ✅ ✅ ✅');
    console.log('\nO modelo Certificate está configurado corretamente.');
    console.log('Você pode testar a geração de certificados agora!');
    console.log('\nExecute: node test-certificate.js');
  } else {
    console.log('❌ ❌ ❌ PROBLEMAS ENCONTRADOS ❌ ❌ ❌');
    console.log('\nVerifique os erros acima e corrija antes de testar.');
    console.log('\nPossivelmente você precisa:');
    console.log('1. Reiniciar o servidor backend (Ctrl+C e npm start)');
    console.log('2. Verificar se os arquivos foram salvos corretamente');
    console.log('3. Executar o script SQL: fix-certificates-table.sql');
  }
  console.log('='.repeat(50) + '\n');

} catch (error) {
  console.error('\n❌ ERRO:', error.message);
  console.error('\nStack:', error.stack);
} finally {
  await sequelize.close();
  process.exit(0);
}
