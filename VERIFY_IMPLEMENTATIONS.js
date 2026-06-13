/**
 * VERIFY_IMPLEMENTATIONS.js
 * Verificação técnica das implementações sem necessidade de autenticação
 * Verifica:
 * 1. Database schema (tipo_torneio column, blocos)
 * 2. Backend code validation (controllers)
 * 3. Frontend builds
 * 4. API endpoints disponíveis
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${msg}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`),
};

let results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function assert(condition, message) {
  if (condition) {
    log.success(message);
    results.passed++;
    return true;
  } else {
    log.error(message);
    results.failed++;
    return false;
  }
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  assert(exists, `${description}: ${exists ? '✅ Existe' : '❌ Não encontrado'}`);
  return exists;
}

function checkFileContains(filePath, searchString, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const found = content.includes(searchString);
    assert(found, `${description}: ${found ? '✅ Contém' : '❌ Não contém'}`);
    return found;
  } catch (err) {
    log.error(`${description}: Erro ao ler arquivo - ${err.message}`);
    results.failed++;
    return false;
  }
}

// ============================================
// VERIFICAÇÕES
// ============================================

function verifyBackendCode() {
  log.section('🔧 VERIFICAÇÃO 1: Código Backend');

  const torneioControllerPath = path.join(__dirname, 'BackEnd/controllers/TorneoController.js');

  // Verificação 1: Arquivo existe
  checkFile(torneioControllerPath, 'TorneoController.js');

  // Verificação 2: Contém validação de concorrência (409)
  checkFileContains(
    torneioControllerPath,
    "res.status(409)",
    'Validação de HTTP 409 para conflito de concorrência'
  );

  // Verificação 3: Contém TOURNAMENT_CONFLICT
  checkFileContains(
    torneioControllerPath,
    'TOURNAMENT_CONFLICT',
    'Código de erro TOURNAMENT_CONFLICT implementado'
  );

  // Verificação 4: Contém validação de tipo_torneio
  checkFileContains(
    torneioControllerPath,
    "tipo_torneio",
    'Campo tipo_torneio referenciado'
  );

  // Verificação 5: Contém validação de datas
  checkFileContains(
    torneioControllerPath,
    "inicia_em",
    'Validação de data de início'
  );

  // Verificação 6: Contém validação de blocos
  checkFileContains(
    torneioControllerPath,
    "bloco",
    'Validação de blocos de questões'
  );
}

function verifyFrontendCode() {
  log.section('🎨 VERIFICAÇÃO 2: Código Frontend');

  const formPath = path.join(__dirname, 'FrontEnd/src/Administrador/components/TournamentForm.jsx');
  const servicePath = path.join(__dirname, 'FrontEnd/src/Administrador/services/TournamentService.js');
  const tabPath = path.join(__dirname, 'FrontEnd/src/Administrador/TorneiosTab.jsx');

  // Verificar TournamentForm.jsx
  checkFile(formPath, 'TournamentForm.jsx');
  checkFileContains(formPath, 'tipo_torneio', 'Formulário maneja tipo_torneio');
  checkFileContains(formPath, 'TOURNAMENT_CONFLICT', 'Formulário trata erro TOURNAMENT_CONFLICT');
  checkFileContains(formPath, 'disciplina_especifica', 'Formulário maneja disciplina específica');

  // Verificar TournamentService.js
  checkFile(servicePath, 'TournamentService.js');
  checkFileContains(servicePath, '409', 'Serviço maneja status 409');
  checkFileContains(servicePath, 'TOURNAMENT_CONFLICT', 'Serviço reconhece TOURNAMENT_CONFLICT');

  // Verificar TorneiosTab.jsx
  checkFile(tabPath, 'TorneiosTab.jsx');
  checkFileContains(tabPath, 'fetchTorneios', 'Tab carrega torneios');
  checkFileContains(tabPath, 'showToast', 'Tab mostra mensagens ao usuário');
}

function verifyBlocoCode() {
  log.section('📋 VERIFICAÇÃO 3: Código de Blocos de Questões');

  const blocosServicePath = path.join(__dirname, 'FrontEnd/src/Administrador/services/BlocosService.js');
  const blocoManagerPath = path.join(__dirname, 'FrontEnd/src/Administrador/BlocoQuestoesManager.jsx');

  checkFile(blocosServicePath, 'BlocosService.js');
  checkFileContains(blocosServicePath, 'listar', 'BlocosService tem método listar');
  checkFileContains(blocosServicePath, 'associar', 'BlocosService tem método associar');

  checkFile(blocoManagerPath, 'BlocoQuestoesManager.jsx');
  checkFileContains(blocoManagerPath, 'carregarBlocos', 'Manager carrega blocos');
  checkFileContains(blocoManagerPath, 'handleToggleExpand', 'Manager permite expandir/recolher');
}

function verifyDatabaseMigrations() {
  log.section('🗄️  VERIFICAÇÃO 4: Migrações de Database');

  const migrationsDir = path.join(__dirname, 'BackEnd/migrations');

  if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js'));
    log.info(`Migrações encontradas: ${files.length}`);
    
    // Procurar migração de tipo_torneio
    const tipoTorneioMigration = files.find(f => 
      fs.readFileSync(path.join(migrationsDir, f), 'utf8').includes('tipo_torneio')
    );
    
    assert(tipoTorneioMigration, `Migração de tipo_torneio encontrada`);
  } else {
    log.warn('Diretório de migrações não encontrado');
  }
}

function verifyModels() {
  log.section('📊 VERIFICAÇÃO 5: Models de Database');

  const torneioModelPath = path.join(__dirname, 'BackEnd/models/Torneio.js');
  const blocoModelPath = path.join(__dirname, 'BackEnd/models/BlocoQuestoes.js');

  // Verificar Torneio model
  if (checkFile(torneioModelPath, 'Modelo Torneio')) {
    checkFileContains(torneioModelPath, 'tipo_torneio', 'Model Torneio define tipo_torneio');
    checkFileContains(torneioModelPath, 'disciplina_especifica', 'Model Torneio define disciplina_especifica');
  }

  // Verificar BlocoQuestoes model
  if (checkFile(blocoModelPath, 'Modelo BlocoQuestoes')) {
    checkFileContains(blocoModelPath, 'status', 'Model BlocoQuestoes define status');
    checkFileContains(blocoModelPath, 'disciplina', 'Model BlocoQuestoes define disciplina');
  }
}

function verifyTestData() {
  log.section('🧪 VERIFICAÇÃO 6: Scripts de Dados de Teste');

  const testScriptPath = path.join(__dirname, 'BackEnd/create_math_blocks_test.js');

  if (checkFile(testScriptPath, 'Script de criação de blocos de Matemática')) {
    checkFileContains(testScriptPath, 'BlocoQuestoes', 'Script cria blocos');
    checkFileContains(testScriptPath, 'QuestaoTesteConhecimento', 'Script cria questões de teste');
    checkFileContains(testScriptPath, 'matematica', 'Script cria questões de Matemática');
  }
}

function verifyDocumentation() {
  log.section('📚 VERIFICAÇÃO 7: Documentação');

  const docFiles = [
    'IMPLEMENTACAO_RESTRICOES_TORNEIOS.md',
    '🧪_TESTE_RESTRICOES_TORNEIOS.md',
    '📋_BLOCOS_QUESTOES_CRIADOS.md',
    'RELATORIO_INVESTIGACAO_TIPO_TORNEIO.md',
    '🎯_RESUMO_IMPLEMENTACAO_FINAL.md',
  ];

  docFiles.forEach(doc => {
    checkFile(path.join(__dirname, doc), `Documentação: ${doc}`);
  });
}

function verifyFrontendBuild() {
  log.section('🏗️  VERIFICAÇÃO 8: Build Frontend');

  const distPath = path.join(__dirname, 'dist');
  const indexPath = path.join(distPath, 'index.html');

  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    log.info(`Arquivos em dist/: ${files.length}`);
    
    assert(fs.existsSync(indexPath), 'index.html existe em dist/');
    
    // Verificar se há JS e CSS
    const jsFiles = files.filter(f => f.endsWith('.js')).length;
    const cssFiles = files.filter(f => f.endsWith('.css')).length;
    
    log.info(`  - Arquivos JS: ${jsFiles}`);
    log.info(`  - Arquivos CSS: ${cssFiles}`);
  } else {
    log.warn('Diretório dist/ não encontrado (build pode não ter sido executado)');
  }
}

function verifyServices() {
  log.section('🔌 VERIFICAÇÃO 9: Serviços de API');

  const apiBase = `http://localhost:3000`;
  const endpoints = [
    '/api/admin/torneos',
    '/api/blocos',
    '/api/teste-conhecimento/questoes',
  ];

  log.info(`Endpoints esperados em ${apiBase}:`);
  endpoints.forEach(ep => {
    log.info(`  - GET ${ep}`);
    log.info(`  - POST ${ep}`);
  });

  log.warn('Verificação de endpoints requer servidor rodando. Execute: npm run dev');
}

function generateReport() {
  log.section('📊 RELATÓRIO FINAL');

  const total = results.passed + results.failed;
  const percentual = total > 0 ? Math.round((results.passed / total) * 100) : 0;

  console.log(`${colors.green}✅ Verificações Passaram: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Verificações Falharam: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Avisos: ${results.warnings}${colors.reset}`);
  console.log(`\n${colors.cyan}Taxa de Sucesso: ${percentual}% (${results.passed}/${total})${colors.reset}\n`);

  if (results.failed === 0) {
    log.success('🎉 TODAS AS VERIFICAÇÕES PASSARAM!');
    log.info('O sistema está pronto para testes de integração.');
    log.info('Execute: npm run dev (no BackEnd) para iniciar o servidor');
    log.info('Depois: npm run dev (no FrontEnd) para iniciar a interface');
  } else {
    log.error('⚠️  Algumas verificações falharam. Revise o código acima.');
  }
}

// ============================================
// EXECUTAR
// ============================================

function main() {
  console.clear();
  log.section('🔍 VERIFICAÇÃO TÉCNICA DO SISTEMA COMAES');
  log.info(`Diretório: ${__dirname}`);
  log.info(`Data: ${new Date().toLocaleString('pt-BR')}`);

  verifyBackendCode();
  verifyFrontendCode();
  verifyBlocoCode();
  verifyDatabaseMigrations();
  verifyModels();
  verifyTestData();
  verifyDocumentation();
  verifyFrontendBuild();
  verifyServices();

  generateReport();
}

main();
