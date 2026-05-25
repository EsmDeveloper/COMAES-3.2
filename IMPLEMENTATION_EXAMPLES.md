# 📚 EXEMPLOS PRÁTICOS DE IMPLEMENTAÇÃO

## 1. Modelo Questao.js

```javascript
// BackEnd/models/Questao.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Questao = sequelize.define('Questao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { len: [5, 255] }
  },
  enunciado: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM(
      'multipla_escolha',
      'verdadeiro_falso',
      'aberta',
      'codigo',
      'imagem',
      'multimedia'
    ),
    allowNull: false,
    defaultValue: 'multipla_escolha'
  },
  disciplina: {
    type: DataTypes.ENUM('Matemática', 'Inglês', 'Programação', 'Geral'),
    allowNull: false,
    defaultValue: 'Geral'
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  dificuldade: {
    type: DataTypes.ENUM('facil', 'medio', 'dificil'),
    allowNull: false,
    defaultValue: 'medio'
  },
  pontos: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: { min: 1, max: 100 }
  },
  tempo_limite_segundos: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    validate: { min: 10 }
  },
  opcoes: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  resposta_correta: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  explicacao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  feedback_correto: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  feedback_incorreto: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  midia: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  linguagem_programacao: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  criado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' }
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  atualizado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  atualizado_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deletado_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('rascunho', 'ativa', 'arquivada', 'revisao'),
    defaultValue: 'rascunho'
  },
  versao: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  total_respondidas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_corretas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  taxa_acerto: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
}, {
  tableName: 'questoes',
  timestamps: false,
  paranoid: true,
  indexes: [
    { fields: ['criado_por'] },
    { fields: ['disciplina'] },
    { fields: ['categoria'] },
    { fields: ['dificuldade'] },
    { fields: ['status'] },
    { fields: ['tipo'] },
    { fields: ['uuid'] }
  ]
});

export default Questao;
```

## 2. Validador de Questão

```javascript
// BackEnd/utils/questaoValidators.js
import { Op } from 'sequelize';

export const validateQuestao = (data) => {
  const errors = {};

  // Campos obrigatórios
  if (!data.titulo?.trim()) {
    errors.titulo = 'Título obrigatório';
  } else if (data.titulo.length < 5) {
    errors.titulo = 'Título deve ter pelo menos 5 caracteres';
  } else if (data.titulo.length > 255) {
    errors.titulo = 'Título não pode ter mais de 255 caracteres';
  }

  if (!data.enunciado?.trim()) {
    errors.enunciado = 'Enunciado obrigatório';
  }

  if (!data.tipo) {
    errors.tipo = 'Tipo obrigatório';
  }

  if (!data.disciplina) {
    errors.disciplina = 'Disciplina obrigatória';
  }

  // Validação por tipo
  if (data.tipo === 'multipla_escolha' || data.tipo === 'verdadeiro_falso') {
    if (!Array.isArray(data.opcoes) || data.opcoes.length < 2) {
      errors.opcoes = 'Mínimo 2 opções';
    }
    
    if (!data.resposta_correta?.valor) {
      errors.resposta_correta = 'Resposta correta obrigatória';
    }
    
    // Validar que resposta_correta é uma opção válida
    if (data.opcoes && data.resposta_correta?.valor) {
      const opcaoIds = data.opcoes.map(o => o.id);
      if (!opcaoIds.includes(data.resposta_correta.valor)) {
        errors.resposta_correta = 'Resposta correta deve ser uma opção válida';
      }
    }
  }

  if (data.tipo === 'aberta') {
    if (!data.resposta_correta?.palavras_chave || data.resposta_correta.palavras_chave.length === 0) {
      errors.resposta_correta = 'Palavras-chave obrigatórias para resposta aberta';
    }
  }

  // Validação de pontos
  if (!Number.isInteger(data.pontos) || data.pontos < 1 || data.pontos > 100) {
    errors.pontos = 'Pontos deve ser um número entre 1 e 100';
  }

  // Validação de tempo
  if (data.tempo_limite_segundos && data.tempo_limite_segundos < 10) {
    errors.tempo_limite_segundos = 'Tempo mínimo é 10 segundos';
  }

  // Validação de dificuldade
  if (data.dificuldade && !['facil', 'medio', 'dificil'].includes(data.dificuldade)) {
    errors.dificuldade = 'Dificuldade inválida';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateResposta = (questao, resposta) => {
  const errors = {};

  if (!resposta) {
    errors.resposta = 'Resposta obrigatória';
    return { valid: false, errors };
  }

  if (questao.tipo === 'multipla_escolha' || questao.tipo === 'verdadeiro_falso') {
    if (!['a', 'b', 'c', 'd', 'e', 'f'].includes(resposta)) {
      errors.resposta = 'Opção inválida';
    }
  }

  if (questao.tipo === 'aberta') {
    if (typeof resposta !== 'string' || resposta.trim().length === 0) {
      errors.resposta = 'Resposta não pode estar vazia';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
```

