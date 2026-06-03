// Teste simples para verificar estrutura e fluxo
const { Sequelize } = require('sequelize');

async function testEstrutura() {
  console.log('🔍 Testando estrutura do sistema de colaboradores...\n');
  
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: '',
    database: 'comaes'
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    // Verificar se o campo status_colaborador existe
    console.log('\n📋 Verificando estrutura da tabela usuarios...');
    const [results] = await sequelize.query(`
      SHOW COLUMNS FROM usuarios 
      WHERE Field IN ('role', 'disciplina_colaborador', 'status_colaborador')
    `);
    
    const camposExistentes = results.map(r => r.Field);
    console.log('✅ Campos encontrados na tabela usuarios:', camposExistentes);
    
    if (!camposExistentes.includes('role')) {
      console.warn('⚠️ Campo "role" não encontrado! Execute a migração 20260601000000');
    }
    
    if (!camposExistentes.includes('status_colaborador')) {
      console.warn('⚠️ Campo "status_colaborador" não encontrado! Execute a migração 20260602000000');
    }
    
    if (!camposExistentes.includes('disciplina_colaborador')) {
      console.warn('⚠️ Campo "disciplina_colaborador" não encontrado!');
    }

    // Verificar dados atuais
    console.log('\n📊 Verificando dados atuais de colaboradores...');
    const [colaboradores] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'colaborador' THEN 1 ELSE 0 END) as total_colaboradores,
        SUM(CASE WHEN role = 'colaborador' AND status_colaborador = 'pendente' THEN 1 ELSE 0 END) as pendentes,
        SUM(CASE WHEN role = 'colaborador' AND status_colaborador = 'aprovado' THEN 1 ELSE 0 END) as aprovados,
        SUM(CASE WHEN role = 'colaborador' AND status_colaborador = 'rejeitado' THEN 1 ELSE 0 END) as rejeitados
      FROM usuarios
    `);
    
    console.log('📈 Estatísticas dos colaboradores:');
    console.log(`   Total de usuários: ${colaboradores[0].total}`);
    console.log(`   Total de colaboradores: ${colaboradores[0].total_colaboradores || 0}`);
    console.log(`   Colaboradores pendentes: ${colaboradores[0].pendentes || 0}`);
    console.log(`   Colaboradores aprovados: ${colaboradores[0].aprovados || 0}`);
    console.log(`   Colaboradores rejeitados: ${colaboradores[0].rejeitados || 0}`);

    // Verificar tipos dos campos
    console.log('\n🔍 Verificando tipos dos campos...');
    const [todosCampos] = await sequelize.query('SHOW COLUMNS FROM usuarios');
    const camposRelevantes = todosCampos.filter(c => 
      ['role', 'disciplina_colaborador', 'status_colaborador'].includes(c.Field)
    );
    
    camposRelevantes.forEach(campo => {
      console.log(`   - ${campo.Field}: ${campo.Type} ${campo.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // Testar constraints do ENUM
    console.log('\n🔍 Verificando valores ENUM permitidos...');
    
    const campoRole = todosCampos.find(c => c.Field === 'role');
    if (campoRole && campoRole.Type.includes('enum')) {
      const enumValues = campoRole.Type.match(/enum\((.*?)\)/);
      if (enumValues) {
        console.log(`   Valores ENUM para role: ${enumValues[1]}`);
      }
    }
    
    const campoStatus = todosCampos.find(c => c.Field === 'status_colaborador');
    if (campoStatus && campoStatus.Type.includes('enum')) {
      const enumValues = campoStatus.Type.match(/enum\((.*?)\)/);
      if (enumValues) {
        console.log(`   Valores ENUM para status_colaborador: ${enumValues[1]}`);
      }
    }

    // Sugestões
    console.log('\n💡 Sugestões:');
    console.log('   1. Verifique se o backend está importando o middleware isAdmin corretamente');
    console.log('   2. Confirme se as rotas de /api/admin/colaboradores estão funcionando');
    console.log('   3. Teste o registro público com role="colaborador"');
    console.log('   4. Teste o login de colaborador pendente (deve bloquear)');
    console.log('   5. Teste aprovação via API admin');

    console.log('\n✅ Teste de estrutura concluído!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexão encerrada');
  }
}

// Executar teste
testEstrutura();