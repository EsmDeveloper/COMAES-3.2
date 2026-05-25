# 📋 REFORMULAÇÃO COMPLETA DO SISTEMA DE QUESTÕES - COMAES 3.2

## ÍNDICE
1. [Análise Atual](#análise-atual)
2. [Problemas Identificados](#problemas-identificados)
3. [Arquitetura Proposta](#arquitetura-proposta)
4. [Modelos de Dados Novos](#modelos-de-dados-novos)
5. [API Backend](#api-backend)
6. [Componentes Frontend](#componentes-frontend)
7. [Fluxos de Uso](#fluxos-de-uso)
8. [Plano de Implementação](#plano-de-implementação)

---

## ANÁLISE ATUAL

### Estado Atual do Sistema
- **3 modelos de questões separados**: QuestaoMatematica, QuestaoProgramacao, QuestaoIngles
- **1 modelo genérico**: Pergunta (sem relacionamento com torneios)
- **Sem validação específica** para questões
- **Sem categorias, tags ou organização** por disciplina
- **Interface de admin genérica** sem otimização para questões
- **Sem suporte a múltiplos tipos** de questões (apenas múltipla escolha)
- **Sem explicações de respostas** ou feedback detalhado
- **Sem sistema de pontos flexível** (hardcoded por tipo)
- **Sem versionamento** de questões
- **Sem auditoria** de criação/modificação

---

## PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICOS

1. **Duplicação de Modelos**
   - Problema: Pergunta e Questao* são sistemas paralelos
   - Impacto: Confusão, manutenção duplicada, inconsistência
   - Solução: Unificar em modelo polimórfico

2. **Falta de Validação**
   - Problema: Sem validadores específicos para questões
   - Impacto: Dados inválidos no banco, erros em tempo de execução
   - Solução: Criar validadores robustos

3. **Sem Organização**
   - Problema: Questões não têm categorias, tags ou disciplinas claras
   - Impacto: Difícil encontrar e reutilizar questões
   - Solução: Sistema de categorização e tags

4. **Sem Tipos Flexíveis**
   - Problema: Apenas múltipla escolha suportada
   - Impacto: Não permite questões abertas, código, imagens
   - Solução: Sistema de tipos extensível

### 🟡 MODERADOS

5. **Interface de Admin Genérica**
   - Problema: TableManager genérico não otimizado para questões
   - Impacto: Experiência ruim, fluxo lento
   - Solução: Componentes específicos para questões

6. **Sem Feedback Detalhado**
   - Problema: Sem explicações de respostas
   - Impacto: Usuários não aprendem com erros
   - Solução: Campo de explicação e feedback

7. **Sem Versionamento**
   - Problema: Questões deletadas perdem histórico
   - Impacto: Impossível recuperar ou auditar
   - Solução: Soft delete + histórico de versões

8. **Sem Paginação**
   - Problema: Endpoints retornam todos os registros
   - Impacto: Performance ruim com muitas questões
   - Solução: Implementar paginação e filtros

### 🟢 MENORES

9. **Nomenclatura Inconsistente**
   - Problema: "questao" vs "pergunta" vs "question"
   - Solução: Padronizar como "Questão"

10. **Sem Cache**
    - Problema: Questões carregadas sempre do BD
    - Solução: Redis para questões frequentes

---

## ARQUITETURA PROPOSTA

### Estrutura de Dados Unificada

```
┌─────────────────────────────────────────────────────────────┐
│                    QUESTÃO (Modelo Único)                   │
├─────────────────────────────────────────────────────────────┤
│ • ID, UUID                                                  │
│ • Tipo (multipla_escolha, verdadeiro_falso, aberta,        │
│         codigo, imagem, multimedia)                         │
│ • Disciplina (Matemática, Inglês, Programação)             │
│ • Categoria (Álgebra, Geometria, etc)                      │
│ • Tags (array)                                              │
│ • Dificuldade (fácil, médio, difícil)                      │
│ • Pontos (flexível)                                         │
│ • Tempo Limite (segundos)                                   │
│ • Enunciado, Opções, Resposta Correta                      │
│ • Explicação, Feedback                                      │
│ • Mídia (imagens, vídeos, código)                          │
│ • Criador, Data Criação, Última Modificação                │
│ • Status (ativa, rascunho, arquivada)                      │
│ • Versão, Histórico                                         │
└─────────────────────────────────────────────────────────────┘
```

### Relacionamentos

```
Usuário (1) ──────────────────────────── (N) Questão
                                         ↓
                                    Torneio (N)
                                         ↓
                                  ParticipanteTorneio
                                         ↓
                                   TentativaTeste
                                         ↓
                                    Resposta
```

---

## MODELOS DE DADOS NOVOS

### 1. Questão (Modelo Unificado)

```javascript
// BackEnd/models/Questao.js
const Questao = sequelize.define('Questao', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
  
  // Conteúdo
  titulo: { type: DataTypes.STRING(255), allowNull: false },
  enunciado: { type: DataTypes.TEXT, allowNull: false },
  
  // Tipo e Disciplina
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
  categoria: { type: DataTypes.STRING(100), allowNull: true },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  
  // Dificuldade e Pontos
  dificuldade: {
    type: DataTypes.ENUM('facil', 'medio', 'dificil'),
    allowNull: false,
    defaultValue: 'medio'
  },
  pontos: { type: DataTypes.INTEGER, defaultValue: 10, validate: { min: 1, max: 100 } },
  tempo_limite_segundos: { type: DataTypes.INTEGER, defaultValue: 60, validate: { min: 10 } },
  
  // Conteúdo da Questão
  opcoes: { type: DataTypes.JSON, defaultValue: [] }, // [{id, texto, imagem}]
  resposta_correta: { type: DataTypes.JSON, allowNull: false }, // {tipo, valor}
  explicacao: { type: DataTypes.TEXT, allowNull: true },
  feedback_correto: { type: DataTypes.TEXT, allowNull: true },
  feedback_incorreto: { type: DataTypes.TEXT, allowNull: true },
  
  // Mídia
  midia: { type: DataTypes.JSON, defaultValue: {} }, // {imagens: [], videos: [], codigo: {}}
  linguagem_programacao: { type: DataTypes.STRING(50), allowNull: true },
  
  // Metadados
  criado_por: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'usuarios', key: 'id' } },
  criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  atualizado_por: { type: DataTypes.INTEGER, allowNull: true },
  atualizado_em: { type: DataTypes.DATE, allowNull: true },
  deletado_em: { type: DataTypes.DATE, allowNull: true }, // Soft delete
  
  // Status
  status: {
    type: DataTypes.ENUM('rascunho', 'ativa', 'arquivada', 'revisao'),
    defaultValue: 'rascunho'
  },
  versao: { type: DataTypes.INTEGER, defaultValue: 1 },
  
  // Estatísticas
  total_respondidas: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_corretas: { type: DataTypes.INTEGER, defaultValue: 0 },
  taxa_acerto: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  
}, {
  tableName: 'questoes',
  timestamps: false,
  paranoid: true, // Soft delete automático
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
```

### 2. QuestaoTorneio (Relacionamento)

```javascript
// BackEnd/models/QuestaoTorneio.js
const QuestaoTorneio = sequelize.define('QuestaoTorneio', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  questao_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'questoes', key: 'id' } },
  torneio_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'torneios', key: 'id' } },
  disciplina: { type: DataTypes.ENUM('Matemática', 'Inglês', 'Programação'), allowNull: false },
  ordem: { type: DataTypes.INTEGER, allowNull: false },
  pontos_customizado: { type: DataTypes.INTEGER, allowNull: true }, // Override de pontos
  adicionado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'questoes_torneios',
  timestamps: false,
  indexes: [
    { fields: ['torneio_id', 'disciplina'] },
    { fields: ['questao_id'] }
  ]
});
```

### 3. Resposta (Respostas de Usuários)

```javascript
// BackEnd/models/Resposta.js
const Resposta = sequelize.define('Resposta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tentativa_teste_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tentativas_teste', key: 'id' } },
  questao_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'questoes', key: 'id' } },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'usuarios', key: 'id' } },
  
  resposta_usuario: { type: DataTypes.JSON, allowNull: false }, // {tipo, valor}
  correta: { type: DataTypes.BOOLEAN, defaultValue: false },
  pontos_obtidos: { type: DataTypes.INTEGER, defaultValue: 0 },
  tempo_resposta_segundos: { type: DataTypes.INTEGER, allowNull: true },
  
  respondida_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'respostas',
  timestamps: false,
  indexes: [
    { fields: ['tentativa_teste_id'] },
    { fields: ['questao_id'] },
    { fields: ['usuario_id'] }
  ]
});
```

### 4. VersaoQuestao (Histórico)

```javascript
// BackEnd/models/VersaoQuestao.js
const VersaoQuestao = sequelize.define('VersaoQuestao', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  questao_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'questoes', key: 'id' } },
  versao: { type: DataTypes.INTEGER, allowNull: false },
  
  // Snapshot dos dados
  dados: { type: DataTypes.JSON, allowNull: false },
  
  modificado_por: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'usuarios', key: 'id' } },
  modificado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  motivo_mudanca: { type: DataTypes.TEXT, allowNull: true },
  
}, {
  tableName: 'versoes_questoes',
  timestamps: false,
  indexes: [
    { fields: ['questao_id', 'versao'] }
  ]
});
```

---

## API BACKEND

### Endpoints de Questões

```
# CRUD Básico
GET    /api/questoes                          # Listar com filtros
GET    /api/questoes/:id                      # Obter uma questão
POST   /api/questoes                          # Criar questão
PUT    /api/questoes/:id                      # Atualizar questão
DELETE /api/questoes/:id                      # Deletar (soft delete)

# Filtros e Busca
GET    /api/questoes?disciplina=Matemática    # Por disciplina
GET    /api/questoes?categoria=Álgebra        # Por categoria
GET    /api/questoes?dificuldade=medio        # Por dificuldade
GET    /api/questoes?tags=trigonometria       # Por tags
GET    /api/questoes?status=ativa             # Por status
GET    /api/questoes?search=termo             # Busca por texto
GET    /api/questoes?page=1&limit=20          # Paginação

# Questões de Torneio
GET    /api/torneios/:id/questoes             # Questões do torneio
GET    /api/torneios/:id/questoes/:disciplina # Por disciplina
POST   /api/torneios/:id/questoes             # Adicionar questão
DELETE /api/torneios/:id/questoes/:questao_id # Remover questão

# Respostas
POST   /api/respostas                         # Registrar resposta
GET    /api/respostas/:tentativa_id           # Respostas de uma tentativa
GET    /api/questoes/:id/estatisticas         # Estatísticas da questão

# Versionamento
GET    /api/questoes/:id/versoes              # Histórico de versões
GET    /api/questoes/:id/versoes/:versao      # Versão específica
POST   /api/questoes/:id/restaurar/:versao    # Restaurar versão
```

### Exemplo de Payload

```json
{
  "titulo": "Qual é a raiz quadrada de 144?",
  "enunciado": "Calcule a raiz quadrada de 144.",
  "tipo": "multipla_escolha",
  "disciplina": "Matemática",
  "categoria": "Álgebra",
  "tags": ["raiz_quadrada", "operacoes_basicas"],
  "dificuldade": "facil",
  "pontos": 10,
  "tempo_limite_segundos": 60,
  "opcoes": [
    { "id": "a", "texto": "10" },
    { "id": "b", "texto": "12" },
    { "id": "c", "texto": "14" },
    { "id": "d", "texto": "16" }
  ],
  "resposta_correta": { "tipo": "multipla_escolha", "valor": "b" },
  "explicacao": "A raiz quadrada de 144 é 12, pois 12 × 12 = 144.",
  "feedback_correto": "Parabéns! Você acertou!",
  "feedback_incorreto": "Tente novamente. Lembre-se que 12 × 12 = 144.",
  "midia": {
    "imagens": [],
    "videos": [],
    "codigo": null
  }
}
```



---

## COMPONENTES FRONTEND

### 1. QuestaoForm (Criação/Edição)

**Localização**: `FrontEnd/src/Administrador/components/QuestaoForm.jsx`

```javascript
/**
 * Formulário inteligente para criar/editar questões
 * - Suporta múltiplos tipos de questões
 - Validação em tempo real
 - Preview de questão
 - Salvamento automático em rascunho
 */

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Eye, Code, Image, FileText } from 'lucide-react';

export const QuestaoForm = ({ questaoId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    enunciado: '',
    tipo: 'multipla_escolha',
    disciplina: 'Matemática',
    categoria: '',
    tags: [],
    dificuldade: 'medio',
    pontos: 10,
    tempo_limite_segundos: 60,
    opcoes: [
      { id: 'a', texto: '' },
      { id: 'b', texto: '' },
      { id: 'c', texto: '' },
      { id: 'd', texto: '' }
    ],
    resposta_correta: { tipo: 'multipla_escolha', valor: 'a' },
    explicacao: '',
    feedback_correto: '',
    feedback_incorreto: '',
    midia: { imagens: [], videos: [], codigo: null }
  });

  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Validação em tempo real
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.titulo.trim()) newErrors.titulo = 'Título obrigatório';
    if (!formData.enunciado.trim()) newErrors.enunciado = 'Enunciado obrigatório';
    
    if (formData.tipo === 'multipla_escolha' || formData.tipo === 'verdadeiro_falso') {
      const opcoesPreenchidas = formData.opcoes.filter(o => o.texto.trim());
      if (opcoesPreenchidas.length < 2) {
        newErrors.opcoes = 'Mínimo 2 opções preenchidas';
      }
    }
    
    if (formData.pontos < 1 || formData.pontos > 100) {
      newErrors.pontos = 'Pontos entre 1 e 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTipoChange = (novoTipo) => {
    setFormData(prev => ({
      ...prev,
      tipo: novoTipo,
      opcoes: novoTipo === 'verdadeiro_falso' 
        ? [{ id: 'a', texto: 'Verdadeiro' }, { id: 'b', texto: 'Falso' }]
        : prev.opcoes
    }));
  };

  const handleOpcaoChange = (index, texto) => {
    setFormData(prev => ({
      ...prev,
      opcoes: prev.opcoes.map((o, i) => i === index ? { ...o, texto } : o)
    }));
  };

  const handleAddOpcao = () => {
    const novoId = String.fromCharCode(97 + formData.opcoes.length); // 'e', 'f', etc
    setFormData(prev => ({
      ...prev,
      opcoes: [...prev.opcoes, { id: novoId, texto: '' }]
    }));
  };

  const handleRemoveOpcao = (index) => {
    if (formData.opcoes.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      opcoes: prev.opcoes.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          {questaoId ? 'Editar Questão' : 'Nova Questão'}
        </h1>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Editar' : 'Preview'}
        </button>
      </div>

      {showPreview ? (
        <QuestaoPreview questao={formData} />
      ) : (
        <form className="space-y-8">
          {/* Seção 1: Informações Básicas */}
          <section className="border-b pb-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.titulo ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 focus:ring-blue-300'
                  }`}
                  placeholder="Ex: Qual é a raiz quadrada de 144?"
                />
                {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Questão *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="multipla_escolha">Múltipla Escolha</option>
                  <option value="verdadeiro_falso">Verdadeiro/Falso</option>
                  <option value="aberta">Resposta Aberta</option>
                  <option value="codigo">Código</option>
                  <option value="imagem">Imagem</option>
                  <option value="multimedia">Multimídia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Disciplina *
                </label>
                <select
                  value={formData.disciplina}
                  onChange={(e) => setFormData(prev => ({ ...prev, disciplina: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="Matemática">Matemática</option>
                  <option value="Inglês">Inglês</option>
                  <option value="Programação">Programação</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Ex: Álgebra, Geometria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dificuldade *
                </label>
                <select
                  value={formData.dificuldade}
                  onChange={(e) => setFormData(prev => ({ ...prev, dificuldade: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="facil">Fácil</option>
                  <option value="medio">Médio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pontos (1-100) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.pontos}
                  onChange={(e) => setFormData(prev => ({ ...prev, pontos: parseInt(e.target.value) }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.pontos ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 focus:ring-blue-300'
                  }`}
                />
                {errors.pontos && <p className="text-red-500 text-sm mt-1">{errors.pontos}</p>}
              </div>
            </div>
          </section>

          {/* Seção 2: Enunciado */}
          <section className="border-b pb-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Enunciado</h2>
            
            <textarea
              value={formData.enunciado}
              onChange={(e) => setFormData(prev => ({ ...prev, enunciado: e.target.value }))}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.enunciado ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 focus:ring-blue-300'
              }`}
              placeholder="Descreva a questão em detalhes..."
            />
            {errors.enunciado && <p className="text-red-500 text-sm mt-1">{errors.enunciado}</p>}
          </section>

          {/* Seção 3: Opções (Múltipla Escolha) */}
          {(formData.tipo === 'multipla_escolha' || formData.tipo === 'verdadeiro_falso') && (
            <section className="border-b pb-8">
              <h2 className="text-xl font-semibold text-slate-700 mb-4">Opções</h2>
              
              <div className="space-y-3">
                {formData.opcoes.map((opcao, index) => (
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
                      checked={formData.resposta_correta.valor === opcao.id}
                      onChange={() => setFormData(prev => ({
                        ...prev,
                        resposta_correta: { tipo: formData.tipo, valor: opcao.id }
                      }))}
                      className="w-5 h-5 cursor-pointer"
                    />
                    {formData.opcoes.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOpcao(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {formData.tipo === 'multipla_escolha' && (
                <button
                  type="button"
                  onClick={handleAddOpcao}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Opção
                </button>
              )}

              {errors.opcoes && <p className="text-red-500 text-sm mt-2">{errors.opcoes}</p>}
            </section>
          )}

          {/* Seção 4: Feedback e Explicação */}
          <section className="border-b pb-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Feedback e Explicação</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Explicação da Resposta
                </label>
                <textarea
                  value={formData.explicacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, explicacao: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Explique por que a resposta está correta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Feedback para Resposta Correta
                </label>
                <textarea
                  value={formData.feedback_correto}
                  onChange={(e) => setFormData(prev => ({ ...prev, feedback_correto: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Ex: Parabéns! Você acertou!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Feedback para Resposta Incorreta
                </label>
                <textarea
                  value={formData.feedback_incorreto}
                  onChange={(e) => setFormData(prev => ({ ...prev, feedback_incorreto: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Ex: Tente novamente. Dica: ..."
                />
              </div>
            </div>
          </section>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
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
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Questão'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default QuestaoForm;
```

### 2. QuestaoPreview (Visualização)

```javascript
// FrontEnd/src/Administrador/components/QuestaoPreview.jsx
export const QuestaoPreview = ({ questao }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
      <div className="max-w-2xl mx-auto">
        {/* Metadados */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
            {questao.disciplina}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            questao.dificuldade === 'facil' ? 'bg-green-200 text-green-800' :
            questao.dificuldade === 'medio' ? 'bg-yellow-200 text-yellow-800' :
            'bg-red-200 text-red-800'
          }`}>
            {questao.dificuldade.charAt(0).toUpperCase() + questao.dificuldade.slice(1)}
          </span>
          <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium">
            {questao.pontos} pts
          </span>
        </div>

        {/* Enunciado */}
        <h3 className="text-2xl font-bold text-slate-800 mb-6">{questao.enunciado}</h3>

        {/* Opções */}
        {(questao.tipo === 'multipla_escolha' || questao.tipo === 'verdadeiro_falso') && (
          <div className="space-y-3 mb-8">
            {questao.opcoes.map((opcao, index) => (
              <div
                key={opcao.id}
                className={`p-4 rounded-lg border-2 transition ${
                  questao.resposta_correta.valor === opcao.id
                    ? 'bg-green-100 border-green-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-700">
                    {opcao.id.toUpperCase()}
                  </div>
                  <span className="text-slate-800">{opcao.texto}</span>
                  {questao.resposta_correta.valor === opcao.id && (
                    <span className="ml-auto text-green-600 font-bold">✓ Correta</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Explicação */}
        {questao.explicacao && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Explicação:</h4>
            <p className="text-blue-800">{questao.explicacao}</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 3. QuestaoList (Gerenciamento)

```javascript
// FrontEnd/src/Administrador/components/QuestaoList.jsx
export const QuestaoList = ({ questoes, onEdit, onDelete, onFilter }) => {
  const [filtros, setFiltros] = useState({
    disciplina: '',
    dificuldade: '',
    status: 'ativa',
    search: ''
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const questoesFiltradas = questoes.filter(q => {
    if (filtros.disciplina && q.disciplina !== filtros.disciplina) return false;
    if (filtros.dificuldade && q.dificuldade !== filtros.dificuldade) return false;
    if (filtros.status && q.status !== filtros.status) return false;
    if (filtros.search && !q.titulo.toLowerCase().includes(filtros.search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(questoesFiltradas.length / itemsPerPage);
  const questoesPaginadas = questoesFiltradas.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={filtros.search}
            onChange={(e) => setFiltros(prev => ({ ...prev, search: e.target.value }))}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          <select
            value={filtros.disciplina}
            onChange={(e) => setFiltros(prev => ({ ...prev, disciplina: e.target.value }))}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Todas as Disciplinas</option>
            <option value="Matemática">Matemática</option>
            <option value="Inglês">Inglês</option>
            <option value="Programação">Programação</option>
          </select>

          <select
            value={filtros.dificuldade}
            onChange={(e) => setFiltros(prev => ({ ...prev, dificuldade: e.target.value }))}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Todas as Dificuldades</option>
            <option value="facil">Fácil</option>
            <option value="medio">Médio</option>
            <option value="dificil">Difícil</option>
          </select>

          <select
            value={filtros.status}
            onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Todos os Status</option>
            <option value="ativa">Ativa</option>
            <option value="rascunho">Rascunho</option>
            <option value="arquivada">Arquivada</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Título</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Disciplina</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Dificuldade</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Pontos</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {questoesPaginadas.map(questao => (
              <tr key={questao.id} className="border-b hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm text-slate-800">{questao.titulo}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {questao.disciplina}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    questao.dificuldade === 'facil' ? 'bg-green-100 text-green-800' :
                    questao.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {questao.dificuldade.charAt(0).toUpperCase() + questao.dificuldade.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-800">{questao.pontos}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    questao.status === 'ativa' ? 'bg-green-100 text-green-800' :
                    questao.status === 'rascunho' ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {questao.status.charAt(0).toUpperCase() + questao.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button
                    onClick={() => onEdit(questao.id)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(questao.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-4 py-2 rounded-lg transition ${
              page === p
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};
```



---

## FLUXOS DE USO

### Fluxo 1: Criar Questão (Admin)

```
1. Admin clica em "Questões & Conteúdo" → "Criar Nova Questão"
2. Abre QuestaoForm com formulário vazio
3. Preenche:
   - Título, Enunciado
   - Tipo (múltipla escolha, aberta, código, etc)
   - Disciplina, Categoria, Tags
   - Dificuldade, Pontos, Tempo Limite
   - Opções e Resposta Correta
   - Explicação e Feedback
4. Clica em "Preview" para visualizar
5. Clica em "Salvar Questão"
6. Sistema:
   - Valida todos os campos
   - Cria registro em Questao com status='rascunho'
   - Cria VersaoQuestao v1
   - Retorna sucesso
7. Admin pode:
   - Editar novamente
   - Publicar (status='ativa')
   - Adicionar a torneios
```

### Fluxo 2: Adicionar Questão a Torneio

```
1. Admin em "Torneios" → Seleciona torneio
2. Clica em "Gerenciar Questões"
3. Vê lista de questões por disciplina
4. Clica em "Adicionar Questão"
5. Modal com:
   - Busca/filtro de questões existentes
   - OU criar nova questão inline
6. Seleciona questão e disciplina
7. Sistema:
   - Cria QuestaoTorneio
   - Define ordem automaticamente
   - Atualiza lista
8. Admin pode reordenar via drag-and-drop
```

### Fluxo 3: Responder Questão (Usuário)

```
1. Usuário em "Teste" → Seleciona disciplina
2. useQuiz carrega questões via GET /api/quiz/matematica
3. QuestionCard renderiza questão
4. Usuário seleciona opção ou digita resposta
5. Clica "Enviar"
6. Sistema:
   - Valida resposta
   - Cria Resposta em BD
   - Calcula pontos
   - Mostra feedback (correto/incorreto)
   - Exibe explicação
7. Após feedback, avança para próxima questão
8. Ao final, mostra ResultScreen com:
   - Total de pontos
   - Taxa de acerto
   - Classificação
   - Histórico de respostas
```

### Fluxo 4: Editar Questão

```
1. Admin em "Questões" → Clica "Editar"
2. QuestaoForm carrega dados da questão
3. Admin modifica campos
4. Clica "Salvar"
5. Sistema:
   - Valida
   - Incrementa versão (v1 → v2)
   - Cria VersaoQuestao com snapshot anterior
   - Atualiza Questao
   - Registra atualizado_por e atualizado_em
6. Admin pode:
   - Ver histórico de versões
   - Restaurar versão anterior
```

### Fluxo 5: Filtrar e Buscar Questões

```
1. Admin em "Questões"
2. Usa filtros:
   - Disciplina (Matemática, Inglês, Programação)
   - Dificuldade (Fácil, Médio, Difícil)
   - Status (Ativa, Rascunho, Arquivada)
   - Busca por texto
3. Sistema:
   - GET /api/questoes?disciplina=Matemática&dificuldade=medio&search=raiz
   - Retorna questões paginadas (20 por página)
   - Mostra total de resultados
4. Admin pode:
   - Editar questão
   - Deletar (soft delete)
   - Exportar lista
   - Duplicar questão
```

---

## VALIDADORES BACKEND

```javascript
// BackEnd/utils/questaoValidators.js

export const validateQuestao = (data) => {
  const errors = {};

  // Campos obrigatórios
  if (!data.titulo?.trim()) errors.titulo = 'Título obrigatório';
  if (!data.enunciado?.trim()) errors.enunciado = 'Enunciado obrigatório';
  if (!data.tipo) errors.tipo = 'Tipo obrigatório';
  if (!data.disciplina) errors.disciplina = 'Disciplina obrigatória';

  // Validação por tipo
  if (data.tipo === 'multipla_escolha' || data.tipo === 'verdadeiro_falso') {
    if (!Array.isArray(data.opcoes) || data.opcoes.length < 2) {
      errors.opcoes = 'Mínimo 2 opções';
    }
    if (!data.resposta_correta?.valor) {
      errors.resposta_correta = 'Resposta correta obrigatória';
    }
  }

  // Validação de pontos
  if (!Number.isInteger(data.pontos) || data.pontos < 1 || data.pontos > 100) {
    errors.pontos = 'Pontos entre 1 e 100';
  }

  // Validação de tempo
  if (data.tempo_limite_segundos && data.tempo_limite_segundos < 10) {
    errors.tempo_limite_segundos = 'Mínimo 10 segundos';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateResposta = (questao, resposta) => {
  const errors = {};

  if (!resposta) errors.resposta = 'Resposta obrigatória';

  if (questao.tipo === 'multipla_escolha' || questao.tipo === 'verdadeiro_falso') {
    if (!['a', 'b', 'c', 'd', 'e', 'f'].includes(resposta)) {
      errors.resposta = 'Opção inválida';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
};
```

---

## CONTROLLERS BACKEND

```javascript
// BackEnd/controllers/QuestaoController.js

import Questao from '../models/Questao.js';
import VersaoQuestao from '../models/VersaoQuestao.js';
import Resposta from '../models/Resposta.js';
import { validateQuestao } from '../utils/questaoValidators.js';

export const QuestaoController = {
  // Listar questões com filtros
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

  // Obter uma questão
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const questao = await Questao.findByPk(id, {
        attributes: { exclude: ['deletado_em'] }
      });

      if (!questao) {
        return res.status(404).json({ success: false, error: 'Questão não encontrada' });
      }

      res.json({ success: true, data: questao });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Criar questão
  create: async (req, res) => {
    try {
      const validation = validateQuestao(req.body);
      if (!validation.valid) {
        return res.status(400).json({ success: false, errors: validation.errors });
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

      res.status(201).json({ success: true, data: questao });
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
        return res.status(404).json({ success: false, error: 'Questão não encontrada' });
      }

      const validation = validateQuestao(req.body);
      if (!validation.valid) {
        return res.status(400).json({ success: false, errors: validation.errors });
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

      res.json({ success: true, data: questao });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Deletar (soft delete)
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const questao = await Questao.findByPk(id);

      if (!questao) {
        return res.status(404).json({ success: false, error: 'Questão não encontrada' });
      }

      await questao.destroy(); // Soft delete via paranoid

      res.json({ success: true, message: 'Questão deletada' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Publicar questão
  publish: async (req, res) => {
    try {
      const { id } = req.params;
      const questao = await Questao.findByPk(id);

      if (!questao) {
        return res.status(404).json({ success: false, error: 'Questão não encontrada' });
      }

      await questao.update({ status: 'ativa' });

      res.json({ success: true, data: questao });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obter versões
  getVersions: async (req, res) => {
    try {
      const { id } = req.params;
      const versoes = await VersaoQuestao.findAll({
        where: { questao_id: id },
        order: [['versao', 'DESC']]
      });

      res.json({ success: true, data: versoes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Restaurar versão
  restoreVersion: async (req, res) => {
    try {
      const { id, versao } = req.params;
      const questao = await Questao.findByPk(id);

      if (!questao) {
        return res.status(404).json({ success: false, error: 'Questão não encontrada' });
      }

      const versaoAnterior = await VersaoQuestao.findOne({
        where: { questao_id: id, versao: parseInt(versao) }
      });

      if (!versaoAnterior) {
        return res.status(404).json({ success: false, error: 'Versão não encontrada' });
      }

      // Criar nova versão com dados da versão anterior
      const novaVersao = questao.versao + 1;
      await VersaoQuestao.create({
        questao_id: questao.id,
        versao: novaVersao,
        dados: questao.toJSON(),
        modificado_por: req.user.id,
        motivo_mudanca: `Restauração da versão ${versao}`
      });

      // Atualizar questão
      const dadosRestaurados = versaoAnterior.dados;
      await questao.update({
        ...dadosRestaurados,
        versao: novaVersao,
        atualizado_por: req.user.id,
        atualizado_em: new Date()
      });

      res.json({ success: true, data: questao });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Registrar resposta
  registrarResposta: async (req, res) => {
    try {
      const { tentativa_teste_id, questao_id, resposta_usuario } = req.body;

      const questao = await Questao.findByPk(questao_id);
      if (!questao) {
        return res.status(404).json({ success: false, error: 'Questão não encontrada' });
      }

      // Verificar se resposta está correta
      const correta = JSON.stringify(questao.resposta_correta.valor) === 
                      JSON.stringify(resposta_usuario);

      const pontos = correta ? questao.pontos : 0;

      const resposta = await Resposta.create({
        tentativa_teste_id,
        questao_id,
        usuario_id: req.user.id,
        resposta_usuario,
        correta,
        pontos_obtidos: pontos
      });

      // Atualizar estatísticas da questão
      await questao.increment('total_respondidas');
      if (correta) {
        await questao.increment('total_corretas');
      }

      res.json({
        success: true,
        data: resposta,
        feedback: {
          correta,
          pontos,
          explicacao: questao.explicacao,
          feedback: correta ? questao.feedback_correto : questao.feedback_incorreto
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obter estatísticas
  getEstatisticas: async (req, res) => {
    try {
      const { id } = req.params;
      const questao = await Questao.findByPk(id);

      if (!questao) {
        return res.status(404).json({ success: false, error: 'Questão não encontrada' });
      }

      const taxaAcerto = questao.total_respondidas > 0
        ? ((questao.total_corretas / questao.total_respondidas) * 100).toFixed(2)
        : 0;

      res.json({
        success: true,
        data: {
          total_respondidas: questao.total_respondidas,
          total_corretas: questao.total_corretas,
          taxa_acerto: taxaAcerto
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

export default QuestaoController;
```

---

## ROUTES BACKEND

```javascript
// BackEnd/routes/questoesRoutes.js

import express from 'express';
import isAdmin from '../middlewares/isAdmin.js';
import { QuestaoController } from '../controllers/QuestaoController.js';

const router = express.Router();

// Rotas públicas (leitura)
router.get('/', QuestaoController.getAll);
router.get('/:id', QuestaoController.getById);
router.get('/:id/estatisticas', QuestaoController.getEstatisticas);

// Rotas protegidas (admin)
router.post('/', isAdmin, QuestaoController.create);
router.put('/:id', isAdmin, QuestaoController.update);
router.delete('/:id', isAdmin, QuestaoController.delete);
router.patch('/:id/publish', isAdmin, QuestaoController.publish);

// Versionamento
router.get('/:id/versoes', isAdmin, QuestaoController.getVersions);
router.post('/:id/versoes/:versao/restaurar', isAdmin, QuestaoController.restoreVersion);

// Respostas
router.post('/respostas', QuestaoController.registrarResposta);

export default router;
```



---

## PLANO DE IMPLEMENTAÇÃO

### Fase 1: Preparação (Semana 1)

#### 1.1 Criar Modelos de Dados
- [ ] Criar `BackEnd/models/Questao.js` (modelo unificado)
- [ ] Criar `BackEnd/models/QuestaoTorneio.js` (relacionamento)
- [ ] Criar `BackEnd/models/Resposta.js` (respostas de usuários)
- [ ] Criar `BackEnd/models/VersaoQuestao.js` (histórico)
- [ ] Adicionar índices e constraints

#### 1.2 Criar Migration
- [ ] `BackEnd/migrations/20260520000000-create-questoes-table.js`
- [ ] `BackEnd/migrations/20260520000001-create-questoes-torneios-table.js`
- [ ] `BackEnd/migrations/20260520000002-create-respostas-table.js`
- [ ] `BackEnd/migrations/20260520000003-create-versoes-questoes-table.js`
- [ ] Testar migrations em ambiente local

#### 1.3 Criar Validadores
- [ ] `BackEnd/utils/questaoValidators.js`
- [ ] Testes unitários para validadores
- [ ] Documentação de regras de validação

### Fase 2: Backend (Semana 2)

#### 2.1 Implementar Controllers
- [ ] `BackEnd/controllers/QuestaoController.js`
  - [ ] getAll (com filtros e paginação)
  - [ ] getById
  - [ ] create
  - [ ] update
  - [ ] delete (soft delete)
  - [ ] publish
  - [ ] getVersions
  - [ ] restoreVersion
  - [ ] registrarResposta
  - [ ] getEstatisticas

#### 2.2 Implementar Routes
- [ ] `BackEnd/routes/questoesRoutes.js`
- [ ] Integrar em `BackEnd/index.js`
- [ ] Testar todos os endpoints com Postman/Insomnia

#### 2.3 Implementar Serviços
- [ ] Serviço de cálculo de pontos
- [ ] Serviço de avaliação automática (para respostas abertas)
- [ ] Serviço de cache (Redis)
- [ ] Serviço de exportação (CSV, PDF)

#### 2.4 Testes Backend
- [ ] Testes unitários para controllers
- [ ] Testes de integração para endpoints
- [ ] Testes de validação
- [ ] Testes de performance (paginação)

### Fase 3: Frontend - Admin (Semana 3)

#### 3.1 Criar Componentes
- [ ] `FrontEnd/src/Administrador/components/QuestaoForm.jsx`
  - [ ] Formulário com validação em tempo real
  - [ ] Suporte a múltiplos tipos de questões
  - [ ] Preview de questão
  - [ ] Salvamento automático em rascunho

- [ ] `FrontEnd/src/Administrador/components/QuestaoPreview.jsx`
  - [ ] Visualização da questão como usuário veria

- [ ] `FrontEnd/src/Administrador/components/QuestaoList.jsx`
  - [ ] Tabela com filtros
  - [ ] Paginação
  - [ ] Busca
  - [ ] Ações (editar, deletar, duplicar)

- [ ] `FrontEnd/src/Administrador/components/QuestaoTorneioManager.jsx`
  - [ ] Adicionar questões a torneios
  - [ ] Reordenar questões (drag-and-drop)
  - [ ] Remover questões

#### 3.2 Criar Páginas
- [ ] `FrontEnd/src/Administrador/pages/QuestoesPage.jsx`
  - [ ] Integra QuestaoList e QuestaoForm
  - [ ] Gerenciamento completo

#### 3.3 Atualizar Admin Dashboard
- [ ] Adicionar menu "Questões & Conteúdo"
- [ ] Integrar QuestoesPage
- [ ] Atualizar navegação

#### 3.4 Testes Frontend
- [ ] Testes de componentes (React Testing Library)
- [ ] Testes de validação
- [ ] Testes de responsividade (mobile)
- [ ] Testes de acessibilidade

### Fase 4: Frontend - Usuário (Semana 4)

#### 4.1 Atualizar Componentes de Teste
- [ ] Atualizar `QuestionCard.jsx` para novos tipos
- [ ] Adicionar suporte a código
- [ ] Adicionar suporte a imagens
- [ ] Adicionar suporte a multimídia

#### 4.2 Atualizar useQuiz Hook
- [ ] Integrar com novo endpoint `/api/questoes`
- [ ] Suportar novos tipos de questões
- [ ] Melhorar cálculo de pontos
- [ ] Adicionar feedback detalhado

#### 4.3 Atualizar Página de Teste
- [ ] Integrar com novo sistema
- [ ] Melhorar UX
- [ ] Adicionar estatísticas

#### 4.4 Testes Frontend
- [ ] Testes de fluxo completo
- [ ] Testes de performance
- [ ] Testes de responsividade

### Fase 5: Integração e Testes (Semana 5)

#### 5.1 Integração End-to-End
- [ ] Testar fluxo completo: criar → adicionar a torneio → responder
- [ ] Testar filtros e busca
- [ ] Testar versionamento
- [ ] Testar soft delete

#### 5.2 Testes de Performance
- [ ] Testar com 1000+ questões
- [ ] Testar paginação
- [ ] Testar cache
- [ ] Otimizar queries

#### 5.3 Testes de Segurança
- [ ] Validar permissões (admin only)
- [ ] Testar SQL injection
- [ ] Testar XSS
- [ ] Testar CSRF

#### 5.4 Testes de Usabilidade
- [ ] Testar com usuários reais
- [ ] Coletar feedback
- [ ] Fazer ajustes

### Fase 6: Migração de Dados (Semana 6)

#### 6.1 Script de Migração
- [ ] Criar script para migrar dados de Pergunta → Questao
- [ ] Criar script para migrar dados de Questao* → Questao
- [ ] Testar migração em staging
- [ ] Backup de dados

#### 6.2 Deprecação
- [ ] Manter modelos antigos por 1 mês
- [ ] Avisar admins sobre mudança
- [ ] Documentar processo

#### 6.3 Limpeza
- [ ] Remover modelos antigos
- [ ] Remover rotas antigas
- [ ] Atualizar documentação

### Fase 7: Deploy e Monitoramento (Semana 7)

#### 7.1 Deploy
- [ ] Deploy em staging
- [ ] Testes finais
- [ ] Deploy em produção
- [ ] Monitoramento

#### 7.2 Documentação
- [ ] Documentar API
- [ ] Documentar componentes
- [ ] Criar guia de uso para admins
- [ ] Criar guia de uso para desenvolvedores

#### 7.3 Treinamento
- [ ] Treinar admins
- [ ] Criar vídeos tutoriais
- [ ] Criar FAQ

---

## CHECKLIST DE QUALIDADE

### Backend
- [ ] Todos os endpoints testados
- [ ] Validação em todos os campos
- [ ] Tratamento de erros consistente
- [ ] Logs de auditoria
- [ ] Performance otimizada
- [ ] Segurança validada
- [ ] Documentação completa

### Frontend
- [ ] Todos os componentes testados
- [ ] Validação em tempo real
- [ ] Mensagens de erro claras
- [ ] Responsividade mobile
- [ ] Acessibilidade (WCAG 2.1)
- [ ] Performance otimizada
- [ ] Documentação completa

### Banco de Dados
- [ ] Índices criados
- [ ] Constraints definidas
- [ ] Soft delete funcionando
- [ ] Versionamento funcionando
- [ ] Backup testado

### Documentação
- [ ] API documentada (Swagger/OpenAPI)
- [ ] Componentes documentados (Storybook)
- [ ] Guias de uso
- [ ] Exemplos de código
- [ ] FAQ

---

## MÉTRICAS DE SUCESSO

### Performance
- [ ] Listar 1000 questões em < 500ms
- [ ] Criar questão em < 1s
- [ ] Editar questão em < 1s
- [ ] Responder questão em < 100ms

### Usabilidade
- [ ] Criar questão em < 5 minutos
- [ ] Encontrar questão em < 30 segundos
- [ ] Taxa de erro < 5%
- [ ] Satisfação do usuário > 4/5

### Qualidade
- [ ] Cobertura de testes > 80%
- [ ] 0 bugs críticos
- [ ] 0 vulnerabilidades de segurança
- [ ] Uptime > 99.9%

---

## PRÓXIMOS PASSOS

1. **Aprovação do Design**
   - Revisar documento com stakeholders
   - Coletar feedback
   - Fazer ajustes

2. **Preparação do Ambiente**
   - Criar branch de desenvolvimento
   - Configurar CI/CD
   - Preparar ambiente de staging

3. **Início da Implementação**
   - Começar com Fase 1
   - Fazer daily standups
   - Documentar progresso

4. **Comunicação**
   - Informar admins sobre mudanças
   - Criar documentação
   - Preparar treinamento

---

## REFERÊNCIAS

- [Sequelize Documentation](https://sequelize.org/)
- [React Best Practices](https://react.dev/)
- [REST API Design](https://restfulapi.net/)
- [Database Design](https://www.postgresql.org/docs/)
- [Web Accessibility](https://www.w3.org/WAI/)

---

## CONTATO

Para dúvidas ou sugestões sobre este documento, entre em contato com a equipe de desenvolvimento.

**Versão**: 1.0  
**Data**: 21 de Maio de 2026  
**Autor**: Equipe de Desenvolvimento COMAES  
**Status**: Proposta