## 3. Controller de Questão (Exemplo Simplificado)

```javascript
// BackEnd/controllers/QuestaoController.js
import Questao from '../models/Questao.js';
import VersaoQuestao from '../models/VersaoQuestao.js';
import { validateQuestao } from '../utils/questaoValidators.js';
import { Op } from 'sequelize';

export const QuestaoController = {
  // Listar com filtros
  getAll: async (req, res) => {
    try {
      const {
        disciplina,
        dificuldade,
        status = 'ativa',
        search,
        page = 1,
        limit = 20
      } = req.query;

      const where = { status };
      
      if (disciplina) where.disciplina = disciplina;
      if (dificuldade) where.dificuldade = dificuldade;
      
      if (search) {
        where[Op.or] = [
          { titulo: { [Op.iLike]: `%${search}%` } },
          { enunciado: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;
      const { count, rows } = await Questao.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        order: [['criado_em', 'DESC']],
        attributes: { exclude: ['deletado_em'] }
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Criar questão
  create: async (req, res) => {
    try {
      const validation = validateQuestao(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors
        });
      }

      const questao = await Questao.create({
        ...req.body,
        criado_por: req.user.id,
        status: 'rascunho'
      });

      // Criar versão inicial
      await VersaoQuestao.create({
        questao_id: questao.id,
        versao: 1,
        dados: questao.toJSON(),
        modificado_por: req.user.id,
        motivo_mudanca: 'Criação inicial'
      });

      res.status(201).json({
        success: true,
        data: questao
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Atualizar questão
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const questao = await Questao.findByPk(id);

      if (!questao) {
        return res.status(404).json({
          success: false,
          error: 'Questão não encontrada'
        });
      }

      const validation = validateQuestao(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors
        });
      }

      // Criar versão anterior
      const novaVersao = questao.versao + 1;
      await VersaoQuestao.create({
        questao_id: questao.id,
        versao: novaVersao,
        dados: questao.toJSON(),
        modificado_por: req.user.id,
        motivo_mudanca: req.body.motivo_mudanca || 'Atualização'
      });

      // Atualizar questão
      await questao.update({
        ...req.body,
        versao: novaVersao,
        atualizado_por: req.user.id,
        atualizado_em: new Date()
      });

      res.json({
        success: true,
        data: questao
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

export default QuestaoController;
```

## 4. Componente QuestaoForm (Simplificado)

