/**
 * Script de Teste - API de Tentativas
 * Testa os endpoints de persistência de respostas
 * 
 * Uso: node scripts/testTentativas.js
 */

import sequelize from '../config/db.js';
import User from '../models/User.js';
import Torneio from '../models/Torneio.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import Pergunta from '../models/Pergunta.js';
import TentativaResposta from '../models/TentativaResposta.js';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:3000';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

let testsPassed = 0;
let testsFailed = 0;

async function setupTestData() {
  log.info('Preparando dados de teste...');

  try {
    // Criar usuário de teste
    const usuario = await User.create({
      nome: 'Teste Tentativas',
      email: `teste-tentativas-${Date.now()}@test.com`,
      telefone: '923456789',
      nascimento: '2000-01-01',
      sexo: 'M',
      password: 'TestPassword123!',
      ativo: true,
    });

    log.success(`Usuário criado: ${usuario.id}`);

    // Criar torneio de teste
    const torneio = await Torneio.create({
      nome: 'Torneio Teste Tentativas',
      descricao: 'Torneio para testar API de tentativas',
      data_inicio: new Date(),
      data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'ativo',
      criado_por: usuario.id,
    });

    log.success(`Torneio criado: ${torneio.id}`);

    // Inscrever usuário no torneio
    const participante = await ParticipanteTorneio.create({
      usuario_id: usuario.id,
      torneio_id: torneio.id,
      disciplina_competida: 'Matemática',
      status: 'confirmado',
    });

    log.success(`Participante inscrito: ${participante.id}`);

    // Criar questões de teste
    const questoes = await Pergunta.bulkCreate([
      {
        ordem_indice: 1,
        tipo: 'matematica',
        texto_pergunta: 'Quanto é 2 + 2?',
        opcao_a: '3',
        opcao_b: '4',
        opcao_c: '5',
        opcao_d: '6',
        resposta_correta: 'b',
        dificuldade: 'facil',
        pontos: 1,
      },
      {
        ordem_indice: 2,
        tipo: 'matematica',
        texto_pergunta: 'Quanto é 5 * 5?',
        opcao_a: '20',
        opcao_b: '25',
        opcao_c: '30',
        opcao_d: '35',
        resposta_correta: 'b',
        dificuldade: 'facil',
        pontos: 1,
      },
      {
        ordem_indice: 3,
        tipo: 'matematica',
        texto_pergunta: 'Quanto é 10 / 2?',
        opcao_a: '3',
        opcao_b: '4',
        opcao_c: '5',
        opcao_d: '6',
        resposta_correta: 'c',
        dificuldade: 'facil',
        pontos: 1,
      },
    ]);

    log.success(`${questoes.length} questões criadas`);

    // Gerar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    return {
      usuario,
      torneio,
      participante,
      questoes,
      token,
    };
  } catch (erro) {
    log.error(`Erro ao preparar dados: ${erro.message}`);
    throw erro;
  }
}

async function testSalvarTentativaCorreta(data) {
  log.info('Teste 1: Salvar tentativa CORRETA');

  try {
    const response = await fetch(`${API_BASE}/api/tentativas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
      body: JSON.stringify({
        torneio_id: data.torneio.id,
        disciplina_competida: 'Matemática',
        questao_id: data.questoes[0].id,
        resposta_selecionada: 'b',
        tempo_gasto: 45,
      }),
    });

    const result = await response.json();

    if (response.status === 201 && result.sucesso && result.tentativa.correta) {
      log.success('Tentativa correta salva com sucesso');
      testsPassed++;
      return result.tentativa;
    } else {
      log.error(`Falha: ${JSON.stringify(result)}`);
      testsFailed++;
    }
  } catch (erro) {
    log.error(`Erro: ${erro.message}`);
    testsFailed++;
  }
}

async function testSalvarTentativaErrada(data) {
  log.info('Teste 2: Salvar tentativa ERRADA');

  try {
    const response = await fetch(`${API_BASE}/api/tentativas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
      body: JSON.stringify({
        torneio_id: data.torneio.id,
        disciplina_competida: 'Matemática',
        questao_id: data.questoes[1].id,
        resposta_selecionada: 'a',
        tempo_gasto: 60,
      }),
    });

    const result = await response.json();

    if (response.status === 201 && result.sucesso && !result.tentativa.correta && result.tentativa.pontos_obtidos === 0) {
      log.success('Tentativa errada salva com sucesso');
      testsPassed++;
    } else {
      log.error(`Falha: ${JSON.stringify(result)}`);
      testsFailed++;
    }
  } catch (erro) {
    log.error(`Erro: ${erro.message}`);
    testsFailed++;
  }
}

