/**
 * Script para popular a tabela de rankings com dados de exemplo
 * 
 * Este script insere dados de exemplo na tabela rankings para
 * permitir testes da funcionalidade de rankings educacionais
 */

import sequelize from '../config/db.js';
import Usuario from '../models/User.js';
import Ranking from '../models/Ranking.js';

async function populateRankings() {
  console.log('📊 Iniciando população de dados de exemplo para rankings...\n');
  
  try {
    // 1. Verificar se há usuários na base
    const usuarios = await Usuario.findAll({
      limit: 20,
      attributes: ['id', 'nome', 'email', 'nivel_atual', 'xp_total']
    });
    
    if (usuarios.length === 0) {
      console.log('❌ Nenhum usuário encontrado na base de dados');
      console.log('   É necessário ter usuários cadastrados antes de popular rankings');
      return;
    }
    
    console.log(`✅ Encontrados ${usuarios.length} usuários para gerar rankings\n`);
    
    // 2. Limpar tabela rankings existente (opcional)
    console.log('🧹 Limpando dados de ranking existentes...');
    await Ranking.destroy({ where: {}, truncate: true });
    console.log('   Tabela rankings limpa\n');
    
    // 3. Gerar dados de exemplo para cada usuário
    console.log('🎲 Gerando dados de ranking de exemplo...');
    const rankingEntries = [];
    const disciplinas = ['geral', 'matematica', 'programacao', 'ingles'];
    
    for (const usuario of usuarios) {
      // Para cada disciplina, criar um ranking com pontuação aleatória
      for (const disciplina of disciplinas) {
        // Gerar pontuação baseada no XP do usuário + variação aleatória
        const baseXP = usuario.xp_total || 0;
        const variacao = Math.floor(Math.random() * 1000);
        const pontuacao = baseXP + variacao;
        
        rankingEntries.push({
          usuario_id: usuario.id,
          disciplina,
          pontuacao_total: pontuacao,
          posicao_geral: null, // Será calculado depois
          posicao_disciplina: null, // Será calculado depois
          data_atualizacao: new Date()
        });
      }
      
      console.log(`   Usuário ${usuario.nome}: Gerado ranking para ${disciplinas.length} disciplinas`);
    }
    
    // 4. Inserir dados em lote
    console.log('\n💾 Inserindo dados na tabela rankings...');
    await Ranking.bulkCreate(rankingEntries);
    console.log(`   ✅ ${rankingEntries.length} registros inseridos\n`);
    
    // 5. Calcular posições
    console.log('📈 Calculando posições nos rankings...');
    for (const disciplina of disciplinas) {
      // Buscar rankings desta disciplina ordenados por pontuação
      const rankings = await Ranking.findAll({
        where: { disciplina },
        order: [['pontuacao_total', 'DESC']],
        attributes: ['id', 'pontuacao_total']
      });
      
      // Atualizar posições
      const updates = rankings.map((ranking, index) => {
        const posicao = index + 1;
        return ranking.update({
          posicao_disciplina: posicao,
          ...(disciplina === 'geral' ? { posicao_geral: posicao } : {})
        });
      });
      
      await Promise.all(updates);
      console.log(`   ${disciplina}: ${rankings.length} posições calculadas`);
    }
    
    // 6. Verificar resultados
    console.log('\n🔍 Verificando dados inseridos...');
    const totalRankings = await Ranking.count();
    const rankingGeral = await Ranking.findAll({
      where: { disciplina: 'geral' },
      order: [['posicao_geral', 'ASC']],
      limit: 5,
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nome', 'email']
      }]
    });
    
    console.log(`✅ Total de rankings na base: ${totalRankings}`);
    console.log('\n🏆 Top 5 Ranking Geral:');
    rankingGeral.forEach((ranking, index) => {
      console.log(`   ${index + 1}. ${ranking.usuario?.nome || 'N/A'} - ${ranking.pontuacao_total} pontos`);
    });
    
    // 7. Testar endpoints da API
    console.log('\n🌐 Endpoints disponíveis para teste:');
    console.log('   GET /api/rankings/public          - Ranking público (top 10)');
    console.log('   GET /api/rankings/disciplinas     - Lista de disciplinas');
    console.log('   GET /api/rankings/geral           - Ranking geral completo (autenticado)');
    console.log('   GET /api/rankings/matematica      - Ranking matemática (autenticado)');
    console.log('   GET /api/rankings/programacao     - Ranking programação (autenticado)');
    console.log('   GET /api/rankings/ingles          - Ranking inglês (autenticado)');
    console.log('   GET /api/rankings/minha-posicao   - Posição do usuário logado');
    console.log('\n🔑 Nota: Endpoints autenticados requerem token JWT válido');
    
    console.log('\n🎯 DADOS DE TESTE CRIADOS COM SUCESSO!');
    console.log('   O sistema de rankings está pronto para uso.');
    
  } catch (error) {
    console.error('❌ Erro ao popular rankings:', error);
  } finally {
    console.log('\n🏁 Script concluído');
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  populateRankings();
}

export { populateRankings };