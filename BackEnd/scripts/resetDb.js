/**
 * resetDb.js — Recria todas as tabelas do zero e insere um admin inicial.
 *
 * Uso: node scripts/resetDb.js
 *
 * Estratégia:
 *  1. Dropar o banco inteiro e recriar (garante limpeza total do InnoDB)
 *  2. Aplicar o schema.sql
 *  3. Inserir utilizador admin
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_NAME = process.env.DB_NAME || 'comaes_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

// Conexão SEM banco específico (para poder dropar/recriar o banco)
const rootSeq = new Sequelize('', DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
  dialectOptions: { connectTimeout: 10000 }
});

console.log('\n🔄 A conectar ao MySQL...');
await rootSeq.authenticate();
console.log('✅ Conectado!\n');

// ── 1. Dropar e recriar o banco ──────────────────────────────
console.log(`🗑️  A dropar banco "${DB_NAME}"...`);
await rootSeq.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
console.log(`🔨 A criar banco "${DB_NAME}"...`);
await rootSeq.query(`CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
console.log(`✅ Banco "${DB_NAME}" recriado.\n`);
await rootSeq.close();

// ── 2. Conexão com o banco recriado ──────────────────────────
const seq = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
  dialectOptions: { connectTimeout: 10000 },
  multipleStatements: true
});

await seq.authenticate();

// ── 3. Criar tabelas na ordem correcta (respeita FK) ─────────
console.log('📋 A criar tabelas...');

// Ordem que respeita as dependências de chave estrangeira
const createStatements = [
  // Tabelas sem dependências
  `CREATE TABLE IF NOT EXISTS \`funcoes\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`nome\` varchar(100) NOT NULL,
    \`permissoes\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`permissoes\`)),
    \`criado_em\` datetime DEFAULT NULL,
    \`atualizado_em\` datetime DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`nome\` (\`nome\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS \`conquistas\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`nome\` varchar(100) NOT NULL,
    \`descricao\` text DEFAULT NULL,
    \`criterios\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`criterios\`)),
    \`url_icone\` varchar(1024) DEFAULT NULL,
    \`criado_em\` datetime DEFAULT NULL,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS \`perguntas\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`ordem_indice\` int(11) NOT NULL,
    \`tipo\` enum('matematica','ingles','programacao','multipla_escolha','texto') NOT NULL,
    \`texto_pergunta\` text NOT NULL,
    \`opcao_a\` varchar(255) DEFAULT NULL,
    \`opcao_b\` varchar(255) DEFAULT NULL,
    \`opcao_c\` varchar(255) DEFAULT NULL,
    \`opcao_d\` varchar(255) DEFAULT NULL,
    \`resposta_correta\` enum('a','b','c','d') NOT NULL,
    \`pontos\` int(11) DEFAULT 1,
    \`midia\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`midia\`)),
    \`criado_em\` datetime DEFAULT NULL,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  // usuarios depende de funcoes
  `CREATE TABLE IF NOT EXISTS \`usuarios\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`nome\` varchar(100) NOT NULL,
    \`telefone\` varchar(20) NOT NULL,
    \`email\` varchar(100) NOT NULL,
    \`nascimento\` date NOT NULL,
    \`sexo\` enum('Masculino','Feminino') NOT NULL,
    \`password\` varchar(255) NOT NULL,
    \`escola\` varchar(255) DEFAULT NULL,
    \`imagem\` varchar(1024) DEFAULT NULL,
    \`createdAt\` datetime NOT NULL,
    \`updatedAt\` datetime NOT NULL,
    \`funcao_id\` int(11) DEFAULT NULL,
    \`isAdmin\` tinyint(1) NOT NULL DEFAULT 0,
    \`biografia\` text DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`email\` (\`email\`),
    UNIQUE KEY \`telefone\` (\`telefone\`),
    KEY \`funcao_id\` (\`funcao_id\`),
    CONSTRAINT \`usuarios_ibfk_1\` FOREIGN KEY (\`funcao_id\`) REFERENCES \`funcoes\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  // torneios depende de usuarios
  `CREATE TABLE IF NOT EXISTS \`torneios\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`titulo\` varchar(255) NOT NULL,
    \`descricao\` text DEFAULT NULL,
    \`inicia_em\` datetime DEFAULT NULL,
    \`termina_em\` datetime DEFAULT NULL,
    \`criado_por\` int(11) NOT NULL,
    \`status\` enum('rascunho','agendado','ativo','finalizado','cancelado') DEFAULT 'rascunho',
    \`criado_em\` datetime DEFAULT NULL,
    \`slug\` varchar(255) DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`torneios_criado_por\` (\`criado_por\`),
    KEY \`torneios_status\` (\`status\`),
    CONSTRAINT \`torneios_ibfk_1\` FOREIGN KEY (\`criado_por\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  // Tabelas que dependem de usuarios
  `CREATE TABLE IF NOT EXISTS \`configuracoes_usuario\` (
    \`usuario_id\` int(11) NOT NULL,
    \`preferencias\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`preferencias\`)),
    \`atualizado_em\` datetime DEFAULT NULL,
    PRIMARY KEY (\`usuario_id\`),
    CONSTRAINT \`configuracoes_usuario_ibfk_1\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS \`conquistas_usuario\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`usuario_id\` int(11) NOT NULL,
    \`conquista_id\` int(11) NOT NULL,
    \`concedido_em\` datetime DEFAULT NULL,
    \`concedido_por\` int(11) DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`conquistas_usuario_usuario_id_conquista_id\` (\`usuario_id\`,\`conquista_id\`),
    KEY \`conquista_id\` (\`conquista_id\`),
    KEY \`concedido_por\` (\`concedido_por\`),
    CONSTRAINT \`conquistas_usuario_ibfk_1\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`conquistas_usuario_ibfk_2\` FOREIGN KEY (\`conquista_id\`) REFERENCES \`conquistas\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`conquistas_usuario_ibfk_3\` FOREIGN KEY (\`concedido_por\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS \`noticias\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`titulo\` varchar(255) NOT NULL,
    \`slug\` varchar(255) NOT NULL,
    \`resumo\` text DEFAULT NULL,
    \`conteudo\` text NOT NULL,
    \`autor_id\` int(11) NOT NULL,
    \`tags\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`tags\`)),
    \`url_capa\` varchar(1024) DEFAULT NULL,
    \`publicado_em\` datetime DEFAULT NULL,
    \`publicado\` tinyint(1) DEFAULT 0,
    \`criado_em\` datetime DEFAULT NULL,
    \`atualizado_em\` datetime DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`slug\` (\`slug\`),
    KEY \`noticias_autor_id\` (\`autor_id\`),
    CONSTRAINT \`noticias_ibfk_1\` FOREIGN KEY (\`autor_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS \`notificacoes\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`usuario_id\` int(11) NOT NULL,
    \`tipo\` varchar(100) NOT NULL,
    \`conteudo\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`conteudo\`)),
    \`lido\` tinyint(1) DEFAULT 0,
    \`criado_em\` datetime DEFAULT NULL,
    \`lido_em\` datetime DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`notificacoes_usuario_id\` (\`usuario_id\`),
    CONSTRAINT \`notificacoes_ibfk_1\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS \`redefinicoes_senha\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`usuario_id\` int(11) NOT NULL,
    \`hash_token\` varchar(255) NOT NULL,
    \`expira_em\` datetime NOT NULL,
    \`usado_em\` datetime DEFAULT NULL,
    \`criado_em\` datetime DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`usuario_id\` (\`usuario_id\`),
    CONSTRAINT \`redefinicoes_senha_ibfk_1\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS \`tentativas_teste\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`usuario_id\` int(11) NOT NULL,
    \`iniciado_em\` datetime DEFAULT NULL,
    \`concluido_em\` datetime DEFAULT NULL,
    \`respostas\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`respostas\`)),
    \`pontuacao\` decimal(10,2) DEFAULT NULL,
    \`status\` enum('em_progresso','concluida','cancelada') DEFAULT 'em_progresso',
    \`duracao_segundos\` int(11) DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`tentativas_teste_usuario_id\` (\`usuario_id\`),
    CONSTRAINT \`tentativas_teste_ibfk_1\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS \`tickets_suporte\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`usuario_id\` int(11) DEFAULT NULL,
    \`assunto\` varchar(255) NOT NULL,
    \`mensagem\` text NOT NULL,
    \`status\` enum('aberto','pendente','fechado') DEFAULT 'aberto',
    \`prioridade\` enum('baixa','media','alta') DEFAULT 'media',
    \`atribuido_para\` int(11) DEFAULT NULL,
    \`criado_em\` datetime DEFAULT NULL,
    \`atualizado_em\` datetime DEFAULT NULL,
    \`fechado_em\` datetime DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`tickets_suporte_usuario_id\` (\`usuario_id\`),
    KEY \`atribuido_para\` (\`atribuido_para\`),
    CONSTRAINT \`tickets_suporte_ibfk_1\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT \`tickets_suporte_ibfk_2\` FOREIGN KEY (\`atribuido_para\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  // Tabelas que dependem de torneios
  `CREATE TABLE IF NOT EXISTS \`participantes_torneios\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`torneio_id\` int(11) NOT NULL,
    \`usuario_id\` int(11) NOT NULL,
    \`entrou_em\` datetime DEFAULT NULL,
    \`status\` enum('pendente','confirmado','removido','desclassificado') DEFAULT 'pendente',
    \`pontuacao\` decimal(10,2) DEFAULT 0.00,
    \`posicao\` int(11) DEFAULT NULL,
    \`casos_resolvidos\` int(11) DEFAULT 0,
    \`disciplina_competida\` enum('Matemática','Inglês','Programação') NOT NULL,
    \`ultima_atividade\` datetime DEFAULT NULL,
    \`tempo_total\` int(11) DEFAULT 0,
    \`precisao\` decimal(5,2) DEFAULT 0.00,
    \`nivel_atual\` enum('iniciante','intermediário','avançado','expert') DEFAULT 'iniciante',
    \`conquistas\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`conquistas\`)),
    \`historico_pontuacao\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`historico_pontuacao\`)),
    \`metadados\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`metadados\`)),
    \`criado_em\` datetime NOT NULL,
    \`atualizado_em\` datetime NOT NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`unique_participacao_disciplina\` (\`torneio_id\`,\`usuario_id\`,\`disciplina_competida\`),
    KEY \`participantes_torneios_torneio_id\` (\`torneio_id\`),
    KEY \`participantes_torneios_usuario_id\` (\`usuario_id\`),
    CONSTRAINT \`participantes_torneios_ibfk_1\` FOREIGN KEY (\`torneio_id\`) REFERENCES \`torneios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`participantes_torneios_ibfk_2\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS \`questoes_matematica\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`titulo\` varchar(255) NOT NULL,
    \`descricao\` text NOT NULL,
    \`dificuldade\` enum('facil','medio','dificil') NOT NULL,
    \`torneio_id\` int(11) NOT NULL,
    \`resposta_correta\` text NOT NULL,
    \`opcoes\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`opcoes\`)),
    \`pontos\` int(11) DEFAULT 10,
    \`midia\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`midia\`)),
    \`criado_em\` datetime DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`questoes_matematica_torneio_id\` (\`torneio_id\`),
    CONSTRAINT \`questoes_matematica_ibfk_1\` FOREIGN KEY (\`torneio_id\`) REFERENCES \`torneios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS \`questoes_programacao\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`titulo\` varchar(255) NOT NULL,
    \`descricao\` text NOT NULL,
    \`dificuldade\` enum('facil','medio','dificil') NOT NULL,
    \`torneio_id\` int(11) NOT NULL,
    \`resposta_correta\` text NOT NULL,
    \`opcoes\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`opcoes\`)),
    \`pontos\` int(11) DEFAULT 15,
    \`midia\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`midia\`)),
    \`linguagem\` varchar(50) DEFAULT NULL,
    \`criado_em\` datetime DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`questoes_programacao_torneio_id\` (\`torneio_id\`),
    CONSTRAINT \`questoes_programacao_ibfk_1\` FOREIGN KEY (\`torneio_id\`) REFERENCES \`torneios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS \`questoes_ingles\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`titulo\` varchar(255) NOT NULL,
    \`descricao\` text NOT NULL,
    \`dificuldade\` enum('facil','medio','dificil') NOT NULL,
    \`torneio_id\` int(11) NOT NULL,
    \`resposta_correta\` text NOT NULL,
    \`opcoes\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`opcoes\`)),
    \`pontos\` int(11) DEFAULT 10,
    \`midia\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`midia\`)),
    \`criado_em\` datetime DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`questoes_ingles_torneio_id\` (\`torneio_id\`),
    CONSTRAINT \`questoes_ingles_ibfk_1\` FOREIGN KEY (\`torneio_id\`) REFERENCES \`torneios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  // Tabelas de certificados
  `CREATE TABLE IF NOT EXISTS \`certificados\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`usuario_id\` int(11) NOT NULL,
    \`torneio_id\` int(11) NOT NULL,
    \`emitido_em\` datetime DEFAULT NULL,
    \`url_pdf\` varchar(1024) DEFAULT NULL,
    \`codigo_verificacao\` varchar(100) DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`certificados_usuario_id\` (\`usuario_id\`),
    KEY \`certificados_torneio_id\` (\`torneio_id\`),
    CONSTRAINT \`certificados_ibfk_1\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`certificados_ibfk_2\` FOREIGN KEY (\`torneio_id\`) REFERENCES \`torneios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS \`certificates\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`usuario_id\` int(11) NOT NULL,
    \`torneio_id\` int(11) NOT NULL,
    \`emitido_em\` datetime DEFAULT NULL,
    \`url_pdf\` varchar(1024) DEFAULT NULL,
    \`codigo_verificacao\` varchar(100) DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`certificates_usuario_id\` (\`usuario_id\`),
    KEY \`certificates_torneio_id\` (\`torneio_id\`),
    CONSTRAINT \`certificates_ibfk_1\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`certificates_ibfk_2\` FOREIGN KEY (\`torneio_id\`) REFERENCES \`torneios\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
];

let ok = 0, failed = 0;
for (const stmt of createStatements) {
  // Extrair nome da tabela para log
  const match = stmt.match(/CREATE TABLE IF NOT EXISTS `(\w+)`/);
  const tableName = match ? match[1] : '?';
  try {
    await seq.query(stmt);
    console.log(`  ✅ ${tableName}`);
    ok++;
  } catch (e) {
    console.warn(`  ❌ ${tableName}: ${e.message}`);
    failed++;
  }
}

console.log(`\n✅ Tabelas criadas: ${ok} | Falhas: ${failed}\n`);

// Verificar se a tabela usuarios foi criada
const [tables] = await seq.query(`SHOW TABLES LIKE 'usuarios'`);
if (tables.length === 0) {
  console.error('❌ Tabela "usuarios" não foi criada. Verifica o schema.sql.');
  process.exit(1);
}
console.log('✅ Tabela "usuarios" confirmada.\n');

// ── 4. Inserir utilizador admin ──────────────────────────────
const adminData = {
  nome:       'Administrador',
  email:      'admin@comaes.ao',
  telefone:   '923000000',
  password:   'Admin@2026',
  nascimento: '2000-01-01',
  sexo:       'Masculino',
  isAdmin:    1,
};

const hash = await bcrypt.hash(adminData.password, 10);
const now  = new Date().toISOString().slice(0, 19).replace('T', ' ');

await seq.query(`
  INSERT INTO usuarios (nome, email, telefone, password, nascimento, sexo, isAdmin, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`, {
  replacements: [
    adminData.nome, adminData.email, adminData.telefone,
    hash, adminData.nascimento, adminData.sexo,
    adminData.isAdmin, now, now
  ]
});

console.log('👤 Utilizador admin criado!\n');
console.log('   Email    :', adminData.email);
console.log('   Senha    :', adminData.password);
console.log('   Telefone :', adminData.telefone);
console.log('\n⚠️  Muda a senha após o primeiro login!\n');

await seq.close();
process.exit(0);
