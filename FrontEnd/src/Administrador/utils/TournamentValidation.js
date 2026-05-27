/**
 * TournamentValidation.js
 * Validações completas de formulário de torneios
 * Implementa: validação de datas, status dinâmicos, regras de negócio
 */

export const TournamentValidation = {
  /**
   * Gerar slug automaticamente a partir do título
   */
  generateSlug(title) {
    if (!title || typeof title !== 'string') return '';
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100);
  },

  /**
   * Validar formulário completo
   * @param {Object} formData - Dados do formulário
   * @param {string} mode - Modo ('create' ou 'edit')
   * @param {string} minDateTime - Data mínima para início (para modo criação)
   */
  validate(formData, mode = 'create', minDateTime = null) {
    const errors = {};

    // ============================================
    // VALIDAR TÍTULO
    // ============================================
    if (!formData.titulo || !formData.titulo.trim()) {
      errors.titulo = 'Título é obrigatório';
    } else if (formData.titulo.length < 3) {
      errors.titulo = 'Mínimo 3 caracteres';
    } else if (formData.titulo.length > 255) {
      errors.titulo = 'Máximo 255 caracteres';
    }

    // ============================================
    // VALIDAR DESCRIÇÃO
    // ============================================
    if (!formData.descricao || !formData.descricao.trim()) {
      errors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.length < 10) {
      errors.descricao = 'Mínimo 10 caracteres';
    }

    // ============================================
    // VALIDAR DATA DE INÍCIO
    // ============================================
    if (!formData.inicia_em) {
      errors.inicia_em = 'Data de início é obrigatória';
    } else {
      const inicioDate = new Date(formData.inicia_em);
      const agora = new Date();

      // Verificar se a data é válida
      if (isNaN(inicioDate.getTime())) {
        errors.inicia_em = 'Data de início inválida';
      } else {
        // Para modo criação, usar minDateTime (agora + 1 minuto)
        // Para modo edição, permitir datas passadas (torneio já começou)
        const minDate = minDateTime ? new Date(minDateTime) : null;

        if (mode === 'create' && minDate && inicioDate < minDate) {
          errors.inicia_em = 'Para criar um torneio ativo, a data de início deve ser pelo menos 1 minuto superior ao horário atual';
        } else if (inicioDate < new Date(agora.getTime() - 60000)) {
          // Allow 1 minute tolerance for editing
          errors.inicia_em = 'Não pode ser no passado';
        }
      }
    }

    // ============================================
    // VALIDAR DATA DE TÉRMINO
    // ============================================
    if (!formData.termina_em) {
      errors.termina_em = 'Data de término é obrigatória';
    } else {
      const fimDate = new Date(formData.termina_em);
      const agora = new Date();

      // Verificar se a data é válida
      if (isNaN(fimDate.getTime())) {
        errors.termina_em = 'Data de término inválida';
      } else {
        // Data de término não pode ser no passado (com tolerância de 1 minuto)
        if (fimDate < new Date(agora.getTime() - 60000)) {
          errors.termina_em = 'Não pode ser no passado';
        }
        // Data de término deve ser posterior à data de início
        else if (formData.inicia_em) {
          const inicioDate = new Date(formData.inicia_em);
          if (!isNaN(inicioDate.getTime()) && fimDate <= inicioDate) {
            errors.termina_em = 'Data de término deve ser posterior à data de início';
          }
        }
      }
    }

    // ============================================
    // VALIDAR STATUS
    // ============================================
    if (!formData.status) {
      errors.status = 'Status é obrigatório';
    } else {
      // Validar se o status é válido para o modo
      const validStatuses = {
        create: ['rascunho', 'ativo'],
        edit: ['rascunho', 'ativo', 'finalizado', 'cancelado'],
      };

      const allowedStatuses = validStatuses[mode] || validStatuses.create;
      if (!allowedStatuses.includes(formData.status)) {
        errors.status = `Status "${formData.status}" não é válido para ${mode === 'create' ? 'criação' : 'edição'}`;
      }
    }

    return errors;
  },

  /**
   * Validar status específico para edição
   * @param {string} currentStatus - Status atual do torneio
   * @param {string} newStatus - Novo status desejado
   * @returns {Object} - { valid: boolean, error?: string }
   */
  validateStatusTransition(currentStatus, newStatus) {
    const transitions = {
      rascunho: ['rascunho', 'ativo', 'cancelado'],
      ativo: ['ativo', 'finalizado', 'cancelado'],
      finalizado: ['finalizado'],
      cancelado: ['cancelado'],
    };

    const allowed = transitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      return {
        valid: false,
        error: `Não é possível mudar de "${currentStatus}" para "${newStatus}"`,
      };
    }

    return { valid: true };
  },

  /**
   * Verificar se há erros
   */
  hasErrors(errors) {
    return Object.keys(errors).length > 0;
  },

  /**
   * Formatar data para input datetime-local
   * Trata diversos formatos de data do backend
   */
  formatDateForInput(dateStr) {
    if (!dateStr) {
      console.log('[TournamentValidation] formatDateForInput: dateStr é null/undefined');
      return '';
    }

    // Se já é uma string no formato ISO ou datetime-local
    if (typeof dateStr === 'string') {
      // Tentar criar data diretamente
      let date = new Date(dateStr);

      // Se falhar, tentar outros formatos
      if (isNaN(date.getTime())) {
        // Tentar formatar como ISO
        date = new Date(dateStr.replace(' ', 'T'));
      }

      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
        console.log('[TournamentValidation] formatDateForInput:', { original: dateStr, formatted });
        return formatted;
      }
    }

    // Se for objeto Date
    if (dateStr instanceof Date) {
      if (!isNaN(dateStr.getTime())) {
        const year = dateStr.getFullYear();
        const month = String(dateStr.getMonth() + 1).padStart(2, '0');
        const day = String(dateStr.getDate()).padStart(2, '0');
        const hours = String(dateStr.getHours()).padStart(2, '0');
        const minutes = String(dateStr.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    }

    console.log('[TournamentValidation] formatDateForInput: não foi possível formatar', dateStr);
    return '';
  },

  /**
   * Formatar data para exibição amigável
   */
  formatDateForDisplay(dateStr) {
    if (!dateStr) return 'Não definida';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Data inválida';

    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Validar se a data está no formato correto
   */
  isValidDateTimeString(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    return regex.test(dateStr);
  },

  /**
   * Obter data mínima para input (agora + 1 minuto)
   */
  getMinDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  },
};