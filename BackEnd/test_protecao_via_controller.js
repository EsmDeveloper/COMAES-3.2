import Torneio from './models/Torneio.js';
import TorneoController from './controllers/TorneoController.js';
import sequelize from './config/db.js';

// Mock do request/response para simular chamada API
const createMockReq = (body, params = {}, user = null) => ({
  body,
  params,
  user: user || { id: 1 }
});

const createMockRes = () => {
  const res = {};
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
  res.json = function(data) {
    res.jsonData = data;
    return res;
  };
  res.send = function() {
    return res;
  };
  res.statusCode = 200;
  return res;
};

async function testarProtecaoViaController() {
  try {
    console.log('📋 TESTE: Verificar proteção de tipo_torneio via Controller\n');

    // 1. Criar torneio específico via controller
    console.log('1️⃣ Criando torneio específico via controller...\n');
    
    const createReq = createMockReq({
      titulo: 'Teste Controller - Matemática',
      descricao: 'Teste via controller',
      status: 'ativo',
      tipo_torneio: 'especifico',
      disciplina_especifica: 'Matemática',
      inicia_em: new Date().toISOString(),
      termina_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      criado_por: 1
    });

    const createRes = createMockRes();
    await TorneoController.createTorneo(createReq, createRes);

    if (createRes.statusCode !== 201) {
      console.log('❌ Erro ao criar torneio:');
      console.log(JSON.stringify(createRes.jsonData, null, 2));
      process.exit(1);
    }

    const torneioId = createRes.jsonData.torneio.id;
    console.log(`✅ Torneio criado: ID ${torneioId}`);
    console.log(`   tipo_torneio: ${createRes.jsonData.torneio.tipo_torneio}`);
    console.log(`   disciplina_especifica: ${createRes.jsonData.torneio.disciplina_especifica}\n`);

    // 2. Tentar alterar tipo_torneio via controller (deve REJEITAR)
    console.log('2️⃣ Tentando alterar tipo_torneio para "generico" via controller...\n');

    const updateReq = createMockReq(
      {
        status: 'ativo',
        tipo_torneio: 'generico'  // Tentando mudar!
      },
      { id: torneioId },
      { id: 1 }
    );

    const updateRes = createMockRes();
    await TorneoController.updateTorneo(updateReq, updateRes);

    if (updateRes.statusCode === 400) {
      const errorData = updateRes.jsonData;
      if (errorData.message.includes('READ-ONLY') || errorData.message.includes('não pode ser alterado')) {
        console.log('✅ SUCESSO: Controller bloqueou a alteração!');
        console.log(`   Mensagem: ${errorData.message}`);
        console.log(`   Status HTTP: ${updateRes.statusCode}\n`);

        // 3. Verificar que o valor no banco não mudou
        console.log('3️⃣ Verificando banco de dados...\n');
        const verificacao = await Torneio.findByPk(torneioId);
        console.log(`   tipo_torneio (BD): ${verificacao.tipo_torneio}`);
        console.log(`   disciplina_especifica (BD): ${verificacao.disciplina_especifica}`);
        
        if (verificacao.tipo_torneio === 'especifico') {
          console.log('\n✅ PROTEÇÃO FUNCIONANDO PERFEITAMENTE!');
          console.log('   O tipo_torneio foi mantido como "especifico"');
        }
      } else {
        console.log('❌ Erro diferente recebido:');
        console.log(JSON.stringify(updateRes.jsonData, null, 2));
      }
    } else if (updateRes.statusCode === 200) {
      console.log('❌ FALHA: Controller permitiu a alteração!');
      console.log(`   Status HTTP: ${updateRes.statusCode}`);
      console.log(`   Dados: ${JSON.stringify(updateRes.jsonData, null, 2)}`);
    } else {
      console.log(`⚠️ Status HTTP inesperado: ${updateRes.statusCode}`);
      console.log(`   Resposta: ${JSON.stringify(updateRes.jsonData, null, 2)}`);
    }

    console.log('\n');
    console.log('Torneio ID para teste manual:', torneioId);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testarProtecaoViaController();
