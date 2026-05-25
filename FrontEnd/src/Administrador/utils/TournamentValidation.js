/**
 * TournamentValidation.js
 * Validações de formulário de torneios
 * Responsabilidade única: Validar dados
 */

export const TournamentValidation = {
  /**
   * Gerar slug automaticamente a partir do título
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 100);
  },

  /**
   * Validar formulário completo
   */
  validate(formData) {
    const errors = {};

    // Validar título
    if (!formData.titulo || !formData.titulo.trim()) {
      errors.titulo = 'Título é obrigatório';
    } else if (formData.titulo.length < 3) {
      errors.titulo = 'Mínimo 3 caracteres';
    } else if (formData.titulo.length > 255) {
      errors.titulo = 'Máximo 255 caracteres';
    }

    // Validar descrição
    if (!formData.descricao || !formData.descricao.trim()) {
      errors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.length < 10) {
      errors.descricao = 'Mínimo 10 caracteres';
    }

    // Validar datas
    if (!formData.inicia_em) {
      errors.inicia_em = 'Data de início é obrigatória';
    } else {
      const inicioDate = new Date(formData.inicia_em);
      const agora = new Date();
      const tolerance = 2 * 60 * 60 * 1000; // 2 horas
      
      if (inicioDate < new Date(agora.getTime() - tolerance)) {
        errors.inicia_em = 'Não pode ser no passado';
      }
    }

    if (!formData.termina_em) {
      errors.termina_em = 'Data de término é obrigatória';
    } else if (formData.inicia_em) {
      const fimDate = new Date(formData.termina_em);
      const inicioDate = new Date(formData.inicia_em);
      
      if (fimDate <= inicioDate) {
        errors.termina_em = 'Deve ser após o início';
      }
    }

    // Validar status
    if (!formData.status) {
      errors.status = 'Status é obrigatório';
    }

    return errors;
  },

  /**
   * Verificar se há erros
   */
  hasErrors(errors) {
    return Object.keys(errors).length > 0;
  },

  /**
   * Formatar data para input datetime-local
   */
  formatDateForInput(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
};
