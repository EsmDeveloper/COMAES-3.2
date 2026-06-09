#!/usr/bin/env node
/**
 * apply_migrations_v2.js
 * Executa migrations SQL para o sistema de torneios (versão simplificada)
 */

import sequelize from './config/db.js';

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migrations...\n');

    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Migrations a executar (ordem importa!)
    const migrations = [
      // 1. Torneios - tipo de torneio
      {
        name: '1. Adicionar tipo_torneio na tabela torneios',
        sql: `ALTER TABLE torneios ADD COLUMN IF NOT EXISTS tipo_torneio ENUM('generico', 'especifico') DEFAULT 'generico' COMMENT 'Tipo de torneio: generico (multidisciplinar) ou especifico (uma disciplina)'`,
      },
      // 2. Torneios - disciplina específica
      {
        name: '2. Adicionar disciplina_especifica na tabela torneios',
        sql: `ALTER TABLE torneios ADD COLUMN IF NOT EXISTS disciplina_especifica VARCHAR(100) DEFAULT NULL COMMENT 'Disciplina específica quando tipo_torneio = "especifico"'`,
      },
      // 3. Participantes - encerrado operacionalmente
      {
        name: '3. Adicionar encerrado_operacionalmente na tabela participantes_torneios',
        sql: `ALTER TABLE participantes_torneios ADD COLUMN IF NOT EXISTS encerrado_operacionalmente BOOLEAN DEFAULT FALSE COMMENT 'Indica se torneio foi encerrado operacionalmente para este participante'`,
      },
      // 4. Participantes - data encerramento
      {
        name: '4. Adicionar data_encerramento_operacional',
        sql: `ALTER TABLE participantes_torneios ADD COLUMN IF NOT EXISTS data_encerramento_operacional DATETIME DEFAULT NULL COMMENT 'Timestamp de quando o torneio foi encerrado operacionalmente'`,
      },
      // 5. Participantes - elegível certificado
      {
        name: '5. Adicionar elegivel_certificado',
        sql: `ALTER TABLE participantes_torneios ADD COLUMN IF NOT EXISTS elegivel_certificado BOOLEAN DEFAULT FALSE COMMENT 'Indica se participante é elegível para certificado (top 3)'`,
      },
      // 6. Certificados - torneio_id
      {
        name: '6. Adicionar torneio_id na tabela certificados',
        sql: `ALTER TABLE certificados ADD COLUMN IF NOT EXISTS torneio_id INT DEFAULT NULL COMMENT 'ID do torneio associado ao certificado'`,
      },
      // 7. Certificados - auto_gerado
      {
        name: '7. Adicionar auto_gerado na tabela certificados',
        sql: `ALTER TABLE certificados ADD COLUMN IF NOT EXISTS auto_gerado BOOLEAN DEFAULT FALSE COMMENT 'Indica se foi gerado automaticamente pelo sistema'`,
      },
      // 8. FK constraint certificados
      {
        name: '8. Adicionar FK certificados -> torneios',
        sql: `ALTER TABLE certificados ADD CONSTRAINT IF NOT EXISTS fk_certificados_torneio FOREIGN KEY (torneio_id) REFERENCES torneios(id) ON DELETE CASCADE`,
      },
      // 9-13. Índices
      {
        name: '9. Índice participacao_ativa',
        sql: `ALTER TABLE participantes_torneios ADD INDEX IF NOT EXISTS idx_participacao_ativa (usuario_id, status, posicao_congelada) COMMENT 'Índice para queries de participação ativa'`,
      },
      {
        name: '10. Índice certificados usuario',
        sql: `ALTER TABLE certificados ADD INDEX IF NOT EXISTS idx_cert_usuario (usuario_id) COMMENT 'Índice para buscar certificados por usuário'`,
      },
      {
        name: '11. Índice certificados torneio',
        sql: `ALTER TABLE certificados ADD INDEX IF NOT EXISTS idx_cert_torneio (torneio_id) COMMENT 'Índice para buscar certificados por torneio'`,
      },
      {
        name: '12. Índice certificados auto_gerado',
        sql: `ALTER TABLE certificados ADD INDEX IF NOT EXISTS idx_cert_auto_torneio (auto_gerado, torneio_id) COMMENT 'Índice para certificados automáticos'`,
      },
      // 13. Índices torneios
      {
        name: '13. Índice tipo_torneio',
        sql: `ALTER TABLE torneios ADD INDEX IF NOT EXISTS idx_tipo_torneio (tipo_torneio) COMMENT 'Índice para filtrar por tipo'`,
      },
      {
        name: '14. Índice disciplina_especifica',
        sql: `ALTER TABLE torneios ADD INDEX IF NOT EXISTS idx_disciplina_especifica (disciplina_especifica) COMMENT 'Índice para filtrar por disciplina'`,
      },
    ];

    console.log(`📊 Executando ${migrations.length} migrations\n`);

    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      try {
        await sequelize.query(migration.sql);
        console.log(`✅ [${i + 1}/${migrations.length}] ${migration.name}`);
      } catch (err) {
        if (
          err.message.includes('already exists') ||
          err.message.includes('Duplicate') ||
          err.message.includes('CONSTRAINT')
        ) {
          console.log(`ℹ️  [${i + 1}/${migrations.length}] ${migration.name} (já existe)`);
        } else {
          console.error(`❌ [${i + 1}/${migrations.length}] ${migration.name}`);
          console.error(`   Erro: ${err.message}`);
          // Continuar com próximas migrations
        }
      }
    }

    // Verificar se colunas foram criadas
    console.log('\n📋 Verificando resultado da migração...\n');
    try {
      const result = await sequelize.query(`
        SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'comaes_db'
        AND TABLE_NAME IN ('torneios', 'certificados', 'participantes_torneios')
        AND COLUMN_NAME IN ('tipo_torneio', 'disciplina_especifica', 'auto_gerado', 'torneio_id', 'encerrado_operacionalmente', 'elegivel_certificado')
        ORDER BY TABLE_NAME, COLUMN_NAME
      `);
      
      if (result && result[0] && result[0].length > 0) {
        console.table(result[0]);
        console.log('\n🎉 Migrations completadas com sucesso!\n');
      } else {
        console.log('⚠️  Nenhuma coluna nova foi encontrada\n');
      }
    } catch (err) {
      console.log('⚠️  Erro ao verificar resultado:', err.message);
    }

    // Desconectar
    await sequelize.close();
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Erro ao executar migrations:', err.message);
    process.exit(1);
  }
}

runMigrations();
