/**
 * Testa os endpoints GET e PUT de configurações
 */
import http from 'http';

function req(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost', port: 3000, path, method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);
    const r = http.request(options, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

async function main() {
  const userId = 1;

  console.log('=== TESTE 1: GET configurações ===');
  const g = await req('GET', `/usuarios/${userId}/configuracao`);
  console.log('Status:', g.status);
  console.log('Dados:', JSON.stringify(g.body.data, null, 2));

  console.log('\n=== TESTE 2: PUT — alterar só tema ===');
  const p1 = await req('PUT', `/usuarios/${userId}/configuracao`, { tema: 'dark' });
  console.log('Status:', p1.status);
  console.log('Resultado:', JSON.stringify(p1.body.data, null, 2));

  console.log('\n=== TESTE 3: GET — verificar se tema foi guardado ===');
  const g2 = await req('GET', `/usuarios/${userId}/configuracao`);
  console.log('Tema guardado:', g2.body.data?.tema);
  console.log('Outros campos intactos:', JSON.stringify(g2.body.data, null, 2));

  console.log('\n=== TESTE 4: PUT — alterar notificacoes.email ===');
  const p2 = await req('PUT', `/usuarios/${userId}/configuracao`, { notificacoes: { email: false } });
  console.log('Status:', p2.status);

  console.log('\n=== TESTE 5: GET — verificar merge profundo ===');
  const g3 = await req('GET', `/usuarios/${userId}/configuracao`);
  console.log('notificacoes:', JSON.stringify(g3.body.data?.notificacoes, null, 2));
  console.log('tema (intacto):', g3.body.data?.tema);
}

main().catch(console.error);
