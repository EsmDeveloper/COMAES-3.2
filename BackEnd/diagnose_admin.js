import 'dotenv/config';
import sequelize from './config/db.js';
import Usuario from './models/User.js';

async function diagnose() {
  try {
    console.log('🔍 DIAGNÓSTICO: Verificando Status do Admin\n');

    // 1. Verificar se há admins no banco
    console.log('1️⃣ Procurando admins no banco...\n');
    const admins = await sequelize.query(
      `SELECT id, nome, email, role, isAdmin, status_colaborador FROM usuarios WHERE role = 'admin' OR isAdmin = true LIMIT 10`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (admins.length === 0) {
      console.log('❌ PROBLEMA: Nenhum admin encontrado no banco!\n');
      console.log('   Solução: Execute o seed para criar admin');
      console.log('   Comando: node BackEnd/seed_dados_teste.js\n');
    } else {
      console.log(`✅ Encontrados ${admins.length} admin(s):\n`);
      admins.forEach((admin, idx) => {
        console.log(`   ${idx + 1}. ${admin.nome}`);
        console.log(`      Email: ${admin.email}`);
        console.log(`      Role: ${admin.role}`);
        console.log(`      isAdmin: ${admin.isAdmin}`);
        console.log(`      Status: ${admin.status_colaborador}\n`);
      });
    }

    // 2. Verificar admin@comaes.com especificamente
    console.log('2️⃣ Verificando admin@comaes.com especificamente...\n');
    const [adminCheck] = await sequelize.query(
      `SELECT id, nome, email, role, isAdmin, password FROM usuarios WHERE email = 'admin@comaes.com' LIMIT 1`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (!adminCheck) {
      console.log('❌ PROBLEMA: admin@comaes.com NÃO EXISTE no banco!\n');
      console.log('   Você precisa criar ou fazer seed do admin\n');
    } else {
      console.log('✅ admin@comaes.com encontrado:\n');
      console.log(`   ID: ${adminCheck.id}`);
      console.log(`   Nome: ${adminCheck.nome}`);
      console.log(`   Role: ${adminCheck.role}`);
      console.log(`   isAdmin: ${adminCheck.isAdmin}`);
      console.log(`   Password Hash: ${adminCheck.password ? '✅ Presente' : '❌ Ausente'}\n`);

      if (!adminCheck.isAdmin || adminCheck.role !== 'admin') {
        console.log('⚠️  AVISO: Usuário NÃO está marcado como admin!\n');
        console.log('   Execute:');
        console.log(`   UPDATE usuarios SET isAdmin=true, role='admin' WHERE id=${adminCheck.id};\n`);
      }
    }

    // 3. Verificar JWT_SECRET
    console.log('3️⃣ Verificando JWT_SECRET...\n');
    console.log(`   JWT_SECRET carregado: ${process.env.JWT_SECRET ? '✅ YES' : '❌ NO'}`);
    console.log(`   JWT_SECRET value: ${process.env.JWT_SECRET || 'USANDO DEFAULT "secret"'}\n`);

    // 4. Teste de login simulado
    console.log('4️⃣ Simulando verificação de token...\n');
    if (adminCheck) {
      const jwt = await import('jsonwebtoken');
      
      // Criar token com novo isAdmin
      const testPayload = {
        id: adminCheck.id,
        email: adminCheck.email,
        role: adminCheck.role,
        isAdmin: true,
        status_colaborador: 'aprovado'
      };
      
      const testToken = jwt.default.sign(
        testPayload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );
      
      console.log('   Token criado para teste');
      
      // Tentar verificar
      try {
        const decoded = jwt.default.verify(
          testToken,
          process.env.JWT_SECRET || 'secret'
        );
        console.log('   ✅ Token verificado com sucesso');
        console.log(`   decoded.isAdmin = ${decoded.isAdmin}\n`);
      } catch (err) {
        console.log(`   ❌ Erro ao verificar token: ${err.message}\n`);
      }
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('CONCLUSÃO:');
    if (admins.length === 0) {
      console.log('❌ Problema: Nenhum admin no banco');
    } else if (!adminCheck?.isAdmin) {
      console.log('⚠️  Problema: Admin não está marcado como isAdmin=true');
    } else {
      console.log('✅ Admin configurado corretamente no banco');
    }
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro ao diagnosticar:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

diagnose();
