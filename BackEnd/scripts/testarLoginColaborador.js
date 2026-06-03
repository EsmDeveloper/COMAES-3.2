import http from 'http';

function postLogin(email, senha) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ usuario: email, senha });
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const result = await postLogin('colaborador.mat@comaes.ao', 'Comaes@2026');
  console.log('STATUS:', result.status);
  if (result.body.data) {
    const d = result.body.data;
    console.log('DADOS DEVOLVIDOS:');
    Object.entries(d).forEach(([k, v]) => console.log(`  ${k}: ${JSON.stringify(v)}`));
  } else {
    console.log('ERRO:', result.body);
  }
}
main().catch(console.error);
