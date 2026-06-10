import sequelize from './config/db.js';
import BlocoQuestoes from './models/BlocoQuestoes.js';
import QuestaoTesteConhecimento from './models/QuestaoTesteConhecimento.js';
import BlocoQuestaoItem from './models/BlocoQuestaoItem.js';
import Torneio from './models/Torneio.js';
import TorneioBloco from './models/TorneioBloco.js';
import './models/associations.js';

/**
 * PHASE 1 TEST SCRIPT
 * Objetivo: Adicionar questões aos blocos existentes e criar um torneio para teste
 * 
 * Sequência:
 * 1. Listar blocos existentes
 * 2. Listar questões ativas existentes
 * 3. Adicionar questões aos blocos (até 5 questões por bloco)
 * 4. Criar um torneio específico (Matemática)
 * 5. Associar blocos ao torneio
 * 6. Verificar dados no frontend
 */

async function runPhase1Test() {
  try {
    console.log('\n========== PHASE 1: TEST DATA SETUP ==========\n');

    // 1. LISTAR BLOCOS EXISTENTES
    console.log('1️⃣  LISTANDO BLOCOS EXISTENTES...\n');
    const blocos = await BlocoQuestoes.findAll({
      attributes: ['id', 'titulo', 'disciplina', 'dificuldade', 'status', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    console.log(`✅ Total de blocos encontrados: ${blocos.length}`);
    if (blocos.length === 0) {
      console.log('   ⚠️  NENHUM BLOCO ENCONTRADO. Criando blocos de teste...\n');
      
      // Criar blocos de teste
      const blocosMath = [];
      for (let i = 1; i <= 2; i++) {
        const bloco = await BlocoQuestoes.create({
          titulo: `Bloco Matemática ${i}`,
          descricao: `Bloco teste de matemática para torneio específico`,
          disciplina: 'matematica',
          dificuldade: i === 1 ? 'facil' : 'medio',
          status: 'pendente',
          criado_por: 1, // Admin user
        });
        blocosMath.push(bloco);
        console.log(`   ✅ Criado: "${bloco.titulo}" (ID: ${bloco.id})`);
      }
      
      blocos.push(...blocosMath);
    } else {
      blocos.forEach((b, idx) => {
        console.log(`   ${idx + 1}. "${b.titulo}" (ID: ${b.id}, Disciplina: ${b.disciplina}, Status: ${b.status})`);
      });
    }

    // 2. LISTAR QUESTÕES ATIVAS
    console.log('\n2️⃣  LISTANDO QUESTÕES ATIVAS...\n');
    const questoes = await QuestaoTesteConhecimento.findAll({
      attributes: ['id', 'enunciado', 'categoria', 'dificuldade', 'ativo'],
      where: { ativo: true },
      order: [['created_at', 'DESC']],
      limit: 100,
    });

    console.log(`✅ Total de questões ativas encontradas: ${questoes.length}`);
    
    if (questoes.length === 0) {
      console.log('   ⚠️  NENHUMA QUESTÃO ATIVA ENCONTRADA. Criando questões de teste...\n');
      
      // Criar questões de teste para cada disciplina
      const disciplinas = ['matematica', 'ingles', 'programacao'];
      const questoesCriadas = [];
      
      for (const disciplina of disciplinas) {
        for (let i = 1; i <= 3; i++) {
          const opcoes = [
            `Opção A para ${disciplina} ${i}`,
            `Opção B para ${disciplina} ${i}`,
            `Opção C para ${disciplina} ${i}`,
            `Opção D para ${disciplina} ${i}`,
          ];
          
          const questao = await QuestaoTesteConhecimento.create({
            enunciado: `Questão ${i} de ${disciplina.toUpperCase()}: O que é isso?`,
            opcoes: opcoes,
            resposta_correta: opcoes[0],
            categoria: disciplina,
            dificuldade: i === 1 ? 'facil' : i === 2 ? 'medio' : 'dificil',
            pontos: i * 10,
            ativo: true,
          });
          
          questoesCriadas.push({ ...questao.toJSON(), disciplina });
          console.log(`   ✅ Criada: "${questao.enunciado}" (ID: ${questao.id}, Categoria: ${disciplina})`);
        }
      }
      
      questoes.push(...questoesCriadas);
    } else {
      console.log('   Primeiras 10 questões:');
      questoes.slice(0, 10).forEach((q, idx) => {
        const enunciado = q.enunciado.substring(0, 50) + '...';
        console.log(`   ${idx + 1}. "${enunciado}" (ID: ${q.id}, Categoria: ${q.categoria})`);
      });
    }

    // 3. ADICIONAR QUESTÕES AOS BLOCOS
    console.log('\n3️⃣  ADICIONANDO QUESTÕES AOS BLOCOS...\n');
    
    const blocosComQuestoes = [];
    
    for (const bloco of blocos) {
      console.log(`📦 Bloco "${bloco.titulo}" (ID: ${bloco.id}):`);
      
      // Filtrar questões da mesma disciplina
      const questoesDaDisc = questoes.filter(q => 
        q.categoria === bloco.disciplina || q.disciplina === bloco.disciplina
      );
      
      if (questoesDaDisc.length === 0) {
        console.log(`   ⚠️  Nenhuma questão encontrada para a disciplina ${bloco.disciplina}`);
        continue;
      }
      
      // Adicionar até 3 questões ao bloco
      let adicionadas = 0;
      for (const questao of questoesDaDisc.slice(0, 3)) {
        try {
          const jaExiste = await BlocoQuestaoItem.findOne({
            where: { bloco_id: bloco.id, questao_id: questao.id },
          });
          
          if (!jaExiste) {
            await BlocoQuestaoItem.create({
              bloco_id: bloco.id,
              questao_id: questao.id,
              ordem: adicionadas,
            });
            adicionadas++;
            console.log(`   ✅ Adicionada: Q${questao.id} - "${questao.enunciado.substring(0, 40)}..."`);
          }
        } catch (err) {
          console.log(`   ❌ Erro ao adicionar Q${questao.id}: ${err.message}`);
        }
      }
      
      const totalQuestoes = await BlocoQuestaoItem.count({ where: { bloco_id: bloco.id } });
      blocosComQuestoes.push({ bloco, totalQuestoes });
      console.log(`   Resultado: ${totalQuestoes} questão(ões) no bloco\n`);
    }

    // 4. CRIAR TORNEIO ESPECÍFICO
    console.log('\n4️⃣  CRIANDO TORNEIO ESPECÍFICO (TESTE)...\n');
    
    const titulo = `Torneio Teste - Matemática Específica - ${new Date().getTime()}`;
    const slug = titulo.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    const torneio = await Torneio.create({
      titulo: titulo,
      slug: slug,
      descricao: 'Torneio de teste para validar sistema com tipo específico',
      tipo_torneio: 'especifico',
      disciplina_especifica: 'matematica',
      inicia_em: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos no futuro
      termina_em: new Date(Date.now() + 60 * 60 * 1000), // 1 hora no futuro
      status: 'rascunho',
      criado_por: 1, // Admin
    });
    
    console.log(`✅ Torneio criado com sucesso:`);
    console.log(`   ID: ${torneio.id}`);
    console.log(`   Título: ${torneio.titulo}`);
    console.log(`   Tipo: ${torneio.tipo_torneio}`);
    console.log(`   Disciplina: ${torneio.disciplina_especifica}\n`);

    // 5. ASSOCIAR BLOCOS AO TORNEIO
    console.log('\n5️⃣  ASSOCIANDO BLOCOS AO TORNEIO...\n');
    
    const blocosAssociados = [];
    
    for (const item of blocosComQuestoes) {
      if (item.totalQuestoes > 0) {
        try {
          // Primeiro, aprovar o bloco
          await item.bloco.update({ status: 'aprovado' });
          
          const assoc = await TorneioBloco.create({
            torneio_id: torneio.id,
            bloco_id: item.bloco.id,
            ordem: blocosAssociados.length,
          });
          
          blocosAssociados.push(assoc);
          console.log(`✅ Bloco "${item.bloco.titulo}" (${item.totalQuestoes} Q) associado ao torneio`);
        } catch (err) {
          console.log(`❌ Erro ao associar bloco: ${err.message}`);
        }
      }
    }
    
    console.log(`\n   Total de blocos associados: ${blocosAssociados.length}`);

    // 6. VALIDAÇÃO FINAL
    console.log('\n6️⃣  VALIDAÇÃO FINAL...\n');
    
    const torneioAtualizado = await Torneio.findByPk(torneio.id);
    console.log(`✅ Torneio "${torneioAtualizado.titulo}":`);
    console.log(`   Status: ${torneioAtualizado.status}`);
    console.log(`   Tipo: ${torneioAtualizado.tipo_torneio}`);
    console.log(`   Disciplina Específica: ${torneioAtualizado.disciplina_especifica}`);
    console.log(`   Blocos Associados: ${blocosAssociados.length}`);
    
    // Listar questões do torneio
    const tortQuestoes = await TorneioBloco.findAll({
      where: { torneio_id: torneio.id },
      include: [{
        model: BlocoQuestoes,
        as: 'bloco',
        include: [{
          model: BlocoQuestaoItem,
          as: 'items',
          include: [{
            model: QuestaoTesteConhecimento,
            as: 'questao',
            attributes: ['id', 'enunciado'],
          }],
        }],
      }],
    });
    
    let totalQuestoes = 0;
    for (const tb of tortQuestoes) {
      const qCount = tb.bloco.items ? tb.bloco.items.length : 0;
      totalQuestoes += qCount;
      console.log(`   - ${tb.bloco.titulo}: ${qCount} questões`);
    }
    
    console.log(`\n✅ TOTAL DE QUESTÕES NO TORNEIO: ${totalQuestoes}`);

    console.log('\n========== PRÓXIMOS PASSOS ==========');
    console.log('1. Ir para Frontend → "Entrar no Torneio"');
    console.log(`2. Procurar pelo torneio: "${torneioAtualizado.titulo}"`);
    console.log('3. Verificar se:');
    console.log('   ✓ Apenas Matemática aparece como ATIVA (verde)');
    console.log('   ✓ Inglês e Programação aparecem como INDISPONÍVEIS (desabilitadas)');
    console.log('4. Clicar em "Ver Torneio" para Matemática');
    console.log('5. Responder as questões do torneio\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runPhase1Test();
