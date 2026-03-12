import User from '../models/User.js';
import Funcao from '../models/Funcao.js';
import RedefinicaoSenha from '../models/RedefinicaoSenha.js';
import ConfiguracaoUsuario from '../models/ConfiguracaoUsuario.js';
import Torneio from '../models/Torneio.js';
import Noticia from '../models/Noticia.js';
import Pergunta from '../models/Pergunta.js';
import QuestaoMatematica from '../models/QuestaoMatematica.js';
import QuestaoProgramacao from '../models/QuestaoProgramacao.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import QuestaoIngles from '../models/QuestaoIngles.js';
import TentativaTeste from '../models/TentativaTeste.js';
import TicketSuporte from '../models/TicketSuporte.js';
import Notificacao from '../models/Notificacao.js';
import Conquista from '../models/Conquista.js';
import ConquistaUsuario from '../models/ConquistaUsuario.js';

const models = {
    user: User,
    funcao: Funcao,
    redefinicaosenha: RedefinicaoSenha,
    configuracaousuario: ConfiguracaoUsuario,
    torneio: Torneio,
    noticia: Noticia,
    pergunta: Pergunta,
    questaomatematica: QuestaoMatematica,
    questoes_programacao: QuestaoProgramacao,
    questaoingles: QuestaoIngles,
    tentativateste: TentativaTeste,
    ticketsuporte: TicketSuporte,
    participante_torneio: ParticipanteTorneio,
    notificacao: Notificacao,
    conquista: Conquista,
    conquistausuario: ConquistaUsuario,
};

export const getModel = (modelName) => {
    const model = models[modelName.toLowerCase()];
    if (!model) {
        throw new Error(`Model not found: ${modelName}`);
    }
    return model;
};

export const getModelNames = () => {
    return Object.keys(models);
};