async function testSalvarTentativaSemAutenticacao(data) {
  log.info('Teste 3: Salvar tentativa SEM AUTENTICAÇÃO');

  try {
    const response = await fetch(`${API_BASE}/api/tentativas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        torneio_id: data.torneio.id,
        disciplina_competida: 'Matemática',
        questao_id: data.questoes[0].id,
        resposta_selecionada: 'b',
      }),
    });

    const result = await response.json();

    if (response.status === 401) {
      log.success('Acesso negado sem autenticação (esperado)');
      testsPassed++;
    } else {
      log.error(`Falha: Deveria retornar 401, retornou ${response.status}`);
      testsFailed++;
    }
  } catch (erro) {
    log.error(`Erro: ${erro.message}`);
    testsFailed++;
  }
}

async function testObterHistorico(data) {
  log.info('Teste 4: Obter histórico de tentativas');

  try {
    // Salvar algumas tentativas primeiro
    await fetch(`${API_BASE}/api/tentativas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
      body: JSON.stringify({
        torneio_id: data.torneio.id,
        disciplina_competida: 'Matemática',
        questao_id: data.questoes[0].id,
        resposta_selecionada: 'b',
      }),
    });

    // Obter histórico
    const response = await fetch(
      `${API_BASE}/api/tentativas/${data.torneio.id}/Matemática`,
      {
        headers: {
          'Authorization': `Bearer ${data.token}`,
        },
      }
    );

    const result = await response.json();

    if (response.status === 200 && result.sucesso && Array.isArray(result.tentativas)) {
      log.success(`Histórico obtido: ${result.tentativas.length} tentativas`);
      testsPassed++;
    } else {
      log.error(`Falha: ${JSON.stringify(result)}`);
      testsFailed++;
    }
  } catch (erro) {
    log.error(`Erro: ${erro.message}`);
    testsFailed++;
  }
}

async function testObterEstatisticas(data) {
  log.info('Teste 5: Obter estatísticas');

  try {
    const response = await fetch(
      `${API_BASE}/api/tentativas/stats/${data.torneio.id}`,
      {
        headers: {
          'Authorization': `Bearer ${data.token}`,
        },
      }
    );

    const result = await response.json();

    if (response.status === 200 && result.sucesso && result.estatisticas) {
      log.success('Estatísticas obtidas com sucesso');
      testsPassed++;
    } else {
      log.error(`Falha: ${JSON.stringify(result)}`);
      testsFailed++;
    }
  } catch (erro) {
    log.error(`Erro: ${erro.message}`);
    testsFailed++;
  }
}

async function cleanupTestData(data) {
  log.info('Limpando dados de teste...');

  try {
    await TentativaResposta.destroy({ where: { usuario_id: data.usuario.id } });
    await ParticipanteTorneio.destroy({ where: { usuario_id: data.usuario.id } });
    await Torneio.destroy({ where: { id: data.torneio.id } });
    await User.destroy({ where: { id: data.usuario.id } });

    log.success('Dados de teste removidos');
  } catch (erro) {
    log.warn(`Erro ao limpar dados: ${erro.message}`);
  }
}

async function runTests() {
  console.log('\n' + colors.blue + '='.repeat(50) + colors.reset);
  console.log(colors.blue + 'TESTES DA API DE TENTATIVAS' + colors.reset);
  console.log(colors.blue + '='.repeat(50) + colors.reset + '\n');

  try {
    // Conectar ao banco
    await sequelize.authenticate();
    log.success('Conectado ao banco de dados');

    // Preparar dados
    const data = await setupTestData();

    // Executar testes
    await testSalvarTentativaCorreta(data);
    await testSalvarTentativaErrada(data);
    await testSalvarTentativaSemAutenticacao(data);
    await testObterHistorico(data);
    await testObterEstatisticas(data);

    // Limpar dados
    await cleanupTestData(data);

    // Resumo
    console.log('\n' + colors.blue + '='.repeat(50) + colors.reset);
    console.log(colors.blue + 'RESUMO DOS TESTES' + colors.reset);
    console.log(colors.blue + '='.repeat(50) + colors.reset);
    console.log(`${colors.green}✓ Testes Passados: ${testsPassed}${colors.reset}`);
    console.log(`${colors.red}✗ Testes Falhados: ${testsFailed}${colors.reset}`);
    console.log(`Total: ${testsPassed + testsFailed}\n`);

    process.exit(testsFailed > 0 ? 1 : 0);
  } catch (erro) {
    log.error(`Erro fatal: ${erro.message}`);
    process.exit(1);
  }
}

runTests();
