/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMAES 3.2 - MODEL MAPPER SEGURO COM WHITELIST
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * SUBSTITUIÇÃO COMPLETA DO modelMapper.js ANTERIOR
 * 
 * PRINCÍPIOS:
 * - WHITELIST ESTRITA: apenas modelos explicitamente permitidos
 * - Zero fallbacks dinâmicos
 * - Zero proxy magic
 * - Throw error para modelos não autorizados
 * - Schema validation obrigatória
 */

import Usuario from '../models/User.js';
import Torneio from '../models/Torneio.js';
import Noticia from '../models/Noticia.js';
import Notificacao from '../models/Notificacao.js';
import Questao from '../models/Questao.js';
import Certificado from '../models/Certificado.js';

/**
 * WHITELIST ABSOLUTA DE MODELOS ADMINISTRATIVOS
 * 
 * Qualquer modelo não listado aqui será REJEITADO
 * Não existe fallback, não existe busca dinâmica
 */
const ALLOWED_ADMIN_MODELS = {
  // Gestão de Utilizadores
  'usuario': Usuario,
  'usuarios': Usuario,
  'user': Usuario,
  'users': Usuario,

  // Torneios e Competições
  'torneio': Torneio,
  'torneios': Torneio,
  'tournament': Torneio,

  // Comunicação
  'noticia': Noticia,
  'noticias': Noticia,
  'news': Noticia,

  'notificacao': Notificacao,
  'notificacoes': Notificacao,
  'notification': Notificacao,

  // Questões (read-only no admin genérico)
  'questao': Questao,
  'questoes': Questao,
  'question': Questao,

  // Certificados
  'certificado': Certificado,
  'certificados': Certificado,
  'certificate': Certificado
};

/**
 * Lista de modelos disponíveis (nomes normalizados)
 */
export const AVAILABLE_MODELS = Object.keys(ALLOWED_ADMIN_MODELS)
  .filter((key, index, self) => {
    // Pegar apenas versão singular de cada modelo
    const singular = key.endsWith('s') ? key.slice(0, -1) : key;
    const firstIndex = self.findIndex(k => k === singular || k === singular + 's');
    return index === firstIndex;
  })
  .map(key => key.endsWith('s') ? key.slice(0, -1) : key);

/**
 * Obter modelo por nome com validação de whitelist
 * 
 * @param {string} modelName - Nome do modelo (case-insensitive)
 * @returns {Model} Modelo Sequelize
 * @throws {Error} Se modelo não estiver na whitelist
 */
export function getModel(modelName) {
  if (!modelName || typeof modelName !== 'string') {
    throw new Error('Nome de modelo inválido.');
  }

  const normalized = modelName.toLowerCase().trim();

  if (!ALLOWED_ADMIN_MODELS[normalized]) {
    console.error(`[SECURITY] Tentativa de acesso a modelo não autorizado: "${modelName}"`);
    throw new Error(
      `Modelo "${modelName}" não está disponível. ` +
      `Modelos permitidos: ${AVAILABLE_MODELS.join(', ')}`
    );
  }

  return ALLOWED_ADMIN_MODELS[normalized];
}

/**
 * Verificar se um modelo está na whitelist
 * 
 * @param {string} modelName - Nome do modelo
 * @returns {boolean}
 */
export function isModelAllowed(modelName) {
  if (!modelName || typeof modelName !== 'string') {
    return false;
  }

  const normalized = modelName.toLowerCase().trim();
  return !!ALLOWED_ADMIN_MODELS[normalized];
}

/**
 * Obter lista de modelos permitidos
 * 
 * @returns {string[]} Array de nomes de modelos
 */
export function getAllowedModels() {
  return AVAILABLE_MODELS;
}

/**
 * Obter schema de um modelo
 * Retorna informações de colunas para UI
 * 
 * @param {string} modelName - Nome do modelo
 * @returns {object} Schema information
 */
export function getModelSchema(modelName) {
  const Model = getModel(modelName);
  const attrs = Model.rawAttributes || {};

  const schema = {
    modelName: Model.name,
    tableName: Model.tableName,
    columns: Object.keys(attrs).map(key => {
      const attr = attrs[key];
      const enumValues = attr.values || (attr.type && attr.type.values) || null;

      return {
        name: key,
        type: attr.type ? attr.type.toString() : 'STRING',
        allowNull: attr.allowNull === undefined ? true : attr.allowNull,
        primaryKey: !!attr.primaryKey,
        autoIncrement: !!attr.autoIncrement,
        defaultValue: attr.defaultValue === undefined ? null : attr.defaultValue,
        enumValues: enumValues || null,
        comment: attr.comment || null
      };
    })
  };

  return schema;
}

export default {
  getModel,
  isModelAllowed,
  getAllowedModels,
  getModelSchema,
  AVAILABLE_MODELS
};
