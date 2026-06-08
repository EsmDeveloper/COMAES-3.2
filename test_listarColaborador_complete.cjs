/**
 * test_listarColaborador_complete.cjs
 * Script de teste completo para debug do listarColaborador
 * 
 * Uso: node test_listarColaborador_complete.cjs [TOKEN_AQUI]
 * 
 * Se não passar token, vai usar um token mock de teste
 */

const http = require('http');

// Cores para console
const cores = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(tipo, msg, detalhe = '') {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  const tipos = {
    '✓': `${cores.green}✓${cores.reset}`,
    '✗': `${cores.red}✗${cores.reset}`,
    'ℹ': `${cores.blue}ℹ${cores.reset}`,
    '⚠': `${cores.yellow}⚠${cores.reset}`
  };
  const icon = tipos[tipo] || tipo;
  console.log(`[${timestamp}] ${icon} ${msg}`);
  if (detalhe) console.log(`    ${cores.blue}${detalhe}${cores.reset}`);
}

function testarConexao(callback) {
  const opcoes = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/questoes', // Endpoint simples para testar conexão
    method: 'GET',
    timeout: 5000
  };

  log('ℹ', 'Testando conexão com servidor...');

  const req = http.request(opcoes, (res) => {
    log('✓', 'Servidor respondeu', `Status: ${res.statusCode}`);
    callback(true, res.statusCode);
  });

  req.on('error', (err) => {
    log('✗', 'Erro ao conectar no servidor', err.message);
    callback(false, null);
  });

  req.on('timeout', () => {
    log('✗', 'Timeout na conexão', 'Servidor não respondeu em 5 segundos');
    req.destroy();
    callback(false, null);
  });

  req.end();
}

function testarEndpointColaborador(token, callback) {
  const opcoes = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/colaborador/questoes',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    timeout: 5000
  };

  log('ℹ', 'Testando endpoint /api/colaborador/questoes');

  let dados = '';

  const req = http.request(opcoes, (res) => {
    res.on('data', (chunk) => { dados += chunk; });
    res.on('end', () => {
      try {
        const resposta = JSON.parse(dados);
        
        if (res.statusCode === 200) {
          log('✓', 'Endpoint respondeu com sucesso', `Status: 200`);
          const totalQuestoes = resposta?.dados?.questoes?.length || 0;
          log('ℹ', `Total de questões retornadas: ${totalQuestoes}`);
          callback(true, resposta);
        } else if (res.statusCode === 401) {
          log('✗', 'Erro 401: Não autenticado', 'Token inválido ou expirado');
          log('ℹ', 'Resposta do servidor:', JSON.stringify(resposta, null, 2));
          callback(false, resposta);
        } else if (res.statusCode === 403) {
          log('✗', 'Erro 403: Acesso negado', 'Você pode não ser um colaborador aprovado');
          log('ℹ', 'Resposta do servidor:', JSON.stringify(resposta, null, 2));
          callback(false, resposta);
        } else {
          log('⚠', `Endpoint retornou status ${res.statusCode}`, 'Verifique os logs do servidor');
          log('ℹ', 'Resposta:', JSON.stringify(resposta, null, 2));
          callback(false, resposta);
        }
      } catch (err) {
        log('✗', 'Erro ao parsear resposta JSON', err.message);
        log('ℹ', 'Resposta recebida:', dados);
        callback(false, null);
      }
    });
  });

  req.on('error', (err) => {
    log('✗', 'Erro ao conectar no endpoint', err.message);
    callback(false, null);
  });

  req.on('timeout', () => {
    log('✗', 'Timeout na requisição', 'Servidor não respondeu em 5 segundos');
    req.destroy();
    callback(false, null);
  });

  req.end();
}

// ============= MAIN =============

console.log(`\n${cores.bold}🔍 TESTE COMPLETO: listarColaborador${cores.reset}\n`);

let token = process.argv[2];
if (!token) {
  log('⚠', 'Nenhum token fornecido', 'Use: node test_listarColaborador_complete.cjs [TOKEN]');
  token = 'token_teste_mock'; // Token mock para teste inicial
}

log('ℹ', 'Token a usar:', token.substring(0, 20) + '...' + (token.length > 30 ? token.substring(token.length - 10) : ''));

console.log('');

// Teste 1: Conexão básica
testarConexao((conectado, statusCode) => {
  console.log('');

  if (!conectado) {
    log('✗', 'FALHA: Não é possível conectar ao servidor', 'Verifique se o backend está rodando');
    log('ℹ', 'Para iniciar o backend, execute:', 'cd BackEnd && npm start');
    process.exit(1);
  }

  if (statusCode !== 200) {
    log('⚠', `Servidor respondeu com status ${statusCode}`, 'Mas pode estar funcionando');
  }

  // Teste 2: Endpoint específico
  testarEndpointColaborador(token, (sucesso, resposta) => {
    console.log('');

    if (sucesso) {
      log('✓', 'TESTE CONCLUÍDO COM SUCESSO!');
      log('ℹ', 'O endpoint /api/colaborador/questoes está respondendo corretamente');
      
      if (resposta?.dados?.questoes?.length === 0) {
        log('ℹ', 'Você não tem questões criadas ainda', 'Crie sua primeira questão no painel');
      }
    } else {
      log('✗', 'TESTE FALHOU', 'Verifique a saída acima');
      
      if (resposta?.statusCode === 401 || resposta?.statusCode === 403) {
        log('ℹ', 'Próximos passos:');
        log('ℹ', '1. Verifique se você está logado no frontend');
        log('ℹ', '2. Verifique se seu token é válido (copie do localStorage)');
        log('ℹ', '3. Verifique se sua conta de colaborador foi aprovada');
      }
    }

    console.log('');
  });
});
