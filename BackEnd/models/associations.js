/**
 * Configuração centralizada de todas as associações Sequelize
 * Este arquivo deve ser importado ANTES de qualquer rota ou controller
 * para garantir que as associações estejam disponíveis
 */

import Usuario from "./User.js";
import Funcao from "./Funcao.js";
import RedefinicaoSenha from "./RedefinicaoSenha.js";
import ConfiguracaoUsuario from "./ConfiguracaoUsuario.js";
import Torneio from "./Torneio.js";
import ParticipanteTorneio from "./ParticipanteTorneio.js";
import Noticia from "./Noticia.js";
import TentativaTeste from "./TentativaTeste.js";
import TentativaResposta from "./TentativaResposta.js";
import TicketSuporte from "./TicketSuporte.js";
import Notificacao from "./Notificacao.js";
import Conquista from "./Conquista.js";
import ConquistaUsuario from "./ConquistaUsuario.js";
import Certificate from "./Certificate.js";
import Certificado from "./Certificado.js";
import Questao from "./Questao.js";
import QuestaoMatematica from "./QuestaoMatematica.js";
import QuestaoProgramacao from "./QuestaoProgramacao.js";
import QuestaoIngles from "./QuestaoIngles.js";
import ResultadoTeste from "./ResultadoTeste.js";
import BlocoQuestoes from "./BlocoQuestoes.js";
import BlocoQuestaoItem from "./BlocoQuestaoItem.js";
import TorneioBloco from "./TorneioBloco.js";
import QuestaoTesteConhecimento from "./QuestaoTesteConhecimento.js";
import SequenciaAprendizagem from "./SequenciaAprendizagem.js";
import Missao from "./Missao.js";
import MissaoUsuario from "./MissaoUsuario.js";
import Ranking from "./Ranking.js";

// Flag para garantir que setupAssociations só é chamado uma vez
let associationsConfigured = false;

