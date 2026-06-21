/**
 * TEST: Complete Flow - Criar Torneio Específico via API
 * Simula exatamente o que o frontend está fazendo
 */
import Torneio from './models/Torneio.js';
import sequelize from './config/db.js';
import fetch from 'node-fetch';

async function testCompleteFlow() {
  try {
    console.log('\n');
    console.log('🧪 TEST COMPLETO: Criar e recuperar Torneio Específico\n');
    console.log('\n');

    // PASSO 1: Criar via banco de dados direto
    console.log('1️⃣  CRIANDO TORNEIO VIA DATABASE...\n');
    
    const torneioTest = await Torneio.create({
      titulo: 'Torneio Teste Completo ' + Date.now(),
      slug: 'torneio-teste-completo-' + Date.now(),
      descricao: 'Teste para debug',
      inicia_em: new Date(Date.now() + 60000),
      termina_em: new Date(Date.now() + 86400000),
      criado_por: 1,
      status: 'rascunho',
      tipo_torneio: 'especifico',
      disciplina_especifica: 'Matemática'
    });

    console.log('✅ Torneio criado no banco!');
    console.log(`   ID: ${torneioTest.id}`);
    console.log(`   Título: ${torneioTest.titulo}`);
    console.log(`   tipo_torneio: ${torneioTest.tipo_torneio}`);
    console.log(`   disciplina_especifica: ${torneioTest.disciplina_especifica}\n`);

    // PASSO 2: Recuperar do banco
    console.log('2️⃣  RECUPERANDO DO BANCO...\n');
    
    const torneioRecuperado = await Torneio.findByPk(torneioTest.id);
    
    console.log('✅ Torneio recuperado!');
    console.log(`   ID: ${torneioRecuperado.id}`);
    console.log(`   tipo_torneio: ${torneioRecuperado.tipo_torneio}`);
    console.log(`   disciplina_especifica: ${torneioRecuperado.disciplina_especifica}\n`);

    // PASSO 3: Listar todos via query (como getAllTorneos faz)
    console.log('3️⃣  LISTANDO TODOS OS TORNEIOS VIA QUERY...\n');
    
    const torneios = await Torneio.findAll({
      attributes: ['id', 'titulo', 'descricao', 'inicia_em', 'termina_em', 'status', 'criado_em', 'slug', 'tipo_torneio', 'disciplina_especifica'],
      order: [['criado_em', 'DESC']],
      limit: 10,
    });

    console.log(`✅ ${torneios.length} torneios encontrados\n`);
    
    const nossoTorneio = torneios.find(t => t.id === torneioTest.id);
    if (nossoTorneio) {
      console.log('✅ Nosso torneio está na lista!');
      console.log(`   ID: ${nossoTorneio.id}`);
      console.log(`   tipo_torneio: ${nossoTorneio.tipo_torneio}`);
      console.log(`   disciplina_especifica: ${nossoTorneio.disciplina_especifica}\n`);
    } else {
      console.log('❌ Nosso torneio NÃO está na lista!\n');
    }

    // PASSO 4: Verificar resposta JSON (como seria retornado)
    console.log('4️⃣  CONVERTENDO PARA JSON (como seria retornado pela API)...\n');
    
    const torneioJson = nossoTorneio ? nossoTorneio.toJSON() : null;
    
    if (torneioJson) {
      console.log('✅ Torneio convertido para JSON:');
      console.log(JSON.stringify(torneioJson, null, 2));
      console.log('\n');
    }

    // PASSO 5: Verificar se tipo_torneio está correto
    console.log('5️⃣  VERIFICANDO TIPO_TORNEIO...\n');
    
    if (torneioJson && torneioJson.tipo_torneio === 'especifico') {
      console.log('✅ SUCESSO! tipo_torneio está CORRETO!');
    } else {
      console.log(`❌ ERRO! tipo_torneio é "${torneioJson?.tipo_torneio}" (esperado: "especifico")`);
    }

    console.log('\n\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testCompleteFlow();
