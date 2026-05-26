import express from 'express';
import isAdmin from '../middlewares/isAdmin.js';
import * as GenericController from '../controllers/GenericController.js';
import { getModelNames, getModel } from '../utils/modelMapper.js';
import UserController from '../controllers/UserController.js';
import TorneoController from '../controllers/TorneoController.js';
import Usuario from '../models/User.js';
import Torneio from '../models/Torneio.js';
import Questao from '../models/Questao.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import ResultadoTeste from '../models/ResultadoTeste.js';
import { Op } from 'sequelize';

const router = express.Router();

// ===== ENDPOINT DE ESTATÍSTICAS AGREGADAS =====
router.get('/stats', isAdmin, async (req, res) => {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

        // Executar todas as consultas em paralelo para melhor desempenho
        const [
            totalUsuarios,
            totalAdmins,
            usuarios7Dias,
            usuarios30Dias,
            usuarios90Dias,
            totalTorneios,
            torneiosAtivos,
            torneiosFinalizados,
            totalQuestoes,
            questoesTorneio,
            questoesTesteConhecimento,
            resultados30Dias,
            mediaGeralAcertos,
            inscricoesAtivas,
            ultimosTestes,
            ultimosTorneios
        ] = await Promise.all([
            // Total de usuários
            Usuario.count(),
            // Total de administradores
            Usuario.count({ where: { isAdmin: true } }),
            // Novos usuários nos últimos 7 dias
            Usuario.count({ where: { createdAt: { [Op.gt]: sevenDaysAgo } } }),
            // Novos usuários nos últimos 30 dias
            Usuario.count({ where: { createdAt: { [Op.gt]: thirtyDaysAgo } } }),
            // Novos usuários nos últimos 90 dias
            Usuario.count({ where: { createdAt: { [Op.gt]: ninetyDaysAgo } } }),
            // Total de torneios
            Torneio.count(),
            // Torneios ativos
            Torneio.count({ where: { status: 'ativo' } }),
            // Torneios finalizados
            Torneio.count({ where: { status: 'finalizado' } }),
            // Total de questões (todas)
            Questao.count(),
            // Questões de torneios
            Questao.count({ where: { torneio_id: { [Op.ne]: null } } }),
            // Questões de teste de conhecimento (torneio_id null)
            Questao.count({ where: { torneio_id: null } }),
            // Testes de conhecimento realizados nos últimos 30 dias
            ResultadoTeste.count({ where: { created_at: { [Op.gt]: thirtyDaysAgo } } }),
            // Média geral de acertos
            ResultadoTeste.findAll({
                attributes: [
                    [require('sequelize').fn('AVG', require('sequelize').col('percentual_acertos')), 'media']
                ],
                raw: true
            }),
            // Inscrições em torneios ativos
            ParticipanteTorneio.count({
                include: [{
                    model: Torneio,
                    as: 'torneio',
                    where: { status: 'ativo' },
                    required: true
                }]
            }),
            // Últimos 5 testes concluídos
            ResultadoTeste.findAll({
                limit: 5,
                order: [['created_at', 'DESC']],
                include: [{
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['id', 'nome', 'email']
                }]
            }),
            // Últimos 3 torneios criados
            Torneio.findAll({
                limit: 3,
                order: [['criado_em', 'DESC']],
                attributes: ['id', 'titulo', 'status', 'criado_em', 'inicia_em', 'termina_em']
            })
        ]);

        // Calcular variação percentual (simulada - comparação com período anterior)
        const variacao7Dias = usuarios7Dias > 0 ? Math.round((usuarios7Dias / (usuarios30Dias - usuarios7Dias || 1)) * 100) : 0;
        const variacao30Dias = usuarios30Dias > 0 ? Math.round((usuarios30Dias / (usuarios90Dias - usuarios30Dias || 1)) * 100) : 0;

        // Processar dados de evolução de usuários (últimos 30 dias)
        const evolucaoUsuarios = await gerarEvolucaoUsuarios(thirtyDaysAgo);

        res.json({
            success: true,
            data: {
                usuarios: {
                    total: totalUsuarios,
                    administradores: totalAdmins,
                    novos: {
                        dias7: usuarios7Dias,
                        dias30: usuarios30Dias,
                        dias90: usuarios90Dias,
                        variacao7Dias: variacao7Dias,
                        variacao30Dias: variacao30Dias
                    }
                },
                torneios: {
                    total: totalTorneios,
                    ativos: torneiosAtivos,
                    finalizados: torneiosFinalizados,
                    inscricoesAtivas: inscricoesAtivas
                },
                questoes: {
                    total: totalQuestoes,
                    torneios: questoesTorneio,
                    testeConhecimento: questoesTesteConhecimento
                },
                testesConhecimento: {
                    realizados30Dias: resultados30Dias,
                    mediaAcertos: mediaGeralAcertos[0]?.media ? Math.round(parseFloat(mediaGeralAcertos[0].media)) : 0
                },
                evolucaoUsuarios,
                ultimasAtividades: {
                    ultimosTestes: ultimosTestes.map(t => ({
                        id: t.id,
                        usuario: t.usuario?.nome || 'Usuário desconhecido',
                        area: t.area,
                        percentual: t.percentual_acertos,
                        pontos: t.pontos,
                        data: t.created_at
                    })),
                    ultimosTorneios: ultimosTorneios.map(t => ({
                        id: t.id,
                        titulo: t.titulo,
                        status: t.status,
                        data: t.criado_em
                    }))
                }
            }
        });
    } catch (error) {
        console.error('Erro ao gerar estatísticas:', error);
        res.status(500).json({ success: false, error: 'Erro ao gerar estatísticas' });
    }
});