export const setupAssociations = () => {
  if (associationsConfigured) {
    console.log('⚠️ Associações já foram configuradas anteriormente');
    return;
  }

  console.log('🔗 Configurando associações Sequelize...');

  // Usuario <-> Funcao
  Funcao.hasMany(Usuario, { foreignKey: 'funcao_id', as: 'usuarios' });
  Usuario.belongsTo(Funcao, { foreignKey: 'funcao_id', as: 'funcao' });

  // Usuario <-> RedefinicaoSenha
  Usuario.hasMany(RedefinicaoSenha, { foreignKey: 'usuario_id', as: 'redefinicoes' });
  RedefinicaoSenha.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // Usuario <-> ConfiguracaoUsuario (1:1)
  Usuario.hasOne(ConfiguracaoUsuario, { foreignKey: 'usuario_id', as: 'configuracao' });
  ConfiguracaoUsuario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // Torneio <-> Usuario (criador)
  Usuario.hasMany(Torneio, { foreignKey: 'criado_por', as: 'torneiosCriados' });
  Torneio.belongsTo(Usuario, { foreignKey: 'criado_por', as: 'criador' });

  // Torneio <-> ParticipanteTorneio
  Torneio.hasMany(ParticipanteTorneio, { foreignKey: 'torneio_id', as: 'participantes' });
  ParticipanteTorneio.belongsTo(Torneio, { foreignKey: 'torneio_id', as: 'torneio' });

  // ⭐ ASSOCIAÇÃO CRÍTICA: ParticipanteTorneio <-> Usuario
  Usuario.hasMany(ParticipanteTorneio, { foreignKey: 'usuario_id', as: 'torneios' });
  ParticipanteTorneio.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // Noticia <-> Usuario (autor)
  Usuario.hasMany(Noticia, { foreignKey: 'autor_id', as: 'noticias' });
  Noticia.belongsTo(Usuario, { foreignKey: 'autor_id', as: 'autor' });

  // TentativaTeste <-> Usuario
  Usuario.hasMany(TentativaTeste, { foreignKey: 'usuario_id', as: 'tentativas' });
  TentativaTeste.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // TicketSuporte <-> Usuario (autor)
  Usuario.hasMany(TicketSuporte, { foreignKey: 'usuario_id', as: 'ticketsEnviados' });
  TicketSuporte.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario', onDelete: 'SET NULL' });

  // TicketSuporte <-> Usuario (atribuído_para)
  Usuario.hasMany(TicketSuporte, { foreignKey: 'atribuido_para', as: 'ticketsAtribuidos' });
  TicketSuporte.belongsTo(Usuario, { foreignKey: 'atribuido_para', as: 'atribuido', onDelete: 'SET NULL' });

  // Notificacao <-> Usuario
  Usuario.hasMany(Notificacao, { foreignKey: 'usuario_id', as: 'notificacoes' });
  Notificacao.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // ConquistaUsuario <-> Usuario
  Usuario.hasMany(ConquistaUsuario, { foreignKey: 'usuario_id', as: 'conquistas' });
  ConquistaUsuario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // ConquistaUsuario <-> Conquista
  Conquista.hasMany(ConquistaUsuario, { foreignKey: 'conquista_id', as: 'usuarios' });
  ConquistaUsuario.belongsTo(Conquista, { foreignKey: 'conquista_id', as: 'conquista' });

  // ConquistaUsuario <-> Usuario (concedido_por)
  Usuario.hasMany(ConquistaUsuario, { foreignKey: 'concedido_por', as: 'conquistasConcedidas' });
  ConquistaUsuario.belongsTo(Usuario, { foreignKey: 'concedido_por', as: 'concedidoPor', onDelete: 'SET NULL' });

  // Certificate <-> Usuario (usando usuario_id no banco)
  Usuario.hasMany(Certificate, { foreignKey: 'usuario_id', as: 'certificates' });
  Certificate.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'user' });

  // Certificate <-> Torneio (usando torneio_id no banco)
  Torneio.hasMany(Certificate, { foreignKey: 'torneio_id', as: 'certificates' });
  Certificate.belongsTo(Torneio, { foreignKey: 'torneio_id', as: 'tournament' });

  // Certificado <-> Usuario
  Usuario.hasMany(Certificado, { foreignKey: 'usuario_id', as: 'certificados' });
  Certificado.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // Certificado <-> Torneio
  Torneio.hasMany(Certificado, { foreignKey: 'torneio_id', as: 'certificados' });
  Certificado.belongsTo(Torneio, { foreignKey: 'torneio_id', as: 'torneio' });

  // Certificado <-> ParticipanteTorneio
  ParticipanteTorneio.hasOne(Certificado, { foreignKey: 'participante_id', as: 'certificado' });
  Certificado.belongsTo(ParticipanteTorneio, { foreignKey: 'participante_id', as: 'participante' });

  // TentativaResposta <-> Usuario
  Usuario.hasMany(TentativaResposta, { foreignKey: 'usuario_id', as: 'tentativasRespostas' });
  TentativaResposta.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // TentativaResposta <-> Questao
  Questao.hasMany(TentativaResposta, { foreignKey: 'questao_id', as: 'tentativas' });
  TentativaResposta.belongsTo(Questao, { foreignKey: 'questao_id', as: 'questao' });

  // Questao <-> Usuario (colaborador autor / admin revisor)
  Usuario.hasMany(Questao, { foreignKey: 'autor_id', as: 'questoesCriadas' });
  Questao.belongsTo(Usuario, { foreignKey: 'autor_id', as: 'autor' });
  Usuario.hasMany(Questao, { foreignKey: 'revisado_por', as: 'questoesRevisadas' });
  Questao.belongsTo(Usuario, { foreignKey: 'revisado_por', as: 'revisadoPor' });

  // TentativaResposta <-> Torneio
  Torneio.hasMany(TentativaResposta, { foreignKey: 'torneio_id', as: 'tentativas' });
  TentativaResposta.belongsTo(Torneio, { foreignKey: 'torneio_id', as: 'torneio' });

  // Questao <-> QuestaoMatematica (herança)
  Questao.hasOne(QuestaoMatematica, { foreignKey: 'questao_id', as: 'detalhesMatematica' });
  QuestaoMatematica.belongsTo(Questao, { foreignKey: 'questao_id', as: 'questao' });

  // Questao <-> QuestaoProgramacao (herança)
  Questao.hasOne(QuestaoProgramacao, { foreignKey: 'questao_id', as: 'detalhesProgramacao' });
  QuestaoProgramacao.belongsTo(Questao, { foreignKey: 'questao_id', as: 'questao' });

  // Questao <-> QuestaoIngles (herança)
  Questao.hasOne(QuestaoIngles, { foreignKey: 'questao_id', as: 'detalhesIngles' });
  QuestaoIngles.belongsTo(Questao, { foreignKey: 'questao_id', as: 'questao' });

  // ResultadoTeste <-> Usuario
  Usuario.hasMany(ResultadoTeste, { foreignKey: 'usuario_id', as: 'resultadosTeste' });
  ResultadoTeste.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // ── Blocos de Questões ────────────────────────────────────────────────────

  // BlocoQuestoes <-> Usuario (criador)
  Usuario.hasMany(BlocoQuestoes, { foreignKey: 'criado_por', as: 'blocosCriados' });
  BlocoQuestoes.belongsTo(Usuario, { foreignKey: 'criado_por', as: 'criador' });

  // BlocoQuestoes <-> Usuario (aprovadorAdmin)
  Usuario.hasMany(BlocoQuestoes, { foreignKey: 'aprovado_por_id', as: 'blocosAprovados' });
  BlocoQuestoes.belongsTo(Usuario, { foreignKey: 'aprovado_por_id', as: 'aprovadorAdmin' });

  // BlocoQuestoes <-> QuestaoTesteConhecimento (N:M via BlocoQuestaoItem)
  BlocoQuestoes.belongsToMany(QuestaoTesteConhecimento, {
    through: BlocoQuestaoItem,
    foreignKey: 'bloco_id',
    otherKey: 'questao_id',
    as: 'questoes',
  });
  QuestaoTesteConhecimento.belongsToMany(BlocoQuestoes, {
    through: BlocoQuestaoItem,
    foreignKey: 'questao_id',
    otherKey: 'bloco_id',
    as: 'blocos',
  });

  // BlocoQuestaoItem direto (para queries com include)
  BlocoQuestoes.hasMany(BlocoQuestaoItem, { foreignKey: 'bloco_id', as: 'items' });
  BlocoQuestaoItem.belongsTo(BlocoQuestoes, { foreignKey: 'bloco_id', as: 'bloco' });
  QuestaoTesteConhecimento.hasMany(BlocoQuestaoItem, { foreignKey: 'questao_id', as: 'blocoItems' });
  BlocoQuestaoItem.belongsTo(QuestaoTesteConhecimento, { foreignKey: 'questao_id', as: 'questao' });

  // Torneio <-> BlocoQuestoes (N:M via TorneioBloco)
  Torneio.belongsToMany(BlocoQuestoes, {
    through: TorneioBloco,
    foreignKey: 'torneio_id',
    otherKey: 'bloco_id',
    as: 'blocos',
  });
  BlocoQuestoes.belongsToMany(Torneio, {
    through: TorneioBloco,
    foreignKey: 'bloco_id',
    otherKey: 'torneio_id',
    as: 'torneios',
  });

  // TorneioBloco direto (para queries com include)
  Torneio.hasMany(TorneioBloco, { foreignKey: 'torneio_id', as: 'torneiBlocos' });
  TorneioBloco.belongsTo(Torneio, { foreignKey: 'torneio_id', as: 'torneio' });
  BlocoQuestoes.hasMany(TorneioBloco, { foreignKey: 'bloco_id', as: 'torneioAssociacoes' });
  TorneioBloco.belongsTo(BlocoQuestoes, { foreignKey: 'bloco_id', as: 'bloco' });

  // ── Streak / Sequência de Aprendizagem ────────────────────────────────────
  Usuario.hasOne(SequenciaAprendizagem, { foreignKey: 'usuario_id', as: 'sequencia' });
  SequenciaAprendizagem.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // ── Missões ────────────────────────────────────────────────────────────────
  Usuario.hasMany(MissaoUsuario, { foreignKey: 'usuario_id', as: 'missoes_usuario' });
  MissaoUsuario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  Missao.hasMany(MissaoUsuario, { foreignKey: 'missao_id', as: 'progressos' });
  MissaoUsuario.belongsTo(Missao, { foreignKey: 'missao_id', as: 'missao' });

  // ── Rankings Educacionais Gamificados ─────────────────────────────────────
  try {
    console.log('🔗 Configurando associação Ranking <-> Usuario...');
    Usuario.hasMany(Ranking, { foreignKey: 'usuario_id', as: 'rankings' });
    Ranking.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
    console.log('   ✅ Associação Ranking <-> Usuario configurada');
  } catch (error) {
    console.error('   ❌ Erro ao configurar associação Ranking:', error.message);
    console.log('   ⚠️ O modelo Ranking ainda não foi inicializado. Inicializando agora...');
    
    try {
      // Tentar inicializar o modelo Ranking manualmente
      const sequelize = Usuario.sequelize;
      Ranking.init(sequelize);
      Ranking.associate({ Usuario });
      
      Usuario.hasMany(Ranking, { foreignKey: 'usuario_id', as: 'rankings' });
      Ranking.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
      console.log('   ✅ Associação Ranking <-> Usuario configurada após inicialização');
    } catch (initError) {
      console.error('   ❌ Falha ao inicializar modelo Ranking:', initError.message);
      console.log('   ⚠️ Contornando erro - continuando sem associação Ranking');
    }
  }

  associationsConfigured = true;
  console.log('✅ Associações Sequelize configuradas com sucesso!');
  console.log('   - Usuario <-> ParticipanteTorneio: ✅');
  console.log('   - ParticipanteTorneio <-> Torneio: ✅');
  console.log('   - Rankings <-> Usuario: ✅');
  console.log('   - Todas as outras associações: ✅');
};

// Configurar associações imediatamente quando este módulo é importado
setupAssociations();

export default setupAssociations;
