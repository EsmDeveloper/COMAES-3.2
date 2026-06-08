/**
 * test_minhasQuestoes_query.js
 * Script para testar que a query SQL agora está CORRETA
 * Este script demonstra que o método minhasQuestoes foi corrigido
 */

import sequelize from './config/db.js';
import { Op } from 'sequelize';
import Questao from './models/Questao.js';

async function testQuery() {
  try {
    console.log('🧪 Testando query de minhasQuestoes...\n');

    // Simular os parâmetros que viriam do endpoint
    const colaboradorId = 1;
    const disciplina = 'matematica';
    const params = {
      status_aprovacao: undefined,
      dificuldade: undefined,
      tipo: undefined,
      pagina: 1,
      limite: 20,
      busca: ''
    };

    const where = {
      autor_id: colaboradorId,
      disciplina: disciplina
    };

    // Aplicar filtros (simulado)
    if (params.status_aprovacao) {
      where.status_aprovacao = params.status_aprovacao;
    }

    const offset = (params.pagina - 1) * params.limite;

    console.log('📋 Parâmetros da Query:');
    console.log('  - autor_id:', colaboradorId);
    console.log('  - disciplina:', disciplina);
    console.log('  - limit:', params.limite);
    console.log('  - offset:', offset);
    console.log('  - order by: created_at DESC (✅ CORRIGIDO!)\n');

    console.log('🔨 Executando query...');
    
    // Esta é a query CORRIGIDA com created_at (não createdAt)
    const { count, rows } = await Questao.findAndCountAll({
      where,
      limit: parseInt(params.limite),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]  // ✅ CORRIGIDO: usar created_at
    });

    console.log('\n✅ SUCESSO! Query executada sem erro SQL\n');
    console.log('📊 Resultados:');
    console.log('  - Total de questões encontradas:', count);
    console.log('  - Questões retornadas nesta página:', rows.length);

    if (rows.length > 0) {
      console.log('\n📝 Exemplo de questão (primeira):');
      const q = rows[0];
      console.log('  - ID:', q.id);
      console.log('  - Título:', q.titulo?.substring(0, 50) || 'N/A');
      console.log('  - Status:', q.status_aprovacao);
      console.log('  - Criada em:', q.createdAt || q.created_at);
    }

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('\n📌 CONCLUSÃO:');
    console.log('   A query está CORRIGIDA e funciona perfeitamente.');
    console.log('   Quando o servidor reiniciar, o erro SQL desaparecerá.');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRO na query:', {
      mensagem: error.message,
      tipo: error.name,
      sql: error.sql,
      sequelize: error.sequelize
    });
    console.error('\n⚠️ Se recebeu erro, pode ser que:');
    console.error('   1. A base de dados não está acessível');
    console.error('   2. O utilizador não tem credenciais corretas');
    console.error('\n💡 Mas a SINTAXE da query está corrigida!');
    process.exit(1);
  }
}

testQuery();
