/**
 * Script para verificar blocos no banco de dados
 */
import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/db.js';
import BlocoQuestoes from '../models/BlocoQuestoes.js';
import User from '../models/User.js';

async function verificarBlocos() {
  try {
    console.log('🔍 Verificando blocos no banco de dados...\n');

    // 1. Contar blocos totais
    const totalBlocos = await BlocoQuestoes.count();
    console.log(`📊 Total de blocos: ${totalBlocos}`);

    if (totalBlocos === 0) {
      console.log('⚠️  Nenhum bloco encontrado no banco!');
      console.log('\n💡 Solução: Crie um bloco na interface do Admin ou use o script de seed.\n');
      process.exit(0);
    }

    // 2. Listar todos os blocos com detalhes
    const blocos = await BlocoQuestoes.findAll({
      order: [['created_at', 'DESC']],
      limit: 20
    });

    console.log('\n📋 Primeiros 20 blocos:\n');
    blocos.forEach((b, idx) => {
      console.log(`${idx + 1}. ID: ${b.id}`);
      console.log(`   Título: ${b.titulo}`);
      console.log(`   Status: ${b.status}`);
      console.log(`   Disciplina: ${b.disciplina}`);
      console.log(`   Criado por (ID): ${b.criado_por}`);
      console.log(`   Criado em: ${b.created_at}`);
      console.log('');
    });

    // 3. Contar por status
    console.log('📈 Blocos por status:');
    const statusMap = {};
    for (const b of blocos) {
      statusMap[b.status] = (statusMap[b.status] || 0) + 1;
    }
    Object.entries(statusMap).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // 4. Verificar admins
    console.log('\n👥 Admins no banco:');
    const admins = await User.findAll({
      attributes: ['id', 'nome', 'is_colaborador'],
      where: { is_colaborador: false },
      limit: 10
    });
    
    if (admins.length === 0) {
      console.log('   Nenhum admin encontrado!');
    } else {
      admins.forEach(a => {
        console.log(`   - ${a.nome} (ID: ${a.id})`);
      });
    }

    // 5. Verificar quais blocos pertencem a admins
    console.log('\n🔗 Blocos de admins:');
    const adminIds = admins.map(a => a.id);
    const blocosAdmin = await BlocoQuestoes.findAll({
      where: { criado_por: adminIds }
    });
    console.log(`   Total: ${blocosAdmin.length}`);
    blocosAdmin.forEach(b => {
      console.log(`   - ${b.titulo} (criado_por: ${b.criado_por})`);
    });

    // 6. Verificar blocos aprovados
    console.log('\n✅ Blocos aprovados:');
    const blocosAprovados = await BlocoQuestoes.findAll({
      where: { status: 'aprovado' }
    });
    console.log(`   Total: ${blocosAprovados.length}`);
    blocosAprovados.forEach(b => {
      console.log(`   - ${b.titulo} (criado_por: ${b.criado_por})`);
    });

    console.log('\n✅ Verificação completa!\n');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

verificarBlocos().then(() => process.exit(0));
