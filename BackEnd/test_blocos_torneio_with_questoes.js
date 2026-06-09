/**
 * test_blocos_torneio_with_questoes.js
 * Teste do endpoint GET /api/torneios/{id}/blocos para verificar se questões vêm incluídas
 */
import axios from 'axios';
import 'dotenv/config.js';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_TOKEN = process.env.TEST_TOKEN || 'seu_token_aqui';

async function testBlocosDoTorneio() {
  try {
    console.log('🧪 Testando endpoint GET /api/torneios/{id}/blocos\n');

    // Assumir que existe um torneio com ID 1 ou 37 (do contexto anterior)
    const torneioIds = [1, 37, 35];

    for (const torneioId of torneioIds) {
      console.log(`\n📋 Testando torneio ID: ${torneioId}`);
      console.log('─'.repeat(60));

      try {
        const response = await axios.get(
          `${API_URL}/api/torneios/${torneioId}/blocos`,
          {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
          }
        );

        const { torneio_id, blocos, total } = response.data;

        console.log(`✅ Status: ${response.status}`);
        console.log(`📊 Torneio ID: ${torneio_id}`);
        console.log(`📦 Total de blocos: ${total}`);

        if (blocos && blocos.length > 0) {
          blocos.forEach((bloco, idx) => {
            console.log(`\n  📌 Bloco ${idx + 1}:`);
            console.log(`     - ID: ${bloco.id}`);
            console.log(`     - Título: ${bloco.titulo}`);
            console.log(`     - Total Questões: ${bloco.total_questoes}`);
            console.log(`     - Questões Incluídas: ${bloco.questoes ? bloco.questoes.length : 0}`);
            
            if (bloco.questoes && bloco.questoes.length > 0) {
              console.log(`     ✅ Primeiras 3 questões:`);
              bloco.questoes.slice(0, 3).forEach((q, qIdx) => {
                console.log(`        ${qIdx + 1}. ${q.enunciado?.substring(0, 50) || q.titulo || 'Sem enunciado'}...`);
              });
            } else if (bloco.total_questoes > 0) {
              console.log(`     ⚠️  Total diz ${bloco.total_questoes}, mas questões array vazio ou falta!`);
            }
          });
        } else {
          console.log(`⚠️  Torneio não tem blocos associados`);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          console.log(`⚠️  Torneio ID ${torneioId} não encontrado (404)`);
        } else {
          console.error(`❌ Erro:`, err.message);
        }
      }
    }

    console.log('\n\n✅ Teste completo!');
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
  }
}

testBlocosDoTorneio();
