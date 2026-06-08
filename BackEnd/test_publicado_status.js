/**
 * Test script to verify "publicado" status works for blocks
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@comaes.com';
const ADMIN_PASSWORD = 'admin123';

async function test() {
  try {
    // 1. Login as admin to get token
    console.log('🔐 Logging in as admin...');
    const loginRes = await axios.post(`${API_BASE}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token = loginRes.data?.token;
    if (!token) {
      console.log('❌ Failed to get token. Response:', loginRes.data);
      return;
    }
    console.log('✅ Login successful, token received');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Create a block with status "publicado"
    console.log('\n📝 Creating block with status "publicado"...');
    const createRes = await axios.post(`${API_BASE}/api/blocos`, {
      titulo: 'Teste Publicação - ' + new Date().getTime(),
      disciplina: 'matematica',
      dificuldade: 'facil',
      descricao: 'Bloco de teste para verificar status publicado',
      status: 'publicado',
    }, { headers });

    const bloco = createRes.data?.data || createRes.data;
    console.log('✅ Block created successfully!');
    console.log('   ID:', bloco.id);
    console.log('   Title:', bloco.titulo);
    console.log('   Status:', bloco.status);

    if (bloco.status !== 'publicado') {
      console.log('❌ ERROR: Status is not "publicado"! Got:', bloco.status);
      return;
    }

    // 3. Fetch the block to verify status persisted
    console.log('\n✅ Verifying block was saved with correct status...');
    const getRes = await axios.get(`${API_BASE}/api/blocos/${bloco.id}`, { headers });
    const fetchedBloco = getRes.data?.data || getRes.data;
    console.log('✅ Block retrieved');
    console.log('   Status:', fetchedBloco.status);

    if (fetchedBloco.status !== 'publicado') {
      console.log('❌ ERROR: Status changed after fetch! Got:', fetchedBloco.status);
      return;
    }

    // 4. Try to associate with a tournament to verify the check passes
    console.log('\n🎯 Getting tournaments...');
    const torneiosRes = await axios.get(`${API_BASE}/api/admin/torneos`, { headers });
    const torneios = Array.isArray(torneiosRes.data) ? torneiosRes.data : (torneiosRes.data?.data || []);
    
    if (torneios.length === 0) {
      console.log('⚠️  No tournaments available to test association');
      console.log('✅ Test PASSED: Block created with "publicado" status successfully!');
      return;
    }

    const torneio = torneios[0];
    console.log('✅ Found tournament:', torneio.titulo);

    console.log('\n🔗 Attempting to associate block with tournament...');
    const assocRes = await axios.post(`${API_BASE}/api/torneios/${torneio.id}/blocos`, {
      bloco_id: bloco.id,
    }, { headers });

    console.log('✅ Block associated successfully!');
    console.log(assocRes.data);
    console.log('\n🎉 ALL TESTS PASSED: "publicado" status is working correctly!');

  } catch (error) {
    console.error('❌ Test failed with error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || error.response.data?.error);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

test().then(() => process.exit(0));
