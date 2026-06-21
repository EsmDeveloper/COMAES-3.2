/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMAES 3.2 - GENERIC CONTROLLER SEGURO
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Substituição completa do controller anterior
 * Usa modelMapperSecure com whitelist estrita
 */

import { getModel, getModelSchema } from '../utils/modelMapperSecure.js';
import { validateNome, validateEmail, validatePassword, validateUserData } from '../utils/validators.js';

/**
 * Middleware to get the model for the route
 * Agora usa a whitelist segura
 */
export const getModelByName = (req, res, next) => {
    try {
        req.Model = getModel(req.params.model);
        next();
    } catch (error) {
        res.status(404).json({ 
          success: false,
          message: error.message,
          code: 'MODEL_NOT_ALLOWED'
        });
    }
};

export const getAll = async (req, res) => {
    try {
        const { Model } = req;
        const data = await Model.findAll();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: `Erro ao obter ${req.params.model}`, error: error.message });
    }
};

export const getSchema = async (req, res) => {
    try {
        const modelName = req.params.model;
        const schema = getModelSchema(modelName);
        res.status(200).json({
          success: true,
          data: schema
        });
    } catch (error) {
        res.status(500).json({ 
          success: false,
          message: `Erro ao obter schema de ${req.params.model}`, 
          error: error.message 
        });
    }
};

export const getById = async (req, res) => {
    try {
        const { Model } = req;
        const { id } = req.params;
        const record = await Model.findByPk(id);
        if (record) {
            res.status(200).json(record);
        } else {
            res.status(404).json({ message: `${req.params.model} não encontrado` });
        }
    } catch (error) {
        res.status(500).json({ message: `Erro ao obter ${req.params.model}`, error: error.message });
    }
};

// Helper: gera slug a partir de uma string
const buildSlug = (value = '') =>
    value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 120);

export const create = async (req, res) => {
    try {
        const { Model } = req;
        let body = { ...req.body };
        
        // Validação centralizada para o modelo Usuario
        if (Model.name === 'Usuario') {
            const { nome, email, password } = body;
            const validation = validateUserData({ nome, email, password });
            
            if (!validation.valid) {
                return res.status(400).json({ 
                    message: 'Dados inválidos.',
                    errors: validation.errors 
                });
            }
        }

        // Tratamento especial para Noticia:
        // - autor_id deve vir do token JWT (req.user), não do body
        // - slug deve ser gerado automaticamente a partir do titulo
        // - tags devem ser normalizadas para array
        if (Model.name === 'Noticia') {
            // Injetar autor_id do usuário autenticado
            if (req.user && req.user.id) {
                body.autor_id = req.user.id;
            } else {
                return res.status(401).json({ message: 'Usuário não autenticado.' });
            }

            // Gerar slug único a partir do titulo
            if (body.titulo) {
                let baseSlug = buildSlug(body.titulo);
                let slug = baseSlug;
                let counter = 1;
                // Garantir unicidade do slug
                while (true) {
                    const existing = await Model.findOne({ where: { slug } });
                    if (!existing) break;
                    slug = `${baseSlug}-${counter++}`;
                }
                body.slug = slug;
            } else {
                return res.status(400).json({ message: 'O título é obrigatório para criar uma notícia.' });
            }

            // Normalizar tags para array
            if (body.tags !== undefined) {
                if (Array.isArray(body.tags)) {
                    body.tags = body.tags.map(t => String(t).trim()).filter(Boolean);
                } else if (typeof body.tags === 'string' && body.tags.trim()) {
                    body.tags = body.tags.split(',').map(t => t.trim()).filter(Boolean);
                } else {
                    body.tags = [];
                }
            }

            // Definir publicado_em se publicado=true e não foi fornecido
            if (body.publicado && !body.publicado_em) {
                body.publicado_em = new Date();
            }
        }
        
        const newRecord = await Model.create(body);
        res.status(201).json(newRecord);
    } catch (error) {
        // Tratamento de erros de validação do Sequelize
        if (error.name === 'SequelizeValidationError') {
            const errors = {};
            error.errors.forEach(err => {
                errors[err.path] = err.message;
            });
            return res.status(400).json({ 
                message: 'Erro de validação.',
                errors 
            });
        }
        res.status(500).json({ message: `Erro ao criar ${req.params.model}`, error: error.message });
    }
};

// helper to pick primary key attribute dynamically
const getPkField = (Model) => {
    // Sequelize stores primary keys in Model.primaryKeys or primaryKeyAttribute
    if (Model.primaryKeyAttributes && Model.primaryKeyAttributes.length) {
        return Model.primaryKeyAttributes[0];
    }
    if (Model.primaryKeyAttribute) {
        return Model.primaryKeyAttribute;
    }
    // fallback
    return 'id';
};

export const update = async (req, res) => {
    try {
        const { Model } = req;
        const { id } = req.params;
        const pk = getPkField(Model);
        const where = {};
        where[pk] = id;
        
        // Validação centralizada para o modelo Usuario
        if (Model.name === 'Usuario') {
            const { nome, email, password } = req.body;
            const fieldsToValidate = {};
            if (nome !== undefined) fieldsToValidate.nome = nome;
            if (email !== undefined) fieldsToValidate.email = email;
            if (password !== undefined) fieldsToValidate.password = password;
            
            const validation = validateUserData(fieldsToValidate);
            
            if (!validation.valid) {
                return res.status(400).json({ 
                    message: 'Dados inválidos.',
                    errors: validation.errors 
                });
            }
        }
        
        // ensure updated timestamp is refreshed when field exists
        if (Model.rawAttributes && Model.rawAttributes.atualizado_em) {
            req.body = { ...req.body, atualizado_em: new Date() };
        }
        const [updated] = await Model.update(req.body, { where });
        if (updated) {
            const record = await Model.findOne({ where });
            res.status(200).json(record);
        } else {
            res.status(404).json({ message: `${req.params.model} não encontrado` });
        }
    } catch (error) {
        res.status(500).json({ message: `Erro ao atualizar ${req.params.model}`, error: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        const { Model } = req;
        const { id } = req.params;
        const pk = getPkField(Model);
        const where = {};
        where[pk] = id;
        const deleted = await Model.destroy({ where });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: `${req.params.model} não encontrado` });
        }
    } catch (error) {
        res.status(500).json({ message: `Erro ao deletar ${req.params.model}`, error: error.message });
    }
};
