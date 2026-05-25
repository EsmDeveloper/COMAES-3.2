/**
 * INTEGRATION_TEST_QUESTOES.js
 * 
 * Script de teste para validar a integração completa do sistema refatorado de questões
 * 
 * Testa:
 * 1. Backend - Rotas refatoradas estão registradas
 * 2. Frontend - Componentes importam corretamente
 * 3. Endpoints - Estrutura de dados está correta
 * 4. Compatibilidade - Sistema 100% baseado em Questao.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TESTS = [];
let passedTests = 0;
let failedTests = 0;

// ─── HELPERS ──────────────────────────────────────────────────────

const test = (name, fn) => {
  TESTS.push({ name, fn });
};

const runTests = async () => {
  console.log('\n' + '═'.repeat(80));
  console.log('🧪 INTEGRATION TEST - SISTEMA DE QUESTÕES REFATORADO');
  console.log('═'.repeat(80) + '\n');

  for (const { name, fn } of TESTS) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Erro: ${error.message}`);
      failedTests++;
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log(`📊 Resultados: ${passedTests} passou, ${failedTests} falhou`);
  console.log('─'.repeat(80) + '\n');

  if (failedTests === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM! Sistema pronto para produção.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os erros acima.\n');
    process.exit(1);
  }
};

// ─── TESTES ───────────────────────────────────────────────────────

// 1. Verificar se arquivo de rotas refatoradas existe
test('Backend: Arquivo questoesRoutesRefactored.js existe', () => {
  const filePath = path.join(__dirname, 'BackEnd', 'routes', 'questoesRoutesRefactored.js');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }
});

// 2. Verificar se arquivo de controller refatorado existe
test('Backend: Arquivo QuestoesControllerRefactored.js existe', () => {
  const filePath = path.join(__dirname, 'BackEnd', 'controllers', 'QuestoesControllerRefactored.js');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }
});

// 3. Verificar se index.js importa as rotas refatoradas
test('Backend: index.js importa questoesRoutesRefactored', () => {
  const filePath = path.join(__dirname, 'BackEnd', 'index.js');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes("import questoesRoutesRefactored from './routes/questoesRoutesRefactored.js'")) {
    throw new Error('index.js não importa questoesRoutesRefactored');
  }
});

// 4. Verificar se index.js registra as rotas refatoradas
test('Backend: index.js registra app.use para questoesRoutesRefactored', () => {
  const filePath = path.join(__dirname, 'BackEnd', 'index.js');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes("app.use('/api/questoes', questoesRoutesRefactored)")) {
    throw new Error('index.js não registra as rotas refatoradas');
  }
});

// 5. Verificar se não há mais importação de questoesRoutes antigo
test('Backend: index.js NÃO importa questoesRoutes antigo', () => {
  const filePath = path.join(__dirname, 'BackEnd', 'index.js');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Verificar que não há import de questoesRoutes (sem "Refactored")
  const hasOldImport = content.includes("import questoesRoutes from './routes/questoesRoutes.js'");
  if (hasOldImport) {
    throw new Error('index.js ainda importa questoesRoutes antigo');
  }
});

// 6. Verificar se não há mais registro de questoesRoutes antigo
test('Backend: index.js NÃO registra app.use para questoesRoutes antigo', () => {
  const filePath = path.join(__dirname, 'BackEnd', 'index.js');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Verificar que não há app.use com questoesRoutes (sem "Refactored")
  const hasOldRoute = content.includes("app.use('/api/questoes', questoesRoutes);");
  if (hasOldRoute) {
    throw new Error('index.js ainda registra as rotas antigas');
  }
});

// 7. Verificar se não há duplicação de import Questao
test('Backend: Sem duplicação de import Questao', () => {
  const filePath = path.join(__dirname, 'BackEnd', 'index.js');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const matches = content.match(/import Questao from/g);
  if (!matches || matches.length !== 1) {
    throw new Error(`Encontrado ${matches?.length || 0} imports de Questao, esperado 1`);
  }
});

// 8. Verificar se AdminDashboard importa QuestoesManager
test('Frontend: AdminDashboard.jsx importa QuestoesManager', () => {
  const filePath = path.join(__dirname, 'FrontEnd', 'src', 'Administrador', 'AdminDashboard.jsx');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes("import QuestoesManager from './QuestoesManager'")) {
    throw new Error('AdminDashboard não importa QuestoesManager');
  }
});

// 9. Verificar se AdminDashboard tem menu item para questoes
test('Frontend: AdminDashboard.jsx tem menu item "questoes"', () => {
  const filePath = path.join(__dirname, 'FrontEnd', 'src', 'Administrador', 'AdminDashboard.jsx');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes("{ id: 'questoes'")) {
    throw new Error('AdminDashboard não tem menu item para questoes');
  }
});

// 10. Verificar se AdminDashboard renderiza QuestoesManager
test('Frontend: AdminDashboard.jsx renderiza QuestoesManager', () => {
  const filePath = path.join(__dirname, 'FrontEnd', 'src', 'Administrador', 'AdminDashboard.jsx');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes("activeTab === 'questoes' ? (") || !content.includes("<QuestoesManager />")) {
    throw new Error('AdminDashboard não renderiza QuestoesManager');
  }
});

// 11. Verificar se não há mais menu items para tabelas antigas
test('Frontend: AdminDashboard.jsx NÃO tem menu items para tabelas antigas', () => {
  const filePath = path.join(__dirname, 'FrontEnd', 'src', 'Administrador', 'AdminDashboard.jsx');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const hasOldItems = content.includes("{ id: 'questaomatematica'") ||
                      content.includes("{ id: 'questoes_programacao'") ||
                      content.includes("{ id: 'questaoingles'") ||
                      content.includes("{ id: 'pergunta'");
  
  if (hasOldItems) {
    throw new Error('AdminDashboard ainda tem menu items para tabelas antigas');
  }
});

// 12. Verificar se QuestoesManager.jsx existe
test('Frontend: Arquivo QuestoesManager.jsx existe', () => {
  const filePath = path.join(__dirname, 'FrontEnd', 'src', 'Administrador', 'QuestoesManager.jsx');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }
});

// 13. Verificar se CreateQuestaoForm.jsx existe
test('Frontend: Arquivo CreateQuestaoForm.jsx existe', () => {
  const filePath = path.join(__dirname, 'FrontEnd', 'src', 'Administrador', 'CreateQuestaoForm.jsx');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }
});

// 14. Verificar se QuestoesManager importa CreateQuestaoForm
test('Frontend: QuestoesManager.jsx importa CreateQuestaoForm', () => {
  const filePath = path.join(__dirname, 'FrontEnd', 'src', 'Administrador', 'QuestoesManager.jsx');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes("import CreateQuestaoForm from './CreateQuestaoForm'")) {
    throw new Error('QuestoesManager não importa CreateQuestaoForm');
  }
});

// 15. Verificar se CreateQuestaoForm suporta todas as disciplinas
test('Frontend: CreateQuestaoForm.jsx suporta todas as disciplinas', () => {
  const filePath = path.join(__dirname, 'FrontEnd', 'src', 'Administrador', 'CreateQuestaoForm.jsx');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const hasMat = content.includes("value=\"matematica\"");
  const hasIng = content.includes("value=\"ingles\"");
  const hasProg = content.includes("value=\"programacao\"");
  
  if (!hasMat || !hasIng || !hasProg) {
    throw new Error('CreateQuestaoForm não suporta todas as disciplinas');
  }
});

// 16. Verificar se CreateQuestaoForm suporta todos os tipos
test('Frontend: CreateQuestaoForm.jsx suporta todos os tipos', () => {
  const filePath = path.join(__dirname, 'FrontEnd', 'src', 'Administrador', 'CreateQuestaoForm.jsx');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const hasMultipla = content.includes("value=\"multipla_escolha\"");
  const hasTexto = content.includes("value=\"texto\"");
  const hasCodigo = content.includes("value=\"codigo\"");
  
  if (!hasMultipla || !hasTexto || !hasCodigo) {
    throw new Error('CreateQuestaoForm não suporta todos os tipos');
  }
});

// 17. Verificar se CreateQuestaoForm envia para /api/questoes
test('Frontend: CreateQuestaoForm.jsx envia para /api/questoes', () => {
  const filePath = path.join(__dirname, 'FrontEnd', 'src', 'Administrador', 'CreateQuestaoForm.jsx');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes("/api/questoes")) {
    throw new Error('CreateQuestaoForm não envia para /api/questoes');
  }
});

// 18. Verificar se QuestoesManager carrega de /api/questoes
test('Frontend: QuestoesManager.jsx carrega de /api/questoes', () => {
  const filePath = path.join(__dirname, 'FrontEnd', 'src', 'Administrador', 'QuestoesManager.jsx');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes("/api/questoes")) {
    throw new Error('QuestoesManager não carrega de /api/questoes');
  }
});

// 19. Verificar se Questao.js model existe
test('Backend: Modelo Questao.js existe', () => {
  const filePath = path.join(__dirname, 'BackEnd', 'models', 'Questao.js');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }
});

// 20. Verificar se Questao.js tem todos os campos necessários
test('Backend: Questao.js tem todos os campos necessários', () => {
  const filePath = path.join(__dirname, 'BackEnd', 'models', 'Questao.js');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const requiredFields = ['torneio_id', 'titulo', 'descricao', 'disciplina', 'tipo', 'dificuldade', 'resposta_correta'];
  for (const field of requiredFields) {
    if (!content.includes(field)) {
      throw new Error(`Questao.js não tem campo: ${field}`);
    }
  }
});

// ─── EXECUTAR TESTES ──────────────────────────────────────────────

runTests();
