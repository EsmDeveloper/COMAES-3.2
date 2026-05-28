// Script de teste para diagnóstico de geração de certificados
import { generateCertificate } from './certificates/generator/generateCertificado.js';
import sequelize from './config/db.js';
import './models/associations.js';

async function testCertificateGeneration() {
  try {
    console.log('🔍 Iniciando teste de geração de certificado...\n');

    // Conectar ao banco de dados
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida\n');

    // Parâmetros de teste - AJUSTE ESTES VALORES CONFORME NECESSÁRIO
    const torneioId = 1; // ID do torneio
    const usuarioId = 1; // ID do usuário
    const disciplina = 'Matemática';
    const posicao = 1;
    const pontuacao = 95.5;

    console.log('📋 Parâmetros de teste:');
    console.log(`   Torneio ID: ${torneioId}`);
    console.log(`   Usuário ID: ${usuarioId}`);
    console.log(`   Disciplina: ${disciplina}`);
    console.log(`   Posição: ${posicao}`);
    console.log(`   Pontuação: ${pontuacao}\n`);

    // Verificar se o usuário existe
    const [usuarios] = await sequelize.query(
      'SELECT id, nome, email FROM usuarios WHERE id = ?',
      { replacements: [usuarioId] }
    );

    if (usuarios.length === 0) {
      console.error('❌ Usuário não encontrado!');
      console.log('\n💡 Listando usuários disponíveis:');
      const [allUsers] = await sequelize.query('SELECT id, nome, email FROM usuarios LIMIT 5');
      console.table(allUsers);
      process.exit(1);
    }

    console.log(`✅ Usuário encontrado: ${usuarios[0].nome} (${usuarios[0].email})\n`);

    // Verificar se o torneio existe
    const [torneios] = await sequelize.query(
      'SELECT id, titulo, inicia_em, termina_em FROM torneios WHERE id = ?',
      { replacements: [torneioId] }
    );

    if (torneios.length === 0) {
      console.error('❌ Torneio não encontrado!');
      console.log('\n💡 Listando torneios disponíveis:');
      const [allTournaments] = await sequelize.query('SELECT id, titulo, inicia_em, termina_em FROM torneios LIMIT 5');
      console.table(allTournaments);
      process.exit(1);
    }

    console.log(`✅ Torneio encontrado: ${torneios[0].titulo}\n`);

    // Verificar participação
    const [participacoes] = await sequelize.query(
      `SELECT * FROM participantes_torneios 
       WHERE usuario_id = ? AND torneio_id = ? AND disciplina_competida = ?`,
      { replacements: [usuarioId, torneioId, disciplina] }
    );

    if (participacoes.length === 0) {
      console.warn('⚠️  Participação não encontrada - será necessário criar uma\n');
    } else {
      console.log('✅ Participação encontrada:');
      console.table(participacoes);
      console.log('');
    }

    // Verificar se Puppeteer está instalado
    try {
      const puppeteer = await import('puppeteer');
      console.log('✅ Puppeteer instalado e importado com sucesso\n');
    } catch (err) {
      console.error('❌ Erro ao importar Puppeteer:', err.message);
      console.log('\n💡 Execute: npm install puppeteer\n');
      process.exit(1);
    }

    // Verificar se QRCode está instalado
    try {
      const QRCode = await import('qrcode');
      console.log('✅ QRCode instalado e importado com sucesso\n');
    } catch (err) {
      console.error('❌ Erro ao importar QRCode:', err.message);
      console.log('\n💡 Execute: npm install qrcode\n');
      process.exit(1);
    }

    // Verificar diretório de uploads
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsDir = path.join(__dirname, 'uploads', 'certificados');

    if (!fs.existsSync(uploadsDir)) {
      console.log('📁 Criando diretório de uploads...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`✅ Diretório criado: ${uploadsDir}\n`);
    } else {
      console.log(`✅ Diretório de uploads existe: ${uploadsDir}\n`);
    }

    // Tentar gerar o certificado
    console.log('🎨 Gerando certificado...\n');
    const result = await generateCertificate(
      torneioId,
      usuarioId,
      disciplina,
      posicao,
      pontuacao
    );

    if (result.success) {
      console.log('\n✅ ✅ ✅ CERTIFICADO GERADO COM SUCESSO! ✅ ✅ ✅\n');
      console.log('📄 Detalhes:');
      console.log(`   Código: ${result.code}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Certificado ID: ${result.certificado?.id}`);
      console.log('\n');
    } else {
      console.error('\n❌ ❌ ❌ FALHA AO GERAR CERTIFICADO ❌ ❌ ❌\n');
      console.error('Erro:', result.error);
      console.log('\n');
    }

  } catch (error) {
    console.error('\n❌ ERRO DURANTE O TESTE:\n');
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    console.log('\n');
  } finally {
    await sequelize.close();
    console.log('🔌 Conexão com banco de dados fechada');
    process.exit(0);
  }
}

// Executar o teste
testCertificateGeneration();