```javascript
// FrontEnd/src/Administrador/components/QuestaoForm.jsx
import React, { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';

export const QuestaoForm = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({
    titulo: '',
    enunciado: '',
    tipo: 'multipla_escolha',
    disciplina: 'Matemática',
    dificuldade: 'medio',
    pontos: 10,
    opcoes: [
      { id: 'a', texto: '' },
      { id: 'b', texto: '' },
      { id: 'c', texto: '' },
      { id: 'd', texto: '' }
    ],
    resposta_correta: { tipo: 'multipla_escolha', valor: 'a' },
    explicacao: '',
    feedback_correto: '',
    feedback_incorreto: ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const handleOpcaoChange = (index, texto) => {
    setForm(prev => ({
      ...prev,
      opcoes: prev.opcoes.map((o, i) =>
        i === index ? { ...o, texto } : o
      )
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Nova Questão</h1>

      <form className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm(prev => ({ ...prev, titulo: e.target.value }))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Ex: Qual é a raiz quadrada de 144?"
          />
          {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
        </div>

        {/* Enunciado */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Enunciado *
          </label>
          <textarea
            value={form.enunciado}
            onChange={(e) => setForm(prev => ({ ...prev, enunciado: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Descreva a questão em detalhes..."
          />
          {errors.enunciado && <p className="text-red-500 text-sm mt-1">{errors.enunciado}</p>}
        </div>

        {/* Tipo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo *
            </label>
            <select
              value={form.tipo}
              onChange={(e) => setForm(prev => ({ ...prev, tipo: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="multipla_escolha">Múltipla Escolha</option>
              <option value="verdadeiro_falso">Verdadeiro/Falso</option>
              <option value="aberta">Resposta Aberta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Disciplina *
            </label>
            <select
              value={form.disciplina}
              onChange={(e) => setForm(prev => ({ ...prev, disciplina: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="Matemática">Matemática</option>
              <option value="Inglês">Inglês</option>
              <option value="Programação">Programação</option>
            </select>
          </div>
        </div>

        {/* Opções */}
        {form.tipo === 'multipla_escolha' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Opções *
            </label>
            <div className="space-y-3">
              {form.opcoes.map((opcao, index) => (
                <div key={opcao.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-700">
                    {opcao.id.toUpperCase()}
                  </div>
                  <input
                    type="text"
                    value={opcao.texto}
                    onChange={(e) => handleOpcaoChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder={`Opção ${opcao.id.toUpperCase()}`}
                  />
                  <input
                    type="radio"
                    name="resposta_correta"
                    checked={form.resposta_correta.valor === opcao.id}
                    onChange={() => setForm(prev => ({
                      ...prev,
                      resposta_correta: { tipo: 'multipla_escolha', valor: opcao.id }
                    }))}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestaoForm;
```

## 5. Hook useQuestoes (Frontend)

```javascript
// FrontEnd/src/hooks/useQuestoes.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useQuestoes = (filtros = {}) => {
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const fetchQuestoes = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page,
        limit: filtros.limit || 20,
        ...(filtros.disciplina && { disciplina: filtros.disciplina }),
        ...(filtros.dificuldade && { dificuldade: filtros.dificuldade }),
        ...(filtros.status && { status: filtros.status }),
        ...(filtros.search && { search: filtros.search })
      });

      const response = await axios.get(
        `${API_BASE}/api/questoes?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setQuestoes(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar questões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestoes(1);
  }, [filtros]);

  const createQuestao = async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/questoes`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setQuestoes(prev => [response.data.data, ...prev]);
      return response.data.data;
    } catch (err) {
      throw err.response?.data?.errors || err.message;
    }
  };

  const updateQuestao = async (id, data) => {
    try {
      const response = await axios.put(
        `${API_BASE}/api/questoes/${id}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setQuestoes(prev =>
        prev.map(q => q.id === id ? response.data.data : q)
      );
      return response.data.data;
    } catch (err) {
      throw err.response?.data?.errors || err.message;
    }
  };

  const deleteQuestao = async (id) => {
    try {
      await axios.delete(
        `${API_BASE}/api/questoes/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setQuestoes(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  return {
    questoes,
    loading,
    error,
    pagination,
    fetchQuestoes,
    createQuestao,
    updateQuestao,
    deleteQuestao
  };
};
```

## 6. Integração no AdminDashboard

```javascript
// Adicionar ao AdminDashboard.jsx
import QuestoesPage from './pages/QuestoesPage';

// No menu sections:
{
  id: 'content',
  title: '❓ Questões & Conteúdo',
  icon: BookOpen,
  color: 'from-purple-500 to-pink-600',
  items: [
    { id: 'questoes', label: 'Gerenciar Questões', icon: BookOpen },
    { id: 'questaomatematica', label: 'Matemática (Legacy)', icon: BookOpen },
    { id: 'questoes_programacao', label: 'Programação (Legacy)', icon: BookOpen },
    { id: 'questaoingles', label: 'Inglês (Legacy)', icon: BookOpen },
  ]
}

// No renderização:
{activeTab === 'questoes' ? (
  <QuestoesPage />
) : (
  <TableManager table={activeTab} />
)}
```

---

## RESUMO

Este documento fornece exemplos práticos para implementar o novo sistema de questões. Siga os passos do plano de implementação para integrar tudo corretamente.

**Próximos passos:**
1. Criar os modelos no banco de dados
2. Implementar os controllers
3. Criar os componentes React
4. Testar tudo
5. Deploy

