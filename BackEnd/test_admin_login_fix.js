import axios from 'axios';
import 'dotenv/config';

const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:3002';

async function testAdminLogin() {
  try {
    console.log('🔐 Testando login como admin...\n');

    // Login
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@comaes.com',
      password: 'Senha123!'
    });

    const { token, data } = loginRes.data;
    console.log('✅ Login bem-sucedido!');
    console.log(`   Email: ${data.email}`);
    console.log(`   Role: ${data.role}`);
    console.log(`   isAdmin: ${data.isAdmin}\n`);

    // Decodificar JWT para verificar payload
    const parts = token.split('.');
    const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log('📋 JWT Payload:');
    console.log(`   id: ${decoded.id}`);
    console.log(`   email: ${decoded.email}`);
    console.log(`   role: ${decoded.role}`);
    console.log(`   isAdmin: ${decoded.isAdmin}\n`);

    // Testar acesso ao endpoint /api/admin/stats
    console.log('📊 Tentando acessar /api/admin/stats...\n');
    const statsRes = await axios.get(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Acesso concedido!');
    console.log(`   Total de usuários: ${statsRes.data.data?.totalUsuarios || statsRes.data.totalUsuarios}`);
    console.log(`   Total de admins: ${statsRes.data.data?.totalAdmins || statsRes.data.totalAdmins}`);
    console.log(`   Resposta: ${JSON.stringify(statsRes.data, null, 2).substring(0, 200)}...\n`);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.log('\n⚠️  Acesso negado - JWT pode não ter o campo isAdmin');
    }
  }
}

testAdminLogin();
