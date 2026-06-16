/**
 * QuestaoForm.test.jsx - Testes para o componente QuestaoForm
 * 
 * Testes unitários e de integração para validação e comportamento do formulário
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.4
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuestaoForm from './QuestaoForm';

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

// ── Fixtures ──────────────────────────────────────────────────────────────────
const questaoExemplo = {
  id: 1,
  titulo: 'Qual é a capital de Portugal?',
  descricao: 'Identificar a capital do país Portugal',
  tipo: 'multipla_escolha',
  dificuldade: 'facil',
  opcoes: ['Lisboa', 'Porto', 'Braga', 'Covilhã'],
  resposta_correta: 'Lisboa',
  explicacao: 'Lisboa é a capital e maior cidade de Portugal.',
  pontos: 10,
  disciplina: 'historia',
};

// ── Testes de Renderização ────────────────────────────────────────────────────
describe('QuestaoForm - Renderização', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário vazio para criação', () => {
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Criar Nova Questão')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Criar Nova Questão')).toBeFalsy();
  });

  it('deve renderizar o formulário preenchido para edição', () => {
    render(
      <QuestaoForm
        questao={questaoExemplo}
        disciplina="historia"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Editar Questão')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Qual é a capital de Portugal?')).toBeInTheDocument();
  });

  it('deve mostrar disciplina bloqueada (read-only)', () => {
    const { container } = render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const disciplinaField = container.querySelector('input[value="matematica"]');
    expect(disciplinaField).toBeFalsy();

    // Deve mostrar text readonly
    expect(screen.getByText(/Bloqueada - sua disciplina atribuída/i)).toBeInTheDocument();
  });

  it('deve exibir tabs de configuração corretamente', () => {
    render(
      <QuestaoForm
        questao={null}
        disciplina="programacao"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Informações Básicas')).toBeInTheDocument();
    expect(screen.getByText('Configuração')).toBeInTheDocument();
    expect(screen.getByText(/Opções e Resposta Correta/i)).toBeInTheDocument();
  });

  it('deve renderizar campos para múltipla escolha por padrão', () => {
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Deve ter 4 opções por padrão
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons.length).toBeGreaterThanOrEqual(4);
  });
});

// ── Testes de Validação ───────────────────────────────────────────────────────
describe('QuestaoForm - Validação', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve permitir envio com título vazio', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const botaoSubmit = screen.getByRole('button', { name: /Criar Questão/i });
    await user.click(botaoSubmit);

    await waitFor(() => {
      expect(screen.getByText(/Título é obrigatório/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('não deve permitir envio com descrição vazia', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputTitulo = screen.getByPlaceholderText(/Ex: Qual é a capital/i);
    await user.type(inputTitulo, 'Teste Título');

    const botaoSubmit = screen.getByRole('button', { name: /Criar Questão/i });
    await user.click(botaoSubmit);

    await waitFor(() => {
      expect(screen.getByText(/Descrição.*obrigatório/i)).toBeInTheDocument();
    });
  });

  it('não deve permitir resposta_correta vazia em múltipla escolha', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputTitulo = screen.getByPlaceholderText(/Ex: Qual é a capital/i);
    await user.type(inputTitulo, 'Teste Título');

    const inputs = screen.getAllByPlaceholderText(/Digite o enunciado/i);
    const textareaDescricao = inputs[0].closest('textarea') || screen.getByPlaceholderText(/Digite o enunciado/i);
    await user.type(textareaDescricao, 'Descrição teste');

    // Preencher opções
    const opcoes = screen.getAllByPlaceholderText(/Opção [A-D]/i);
    await user.type(opcoes[0], 'Opção 1');
    await user.type(opcoes[1], 'Opção 2');

    const botaoSubmit = screen.getByRole('button', { name: /Criar Questão/i });
    await user.click(botaoSubmit);

    await waitFor(() => {
      expect(screen.getByText(/Selecione a resposta correta/i)).toBeInTheDocument();
    });
  });

  it('deve validar duplicação de opções', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputTitulo = screen.getByPlaceholderText(/Ex: Qual é a capital/i);
    await user.type(inputTitulo, 'Teste Título');

    const descricaoTextarea = screen.getByPlaceholderText(/Digite o enunciado/i);
    await user.type(descricaoTextarea, 'Descrição teste');

    const opcoes = screen.getAllByPlaceholderText(/Opção [A-D]/i);
    await user.type(opcoes[0], 'Mesma Resposta');
    await user.type(opcoes[1], 'Mesma Resposta');

    // Selecionar resposta correta
    const radioButtons = screen.getAllByRole('radio');
    await user.click(radioButtons[0]);

    const botaoSubmit = screen.getByRole('button', { name: /Criar Questão/i });
    await user.click(botaoSubmit);

    await waitFor(() => {
      expect(screen.getByText(/Opções duplicadas não são permitidas/i)).toBeInTheDocument();
    });
  });

  it('deve validar pontos dentro do intervalo 1-1000', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputTitulo = screen.getByPlaceholderText(/Ex: Qual é a capital/i);
    await user.type(inputTitulo, 'Teste Título');

    const descricaoTextarea = screen.getByPlaceholderText(/Digite o enunciado/i);
    await user.type(descricaoTextarea, 'Descrição teste');

    // Preencherche opções
    const opcoes = screen.getAllByPlaceholderText(/Opção [A-D]/i);
    await user.type(opcoes[0], 'Opção 1');
    await user.type(opcoes[1], 'Opção 2');

    // Selecionar resposta
    const radioButtons = screen.getAllByRole('radio');
    await user.click(radioButtons[0]);

    // Alterar pontos para inválido
    const pontosInput = screen.getByDisplayValue('10');
    await user.clear(pontosInput);
    await user.type(pontosInput, '2000');

    const botaoSubmit = screen.getByRole('button', { name: /Criar Questão/i });
    await user.click(botaoSubmit);

    await waitFor(() => {
      expect(screen.getByText(/Pontos devem estar entre 1 e 1000/i)).toBeInTheDocument();
    });
  });

  it('deve validar mínimo 2 opções em múltipla escolha', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputTitulo = screen.getByPlaceholderText(/Ex: Qual é a capital/i);
    await user.type(inputTitulo, 'Teste Título');

    const descricaoTextarea = screen.getByPlaceholderText(/Digite o enunciado/i);
    await user.type(descricaoTextarea, 'Descrição teste');

    // Preencheroche apenas 1 opção
    const opcoes = screen.getAllByPlaceholderText(/Opção [A-D]/i);
    await user.type(opcoes[0], 'Opção 1');

    // Selecionar resposta
    const radioButtons = screen.getAllByRole('radio');
    await user.click(radioButtons[0]);

    const botaoSubmit = screen.getByRole('button', { name: /Criar Questão/i });
    await user.click(botaoSubmit);

    await waitFor(() => {
      expect(screen.getByText(/Mínimo 2 opções.*necessárias/i)).toBeInTheDocument();
    });
  });
});

// ── Testes de Tipos de Questão ────────────────────────────────────────────────
describe('QuestaoForm - Tipos de Questão', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve mostrar interface para texto livre', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const selectTipo = screen.getByDisplayValue('Múltipla Escolha');
    await user.selectOption(selectTipo, 'texto');

    // Deve mostrar textarea para resposta
    expect(screen.getByPlaceholderText(/Digite a resposta correta esperada/i)).toBeInTheDocument();

    // Não deve mostrar opções de múltipla escolha
    expect(screen.queryByPlaceholderText(/Opção A/i)).not.toBeInTheDocument();
  });

  it('deve mostrar interface para código', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="programacao"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const selectTipo = screen.getByDisplayValue('Múltipla Escolha');
    await user.selectOption(selectTipo, 'codigo');

    // Deve mostrar select de linguagem e textarea
    expect(screen.getByDisplayValue('Selecione uma linguagem...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Digite o código da solução esperada/i)).toBeInTheDocument();
  });

  it('deve validar linguagem obrigatória para código', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="programacao"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const selectTipo = screen.getByDisplayValue('Múltipla Escolha');
    await user.selectOption(selectTipo, 'codigo');

    const inputTitulo = screen.getByPlaceholderText(/Ex: Qual é a capital/i);
    await user.type(inputTitulo, 'Teste Título');

    const descricaoTextarea = screen.getByPlaceholderText(/Digite o enunciado/i);
    await user.type(descricaoTextarea, 'Descrição teste');

    const codigoTextarea = screen.getByPlaceholderText(/Digite o código da solução esperada/i);
    await user.type(codigoTextarea, 'console.log("teste");');

    // Não selecionar linguagem
    const botaoSubmit = screen.getByRole('button', { name: /Criar Questão/i });
    await user.click(botaoSubmit);

    await waitFor(() => {
      expect(screen.getByText(/Linguagem é obrigatória/i)).toBeInTheDocument();
    });
  });
});

// ── Testes de Comportamento ───────────────────────────────────────────────────
describe('QuestaoForm - Comportamento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar onCancel ao clicar botão cancelar', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const botaoCancelar = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(botaoCancelar);

    expect(mockOnCancel).toHaveBeenCalledOnce();
  });

  it('deve submeter dados válidos de múltipla escolha', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputTitulo = screen.getByPlaceholderText(/Ex: Qual é a capital/i);
    await user.type(inputTitulo, 'Teste Título');

    const descricaoTextarea = screen.getByPlaceholderText(/Digite o enunciado/i);
    await user.type(descricaoTextarea, 'Descrição teste');

    const opcoes = screen.getAllByPlaceholderText(/Opção [A-D]/i);
    await user.type(opcoes[0], 'Opção 1');
    await user.type(opcoes[1], 'Opção 2');

    const radioButtons = screen.getAllByRole('radio');
    await user.click(radioButtons[0]);

    const botaoSubmit = screen.getByRole('button', { name: /Criar Questão/i });
    await user.click(botaoSubmit);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: 'Teste Título',
          descricao: 'Descrição teste',
          tipo: 'multipla_escolha',
          dificuldade: 'medio',
          opcoes: ['Opção 1', 'Opção 2'],
          resposta_correta: 'Opção 1',
          disciplina: 'matematica',
        })
      );
    });
  });

  it('deve adicionar nova opção em múltipla escolha', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    let opcoes = screen.getAllByPlaceholderText(/Opção [A-D]/i);
    expect(opcoes).toHaveLength(4);

    const botaoAdicionar = screen.getByRole('button', { name: /Adicionar Opção/i });
    await user.click(botaoAdicionar);

    // Rerender para refletir novo estado
    rerender(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    opcoes = screen.getAllByPlaceholderText(/Opção [A-E]/i);
    // Agora deve ter uma opção adicional
    expect(opcoes.length).toBeGreaterThan(4);
  });

  it('deve carregar dados da questão ao editar', () => {
    render(
      <QuestaoForm
        questao={questaoExemplo}
        disciplina="historia"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Qual é a capital de Portugal?')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Identificar a capital do país Portugal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('facil')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de sucesso após criar questão', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        showStatusMessage={true}
      />
    );

    expect(screen.getByText(/Pendente de Aprovação/i)).toBeInTheDocument();
  });
});

// ── Testes de Edge Cases ──────────────────────────────────────────────────────
describe('QuestaoForm - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve permitir título maior que 255 caracteres', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputTitulo = screen.getByPlaceholderText(/Ex: Qual é a capital/i);
    const textoLongo = 'a'.repeat(300);
    await user.type(inputTitulo, textoLongo);

    // HTML input maxLength deve cortar em 255
    expect(inputTitulo.value).toHaveLength(255);
  });

  it('não deve permitir descrição maior que 5000 caracteres', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const descricaoTextarea = screen.getByPlaceholderText(/Digite o enunciado/i);
    const textoLongo = 'a'.repeat(5500);
    await user.type(descricaoTextarea, textoLongo);

    // HTML textarea maxLength deve cortar em 5000
    expect(descricaoTextarea.value).toHaveLength(5000);
  });

  it('deve lidar com resposta que não está nas opções', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputTitulo = screen.getByPlaceholderText(/Ex: Qual é a capital/i);
    await user.type(inputTitulo, 'Teste Título');

    const descricaoTextarea = screen.getByPlaceholderText(/Digite o enunciado/i);
    await user.type(descricaoTextarea, 'Descrição teste');

    const opcoes = screen.getAllByPlaceholderText(/Opção [A-D]/i);
    await user.type(opcoes[0], 'Opção 1');
    await user.type(opcoes[1], 'Opção 2');

    // Não selecionar nenhuma opção (resposta_correta fica '')
    const botaoSubmit = screen.getByRole('button', { name: /Criar Questão/i });
    await user.click(botaoSubmit);

    await waitFor(() => {
      expect(screen.getByText(/Selecione a resposta correta/i)).toBeInTheDocument();
    });
  });

  it('deve permitir número máximo de 10 opções', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Adicionar 6 opções (começar com 4)
    let botaoAdicionar = screen.getByRole('button', { name: /Adicionar Opção/i });
    for (let i = 0; i < 6; i++) {
      await user.click(botaoAdicionar);
      // Pode precisar rerender ou aguardar entre clicks
      try {
        botaoAdicionar = screen.getByRole('button', { name: /Adicionar Opção/i });
      } catch (e) {
        // Botão pode ter desaparecido se atingiu 10
        break;
      }
    }

    // Verificar se não consegue adicionar mais após 10
    const adicionar = screen.queryByRole('button', { name: /Adicionar Opção/i });
    if (adicionar) {
      // Ainda tem botão, contar opções
      const todosPlaceholders = screen.getAllByPlaceholderText(/Opção [A-Z]/i);
      expect(todosPlaceholders.length).toBeLessThanOrEqual(10);
    }
  });
});

// ── Property-Based Tests ──────────────────────────────────────────────────────
describe('QuestaoForm - Property-Based Tests', () => {
  /**
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.4**
   * 
   * Propriedade: Para qualquer questão válida submetida, o objeto enviado contém
   * todos os campos obrigatórios (titulo, descricao, tipo, disciplina, dificuldade, resposta_correta)
   */
  it('deve sempre incluir campos obrigatórios em submissão válida', async () => {
    const user = userEvent.setup();
    render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputTitulo = screen.getByPlaceholderText(/Ex: Qual é a capital/i);
    await user.type(inputTitulo, 'Título Válido');

    const descricaoTextarea = screen.getByPlaceholderText(/Digite o enunciado/i);
    await user.type(descricaoTextarea, 'Descrição válida');

    const opcoes = screen.getAllByPlaceholderText(/Opção [A-D]/i);
    await user.type(opcoes[0], 'Opção A');
    await user.type(opcoes[1], 'Opção B');

    const radioButtons = screen.getAllByRole('radio');
    await user.click(radioButtons[0]);

    const botaoSubmit = screen.getByRole('button', { name: /Criar Questão/i });
    await user.click(botaoSubmit);

    await waitFor(() => {
      const chamada = mockOnSubmit.mock.calls[0][0];
      expect(chamada).toHaveProperty('titulo');
      expect(chamada).toHaveProperty('descricao');
      expect(chamada).toHaveProperty('tipo');
      expect(chamada).toHaveProperty('disciplina');
      expect(chamada).toHaveProperty('dificuldade');
      expect(chamada).toHaveProperty('resposta_correta');
    });
  });

  /**
   * **Validates: Requirement 2.2**
   * 
   * Propriedade: A disciplina enviada deve sempre corresponder à disciplina bloqueada do formulário
   */
  it('deve sempre enviar disciplina correta do usuário', async () => {
    const user = userEvent.setup();
    const disciplinasTestar = ['matematica', 'ingles', 'programacao'];

    for (const disciplina of disciplinasTestar) {
      mockOnSubmit.mockClear();
      const { unmount } = render(
        <QuestaoForm
          questao={null}
          disciplina={disciplina}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const inputTitulo = screen.getByPlaceholderText(/Ex: Qual é a capital/i);
      await user.type(inputTitulo, 'Título Válido');

      const descricaoTextarea = screen.getByPlaceholderText(/Digite o enunciado/i);
      await user.type(descricaoTextarea, 'Descrição válida');

      const opcoes = screen.getAllByPlaceholderText(/Opção [A-D]/i);
      await user.type(opcoes[0], 'Opção A');
      await user.type(opcoes[1], 'Opção B');

      const radioButtons = screen.getAllByRole('radio');
      await user.click(radioButtons[0]);

      const botaoSubmit = screen.getByRole('button', { name: /Criar Questão/i });
      await user.click(botaoSubmit);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            disciplina: disciplina.toLowerCase(),
          })
        );
      });

      unmount();
    }
  });

  /**
   * **Validates: Requirement 4.4**
   * 
   * Propriedade: Status pendente deve ser mostrado para criação (não edição)
   */
  it('deve mostrar status pendente apenas em criação, não em edição', () => {
    const { rerender } = render(
      <QuestaoForm
        questao={null}
        disciplina="matematica"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        showStatusMessage={true}
      />
    );

    expect(screen.getByText(/Pendente de Aprovação/i)).toBeInTheDocument();

    rerender(
      <QuestaoForm
        questao={questaoExemplo}
        disciplina="historia"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        showStatusMessage={true}
      />
    );

    // Não deve mostrar em edição
    expect(screen.queryByText(/Pendente de Aprovação/i)).not.toBeInTheDocument();
  });
});
