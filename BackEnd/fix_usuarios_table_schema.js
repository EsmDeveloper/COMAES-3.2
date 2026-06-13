/**
 * fix_usuarios_table_schema.js
 * 
 * Adiciona campos faltantes à tabela usuarios
 * Estes campos foram definidos no modelo User.js mas não existem na BD
 */

import sequelize from './config/db.js';

async function fixSchema() {
  try {
    console.log('🔧 Iniciando correção do schema da tabela usuarios...\n');

    const campos = [
      {
        nome: 'role',
        sql: "ALTER TABLE usuarios ADD COLUMN role ENUM('estudante', 'colaborador', 'admin') NOT NULL DEFAULT 'estudante' AFTER isAdmin"
      },
      {
        nome: 'username',
        sql: "ALTER TABLE usuarios ADD COLUMN username VARCHAR(50) UNIQUE AFTER role"
      },
      {
        nome: 'disciplina_colaborador',
        sql: "ALTER TABLE usuarios ADD COLUMN disciplina_colaborador ENUM('matematica', 'ingles', 'programacao') NULL AFTER username"
      },
      {
        nome: 'nivel_academico',
        sql: "ALTER TABLE usuarios ADD COLUMN nivel_academico ENUM('estudante_universitario', 'tecnico', 'licenciado', 'mestre', 'doutor', 'professor', 'profissional', 'outro') NULL AFTER disciplina_colaborador"
      },
      {
        nome: 'documentos_colaborador',
        sql: "ALTER TABLE usuarios ADD COLUMN documentos_colaborador JSON NULL AFTER nivel_academico"
      },
      {
        nome: 'status_colaborador',
        sql: "ALTER TABLE usuarios ADD COLUMN status_colaborador ENUM('pendente', 'aprovado', 'rejeitado', 'suspenso') NOT NULL DEFAULT 'pendente' AFTER documentos_colaborador"
      },
      {
        nome: 'xp_total',
        sql: "ALTER TABLE usuarios ADD COLUMN xp_total INT NOT NULL DEFAULT 0 AFTER status_colaborador"
      },
      {
        nome: 'nivel_atual',
        sql: "ALTER TABLE usuarios ADD COLUMN nivel_atual INT NOT NULL DEFAULT 1 AFTER xp_total"
      }
    ];

    for (const campo of campos) {
      try {
        console.log(`➕ Adicionando campo: ${campo.nome}...`);
        await sequelize.query(campo.sql);
        console.log(`   ✅ Campo "${campo.nome}" adicionado com sucesso!\n`);
      } catch (err) {
        if (err.message.includes('Duplicate column name')) {
          console.log(`   ℹ️  Campo "${campo.nome}" já existe, pulando...\n`);
        } else {
          console.error(`   ❌ Erro ao adicionar "${campo.nome}":`, err.message, '\n');
        }
      }
    }

    console.log('🎉 Schema corrigido com sucesso!');
    console.log('\n📋 Próxima etapa:');
    console.log('1. Reinicie o backend');
    console.log('2. Novo colaborador pode ser registrado');
    console.log('3. Admin pode aprovar sem erro');

  } catch (err) {
    console.error('❌ Erro crítico:', err);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixSchema();
