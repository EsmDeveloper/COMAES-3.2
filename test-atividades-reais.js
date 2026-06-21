/**
 * Script de Teste: Atividades Recentes - Dados REAIS
 * 
 * Este script testa se a implementação de atividades recentes
 * está buscando dados reais do banco de dados.
 * 
 * Uso: node test-atividades-reais.js
 */

import sequelize from './BackEnd/config/db.js';
import Usuario from './BackEnd/models/User.js';
import ParticipanteTorneio from './BackEnd/models/ParticipanteTorneio.js';
import Torneio from './BackEnd/models/Torneio.js';
import TentativaTeste from './BackEnd/models/TentativaTeste.js';
import Questao from './BackEnd/models/Questao.js';
import Certificado from './BackEnd/models/Certificado.js';
import { Op } from 'sequelize';

async function testarAtividadesReais() {
  try {
    console.log('\n🧪 TESTE: Atividades Recentes - Dados REAIS');
    console.log('=' .repeat(60));

    // Conectar ao BD
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida\n');

    const dataLimite = new Date(Date.now() - 24 * 60 * 60 * 1000);
    console.log(`📅 Buscando atividades desde: ${dataLimite.toLocaleString('pt-BR')}\n`);

    // 1. PARTICIPAÇÕES EM TORNEIOS
    console.log('1️⃣ PARTICIPAÇÕES EM TORNEIOS');
    const participacoes = await ParticipanteTorneio.findAll({
      include: [
        { model: Usuario, attributes: ['id', 'nome', 'email'] },
        { model: Torneio, attributes: ['id', 'titulo'] }
      ],
      where: {
        createdAt: { [Op.gte]: dataLimite }
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
      raw: false
    });
    console.log(`   Encontradas: ${participacoes.length}`);
    participacoes.forEach(p => {
      if (p.Usuario && p.Torneio) {
        console.log(`   ✓ ${p.Usuario.nome} → ${p.Torneio.titulo} (${p.createdAt.toLocaleString('pt-BR')})`);
      }
    });
    console.log();

    // 2. TESTES COMPLETADOS
    console.log('2️⃣ TESTES COMPLETADOS');
    const testes = await TentativaTeste.findAll({
      include: [
        { model: Usuario, attributes: ['id', 'nome', 'email'] }
      ],
      where: {
        createdAt: { [Op.gte]: dataLimite },
        status: 'completo'
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
      raw: false
    });
    console.log(`   Encontrados: ${testes.length}`);
    testes.forEach(t => {
      if (t.Usuario) {
        const score = Math.round(t.score || 0);
        console.log(`   ✓ ${t.Usuario.nome} - ${score}% acertos (${t.createdAt.toLocaleString('pt-BR')})`);
      }
    });
    console.log();

    // 3. QUESTÕES CRIADAS
    console.log('3️⃣ QUESTÕES CRIADAS');
    const questoes = await Questao.findAll({
      include: [
        { model: Usuario, attributes: ['id', 'nome', 'email'], as: 'autor' }
      ],
      where: {
        createdAt: { [Op.gte]: dataLimite }
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
      raw: false
    });
    console.log(`   Encontradas: ${questoes.length}`);
    questoes.forEach(q => {
      const autorNome = q.autor?.nome || 'Desconhecido';
      const titulo = (q.titulo || q.enunciado || 'Sem título').substring(0, 40);
      console.log(`   ✓ ${autorNome} → "${titulo}..." (${q.createdAt.toLocaleString('pt-BR')})`);
    });
    console.log();

    // 4. QUESTÕES APROVADAS
    console.log('4️⃣ QUESTÕES APROVADAS');
    const questoesAprovadas = await Questao.findAll({
      include: [
        { model: Usuario, attributes: ['id', 'nome', 'email'], as: 'autor' }
      ],
      where: {
        status_aprovacao: 'aprovada',
        updatedAt: { [Op.gte]: dataLimite }
      },
      order: [['updatedAt', 'DESC']],
      limit: 5,
      raw: false
    });
    console.log(`   Encontradas: ${questoesAprovadas.length}`);
    questoesAprovadas.forEach(q => {
      const autorNome = q.autor?.nome || 'Desconhecido';
      const titulo = (q.titulo || q.enunciado || 'Sem título').substring(0, 40);
      console.log(`   ✓ ${autorNome} → "${titulo}..." (${q.updatedAt.toLocaleString('pt-BR')})`);
    });
    console.log();

    // 5. CERTIFICADOS EMITIDOS
    console.log('5️⃣ CERTIFICADOS EMITIDOS');
    const certificados = await Certificado.findAll({
      include: [
        { model: Usuario, attributes: ['id', 'nome', 'email'] },
        { model: Torneio, attributes: ['id', 'titulo'] }
      ],
      where: {
        createdAt: { [Op.gte]: dataLimite }
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
      raw: false
    });
    console.log(`   Encontrados: ${certificados.length}`);
    certificados.forEach(c => {
      if (c.Usuario && c.Torneio) {
        console.log(`   ✓ ${c.Usuario.nome} → ${c.Torneio.titulo} (${c.createdAt.toLocaleString('pt-BR')})`);
      }
    });
    console.log();

    // 6. TORNEIOS FINALIZADOS
    console.log('6️⃣ TORNEIOS FINALIZADOS');
    const torneios = await Torneio.findAll({
      where: {
        status: 'finalizado',
        updatedAt: { [Op.gte]: dataLimite }
      },
      order: [['updatedAt', 'DESC']],
      limit: 5,
      raw: false
    });
    console.log(`   Encontrados: ${torneios.length}`);
    torneios.forEach(t => {
      console.log(`   ✓ ${t.titulo} (${t.updatedAt.toLocaleString('pt-BR')})`);
    });
    console.log();

    // RESUMO
    const totalAtividades = 
      participacoes.length + 
      testes.length + 
      questoes.length + 
      questoesAprovadas.length + 
      certificados.length + 
      torneios.length;

    console.log('=' .repeat(60));
    console.log(`✅ RESULTADO: ${totalAtividades} atividades REAIS encontradas nas últimas 24h`);
    
    if (totalAtividades === 0) {
      console.log('⚠️  AVISO: Nenhuma atividade encontrada nas últimas 24h');
      console.log('   Verifique se há dados no banco de dados');
    } else {
      console.log('✅ Implementação está funcionando corretamente!');
    }
    
    console.log('=' .repeat(60) + '\n');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

testarAtividadesReais();