// Helper para gerar dados de evolução de usuários
async function gerarEvolucaoUsuarios(sinceDate) {
    const dias = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

        const count = await Usuario.count({
            where: {
                createdAt: {
                    [Op.gte]: date,
                    [Op.lt]: nextDate
                }
            }
        });

        dias.push({
            data: date.toISOString().split('T')[0],
            usuarios: count
        });
    }

    return dias;
}

// Rota para obter a lista de todos os modelos disponíveis
router.get('/models', isAdmin, (req, res) => {
    try {
        const modelNames = getModelNames();
        res.status(200).json(modelNames);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter a lista de modelos', error: error.message });
    }
});

// ===== ROTAS ESPECÍFICAS (modelos com controladores dedicados) =====
router.get('/users', isAdmin, UserController.getAllUsers);
router.post('/users', isAdmin, UserController.createUser);
router.put('/users/:id', isAdmin, UserController.updateUser);
router.delete('/users/:id', isAdmin, UserController.deleteUser);
router.patch('/users/:id/toggle-admin', isAdmin, UserController.toggleAdmin);
router.patch('/users/:id/reset-password', isAdmin, UserController.resetPassword);

router.get('/torneos', isAdmin, TorneoController.getAllTorneos);
router.post('/torneos', isAdmin, TorneoController.createTorneo);
router.put('/torneos/:id', isAdmin, TorneoController.updateTorneo);
router.delete('/torneos/:id', isAdmin, TorneoController.deleteTorneo);
router.get('/torneos/:id/participantes', isAdmin, TorneoController.getParticipantes);
router.post('/torneos/inscrever', isAdmin, TorneoController.inscreverParticipante);
router.patch('/participantes/:id/pontos', isAdmin, TorneoController.atualizarPontos);

// ===== ROTAS GENÉRICAS (modelos definidos em modelMapper.js) =====
const resolveModel = (req, res, next) => {
    try {
        req.Model = getModel(req.params.model);
        next();
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

router.get('/:model', isAdmin, resolveModel, GenericController.getAll);
router.get('/:model/:id', isAdmin, resolveModel, GenericController.getById);
router.post('/:model', isAdmin, resolveModel, GenericController.create);
router.put('/:model/:id', isAdmin, resolveModel, GenericController.update);
router.delete('/:model/:id', isAdmin, resolveModel, GenericController.remove);

export default router;
