/**
 * TEST: Debug do payload de criação de torneio
 * Simula exatamente o que o frontend está enviando
 */
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3002';

async function testCriarTorneioEspecifico() {
  try {
    console.log(' TEST: Criando torneio específico via API (simulando frontend)...\n');

    // Payload exato que o frontend está enviando
    const payload = {
      titulo: 'Torneio DEBUG ' + Date.now(),
      descricao: 'Teste de debug do tipo_torneio',
      inicia_em: new Date(Date.now() + 60000).toISOString(),
      termina_em: new Date(Date.now() + 86400000).toISOString(),
      status: 'rascunho',
      pÃºblico: true,
      slug: 'torneio-debug-' + Date.now(),
      tipo_torneio: 'especifico',  //  IMPORTANTE
      disciplina_especifica: 'Matemática',
      criado_por: 1,
      _blocosParaAssociar: []
    };

    console.log(' Enviando payload para API:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('\n');

    // Fazer POST
    const res = await fetch(`${API_BASE}/api/admin/torneos`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(` Response status: ${res.status}\n`);

    const data = await res.json();
    console.log(' Response data:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n');

    // Extrair torneio criado
    const torneio = data.torneio || data;
    console.log(' Verificando torneio retornado:');
    console.log(`   ID: ${torneio.id}`);
    console.log(`   Título: ${torneio.titulo}`);
    console.log(`   tipo_torneio: ${torneio.tipo_torneio}`);
    console.log(`   disciplina_especifica: ${torneio.disciplina_especifica}`);
    console.log('\n');

    if (torneio.tipo_torneio === 'especifico') {
      console.log('âœ… SUCCESS: tipo_torneio está CORRETO na resposta!');
    } else {
      console.log(`âŒ ERRO: tipo_torneio está ${torneio.tipo_torneio} na resposta (esperado: especifico)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('âŒ ERRO:', error.message);
    process.exit(1);
  }
}

testCriarTorneioEspecifico();

