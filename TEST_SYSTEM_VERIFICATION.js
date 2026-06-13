/**
 * TEST_SYSTEM_VERIFICATION.js
 * Testes automáticos completos para verificar todas as implementações
 * - Restrições de torneios concorrentes
 * - Persistência de tipo_torneio
 * - Blocos de questões criados
 * - Validações de datas
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// Credenciais de teste (substitua com credenciais reais)
const TEST_ADMIN = {
  email: 'admin@example.com',
  password: 'admin123'
};

// Cores para output
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

let token = null;
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

// ============================================
// UTILIDADES
// ============================================

async function makeRequest(method, endpoint, data = null, customToken = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (customToken || token) {
      config.headers.Authorization = `Bearer ${customToken || token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    };
  }
}

function assert(condition, message) {
  if (condition) {
    log.success(message);
    testResults.passed++;
    return true;
  } else {
    log.error(message);
    testResults.failed++;
    return false;
  }
}

function assertWarn(condition, message) {
  if (!condition) {
    log.warn(message);
    testResults.warnings++;
  }
}

// ============================================
// TESTES
// ============================================

async function testLogin() {
  log.section('🔐 TESTE 1: Login do Admin');

  const result = await makeRequest('POST', '/api/auth/login', {
    email: TEST_ADMIN.email,
    password: TEST_ADMIN.password,
  });

  if (result.success && result.data.token) {
    token = result.data.token;
    log.success(`Login realizado. Token: ${token.substring(0, 20)}...`);
    assert(true, 'Admin autenticado com sucesso');
    return true;
  } else {
    log.error(`Erro ao fazer login: ${result.message}`);
    assert(false, 'Falha na autenticação do admin');
    return false;
  }
}

async function testBlocosExistem() {
  log.section('📋 TESTE 2: Blocos de Questões Existem');

  const result = await makeRequest('GET', '/api/blocos?limit=100');

  if (result.success) {
    // Extrair blocos corretamente (verificar múltiplos formatos)
    const blocos = result.data?.blocos || result.data?.data || result.data || [];
    const blocoArray = Array.isArray(blocos) ? blocos : [];
    
    log.info(`Total de blocos no sistema: ${blocoArray.length}`);

    // Verificar blocos específicos de matemática (IDs 22, 23, 24)
    const blockIds = [22, 23, 24];
    const matematicaBlocos = blocoArray.filter(b => blockIds.includes(b.id));

    assert(matematicaBlocos.length > 0, `Encontrados ${matematicaBlocos.length} blocos de Matemática (esperado >= 1)`);

    matematicaBlocos.forEach(bloco => {
      log.info(`  - Bloco ${bloco.id}: "${bloco.titulo}" (${bloco.total_questoes || 0} questões, Status: ${bloco.status})`);
      assert(bloco.disciplina === 'matematica', `Bloco ${bloco.id} é de Matemática`);
    });

    return true;
  } else {
    log.error(`Erro ao carregar blocos: ${result.message}`);
    assert(false, 'Blocos carregados com sucesso');
    return false;
  }
}

async function testQuestoesMatematicaExistem() {
  log.section('❓ TESTE 3: Questões de Matemática Existem');

  const result = await makeRequest('GET', '/api/teste-conhecimento/questoes?disciplina=matematica&limit=100');

  if (result.success) {
    const questoes = result.data?.data || result.data?.questoes || result.data || [];
    const questaoArray = Array.isArray(questoes) ? questoes : [];
    
    log.info(`Total de questões de Matemática: ${questaoArray.length}`);

    // Verificar IDs específicos (460-469)
    const matematicaIds = Array.from({ length: 10 }, (_, i) => 460 + i);
    const encontradas = questaoArray.filter(q => matematicaIds.includes(q.id));

    assert(encontradas.length >= 5, `Encontradas ${encontradas.length} questões esperadas (IDs 460-469)`);

    encontradas.slice(0, 3).forEach(questao => {
      log.info(`  - Questão ${questao.id}: "${questao.enunciado?.substring(0, 50)}..." (${questao.dificuldade})`);
    });

    return true;
  } else {
    log.error(`Erro ao carregar questões: ${result.message}`);
    assert(false, 'Questões carregadas com sucesso');
    return false;
  }
}

async function testCreateTournamentDraft() {
  log.section('✏️  TESTE 4: Criar Torneio em Rascunho (DEVE FUNCIONAR)');

  const futureDate = new Date();
  futureDate.setHours(futureDate.getHours() + 2);

  const payload = {
    titulo: `Teste Rascunho ${Date.now()}`,
    descricao: 'Torneio de teste em rascunho',
    status: 'rascunho',
    tipo_torneio: 'generico',
    inicia_em: futureDate.toISOString(),
    termina_em: new Date(futureDate.getTime() + 3600000).toISOString(),
    criado_por: 1, // ID do admin
  };

  const result = await makeRequest('POST', '/api/admin/torneos', payload);

  if (result.success && result.status === 201) {
    const torneio = result.data?.torneio || result.data;
    log.success(`Rascunho criado com ID: ${torneio.id}`);
    assert(torneio.status === 'rascunho', 'Status é "rascunho"');
    assert(torneio.tipo_torneio === 'generico', 'Tipo de torneio preservado');
    return { success: true, torneioId: torneio.id };
  } else {
    log.error(`Erro ao criar rascunho: ${result.statusText} (${result.status})`);
    assert(false, 'Rascunho criado com sucesso');
    return { success: false };
  }
}

async function testCreateActiveTournamentWithExistingActive() {
  log.section('⛔ TESTE 5: Criar Segundo Torneio Ativo (DEVE FALHAR COM 409)');

  // Primeiro, garantir que existe um torneio ativo
  log.info('Verificando se existe torneio ativo...');
  const listResult = await makeRequest('GET', '/api/admin/torneos');
  
  let activoExistente = false;
  if (listResult.success) {
    const torneios = Array.isArray(listResult.data) ? listResult.data : (listResult.data?.data || []);
    activoExistente = torneios.some(t => t.status === 'ativo');
    log.info(`Torneios ativos existentes: ${torneios.filter(t => t.status === 'ativo').length}`);
  }

  if (!activoExistente) {
    log.warn('Nenhum torneio ativo encontrado. Criando um para o teste...');
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    await makeRequest('POST', '/api/admin/torneos', {
      titulo: `Torneio Ativo para Teste ${Date.now()}`,
      descricao: 'Criado automaticamente para teste',
      status: 'ativo',
      tipo_torneio: 'generico',
      inicia_em: futureDate.toISOString(),
      termina_em: new Date(futureDate.getTime() + 3600000).toISOString(),
      criado_por: 1,
    });
  }

  // Agora tentar criar segundo ativo (deve falhar)
  const futureDate = new Date();
  futureDate.setHours(futureDate.getHours() + 4);

  const payload = {
    titulo: `Segundo Ativo ${Date.now()}`,
    descricao: 'Tentativa de criar segundo torneio ativo',
    status: 'ativo',
    tipo_torneio: 'especifico',
    disciplina_especifica: 'Matemática',
    inicia_em: futureDate.toISOString(),
    termina_em: new Date(futureDate.getTime() + 3600000).toISOString(),
    criado_por: 1,
  };

  const result = await makeRequest('POST', '/api/admin/torneos', payload);

  // Esperamos erro HTTP 409
  assert(
    result.status === 409,
    `Recebido status HTTP 409 (recebido: ${result.status})`
  );

  assert(
    result.data?.error === 'TOURNAMENT_CONFLICT',
    `Erro é "TOURNAMENT_CONFLICT" (recebido: ${result.data?.error})`
  );

  if (result.status === 409) {
    log.success(`Mensagem de erro: "${result.data.message}"`);
  } else {
    log.error(`Erro: esperado 409, recebido ${result.status}`);
  }

  return { success: result.status === 409 };
}

async function testTipoTorneioReadOnly() {
  log.section('🔒 TESTE 6: tipo_torneio é READ-ONLY após criação');

  // Criar um torneio específico
  const futureDate = new Date();
  futureDate.setHours(futureDate.getHours() + 5);

  const createPayload = {
    titulo: `Teste tipo_torneio ${Date.now()}`,
    descricao: 'Teste de proteção de tipo_torneio',
    status: 'rascunho',
    tipo_torneio: 'especifico',
    disciplina_especifica: 'Programação',
    inicia_em: futureDate.toISOString(),
    termina_em: new Date(futureDate.getTime() + 3600000).toISOString(),
    criado_por: 1,
  };

  const createResult = await makeRequest('POST', '/api/admin/torneos', createPayload);

  if (!createResult.success) {
    assert(false, 'Torneio criado para teste de READ-ONLY');
    return { success: false };
  }

  const torneio = createResult.data?.torneio || createResult.data;
  const torneioId = torneio.id;

  assert(torneio.tipo_torneio === 'especifico', `Tipo criado como "especifico"`);

  // Tentar editar para "generico" (deve ser ignorado ou rejeitado)
  const updatePayload = {
    titulo: torneio.titulo,
    tipo_torneio: 'generico', // Tentar mudar
    status: 'rascunho',
  };

  const updateResult = await makeRequest('PUT', `/api/admin/torneos/${torneioId}`, updatePayload);

  // Verificar se o tipo permanece como "especifico"
  const getResult = await makeRequest('GET', `/api/admin/torneos/${torneioId}`);

  if (getResult.success) {
    const torneioAtualizado = getResult.data?.torneio || getResult.data;
    assert(
      torneioAtualizado.tipo_torneio === 'especifico',
      `tipo_torneio permanece "especifico" (protegido contra mudança)`
    );
  } else {
    log.warn('Não foi possível verificar se tipo_torneio foi protegido');
  }

  return { success: true };
}

async function testDateValidation() {
  log.section('📅 TESTE 7: Validação de Data de Início');

  const now = new Date();
  const pastDate = new Date(now.getTime() - 3600000); // 1 hora atrás

  const payload = {
    titulo: `Teste Data Passada ${Date.now()}`,
    descricao: 'Teste de validação de data',
    status: 'ativo',
    tipo_torneio: 'generico',
    inicia_em: pastDate.toISOString(), // Data no passado
    termina_em: now.toISOString(),
    criado_por: 1,
  };

  const result = await makeRequest('POST', '/api/admin/torneos', payload);

  assert(
    result.status === 400,
    `Rejeitada data no passado (status: ${result.status})`
  );

  if (result.data?.message) {
    log.info(`Mensagem: "${result.data.message}"`);
  }

  return { success: result.status === 400 };
}

async function testMultipleDrafts() {
  log.section('📝 TESTE 8: Múltiplos Rascunhos Permitidos');

  const futureDate = new Date();
  futureDate.setHours(futureDate.getHours() + 3);

  let successCount = 0;

  for (let i = 1; i <= 3; i++) {
    const payload = {
      titulo: `Rascunho ${i} ${Date.now()}`,
      descricao: `Rascunho de teste número ${i}`,
      status: 'rascunho',
      tipo_torneio: 'generico',
      inicia_em: new Date(futureDate.getTime() + i * 3600000).toISOString(),
      termina_em: new Date(futureDate.getTime() + (i + 1) * 3600000).toISOString(),
      criado_por: 1,
    };

    const result = await makeRequest('POST', '/api/admin/torneos', payload);

    if (result.success && result.status === 201) {
      successCount++;
      log.success(`Rascunho ${i} criado`);
    } else {
      log.error(`Rascunho ${i} falhou`);
    }
  }

  assert(successCount === 3, `3 rascunhos criados com sucesso`);

  return { success: successCount === 3 };
}

// ============================================
// EXECUTAR TESTES
// ============================================

async function runAllTests() {
  log.section('🚀 INICIANDO TESTES DO SISTEMA');
  log.info(`Conectando em: ${API_BASE}`);

  // Teste 1: Login
  const loginOk = await testLogin();
  if (!loginOk) {
    log.error('Falha na autenticação. Abortando testes.');
    return;
  }

  // Teste 2: Blocos existem
  await testBlocosExistem();

  // Teste 3: Questões de Matemática
  await testQuestoesMatematicaExistem();

  // Teste 4: Criar rascunho
  await testCreateTournamentDraft();

  // Teste 5: Segundo ativo deve falhar
  await testCreateActiveTournamentWithExistingActive();

  // Teste 6: tipo_torneio READ-ONLY
  await testTipoTorneioReadOnly();

  // Teste 7: Validação de datas
  await testDateValidation();

  // Teste 8: Múltiplos rascunhos
  await testMultipleDrafts();

  // Resumo final
  log.section('📊 RESUMO DOS TESTES');
  console.log(`${colors.green}✅ Testes Passaram: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Testes Falharam: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Avisos: ${testResults.warnings}${colors.reset}`);

  const total = testResults.passed + testResults.failed;
  const percentual = total > 0 ? Math.round((testResults.passed / total) * 100) : 0;
  console.log(`\n${colors.cyan}Taxa de Sucesso: ${percentual}% (${testResults.passed}/${total})${colors.reset}\n`);

  if (testResults.failed === 0 && testResults.warnings === 0) {
    log.success('🎉 TODOS OS TESTES PASSARAM!');
  } else if (testResults.failed === 0) {
    log.warn('⚠️  Testes passaram mas com avisos');
  } else {
    log.error('Alguns testes falharam. Veja acima para detalhes.');
  }
}

// Executar
runAllTests().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
