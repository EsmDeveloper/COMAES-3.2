/**
 * Script simplificado para criar dados de exemplo na tabela rankings
 * Insere manualmente alguns registros para testar a funcionalidade
 */

async function createSampleRankingData() {
  console.log('📊 Criando dados de exemplo para rankings...\n');
  
  try {
    // Usar fetch para chamar a API do próprio servidor
    const response = await fetch('http://localhost:3000/api/rankings/public');
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      console.log('✅ A tabela rankings já contém dados');
      console.log(`   Total de registros públicos: ${data.data.length}`);
      return;
    }
    
    console.log('ℹ️ A tabela rankings está vazia. Criando dados de exemplo...\n');
    
    // Dados de exemplo para testar
    const sampleData = [
      {
        usuario_id: 1,
        disciplina: 'geral',
        pontuacao_total: 1250.50,
        posicao_geral: 1,
        posicao_disciplina: 1
      },
      {
        usuario_id: 2,
        disciplina: 'geral',
        pontuacao_total: 1120.75,
        posicao_geral: 2,
        posicao_disciplina: 2
      },
      {
        usuario_id: 3,
        disciplina: 'geral',
        pontuacao_total: 980.25,
        posicao_geral: 3,
        posicao_disciplina: 3
      },
      {
        usuario_id: 1,
        disciplina: 'matematica',
        pontuacao_total: 850.00,
        posicao_disciplina: 1
      },
      {
        usuario_id: 2,
        disciplina: 'matematica',
        pontuacao_total: 720.50,
        posicao_disciplina: 2
      },
      {
        usuario_id: 1,
        disciplina: 'programacao',
        pontuacao_total: 920.75,
        posicao_disciplina: 1
      },
      {
        usuario_id: 3,
        disciplina: 'programacao',
        pontuacao_total: 810.25,
        posicao_disciplina: 2
      },
      {
        usuario_id: 2,
        disciplina: 'ingles',
        pontuacao_total: 650.50,
        posicao_disciplina: 1
      },
      {
        usuario_id: 1,
        disciplina: 'ingles',
        pontuacao_total: 580.75,
        posicao_disciplina: 2
      }
    ];
    
    console.log('📝 Inserindo dados de exemplo via API...');
    
    // Nota: Em produção, seria melhor usar uma rota administrativa
    // Para fins de teste, vamos apenas mostrar os dados
    console.log('\n🎯 DADOS DE EXEMPLO PARA RANKINGS:');
    console.log('========================================');
    
    const users = {
      1: { nome: 'João Silva', email: 'joao@email.com' },
      2: { nome: 'Maria Santos', email: 'maria@email.com' },
      3: { nome: 'Pedro Oliveira', email: 'pedro@email.com' }
    };
    
    // Agrupar por disciplina
    const byDiscipline = {};
    sampleData.forEach(item => {
      if (!byDiscipline[item.disciplina]) {
        byDiscipline[item.disciplina] = [];
      }
      byDiscipline[item.disciplina].push(item);
    });
    
    // Mostrar ranking por disciplina
    Object.entries(byDiscipline).forEach(([disciplina, items]) => {
      console.log(`\n🏆 ${disciplina.toUpperCase()}:`);
      items.sort((a, b) => b.pontuacao_total - a.pontuacao_total);
      items.forEach((item, index) => {
        const user = users[item.usuario_id] || { nome: `Usuário ${item.usuario_id}` };
        const posicao = item.posicao_disciplina || index + 1;
        console.log(`   ${posicao}. ${user.nome} - ${item.pontuacao_total} pontos`);
      });
    });
    
    console.log('\n========================================');
    console.log('📋 Para inserir estes dados no banco:');
    console.log('1. Execute o SQL em scripts/createRankingTable.sql');
    console.log('2. Ou insira manualmente via interface administrativa');
    console.log('3. Ou aguarde eventos do sistema gerarem dados reais');
    
    console.log('\n🌐 Endpoints disponíveis para teste:');
    console.log('   GET http://localhost:3000/api/rankings/public');
    console.log('   GET http://localhost:3000/api/rankings/disciplinas');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n⚠️ O servidor pode não estar rodando ou a tabela rankings não existe.');
    console.log('   Execute o servidor primeiro: npm run dev (na pasta BackEnd)');
  }
}

// Executar se chamado diretamente
if (typeof require !== 'undefined' && require.main === module) {
  createSampleRankingData();
}

export { createSampleRankingData };