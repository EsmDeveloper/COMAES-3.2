/**
 * Testa o endpoint POST /auth/login directamente e imprime a resposta completa
 * Executar: node BackEnd/scripts/testarLoginHTTP.js
 */
import http from 'http';

const EMAIL = 'admin@comaes.ao';
const SENHA = 'Admin@2024'; // Tenta com esta senha

function postLogin(email, senha) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ usuario: email, senha });
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== TESTE DO ENDPOINT /auth/login ===\n');
  
  // Testar com o admin@comaes.ao
  const senhas = ['Admin@2024', 'Admin@2026', 'Comaes@2026', 'admin123', 'Admin@123'];
  
  for (const senha of senhas) {
    const result = await postLogin(EMAIL, senha);
    if (result.status === 200) {
      console.log(`✅ Login OK com senha: ${senha}`);
      console.log('STATUS:', result.status);
      console.log('RESPOSTA COMPLETA:');
      console.log(JSON.stringify(result.body, null, 2));
      console.log('\n--- CAMPOS EM body.data ---');
      const data = result.body.data;
      if (data) {
        console.log('id:', data.id);
        console.log('nome:', data.nome);
        console.log('email:', data.email);
        console.log('role:', data.role);
        console.log('isAdmin:', data.isAdmin);
        console.log('status_colaborador:', data.status_colaborador);
        console.log('disciplina_colaborador:', data.disciplina_colaborador);
      }
      break;
    } else {
      console.log(`❌ Falhou com senha "${senha}": ${result.body?.error || result.status}`);
    }
  }
}

main().catch(console.error);
