/**
 * TEST: Debug do payload de criaÃ§Ã£o de torneio
 * Simula exatamente o que o frontend estÃ¡ enviando
 */
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3002';

async function testCriarTorneioEspecifico() {
  try {
    console.log('ðŸ§ª TEST: Criando torneio especÃ­fico via API (simulando frontend)...\n');

    // Payload exato que o frontend estÃ¡ enviando
    const payload = {
      titulo: 'Torneio DEBUG ' + Date.now(),
      descricao: 'Teste de debug do tipo_torneio',
      inicia_em: new Date(Date.now() + 60000).toISOString(),
      termina_em: new Date(Date.now() + 86400000).toISOString(),
      status: 'rascunho',
      pÃºblico: true,
      slug: 'torneio-debug-' + Date.now(),
      tipo_torneio: 'especifico',  // ðŸ‘ˆ IMPORTANTE
      disciplina_especifica: 'MatemÃ¡tica',
      criado_por: 1,
      _blocosParaAssociar: []
    };

    console.log('ðŸ“¤ Enviando payload para API:');
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

    console.log(`ðŸ“¥ Response status: ${res.status}\n`);

    const data = await res.json();
    console.log('ðŸ“‹ Response data:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n');

    // Extrair torneio criado
    const torneio = data.torneio || data;
    console.log('ðŸ” Verificando torneio retornado:');
    console.log(`   ID: ${torneio.id}`);
    console.log(`   TÃ­tulo: ${torneio.titulo}`);
    console.log(`   tipo_torneio: ${torneio.tipo_torneio}`);
    console.log(`   disciplina_especifica: ${torneio.disciplina_especifica}`);
    console.log('\n');

    if (torneio.tipo_torneio === 'especifico') {
      console.log('âœ… SUCCESS: tipo_torneio estÃ¡ CORRETO na resposta!');
    } else {
      console.log(`âŒ ERRO: tipo_torneio estÃ¡ ${torneio.tipo_torneio} na resposta (esperado: especifico)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('âŒ ERRO:', error.message);
    process.exit(1);
  }
}

testCriarTorneioEspecifico();

